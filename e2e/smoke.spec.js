import { expect, test } from '@playwright/test'

const fixtures = {
    project: [
        {
            id: 'project-1',
            name: 'Alpha Project',
            status: 'InProgress',
            version: '1.0',
            owner: 'member-1',
            calendar_country: 'CN',
            calendar_region: '',
            weekend_days: '[0,6]',
            calendar_exceptions: '[]'
        }
    ],
    task: [
        {
            id: 'task-1',
            project_id: 'project-1',
            name: 'Design milestone',
            parent: '',
            sort_order: 1,
            start_time: '2026-07-01 00:00:00',
            end_time: '2026-07-03 00:00:00',
            type: 'Task',
            priority: '2',
            status: 'InProgress',
            progress: 50,
            effort_days: 3,
            assignee: 'member-1'
        }
    ],
    member: [
        {
            id: 'member-1',
            name: 'Alice',
            role: 'PM',
            availability_exceptions: JSON.stringify([
                {
                    start_date: '2026-07-02',
                    end_date: '2026-07-02',
                    type: 'leave',
                    name: 'Annual leave'
                }
            ])
        },
        { id: 'member-2', name: 'Bob', role: 'Developer', availability_exceptions: '[]' }
    ],
    task_dependency: [],
    project_member: [
        { id: 'pm-1', project_id: 'project-1', member_id: 'member-1', role: 'Owner' },
        { id: 'pm-2', project_id: 'project-1', member_id: 'member-2', role: 'Developer' }
    ],
    plan_baseline: []
}

test.beforeEach(async ({ page }) => {
    await page.addInitScript(mockData => {
        localStorage.setItem('easyproject-onboarding-done', 'true')
        window.__EASY_PROJECT_CALLS__ = []
        window.__TAURI_INTERNALS__ = {
            invoke: async (command, args) => {
                window.__EASY_PROJECT_CALLS__.push({ command, args })
                if (command !== 'crud_action') throw new Error(`Unexpected command: ${command}`)
                if (args.model === 'data' && args.action === 'export_json') {
                    return {
                        success: true,
                        data: {
                            schemaVersion: 5,
                            projects: [],
                            tasks: [],
                            dependencies: [],
                            members: [],
                            project_members: [],
                            plan_baselines: []
                        }
                    }
                }
                if (args.model === 'data' && args.action === 'list_backups') {
                    return { success: true, data: { list: [], directory: 'C:\\Backups' } }
                }
                if (args.model === 'calendar' && args.action === 'fetch_ics') {
                    return {
                        success: true,
                        data: {
                            text: 'BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nUID:online-1\r\nDTSTART;VALUE=DATE:20260810\r\nDTEND;VALUE=DATE:20260812\r\nSUMMARY:Customer visit\r\nEND:VEVENT\r\nEND:VCALENDAR'
                        }
                    }
                }
                if (args.model === 'project' && args.action === 'create_from_template') {
                    return {
                        success: true,
                        data: { id: 'project-template', taskCount: args.data.tasks.length }
                    }
                }
                const list = mockData[args.model] || []
                return { success: true, data: { list, total: list.length } }
            }
        }
    }, fixtures)
})

test('loads the dashboard shell with mocked Tauri data', async ({ page }) => {
    await page.goto('/#/dashboard')

    await expect(page.locator('.app-header h1')).toHaveText('EasyProject')
    await expect(page.getByRole('navigation')).toBeVisible()
    await expect(page.getByText('Alpha Project').first()).toBeVisible()
})

