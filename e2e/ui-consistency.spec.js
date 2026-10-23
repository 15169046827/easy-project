import { expect, test } from '@playwright/test'

for (const width of [1280, 960]) {
    for (const dark of [false, true]) {
        test(`keeps opt-in remote entry compact at ${width}px dark=${dark}`, async ({ page }) => {
            await page.setViewportSize({ width, height: 800 })
            await page.addInitScript(dark => {
                window.isTauri = true
                if (!sessionStorage.getItem('compact-entry-initialized')) {
                    sessionStorage.setItem('easyproject.local-launch', 'desktop-preview')
                    sessionStorage.setItem('compact-entry-initialized', '1')
                }
                // Exercise the real entry without native window IPC in this
                // browser-only layout test; actual Windows gets separate QA.
                Object.defineProperty(navigator, 'userAgent', {
                    get: () => 'EasyProject layout test'
                })
                localStorage.setItem('easyproject-theme', dark ? 'dark' : 'light')
            }, dark)
            await page.goto('/?windowChrome=1#/dashboard')
            const entry = page.locator('.remote-connect-entry')
            await expect(entry).toBeVisible()
            await expect(entry).toHaveText('')
            const box = await entry.boundingBox()
            expect(box.height).toBeLessThanOrEqual(36)
            expect(box.x + box.width).toBeLessThanOrEqual(width)
            await entry.focus()
            await page.keyboard.press('Enter')
            await expect(page.getByRole('menu')).toContainText(/本地模式|Local mode/)
            await page.getByRole('menuitem', { name: /登录账号|Sign in to your account/ }).click()
            await expect(page.locator('#remote-username')).toBeVisible()
            await expect(page.locator('input[type="url"]')).toHaveCount(0)
        })
    }
}

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
            priority: 'High',
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
            status: 'Todo',
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
    member: [{ id: 'm1', name: 'Example Member', email: '', role: 'Developer' }],
    project_member: [],
    plan_baseline: []
}

