import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'

test('keeps heavy features deferred on the dashboard and loads XLSX on demand', async ({
    page
}) => {
    const requests = []
    page.on('request', request => requests.push(request.url()))
    await page.goto('/#/dashboard')
    await expect(page.locator('.dashboard')).toBeVisible()
    // The dashboard workload panel legitimately needs calendar rules.
    // Spreadsheet and screenshot tools do not belong to that user path.
    expect(requests.some(url => /xlsx-vendor|exceljs|capture-vendor/.test(url))).toBe(false)
    await page.goto('/#/data')
    await expect(page.locator('.data-page')).toBeVisible()
    expect(requests.some(url => /xlsx-vendor|exceljs/.test(url))).toBe(false)
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Excel', exact: true }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/\.xlsx$/)
    const file = await download.path()
    await page.locator('#project-import-file').setInputFiles({
        name: download.suggestedFilename(),
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        buffer: await readFile(file)
    })
    await expect(page.locator('.import-preview')).toBeVisible()
    await expect(page.locator('.preview-warning')).toHaveCount(0)
    await expect(page.locator('.import-preview > p')).toHaveCount(6)
    expect(requests.some(url => /xlsx-vendor|exceljs/.test(url))).toBe(true)
})

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
        mockData.task_status = mockData.project.flatMap(project =>
            ['Pending', 'InProgress', 'Done'].map((key, index) => ({
                id: `TASK_STATUS:${String(index + 1).padStart(32, '0')}`,
                project_id: project.id,
                name: key,
                builtin_key: key,
                color: '#64748b',
                is_completed: key === 'Done',
                is_default: index === 0,
                sort_order: index
            }))
        )
        mockData.task.forEach(task => {
            const state = mockData.task_status.find(
                state =>
                    state.project_id === task.project_id &&
                    state.builtin_key === (task.status === 'Todo' ? 'Pending' : task.status)
            )
            if (state)
                Object.assign(task, {
                    status_id: state.id,
                    status_builtin_key: state.builtin_key,
                    is_completed: state.is_completed
                })
        })
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
                if (
                    args.model === 'data' &&
                    args.action === 'backup' &&
                    window.__EASY_PROJECT_FAIL_BACKUP__
                ) {
                    return { success: false, message: 'Simulated backup failure' }
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
                let list = mockData[args.model] || []
                if (args.model === 'task_status') {
                    const data = args.data
                    if (args.action === 'get_usage') {
                        const tasks = mockData.task.filter(task => task.status_id === data.id)
                        return {
                            success: true,
                            data: { list: tasks, total: tasks.length, pageIndex: 1 }
                        }
                    }
                    if (args.action === 'add') {
                        const state = {
                            id: `TASK_STATUS:${String(list.length + 1).padStart(32, '0')}`,
                            builtin_key: '',
                            color: '#64748b',
                            sort_order: 100,
                            is_default: false,
                            is_completed: false,
                            ...data
                        }
                        list.push(state)
                        return { success: true, data: { id: state.id } }
                    }
                    if (args.action === 'update') {
                        Object.assign(
                            list.find(state => state.id === data.id),
                            data
                        )
                        return { success: true, data: { id: data.id } }
                    }
                    if (args.action === 'delete') {
                        if (mockData.task.some(task => task.status_id === data.id))
                            return { success: false, message: 'Referenced status' }
                        mockData.task_status = list.filter(state => state.id !== data.id)
                        return { success: true, data: { id: data.id, deleted: true } }
                    }
                }
                if (args.model === 'task_status' && args.data.projectId)
                    list = list.filter(state => state.project_id === args.data.projectId)
                return { success: true, data: { list, total: list.length } }
            }
        }
    }, fixtures)
})