test('creates a scheduled project from a built-in template', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('easyproject-lang', 'en-US'))
    await page.goto('/#/projects')
    await page.getByRole('button', { name: 'New project' }).click()
    await page.getByRole('button', { name: /Software release/ }).click()
    await page.locator('.field-wide input').fill('Release 2.0')
    await page.getByRole('button', { name: 'Create project' }).click()

    await expect
        .poll(async () =>
            page.evaluate(() =>
                window.__EASY_PROJECT_CALLS__.find(
                    call =>
                        call.args?.model === 'project' &&
                        call.args?.action === 'create_from_template'
                )
            )
        )
        .toBeTruthy()
    const call = await page.evaluate(() =>
        window.__EASY_PROJECT_CALLS__.find(
            item => item.args?.model === 'project' && item.args?.action === 'create_from_template'
        )
    )
    expect(call.args.data.project.name).toBe('Release 2.0')
    expect(call.args.data.tasks).toHaveLength(5)
    expect(call.args.data.tasks[1].predecessor_keys).toEqual(['requirements'])
})

test('shows the registered keyboard shortcuts in the help dialog', async ({ page }) => {
    await page.goto('/#/dashboard')
    await page.locator('.help-toggle').click()

    await expect(page.locator('.help-panel')).toBeVisible()
    await expect(page.locator('.help-item')).toHaveCount(10)
    await expect(page.locator('.help-item kbd').first()).toHaveText('Ctrl+D')
    await expect(page.locator('.help-item kbd')).toContainText(['?', 'Escape'])
})

test('opens a project deep link and keeps task context', async ({ page }) => {
    await page.goto('/#/project/project-1')

    await expect(page.getByRole('heading', { name: 'Alpha Project' })).toBeVisible()
    await expect(page.getByText('Design milestone')).toBeVisible()
    await expect(page.getByRole('button', { name: /甘特图|Gantt/ })).toBeVisible()
})

test('opens the all-task page without applying a project filter', async ({ page }) => {
    await page.goto('/#/tasks')
    await expect(page.getByText('Design milestone')).toBeVisible()

    const columnTitles = page.locator('.workspace-table .p-datatable-column-title')
    await expect(columnTitles.first()).toBeVisible()
    expect(
        await columnTitles.evaluateAll(titles =>
            titles.every(title => {
                const style = window.getComputedStyle(title)
                return style.whiteSpace === 'nowrap' && style.wordBreak === 'keep-all'
            })
        )
    ).toBe(true)

    const taskCalls = await page.evaluate(() =>
        window.__EASY_PROJECT_CALLS__.filter(
            ({ args }) => args?.model === 'task' && args?.action === 'get_all'
        )
    )
    expect(taskCalls.some(({ args }) => !args.data.projectId)).toBe(true)
})

test('changes a task assignee from the Gantt editor', async ({ page }) => {
    await page.goto('/#/project/project-1')
    await page.locator('.view-switch button').nth(1).click()

    await page.locator('.task-bar').click()
    await expect(page.locator('.edit-panel')).toBeVisible()

    await page.locator('.edit-field .p-select').click()
    await page.getByText('Bob', { exact: true }).click()
    await page.locator('.btn-save').click()

    const updateCalls = await page.evaluate(() =>
        window.__EASY_PROJECT_CALLS__.filter(
            ({ args }) => args?.model === 'task' && args?.action === 'update'
        )
    )
    expect(updateCalls.some(({ args }) => args.data.assignee === 'member-2')).toBe(true)
})

test('marks a Gantt task when its assignee is unavailable', async ({ page }) => {
    await page.goto('/#/project/project-1')
    await page.locator('.view-switch button').nth(1).click()

    const taskBar = page.locator('.task-bar')
    await expect(taskBar).toHaveClass(/availability-conflict/)
    await expect(taskBar).toHaveAttribute('title', /Alice/)
})