test.beforeEach(async ({ page }) => {
    await page.addInitScript(data => {
        data.task_status = data.project.flatMap(project =>
            ['Pending', 'InProgress', 'Done'].map((key, index) => ({
                id: `TASK_STATUS:${String(index + 1).padStart(32, '0')}`,
                project_id: project.id,
                name: key,
                builtin_key: key,
                is_default: index === 0,
                is_completed: key === 'Done',
                color: '#64748b',
                sort_order: index
            }))
        )
        data.task.forEach(task => {
            const state = data.task_status.find(
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
                const list = (data[args.model] || [])
                    .filter(row => !args.data.projectId || row.project_id === args.data.projectId)
                    .filter(row => {
                        if (args.model !== 'task' || !args.data.status) return true
                        if (args.data.status === 'Pending')
                            return ['Todo', 'Pending'].includes(row.status)
                        if (args.data.status === 'Overdue')
                            return (
                                !['Done', 'Archived'].includes(row.status) &&
                                new Date(row.end_time) < new Date()
                            )
                        if (args.data.status === 'Done') return row.is_completed
                        return row.status_id === args.data.status || row.status === args.data.status
                    })
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
            const routeEyebrows = {
                dashboard: 'DASHBOARD',
                projects: 'PROJECT MANAGEMENT',
                tasks: 'TASK MANAGEMENT',
                members: 'TEAM MANAGEMENT'
            }
            for (const path of ['dashboard', 'projects', 'tasks', 'members']) {
                await page.goto('/#/' + path)
                await expect(page.locator('.workspace-heading .eyebrow')).toHaveText(
                    routeEyebrows[path]
                )
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
                if (path === 'dashboard') {
                    const offsets = await page
                        .locator('.metric-card')
                        .evaluateAll(cards =>
                            cards.map(
                                card =>
                                    card.querySelector('.metric-icon').getBoundingClientRect().x -
                                    card.getBoundingClientRect().x
                            )
                        )
                    for (const offset of offsets)
                        expect(Math.abs(offset - offsets[0])).toBeLessThanOrEqual(1)
                }
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
    await name.hover()
    await expect(page.getByRole('tooltip')).toHaveText(taskName)
    await page.mouse.move(0, 0)
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

for (const dark of [false, true]) {
    test(`board fixed columns wrap and clipped text stays discoverable dark=${dark}`, async ({
        page
    }) => {
        const longName = 'LongTaskTitle'.repeat(30)
        const longComment = 'Long task description with full hover details. '.repeat(20)
        await page.addInitScript(
            ({ dark, longName, longComment }) => {
                localStorage.setItem('easyproject-theme', dark ? 'dark' : 'light')
                const original = window.__TAURI_INTERNALS__.invoke
                window.__TAURI_INTERNALS__.invoke = async (command, args) => {
                    const result =
                        /** @type {{ data: { list: Array<Record<string, unknown>> } }} */ (
                            await original(command, args)
                        )
                    if (args?.model === 'task_status' && args.action === 'get_all') {
                        const sample = result.data.list[0]
                        result.data.list = [
                            ...result.data.list,
                            ...[4, 5, 6].map(index => ({
                                ...sample,
                                id: `TASK_STATUS:${String(index).padStart(32, '0')}`,
                                name: `Custom ${index}`,
                                builtin_key: null,
                                is_default: false
                            }))
                        ]
                    }
                    if (args?.model === 'task' && args.action === 'get_all') {
                        const sample = result.data.list[0]
                        result.data.list = [
                            ...result.data.list,
                            ...Array.from({ length: 20 }, (_, index) => ({
                                ...sample,
                                id: `long-${index}`,
                                parent: '',
                                name: `${longName}-${index}`,
                                comment: longComment
                            }))
                        ]
                    }
                    return result
                }
            },
            { dark, longName, longComment }
        )
        await page.setViewportSize({ width: 1280, height: 800 })
        await page.goto('/#/project/p1')
        await page.getByRole('button', { name: /看板|Board/ }).click()
        await expect(page.locator('.board-column')).toHaveCount(6)
        for (const [width, height, perRow] of [
            [1280, 800, 2],
            [1920, 1080, 4],
            [960, 640, 2],
            [640, 640, 1]
        ]) {
            await page.setViewportSize({ width, height })
            const geometry = await page.locator('.board-columns').evaluate(node => {
                const columns = [...node.querySelectorAll('.board-column')]
                const boxes = columns.map(x => x.getBoundingClientRect())
                const list = columns[1].querySelector('.card-list')
                const card = list.querySelector('.board-card')
                return {
                    perRow: boxes.filter(x => Math.abs(x.y - boxes[0].y) < 1).length,
                    width: boxes[0].width,
                    overflow: node.scrollWidth > node.clientWidth + 1,
                    wrapped: boxes.at(-1).y > boxes[0].y,
                    scrolls: list.scrollHeight > list.clientHeight,
                    aligned: getComputedStyle(card).justifyItems,
                    titleClamp: getComputedStyle(card.querySelector('strong')).webkitLineClamp
                }
            })
                expect(geometry.perRow, JSON.stringify({ width, ...geometry })).toBe(perRow)
                expect(geometry.width).toBeLessThanOrEqual(421)
            expect(geometry.overflow).toBe(false)
            expect(geometry.wrapped).toBe(true)
            expect(geometry.scrolls).toBe(true)
            expect(geometry.aligned).toBe('stretch')
            expect(geometry.titleClamp).toBe('2')
        }
        await page.setViewportSize({ width: 1280, height: 800 })
        const card = page.locator('.board-card').filter({ hasText: `${longName}-0` })
        await card.locator('strong').hover()
        await expect(page.getByRole('tooltip')).toHaveText(`${longName}-0`)
        await card.locator('p').hover()
        await expect(page.getByRole('tooltip')).toHaveText(longComment.trim())
        await card.focus()
        await expect(card).toBeFocused()
    })
}

test('excludes the hidden project column from embedded column preferences', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/#/project/p1')
    await expect(page.locator('.column-toolbar .p-multiselect-label')).toHaveText('已选5列')
    await page.getByRole('button', { name: '恢复默认列', exact: true }).click()
    await expect(page.locator('.column-toolbar .p-multiselect-label')).toHaveText('已选5列')
    const container = page.locator('.p-datatable-table-container')
    expect(await container.evaluate(node => node.scrollWidth <= node.clientWidth + 1)).toBe(true)
})

test('keeps navigation geometry unchanged on hover and keyboard focus', async ({ page }) => {
    await page.setViewportSize({ width: 960, height: 640 })
    await page.goto('/#/dashboard')
    const nav = page.getByRole('navigation')
    const initial = await nav.boundingBox()
    for (const button of await nav.getByRole('button').all()) {
        const box = await button.boundingBox()
        await button.hover()
        await expect.poll(() => button.boundingBox()).toEqual(box)
        await button.focus()
        await expect.poll(() => button.boundingBox()).toEqual(box)
        expect(await nav.boundingBox()).toEqual(initial)
    }
})

test('edits in a modal without expanding hidden columns and cancels its draft at narrow widths', async ({
    page
}) => {
    await page.setViewportSize({ width: 960, height: 640 })
    await page.goto('/#/tasks')
    const table = page.locator('.workspace-table')
    await expect(table.getByRole('columnheader', { name: '名称', exact: true })).toBeVisible()
    const count = await table.getByRole('columnheader').count()
    await table.getByRole('button', { name: '编辑', exact: true }).first().click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.locator('#task-edit-priority')).toHaveText('P2 - 高')
    expect(await table.getByRole('columnheader').count()).toBe(count)
    await dialog.locator('#task-edit-name').fill('Unsaved draft')
    const cancel = dialog.getByRole('button', { name: '取消', exact: true })
    const bounds = await cancel.boundingBox()
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(640)
    await cancel.click()
    await expect(dialog).toHaveCount(0)
    await expect(table.locator('.task-name-text').first()).toHaveText(taskName)
    expect(await table.getByRole('columnheader').count()).toBe(count)
    const calls = await page.evaluate(() => window.__EASY_PROJECT_CALLS__)
    expect(
        calls.filter(call => ['add', 'update', 'set_for_task'].includes(call.args.action))
    ).toHaveLength(0)
})

test('shows relationship names and saves an empty predecessor selection', async ({ page }) => {
    await page.goto('/#/tasks')
    await page.getByRole('button', { name: '展开任务', exact: true }).click()
    const child = page.getByRole('row').filter({ hasText: 'Child task' })
    await expect(child.locator('.cell-ellipsis').filter({ hasText: taskName })).toHaveCount(2)
    await child.getByRole('button', { name: '编辑', exact: true }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.locator('#task-edit-status')).toHaveText('待办')
    await expect(dialog.locator('select[multiple]')).toHaveCount(0)
    await dialog.locator('.p-multiselect-clear-icon').click()
    await dialog.getByRole('button', { name: '保存', exact: true }).click()
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

for (const dark of [false, true]) {
    test(`stable dashboard and member pointer/keyboard states in ${dark ? 'dark' : 'light'}`, async ({
        page
    }) => {
        await page.setViewportSize({ width: 960, height: 640 })
        await page.route('http://127.0.0.1:4173/', async route => {
            const response = await route.fetch()
            await route.fulfill({
                response,
                body: (await response.text()).replace(
                    /<style>/g,
                    '<style nonce="status-response-nonce">'
                ),
                headers: {
                    ...response.headers(),
                    'content-security-policy': "style-src 'self' 'nonce-status-response-nonce'"
                }
            })
        })
        await page.addInitScript(
            value => localStorage.setItem('easyproject-theme', value),
            dark ? 'dark' : 'light'
        )
        await page.goto('/#/dashboard')
        const cards = page.locator('.metric-card')
        await expect(cards).toHaveCount(4)
        const backgrounds = []
        for (const card of await cards.all()) {
            const box = await card.boundingBox()
            await card.hover()
            backgrounds.push(await card.evaluate(node => getComputedStyle(node).backgroundColor))
            expect(await card.boundingBox()).toEqual(box)
            await card.focus()
            expect(await card.boundingBox()).toEqual(box)
        }
        expect(new Set(backgrounds).size).toBe(1)
        const statuses = page.locator('.status-list button')
        // The two states actually used by this project are dynamic, not three fixed buckets.
        await expect(statuses).toHaveCount(2)
        expect(
            await page
                .locator('style[data-primevue-style-id]')
                .evaluateAll(styles =>
                    styles.every(style => style.nonce === 'status-response-nonce')
                )
        ).toBe(true)
        await page.mouse.move(0, 0)
        for (const status of await statuses.all()) {
            const before = await status.boundingBox()
            for (const action of ['hover', 'focus']) {
                await status[action]()
                const frames = await status.evaluate(async node => {
                    const result = []
                    for (let i = 0; i < 20; i++) {
                        await new Promise(resolve => requestAnimationFrame(resolve))
                        const rect = node.getBoundingClientRect()
                        result.push({
                            x: rect.x,
                            y: rect.y,
                            width: rect.width,
                            height: rect.height
                        })
                    }
                    return result
                })
                expect(frames).toEqual(Array.from({ length: 20 }, () => before))
            }
        }
        const attention = page.locator('.attention-list button').first()
        await expect(attention).toBeVisible()
        await page.mouse.move(0, 0)
        const border = await attention.evaluate(node => getComputedStyle(node).borderBottomColor)
        await attention.hover()
        const samples = await attention.evaluate(async node => {
            const result = []
            for (let i = 0; i < 15; i++) {
                await new Promise(resolve => requestAnimationFrame(resolve))
                const style = getComputedStyle(node)
                result.push([style.borderBottomColor, style.outlineStyle, style.boxShadow])
            }
            return result
        })
        expect(
            samples.every(
                ([color, outline, shadow]) =>
                    color === border && outline === 'none' && shadow === 'none'
            )
        ).toBe(true)
        await attention.focus()
        await expect(attention).toHaveCSS('outline-style', 'solid')
        await page.goto('/#/members')
        const trigger = page.locator('.member-trigger').first()
        await expect(trigger).toBeVisible()
        const row = trigger.locator('xpath=ancestor::tr')
        const before = await row.boundingBox()
        for (const action of ['hover', 'focus']) {
            await trigger[action]()
            expect(await row.boundingBox()).toEqual(before)
            const avatar = await trigger.locator('.avatar-circle').boundingBox()
            const name = await trigger.locator('.member-name').boundingBox()
            expect(avatar.width).toBe(32)
            expect(avatar.x + avatar.width).toBeLessThanOrEqual(name.x)
        }
        await trigger.press('Enter')
        await expect(page.locator('.member-detail')).toBeVisible()
    })
}

test('dashboard status and overdue cards navigate to an effective, clearable task filter', async ({
    page
}) => {
    for (const [status, suffix] of [
        ['Pending', '1'],
        ['InProgress', '2']
    ]) {
        const statusId = `TASK_STATUS:${suffix.padStart(32, '0')}`
        await page.goto('/#/dashboard')
        const index = ['InProgress', 'Pending'].indexOf(status)
        await page.locator('.status-list button').nth(index).click()
        await expect(page).toHaveURL(new RegExp(`status=${statusId}`))
        await expect
            .poll(() =>
                page.evaluate(
                    () =>
                        window.__EASY_PROJECT_CALLS__
                            .filter(
                                call =>
                                    call.args.model === 'task' &&
                                    call.args.action === 'get_all' &&
                                    Object.hasOwn(call.args.data, 'status')
                            )
                            .at(-1)?.args.data.status
                )
            )
            .toBe(statusId)
        await expect(page.locator('.filter-bar .p-select').first()).toContainText(
            status === 'Pending' ? '待办' : status === 'Done' ? '完成' : '进行中'
        )
        if (status === 'Pending') {
            await expect(
                page.locator('.task-stats .tstat-card').last().locator('strong')
            ).toHaveText('1')
        }
    }
    await page.goto('/#/dashboard')
    await page.locator('.metric-card').nth(2).click()
    await expect(page).toHaveURL(/status=Done/)
    await page.goto('/#/dashboard')
    await page.locator('.metric-card').nth(3).click()
    await expect(page).toHaveURL(/status=Overdue/)
    await expect(page.locator('.filter-bar .p-select').first()).toContainText('逾期')
    await page.getByRole('button', { name: '清除', exact: true }).click()
    await expect
        .poll(() =>
            page.evaluate(
                () =>
                    window.__EASY_PROJECT_CALLS__
                        .filter(
                            call =>
                                call.args.model === 'task' &&
                                call.args.action === 'get_all' &&
                                Object.hasOwn(call.args.data, 'status')
                        )
                        .at(-1)?.args.data.status
            )
        )
        .toBe('')
})

test('task progress slider supports dragging, keyboard and a numeric percentage', async ({
    page
}) => {
    await page.goto('/#/tasks')
    await page.getByRole('button', { name: '编辑', exact: true }).first().click()
    const dialog = page.getByRole('dialog')
    const slider = dialog.getByRole('slider')
    await expect(slider).toHaveAttribute('aria-valuenow', '30')
    await slider.press('ArrowRight')
    await expect(dialog.locator('#task-edit-progress')).toHaveValue('31%')
    await dialog.locator('#task-edit-progress').fill('73')
    await dialog.locator('#task-edit-name').click()
    await expect(slider).toHaveAttribute('aria-valuenow', '73')
    const track = dialog.locator('.p-slider')
    const bounds = await track.boundingBox()
    await page.mouse.click(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2)
    await expect
        .poll(async () => Number(await slider.getAttribute('aria-valuenow')))
        .toBeGreaterThanOrEqual(49)
    await expect
        .poll(async () => Number(await slider.getAttribute('aria-valuenow')))
        .toBeLessThanOrEqual(51)
    await dialog.getByRole('button', { name: '保存', exact: true }).click()
    await expect(page.locator('.success-banner')).toBeVisible()
    const update = await page.evaluate(() =>
        window.__EASY_PROJECT_CALLS__.find(
            call => call.args.model === 'task' && call.args.action === 'update'
        )
    )
    expect(update.args.data.progress).toBeGreaterThanOrEqual(49)
    expect(update.args.data.progress).toBeLessThanOrEqual(51)
})

test('floating cards follow the resized viewport and collapse to a keyboard-accessible ball', async ({
    page
}) => {
    for (const dark of [false, true]) {
        await page.addInitScript(
            value => localStorage.setItem('easyproject-theme', value),
            dark ? 'dark' : 'light'
        )
        for (const size of [
            { width: 340, height: 360 },
            { width: 500, height: 600 }
        ]) {
            await page.setViewportSize(size)
            await page.goto('/#/floating')
            await expect(page.locator('.floating-task')).toHaveCount(2)
            const bounds = await page.getByTestId('floating-window').boundingBox()
            expect(bounds.width).toBe(size.width)
            expect(bounds.height).toBe(size.height)
            await expect(page.locator('footer')).toBeInViewport({ ratio: 1 })
            await page.getByRole('button', { name: '收起', exact: true }).click()
            const ball = page.locator('.floating-ball')
            await expect(ball).toBeVisible()
            expect((await page.getByTestId('floating-window').boundingBox()).width).toBe(64)
            await ball.press('Enter')
            await expect(page.locator('.floating-content')).toBeVisible()
        }
    }
})

test('percentage sliders and dialogs retain PrimeVue styling under strict nonce CSP', async ({
    page
}) => {
    const violations = []
    page.on('console', message => {
        if (/Refused to apply.*style/i.test(message.text())) violations.push(message.text())
    })
    await page.route('http://127.0.0.1:4173/', async route => {
        const response = await route.fetch()
        await route.fulfill({
            response,
            body: (await response.text()).replace(/<style>/g, '<style nonce="ui-response-nonce">'),
            headers: {
                ...response.headers(),
                'content-security-policy': "style-src 'self' 'nonce-ui-response-nonce'"
            }
        })
    })
    await page.goto('/#/tasks')
    await page.getByRole('button', { name: '编辑', exact: true }).first().click()
    await expect(page.getByRole('dialog').getByRole('slider')).toHaveCSS('position', 'absolute')
    expect(
        await page
            .locator('style[data-primevue-style-id]')
            .evaluateAll(styles => styles.every(style => style.nonce === 'ui-response-nonce'))
    ).toBe(true)
    expect(violations).toEqual([])
})