for (const dark of [false, true])
    test(`project status quick add and conflict protection in ${dark ? 'dark narrow' : 'light'} UI`, async ({
        page
    }) => {
        if (dark) await page.setViewportSize({ width: 960, height: 640 })
        await page.addInitScript(dark => {
            localStorage.setItem('easyproject-lang', 'en-US')
            if (dark) localStorage.setItem('easyproject-theme', 'dark')
        }, dark)
        await page.route('http://127.0.0.1:4173/', async route => {
            const response = await route.fetch()
            await route.fulfill({
                response,
                body: (await response.text()).replace(
                    /<style>/g,
                    '<style nonce="status-test-nonce">'
                ),
                headers: {
                    ...response.headers(),
                    'content-security-policy': "style-src 'self' 'nonce-status-test-nonce'"
                }
            })
        })
        await page.goto('/#/project/project-1')
        await page
            .getByRole('button', { name: /New task/ })
            .first()
            .click()
        await page.locator('#task-edit-name').fill('Draft must survive')
        await page.locator('#task-edit-status').click()
        await page.getByRole('button', { name: 'Add status', exact: true }).click()
        const add = page.getByRole('dialog', { name: 'Add status', exact: true })
        await add.getByLabel('Status name', { exact: true }).fill('Cancelled state')
        await add.getByRole('button', { name: 'Cancel', exact: true }).click()
        await expect(page.locator('#task-edit-name')).toHaveValue('Draft must survive')
        await page.locator('#task-edit-status').click()
        await page.getByRole('button', { name: 'Add status', exact: true }).click()
        await add.getByLabel('Status name', { exact: true }).fill('已完成')
        await add.getByRole('button', { name: 'Save', exact: true }).click()
        await expect(add.getByRole('alert')).toBeVisible()
        expect(
            await page.evaluate(() =>
                window.__EASY_PROJECT_CALLS__.some(
                    ({ args }) => args?.model === 'task_status' && args.action === 'add'
                )
            )
        ).toBe(false)
        await add.getByLabel('Status name', { exact: true }).fill('Review')
        await expect(add.getByRole('combobox', { name: 'Color', exact: true })).toContainText(
            /^(Blue|Violet|Teal|Amber|Rose|Cyan|Magenta|Green)$/
        )
        await add.getByRole('combobox', { name: 'Color', exact: true }).click()
        await page.getByRole('option', { name: 'Teal', exact: true }).click()
        await add.getByRole('button', { name: 'Save', exact: true }).click()
        await expect(add).not.toBeVisible()
        await expect(page.locator('#task-edit-status')).toContainText('Review')
        await expect(page.locator('#task-edit-name')).toHaveValue('Draft must survive')
        await page.keyboard.press('Escape')
        await page.getByRole('button', { name: 'Manage task statuses', exact: true }).click()
        await expect(page.locator('.status-manager')).toContainText('Review')
        await page.getByRole('button', { name: 'Edit Review', exact: true }).click()
        const edit = page.getByRole('dialog', { name: 'Task statuses', exact: true })
        await expect(edit.getByRole('combobox', { name: 'Color', exact: true })).toContainText(
            'Teal'
        )
        await edit.getByRole('combobox', { name: 'Color', exact: true }).click()
        await page.getByRole('option', { name: 'Amber', exact: true }).click()
        await edit.getByRole('button', { name: 'Save', exact: true }).click()
        await expect(edit).not.toBeVisible()
        await page.getByRole('button', { name: 'Delete In Progress', exact: true }).click()
        const conflict = page.getByRole('dialog', { name: 'Task statuses', exact: true })
        await expect(conflict).toContainText('Design milestone')
        await expect(conflict.getByRole('button', { name: 'Delete', exact: true })).toHaveCount(0)
        await page.keyboard.press('Escape')
        await page.getByRole('button', { name: /Board/ }).click()
        await expect(page.locator('.board-column')).toHaveCount(4)
        await expect(page.locator('.board-column')).toContainText([
            'Pending',
            'In Progress',
            'Done',
            'Review'
        ])
        const calls = await page.evaluate(() => window.__EASY_PROJECT_CALLS__)
        expect(
            calls.filter(call => call.args?.model === 'task_status' && call.args.action === 'add')
        ).toHaveLength(1)
        expect(
            calls.find(call => call.args?.model === 'task_status' && call.args.action === 'add')
                .args.data.color
        ).toBe('#14b8a6')
        expect(
            calls.some(
                call =>
                    call.args?.model === 'task_status' &&
                    call.args.action === 'update' &&
                    call.args.data.color === '#f59e0b'
            )
        ).toBe(true)
        expect(
            calls.some(call => call.args?.model === 'task_status' && call.args.action === 'delete')
        ).toBe(false)
        expect(
            await page
                .locator('style[data-primevue-style-id]')
                .evaluateAll(styles => styles.every(style => style.nonce === 'status-test-nonce'))
        ).toBe(true)
    })