test('moves a task across the project board and supports undo', async ({ page }) => {
    await page.goto('/#/project/project-1')
    await page.getByRole('button', { name: /看板|Board/ }).click()

    const card = page.locator('.board-card').filter({ hasText: 'Design milestone' })
    await expect(card).toBeVisible()
    await card.dragTo(page.locator('.board-column').nth(2))

    let calls = await page.evaluate(() => window.__EASY_PROJECT_CALLS__)
    expect(
        calls.some(
            ({ args }) =>
                args?.model === 'task' &&
                args?.action === 'update' &&
                args.data.id === 'task-1' &&
                args.data.status === 'Done' &&
                args.data.progress === 100
        )
    ).toBe(true)

    await page.keyboard.press('Control+z')
    calls = await page.evaluate(() => window.__EASY_PROJECT_CALLS__)
    expect(calls.some(({ args }) => args?.model === 'data' && args?.action === 'import_json')).toBe(
        true
    )
})

test('saves a member unavailable date range', async ({ page }) => {
    await page.goto('/#/members')
    await page.locator('.member-trigger').filter({ hasText: 'Alice' }).click()

    await page.locator('.availability-form .p-inputtext').fill('Conference')
    await page.locator('.availability-form input[type="date"]').first().fill('2026-08-03')
    await page.locator('.availability-form input[type="date"]').nth(1).fill('2026-08-05')
    await page.locator('.availability-form .p-button').click()

    const updateCalls = await page.evaluate(() =>
        window.__EASY_PROJECT_CALLS__.filter(
            ({ args }) => args?.model === 'member' && args?.action === 'update'
        )
    )
    expect(
        updateCalls.some(({ args }) => {
            const ranges = JSON.parse(args.data.availability_exceptions || '[]')
            return ranges.some(
                item =>
                    item.name === 'Conference' &&
                    item.start_date === '2026-08-03' &&
                    item.end_date === '2026-08-05'
            )
        })
    ).toBe(true)
})

test('resizes a task schedule from the right edge of its Gantt bar', async ({ page }) => {
    await page.goto('/#/project/project-1')
    await page.locator('.view-switch button').nth(1).click()

    const rightHandle = page.locator('.task-bar .resize-right')
    await expect(rightHandle).toBeVisible()
    const box = await rightHandle.boundingBox()
    expect(box).not.toBeNull()

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width / 2 + 42, box.y + box.height / 2)
    await page.mouse.up()

    const updateCalls = await page.evaluate(() =>
        window.__EASY_PROJECT_CALLS__.filter(
            ({ args }) => args?.model === 'task' && args?.action === 'update'
        )
    )
    expect(
        updateCalls.some(
            ({ args }) =>
                args.data.id === 'task-1' &&
                args.data.start_time === '2026-07-01 00:00:00' &&
                args.data.end_time === '2026-07-04 00:00:00'
        )
    ).toBe(true)
})

test('saves a custom project workday override', async ({ page }) => {
    await page.goto('/#/project/project-1')
    await page.getByRole('button', { name: /工作日历|Calendar/ }).click()

    await expect(page.locator('.calendar-settings')).toBeVisible()
    await page.locator('.exception-form input[type="date"]').fill('2026-10-10')
    await page.locator('.exception-form input[type="text"]').fill('Release support')
    await page.locator('.exception-form select').selectOption('working')
    await page.locator('.exception-add').click()
    await page.locator('.calendar-save').click()

    const updateCalls = await page.evaluate(() =>
        window.__EASY_PROJECT_CALLS__.filter(
            ({ args }) => args?.model === 'project' && args?.action === 'update'
        )
    )
    expect(
        updateCalls.some(({ args }) => {
            const exceptions = JSON.parse(args.data.calendar_exceptions || '[]')
            return exceptions.some(
                item =>
                    item.date === '2026-10-10' &&
                    item.name === 'Release support' &&
                    item.type === 'working'
            )
        })
    ).toBe(true)
})

