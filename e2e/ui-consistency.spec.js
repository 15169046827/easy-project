import { expect, test } from '@playwright/test'

const projectName =
    'A very long project name for checking fixed column truncation and full hover text'
const taskName = 'A very long parent task name for checking fixed columns and pinned task names'
const fixtures = {
    project: [
        {
            id: 'p1',
            name: projectName,
            status: 'InProgress',
            calendar_country: 'CN',
            weekend_days: '[0,6]',
            calendar_exceptions: '[]'
        }
    ],
    task: [
        {
            id: 't1',
            name: taskName,
            project_id: 'p1',
            parent: '',
            sort_order: 1,
            status: 'InProgress',
            progress: 30,
            start_time: '2026-10-10',
            end_time: '2026-10-12',
            type: 'Task',
            priority: '2',
            comment: 'Long task comment',
            effort_days: 1,
            schedule_mode: 'fixed_dates'
        },
        {
            id: 't2',
            name: 'Child task',
            project_id: 'p1',
            parent: 't1',
            sort_order: 2,
            status: 'Pending',
            progress: 0,
            start_time: '2026-10-13',
            end_time: '2026-10-14',
            type: 'Task',
            priority: '3',
            comment: '',
            effort_days: 1,
            schedule_mode: 'fixed_dates'
        }
    ],
    task_dependency: [
        {
            id: 'd1',
            project_id: 'p1',
            predecessor_task_id: 't1',
            successor_task_id: 't2',
            dependency_type: 'FS',
            lag_days: 0
        }
    ],
    member: [],
    project_member: [],
    plan_baseline: []
}

test.beforeEach(async ({ page }) => {
    await page.addInitScript(data => {
        localStorage.setItem('easyproject-onboarding-done', 'true')
        window.__EASY_PROJECT_CALLS__ = []
        window.__TAURI_INTERNALS__ = {
            invoke: async (command, args) => {
                window.__EASY_PROJECT_CALLS__.push({ command, args })
                if (command !== 'crud_action') throw new Error('Unexpected command')
                if (args.model === 'data' && args.action === 'export_json')
                    return {
                        success: true,
                        data: {
                            schemaVersion: 5,
                            projects: data.project,
                            tasks: data.task,
                            dependencies: data.task_dependency,
                            members: [],
                            project_members: [],
                            plan_baselines: []
                        }
                    }
                if (args.action === 'set_for_task') {
                    data.task_dependency = args.data.predecessorIds.map((id, index) => ({
                        id: 'd' + index,
                        project_id: 'p1',
                        predecessor_task_id: id,
                        successor_task_id: args.data.taskId,
                        dependency_type: 'FS',
                        lag_days: 0
                    }))
                    return { success: true }
                }
                if (args.model === 'task' && args.action === 'delete') {
                    data.task = data.task.filter(task => !args.data.ids.includes(task.id))
                    return { success: true }
                }
                if (args.model === 'task' && args.action === 'update') {
                    Object.assign(data.task.find(task => task.id === args.data.id) || {}, args.data)
                    return { success: true }
                }
                const list = (data[args.model] || []).filter(
                    row => !args.data.projectId || row.project_id === args.data.projectId
                )
                return { success: true, data: { list, total: list.length } }
            }
        }
    }, fixtures)
})

async function measureWorkspace(page) {
    return page.evaluate(() => {
        const element = document.querySelector('.workspace-page')
        const rect = selector => {
            const r = element.querySelector(selector).getBoundingClientRect()
            return { x: r.x, y: r.y, width: r.width, height: r.height }
        }
        return {
            heading: rect('.workspace-heading'),
            stats: rect('.workspace-stats'),
            card: rect('.workspace-stats > *'),
            toolbar: rect('.workspace-toolbar'),
            content: rect('.dashboard-grid, .table-card'),
            scroll: document.documentElement.scrollHeight > window.innerHeight
        }
    })
}

for (const size of [
    { width: 1280, height: 800 },
    { width: 960, height: 640 }
]) {
    for (const dark of [false, true]) {
        test(`aligns route borders and statistics at ${size.width}px ${dark ? 'dark' : 'light'}`, async ({
            page
        }, testInfo) => {
            await page.setViewportSize(size)
            await page.addInitScript(
                value => localStorage.setItem('easyproject-theme', value),
                dark ? 'dark' : 'light'
            )
            const layouts = []
            for (const path of ['dashboard', 'projects', 'tasks', 'members']) {
                await page.goto('/#/' + path)
                await expect(page.locator('.workspace-stats > *')).toHaveCount(4)
                await expect(page.locator('.workspace-page')).toBeVisible()
                const controlsInViewport = await page.locator('.app-header').evaluate(header =>
                    [...header.querySelectorAll('button, .lang-select')].every(node => {
                        const rect = node.getBoundingClientRect()
                        return rect.x >= 0 && rect.right <= window.innerWidth
                    })
                )
                expect(controlsInViewport).toBe(true)
                await expect(page.locator('.workspace-stats > *').first()).toBeVisible()
                let geometry = await measureWorkspace(page)
                await expect
                    .poll(async () => {
                        geometry = await measureWorkspace(page)
                        return geometry.card.height
                    })
                    .toBe(76)
                layouts.push(geometry)
                expect(geometry.card.height).toBe(76)
                expect(geometry.scroll).toBe(false)
                expect(Math.abs(geometry.heading.x - geometry.content.x)).toBeLessThanOrEqual(1)
                await page.screenshot({ path: testInfo.outputPath(path + '.png') })
            }
            for (const actual of layouts.slice(1)) {
                for (const section of ['heading', 'stats', 'toolbar', 'content']) {
                    for (const field of ['x', 'y', 'width'])
                        expect(
                            Math.abs(actual[section][field] - layouts[0][section][field])
                        ).toBeLessThanOrEqual(1)
                }
            }
        })
    }
}