test('loads the dashboard shell with mocked Tauri data', async ({ page }) => {
    await page.goto('/#/dashboard')

    await expect(page.locator('.app-header h1')).toHaveText('EasyProject')
    await expect(page.getByRole('navigation')).toBeVisible()
    await expect(page.getByText('Alpha Project').first()).toBeVisible()
})

test('renders the standalone task window and retains it after reload', async ({
    page
}, testInfo) => {
    await page.setViewportSize({ width: 340, height: 360 })
    await page.goto('/#/floating')
    await expect(page.getByTestId('floating-window')).toBeVisible()
    await expect(page.locator('.app-header')).toHaveCount(0)
    await expect(page.getByText('Design milestone').first()).toBeVisible()
    await expect(page.locator('.floating-project')).toHaveText('Alpha Project')
    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50')
    await page.screenshot({ path: testInfo.outputPath('floating-light.png') })
    await page.evaluate(() => localStorage.setItem('easyproject-theme', 'dark'))
    await page.reload()
    await expect(page.locator('html')).toHaveClass(/app-dark/)
    await page.screenshot({ path: testInfo.outputPath('floating-dark.png') })
    await page.getByRole('button', { name: '收起', exact: true }).click()
    await expect(page.locator('.floating-content')).toHaveCount(0)
    await page.reload()
    await expect(page.getByTestId('floating-window')).toBeVisible()
})

test('uses the native initialization flag without a floating hash route', async ({ page }) => {
    await page.addInitScript(() => {
        window.__EASYPROJECT_FLOATING_WINDOW__ = true
    })
    await page.setViewportSize({ width: 340, height: 360 })
    await page.goto('/')
    await expect(page.locator('.floating-content h2')).toHaveText('Design milestone')
    await expect(page.locator('.app-header')).toHaveCount(0)
    await expect(page.getByRole('combobox')).toHaveCount(0)
    const box = await page.locator('.floating-task').boundingBox()
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width).toBeLessThanOrEqual(340)
    expect(box.y + box.height).toBeLessThanOrEqual(360)
})

test('styles PrimeVue in the task window under desktop-like nonce CSP', async ({ page }) => {
    await page.addInitScript(() => {
        window.__EASYPROJECT_FLOATING_WINDOW__ = true
    })
    await page.route('http://127.0.0.1:4173/', async route => {
        const response = await route.fetch()
        const html = (await response.text()).replace(
            /<style>/g,
            '<style nonce="e2e-response-nonce">'
        )
        await route.fulfill({
            response,
            body: html,
            headers: {
                ...response.headers(),
                'content-security-policy': "style-src 'self' 'nonce-e2e-response-nonce'"
            }
        })
    })
    await page.goto('/')
    await expect(page.locator('.floating-content h2')).toHaveText('Design milestone')
    await expect(page.locator('.p-progressbar')).toHaveCSS('overflow', 'hidden')
    expect(
        await page
            .locator('style[data-primevue-style-id]')
            .evaluateAll(styles => styles.every(style => style.nonce === 'e2e-response-nonce'))
    ).toBe(true)
    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50')
})

test('shows an accessible warning when automatic backup fails', async ({ page }) => {
    await page.clock.install()
    await page.goto('/#/dashboard')
    // Module scripts can still be mounting after load under parallel execution;
    // do not advance the clock before the app registers its backup interval.
    await expect(page.locator('.dashboard')).toBeVisible()
    await page.evaluate(() => {
        window.__EASY_PROJECT_FAIL_BACKUP__ = true
    })
    await page.clock.fastForward(30 * 60 * 1000)
    await expect(page.getByRole('alert')).toContainText(/自动备份失败|Automatic backup failed/)
})