test('imports ICS busy events into a member availability calendar', async ({ page }) => {
    await page.goto('/#/project/project-1')
    await page.getByRole('button', { name: /工作日历|Calendar/ }).click()

    await page.getByTestId('ics-member-select').selectOption('member-2')
    await page.getByTestId('ics-file-input').setInputFiles({
        name: 'busy.ics',
        mimeType: 'text/calendar',
        buffer: Buffer.from(
            'BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nUID:conference-1\r\nDTSTART;VALUE=DATE:20260803\r\nDTEND;VALUE=DATE:20260806\r\nSUMMARY:Conference\r\nEND:VEVENT\r\nEND:VCALENDAR'
        )
    })
    await expect(page.getByText('Conference')).toBeVisible()
    await page.getByTestId('ics-import-button').click()

    const updateCalls = await page.evaluate(() =>
        window.__EASY_PROJECT_CALLS__.filter(
            ({ args }) => args?.model === 'member' && args?.action === 'update'
        )
    )
    expect(
        updateCalls.some(({ args }) => {
            const ranges = JSON.parse(args.data.availability_exceptions || '[]')
            return ranges.some(
                item =>
                    item.name === 'Conference' &&
                    item.start_date === '2026-08-03' &&
                    item.end_date === '2026-08-05' &&
                    item.source === 'ics' &&
                    item.source_uid === 'conference-1'
            )
        })
    ).toBe(true)
})

test('synchronizes a private online ICS subscription', async ({ page }) => {
    await page.goto('/#/project/project-1')
    await page.getByRole('button', { name: /工作日历|Calendar/ }).click()

    await page.getByTestId('subscription-name').fill('Outlook busy time')
    await page.getByTestId('subscription-url').fill('https://calendar.example/private.ics')
    await page.getByTestId('subscription-member').selectOption('member-2')
    await page.getByTestId('subscription-add').click()
    await page.getByTestId('subscription-sync').click()

    const calls = await page.evaluate(() => window.__EASY_PROJECT_CALLS__)
    expect(
        calls.some(({ args }) => args?.model === 'calendar' && args?.action === 'fetch_ics')
    ).toBe(true)
    expect(
        calls.some(({ args }) => {
            if (args?.model !== 'member' || args?.action !== 'update') return false
            return JSON.parse(args.data.availability_exceptions || '[]').some(
                item =>
                    item.source_uid === 'online-1' &&
                    item.start_date === '2026-08-10' &&
                    item.end_date === '2026-08-11'
            )
        })
    ).toBe(true)
})

test('creates a complete task from the Gantt timeline form', async ({ page }) => {
    await page.goto('/#/project/project-1')
    await page.locator('.view-switch button').nth(1).click()

    const grid = page.locator('.row-grid')
    const box = await grid.boundingBox()
    expect(box).not.toBeNull()
    await page.mouse.move(box.x + 20, box.y + 20)
    await page.mouse.down()
    await page.mouse.move(box.x + 90, box.y + 20)
    await page.mouse.up()

    await expect(page.locator('.create-panel')).toBeVisible()
    await page.locator('.create-name').fill('Plan launch')
    await page.locator('.create-panel input[type="date"]').first().fill('2026-07-17')
    await page.locator('.create-panel input[type="number"]').fill('2')
    await expect(page.locator('.create-panel input[type="date"]').nth(1)).toHaveValue('2026-07-20')
    await page.locator('.create-panel .edit-field .p-select').click()
    await page.getByText('Bob', { exact: true }).click()
    await page.locator('.create-comment').fill('Coordinate release')
    await page.locator('.create-panel .btn-save').click()

    const addCalls = await page.evaluate(() =>
        window.__EASY_PROJECT_CALLS__.filter(
            ({ args }) => args?.model === 'task' && args?.action === 'add'
        )
    )
    expect(
        addCalls.some(
            ({ args }) =>
                args.data.name === 'Plan launch' &&
                args.data.parent === '' &&
                args.data.dependence === '' &&
                args.data.priority === '3' &&
                args.data.effort_days === 2 &&
                args.data.end_time === '2026-07-20 00:00:00' &&
                args.data.assignee === 'member-2' &&
                args.data.comment === 'Coordinate release'
        )
    ).toBe(true)
})