for (const locale of ['zh-CN', 'en-US']) {
    for (const windowChrome of [false, true]) {
        test(`keeps all header controls visible at 960px in ${locale}, chrome=${windowChrome}`, async ({
            page
        }) => {
            await page.setViewportSize({ width: 960, height: 640 })
            await page.addInitScript(
                value => localStorage.setItem('easyproject-lang', value),
                locale
            )
            await page.goto(windowChrome ? '/?windowChrome=1#/dashboard' : '/#/dashboard')
            await expect(page.locator('.help-toggle')).toBeInViewport({ ratio: 1 })
            const boxes = await page.locator('.app-header').evaluate(header => {
                const nav = header.querySelector('nav').getBoundingClientRect()
                const actions = header.querySelector('.header-actions').getBoundingClientRect()
                const label = header.querySelector('.p-select-label')
                return {
                    navRight: nav.right,
                    actionsLeft: actions.left,
                    actionsRight: actions.right,
                    width: window.innerWidth,
                    labelFits: label.scrollWidth <= label.clientWidth
                }
            })
            expect(boxes.navRight).toBeLessThanOrEqual(boxes.actionsLeft)
            expect(boxes.actionsRight).toBeLessThanOrEqual(boxes.width)
            expect(boxes.labelFits).toBe(true)
        })
    }
}

test('keeps fixed, left-aligned names visible while optional columns scroll', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/#/tasks')
    await expect(page.locator('.tstat-icon.progress .pi-spin')).toHaveCount(0)
    const name = page.locator('.task-name-text').first()
    await expect(name).toHaveAttribute('title', taskName)
    expect(await name.evaluate(node => getComputedStyle(node).textAlign)).toBe('left')
    const container = page.locator('.p-datatable-table-container')
    expect(await container.evaluate(node => node.scrollWidth <= node.clientWidth + 1)).toBe(true)
    await page.getByRole('combobox', { name: '显示列' }).press('Space')
    await page.getByRole('option', { name: '备注', exact: true }).click()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('columnheader', { name: '备注', exact: true })).toBeVisible()
    await page.reload()
    await expect(page.getByRole('columnheader', { name: '备注', exact: true })).toBeVisible()
    await page.setViewportSize({ width: 960, height: 640 })
    const before = await name.boundingBox()
    await container.evaluate(node => {
        node.scrollLeft = node.scrollWidth
    })
    const after = await name.boundingBox()
    expect(Math.abs(after.x - before.x)).toBeLessThanOrEqual(1)
})

test('excludes the hidden project column from embedded column preferences', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/#/project/p1')
    await expect(page.locator('.column-toolbar .p-multiselect-label')).toHaveText('已选5列')
    await page.getByRole('button', { name: '恢复默认列', exact: true }).click()
    await expect(page.locator('.column-toolbar .p-multiselect-label')).toHaveText('已选5列')
    const container = page.locator('.p-datatable-table-container')
    expect(await container.evaluate(node => node.scrollWidth <= node.clientWidth + 1)).toBe(true)
})

test('shows relationship names and saves an empty predecessor selection', async ({ page }) => {
    await page.goto('/#/tasks')
    await page.getByRole('button', { name: '展开任务', exact: true }).click()
    const child = page.getByRole('row').filter({ hasText: 'Child task' })
    await expect(child.locator('.cell-ellipsis[title="' + taskName + '"]')).toHaveCount(2)
    await child.locator('.p-datatable-row-editor-init').click()
    const editingRow = page
        .locator('tr')
        .filter({ has: page.locator('.p-datatable-row-editor-save') })
    await expect(editingRow.locator('select[multiple]')).toHaveCount(0)
    await editingRow.locator('.p-multiselect-clear-icon').click()
    await editingRow.locator('.p-datatable-row-editor-save').click()
    await expect(page.locator('.success-banner')).toBeVisible()
    const calls = await page.evaluate(() => window.__EASY_PROJECT_CALLS__)
    expect(
        calls.some(
            call =>
                call.args.action === 'set_for_task' &&
                call.args.data.taskId === 't2' &&
                call.args.data.predecessorIds.length === 0
        )
    ).toBe(true)
})

test('uses an application delete dialog with cancel and clears the search inline', async ({
    page
}) => {
    await page.goto('/#/tasks')
    await page.getByPlaceholder('搜索任务名称或备注').fill('Parent')
    await page.getByRole('button', { name: '清空任务搜索', exact: true }).click()
    await expect(page.getByPlaceholder('搜索任务名称或备注')).toHaveValue('')
    await page.getByRole('button', { name: '展开任务', exact: true }).click()
    const child = page.getByRole('row').filter({ hasText: 'Child task' })
    await child.getByRole('checkbox').check()
    await page.getByRole('button', { name: '删除', exact: true }).click()
    await expect(page.getByRole('dialog', { name: '删除任务' })).toBeVisible()
    expect(
        await page.evaluate(() =>
            window.__EASY_PROJECT_CALLS__.some(call => call.args.action === 'delete')
        )
    ).toBe(false)
    await page.getByRole('button', { name: '取消', exact: true }).click()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await page.getByRole('button', { name: '删除', exact: true }).click()
    await page.getByRole('dialog').getByRole('button', { name: '删除', exact: true }).click()
    await expect(page.locator('.success-banner')).toBeVisible()
    expect(
        await page.evaluate(
            () => window.__EASY_PROJECT_CALLS__.filter(call => call.args.action === 'delete').length
        )
    ).toBe(1)
})