test('renders the custom Windows title bar preview without covering navigation', async ({
    page
}) => {
    await page.goto('/?demo=1&windowChrome=1#/dashboard')

    await expect(page.getByTestId('window-titlebar')).toBeVisible()
    await expect(page.getByTestId('window-minimize')).toHaveAttribute('aria-label', '最小化')
    await expect(page.getByTestId('window-maximize')).toHaveAttribute('aria-label', '最大化')
    await expect(page.getByTestId('window-close')).toHaveAttribute('aria-label', '关闭窗口')
    await expect(page.getByRole('navigation')).toBeVisible()

    const titlebarBox = await page.getByTestId('window-titlebar').boundingBox()
    const navigationBox = await page.getByRole('navigation').boundingBox()
    expect(titlebarBox).not.toBeNull()
    expect(navigationBox).not.toBeNull()
    expect(navigationBox.y).toBeGreaterThanOrEqual(titlebarBox.y + titlebarBox.height)

    const viewportHeight = page.viewportSize().height
    const documentMetrics = await page.evaluate(() => ({
        clientHeight: document.documentElement.clientHeight,
        scrollHeight: document.documentElement.scrollHeight,
        bodyScrollHeight: document.body.scrollHeight
    }))
    expect(documentMetrics.clientHeight).toBe(viewportHeight)
    expect(documentMetrics.scrollHeight).toBe(viewportHeight)
    expect(documentMetrics.bodyScrollHeight).toBe(viewportHeight)

    await page.mouse.wheel(0, 500)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
    await expect(page.getByTestId('window-titlebar')).toBeInViewport()
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

for (const dark of [false, true])
    test(`full text remains available for clipped task relationships in ${dark ? 'dark' : 'light'} UI`, async ({
        page
    }) => {
        await page.setViewportSize({ width: 960, height: 720 })
        await page.addInitScript(
            ({ task, dark }) => {
                localStorage.setItem('easyproject-lang', 'en-US')
                localStorage.setItem('easyproject-theme', dark ? 'dark' : 'light')
                const invoke = window.__TAURI_INTERNALS__.invoke
                window.__TAURI_INTERNALS__.invoke = async (command, args) => {
                    if (args?.model === 'task' && args.action === 'get_all')
                        return {
                            success: true,
                            data: {
                                list: [
                                    {
                                        ...task,
                                        id: 'long-parent',
                                        name: 'Parent task full title '.repeat(12)
                                    },
                                    {
                                        ...task,
                                        id: 'long-child',
                                        parent: 'long-parent',
                                        name: 'Child task full title '.repeat(12),
                                        comment: 'Full detailed comment '.repeat(12)
                                    }
                                ],
                                total: 2
                            }
                        }
                    return invoke(command, args)
                }
            },
            { task: fixtures.task[0], dark }
        )
        await page.goto('/#/tasks')
        await expect(page.locator('.task-name-text').first()).toBeVisible()
        const toggle = page.getByRole('button', { name: 'Expand task', exact: true })
        if (await toggle.count()) await toggle.click()
        const parent = page
            .locator('.task-name-text[title]')
            .filter({ hasText: 'Parent task full title' })
            .first()
        await parent.scrollIntoViewIfNeeded()
        await expect(parent).toHaveAttribute('title', 'Parent task full title '.repeat(12))
        await parent.hover()
        await expect(page.getByRole('tooltip')).toContainText(
            'Parent task full title '.repeat(12).trim()
        )
        await page.mouse.move(1, 1)
        const title = page.locator('.child-row .truncate').first()
        await title.hover()
        await expect(page.getByRole('tooltip')).toContainText(
            'Child task full title '.repeat(12).trim()
        )
    })

test('rejects a cross-project drop even when the template prevents dragover defaults', async ({
    page
}) => {
    const secondTask = {
        ...fixtures.task[0],
        id: 'task-2',
        project_id: 'project-2',
        name: 'Other project task',
        sort_order: 9
    }
    await page.addInitScript(extraTask => {
        const invoke = window.__TAURI_INTERNALS__.invoke
        window.__TAURI_INTERNALS__.invoke = async (command, args) => {
            const result = await invoke(command, args)
            if (command === 'crud_action' && args.model === 'task' && args.action === 'get_all') {
                const response =
                    /** @type {{success: boolean, data: {list: object[], total: number}}} */ (
                        result
                    )
                return {
                    ...response,
                    data: {
                        list: [...response.data.list, extraTask],
                        total: response.data.total + 1
                    }
                }
            }
            return result
        }
    }, secondTask)
    await page.goto('/#/tasks')
    const source = page.locator('.task-tree-name').filter({ hasText: 'Design milestone' })
    const target = page.locator('.task-tree-name').filter({ hasText: 'Other project task' })
    await expect(source).toBeVisible()
    await expect(target).toBeVisible()
    const transfer = await page.evaluateHandle(() => new DataTransfer())
    await source.dispatchEvent('dragstart', { dataTransfer: transfer })
    await target.dispatchEvent('dragover', { dataTransfer: transfer })
    await expect(target).not.toHaveClass(/drag-over/)
    // Force the drop handler to run: rejecting hover alone is insufficient.
    await target.dispatchEvent('drop', { dataTransfer: transfer })
    await source.dispatchEvent('dragend', { dataTransfer: transfer })
    expect(
        await page.evaluate(() =>
            window.__EASY_PROJECT_CALLS__.filter(
                ({ args }) =>
                    args.model === 'task' && ['update', 'swap_order'].includes(args.action)
            )
        )
    ).toEqual([])
    await transfer.dispose()
})

test('does not announce reorder success when the task refresh fails', async ({ page }) => {
    const extra = { ...fixtures.task[0], id: 'task-2', name: 'Sibling task', sort_order: 2 }
    await page.addInitScript(extraTask => {
        const invoke = window.__TAURI_INTERNALS__.invoke
        let reordered = false
        window.__TAURI_INTERNALS__.invoke = async (command, args) => {
            const result = await invoke(command, args)
            if (args.model === 'task' && args.action === 'swap_order') reordered = true
            if (args.model === 'task' && args.action === 'get_all') {
                if (reordered) return { success: false, message: 'Simulated task refresh failure' }
                const response =
                    /** @type {{success: boolean, data: {list: object[], total: number}}} */ (
                        result
                    )
                return { ...response, data: { list: [...response.data.list, extraTask], total: 2 } }
            }
            return result
        }
    }, extra)
    await page.goto('/#/tasks')
    const source = page.locator('.task-tree-name').filter({ hasText: 'Design milestone' })
    const target = page.locator('.task-tree-name').filter({ hasText: 'Sibling task' })
    await expect(target).toBeVisible()
    const transfer = await page.evaluateHandle(() => new DataTransfer())
    await source.dispatchEvent('dragstart', { dataTransfer: transfer })
    await target.dispatchEvent('drop', { dataTransfer: transfer })
    await expect(page.locator('.error-banner')).toHaveText('Simulated task refresh failure')
    await expect(page.locator('.success-banner')).toHaveCount(0)
    await transfer.dispose()
})

test('retries dependency save without creating the task twice', async ({ page }) => {
    await page.addInitScript(() => {
        const invoke = window.__TAURI_INTERNALS__.invoke
        let attempts = 0
        window.__TAURI_INTERNALS__.invoke = async (command, args) => {
            const result = await invoke(command, args)
            if (args.model === 'task' && args.action === 'add') {
                return { success: true, data: { id: 'created-task' } }
            }
            if (
                args.model === 'task_dependency' &&
                args.action === 'set_for_task' &&
                ++attempts === 1
            ) {
                return { success: false, message: 'Simulated dependency failure' }
            }
            return result
        }
    })
    await page.goto('/#/project/project-1')
    await page.getByRole('button', { name: /^(新建任务|New task)$/ }).click()
    const dialog = page.getByRole('dialog')
    await dialog.locator('#task-edit-name').fill('Retry task')
    // This retry scenario needs a valid draft; the form now enforces the same
    // required dictionaries as the server before attempting persistence.
    for (const [field, option] of [
        ['type', /^(任务|Task)$/],
        ['priority', /^P1 - /]
    ]) {
        const select = dialog.locator(`#task-edit-${field}`)
        await select.click()
        await page.getByRole('option', { name: option }).click()
        await expect(select).toContainText(option)
    }
    await dialog.getByRole('combobox', { name: /前置任务|Predecessors/ }).press('Space')
    await page.getByRole('option', { name: 'Design milestone', exact: true }).click()
    await page.keyboard.press('Escape')
    await dialog.getByRole('button', { name: /^(保存|Save)$/ }).click()
    await expect(dialog.getByRole('alert')).toContainText(/任务已创建|task was created/i)
    await dialog.getByRole('button', { name: /^(保存|Save)$/ }).click()
    await expect(page.locator('.success-banner')).toBeVisible()
    const calls = await page.evaluate(() => window.__EASY_PROJECT_CALLS__)
    expect(calls.filter(({ args }) => args.model === 'task' && args.action === 'add')).toHaveLength(
        1
    )
    const dependencies = calls.filter(
        ({ args }) => args.model === 'task_dependency' && args.action === 'set_for_task'
    )
    expect(dependencies).toHaveLength(2)
    expect(dependencies.every(({ args }) => args.data.taskId === 'created-task')).toBe(true)
})

test('does not save a stale Gantt drag after leaving its route', async ({ page }) => {
    await page.goto('/#/project/project-1')
    await page.locator('.view-switch button').nth(1).click()
    const bar = page.locator('.task-bar')
    await expect(bar).toBeVisible()
    const box = await bar.boundingBox()
    expect(box).not.toBeNull()
    const x = box.x + box.width / 2
    const y = box.y + box.height / 2
    await page.mouse.move(x, y)
    await page.mouse.down()
    await page.evaluate(() => {
        window.location.hash = '#/tasks'
    })
    await expect(page.locator('.workspace-table')).toBeVisible()
    await expect(page.locator('.gantt')).toHaveCount(0)
    await page.mouse.move(x + 84, y)
    await page.mouse.up()
    expect(
        await page.evaluate(() =>
            window.__EASY_PROJECT_CALLS__.filter(
                ({ args }) => args.model === 'task' && args.action === 'update'
            )
        )
    ).toEqual([])
})

test('shows baseline readback failure instead of a save success banner', async ({ page }) => {
    await page.addInitScript(() => {
        const invoke = window.__TAURI_INTERNALS__.invoke
        let saved = false
        window.__TAURI_INTERNALS__.invoke = async (command, args) => {
            if (args.model === 'plan_baseline' && args.action === 'save') saved = true
            if (saved && args.model === 'plan_baseline' && args.action === 'get_by_project') {
                return { success: false, message: 'Simulated baseline readback failure' }
            }
            return invoke(command, args)
        }
    })
    await page.goto('/#/project/project-1')
    await page.locator('.view-switch button').nth(1).click()
    await expect(page.locator('.task-bar')).toBeVisible()
    await page.getByRole('button', { name: /保存基线|Save baseline/i }).click()
    await expect(page.locator('.gantt-banner.error')).toHaveText(
        'Simulated baseline readback failure'
    )
    await expect(page.locator('.gantt-banner.success')).toHaveCount(0)
})

test('changes a task assignee from the Gantt editor', async ({ page }) => {
    await page.goto('/#/project/project-1')
    await page.locator('.view-switch button').nth(1).click()

    await page.locator('.task-bar').click()
    await expect(page.locator('.edit-panel')).toBeVisible()

    await page.locator('#gantt-edit-assignee').click()
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
    await card.hover()
    // Start the real native drag before scrolling to a wrapped row. dragTo
    // pre-scrolls both endpoints, which can move the source out of view first.
    const source = await card.boundingBox()
    await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2)
    await page.mouse.down()
    await page.mouse.move(source.x + source.width / 2 + 12, source.y + source.height / 2, {
        steps: 5
    })
    const target = page.locator('.board-column').nth(2)
    await target.scrollIntoViewIfNeeded()
    const destination = await target.boundingBox()
    await page.mouse.move(destination.x + destination.width / 2, destination.y + 30, { steps: 20 })
    await page.mouse.up()

    let calls = await page.evaluate(() => window.__EASY_PROJECT_CALLS__)
    expect(
        calls.some(
            ({ args }) =>
                args?.model === 'task' &&
                args?.action === 'update' &&
                args.data.id === 'task-1' &&
                args.data.status_id === 'TASK_STATUS:00000000000000000000000000000003' &&
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

    await page.locator('.availability-form > .p-inputtext').fill('Conference')
    await page.getByLabel('开始时间', { exact: true }).fill('2026-08-03')
    await page.getByLabel('开始时间', { exact: true }).press('Tab')
    await page.getByLabel('结束时间', { exact: true }).fill('2026-08-05')
    await page.getByLabel('结束时间', { exact: true }).press('Tab')
    await page.getByRole('button', { name: '添加', exact: true }).click()

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

test('creates a dependency by dropping on the actual target task bar', async ({ page }) => {
    await page.addInitScript(() => {
        const original = window.__TAURI_INTERNALS__.invoke
        window.__TAURI_INTERNALS__.invoke = async (command, args) => {
            const result = /** @type {{success: boolean, data: {list: object[]}}} */ (
                await original(command, args)
            )
            if (args?.model === 'task' && args?.action === 'get_all') {
                return {
                    success: true,
                    data: {
                        list: [
                            ...result.data.list,
                            {
                                ...result.data.list[0],
                                id: 'task-2',
                                name: 'Implementation',
                                sort_order: 2,
                                start_time: '2026-07-04 00:00:00',
                                end_time: '2026-07-06 00:00:00'
                            }
                        ]
                    }
                }
            }
            return result
        }
    })
    await page.goto('/#/project/project-1')
    await page.locator('.view-switch button').nth(1).click()
    const handle = page.locator('[data-task-id="task-1"] .link-handle')
    const target = page.locator('[data-task-id="task-2"]')
    await expect(target).toBeVisible()
    const start = await handle.boundingBox()
    const end = await target.boundingBox()
    expect(start).not.toBeNull()
    expect(end).not.toBeNull()
    await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2)
    await page.mouse.down()
    await expect(page.locator('.link-temp-layer')).toBeVisible()
    await page.mouse.move(end.x + end.width / 2, end.y + end.height / 2)
    await page.mouse.up()
    await expect
        .poll(() =>
            page.evaluate(() =>
                window.__EASY_PROJECT_CALLS__
                    .filter(
                        ({ args }) =>
                            args?.model === 'task_dependency' && args?.action === 'set_for_task'
                    )
                    .map(({ args }) => args.data)
            )
        )
        .toEqual([{ taskId: 'task-2', predecessorIds: ['task-1'] }])
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
    // The timeline navigation occupies the calendar's left edge. Exercise
    // creation in unobstructed cells rather than pressing that navigation button.
    await page.mouse.move(box.x + 80, box.y + 20)
    await page.mouse.down()
    await page.mouse.move(box.x + 150, box.y + 20)
    await page.mouse.up()

    await expect(page.locator('.create-panel')).toBeVisible()
    await page.locator('.create-name').fill('Plan launch')
    await page.locator('#gantt-create-start').fill('2026-07-17')
    await expect(page.locator('#gantt-create-start')).toHaveValue('2026-07-17')
    // Close the calendar before clicking another field, so an opening overlay
    // cannot interpret that pointer event as selecting a stale calendar day.
    await page.locator('#gantt-create-start').press('Escape')
    await page.locator('.create-name').click()
    await expect(page.locator('#gantt-create-start')).toHaveValue('2026-07-17')
    await page.locator('#gantt-create-effort').fill('2')
    await page.locator('#gantt-create-effort').press('Tab')
    await expect(page.locator('#gantt-create-end')).toHaveValue('2026-07-20')
    await page.locator('#gantt-create-assignee').click()
    await page.getByText('Bob', { exact: true }).click()
    await page.locator('#gantt-create-comment').fill('Coordinate release')
    await page.getByRole('dialog').locator('.btn-save').click()

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
