import { expect, test } from '@playwright/test'

for (const width of [1280, 960, 375]) {
    for (const dark of [false, true]) {
        test(`shared task statistics and drawer at ${width}px dark=${dark}`, async ({ page }) => {
            await page.setViewportSize({ width, height: 800 })
            await page.route('http://127.0.0.1:4173/', async route => {
                const response = await route.fetch()
                await route.fulfill({
                    response,
                    body: (await response.text()).replace(
                        /<style>/g,
                        '<style nonce="refinement-nonce">'
                    ),
                    headers: {
                        ...response.headers(),
                        'content-security-policy':
                            "default-src 'self'; script-src 'self'; style-src 'self' 'nonce-refinement-nonce'; style-src-attr 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https://home-host.tail2956dd.ts.net"
                    }
                })
            })
            await page.addInitScript(
                ({ dark }) => {
                    localStorage.setItem('easyproject-lang', 'zh-CN')
                    localStorage.setItem('easyproject-theme', dark ? 'dark' : 'light')
                    localStorage.setItem('easyproject-onboarding-done', 'true')
                    sessionStorage.setItem('easyproject.local-launch', 'desktop-preview')
                    window.isTauri = true
                    window.__EASY_PROJECT_CALLS__ = []
                    const colors = [
                        '#64748b',
                        '#3b82f6',
                        '#22c55e',
                        '#8b5cf6',
                        '#14b8a6',
                        '#f59e0b',
                        '#f43f5e',
                        '#06b6d4'
                    ]
                    const states = colors.map((color, i) => ({
                        id: 's' + i,
                        project_id: 'p1',
                        name: ['Pending', 'InProgress', 'Done'][i] || 'Phase ' + i,
                        builtin_key: ['Pending', 'InProgress', 'Done'][i] || '',
                        color,
                        is_completed: i === 2,
                        is_default: i === 0,
                        sort_order: i
                    }))
                    states.push({
                        id: 'empty',
                        project_id: 'p1',
                        name: 'No tasks',
                        builtin_key: '',
                        is_completed: false,
                        is_default: false,
                        color: '#d946ef',
                        sort_order: 9
                    })
                    const tasks = colors.map((_, i) => ({
                        id: 't' + i,
                        project_id: 'p1',
                        name:
                            i === 0
                                ? 'Parent goal'
                                : i === 1
                                  ? 'Child with a long complete name for tooltip'
                                  : 'Execution ' + i,
                        parent: i === 1 ? 't0' : '',
                        status_id: 's' + i,
                        status: states[i].name,
                        status_builtin_key: states[i].builtin_key,
                        is_completed: i === 2,
                        priority: 'Normal',
                        type: 'Task',
                        progress: i === 2 ? 100 : 30,
                        effort_days: 2,
                        effort_state: 'estimated',
                        start_time: '2026-10-27',
                        end_time: '2026-10-28',
                        schedule_mode: 'fixed_effort',
                        sort_order: i,
                        comment: 'Synthetic task details',
                        assignee: '',
                        summary:
                            i === 0
                                ? {
                                      has_children: true,
                                      direct_child_count: 1,
                                      completed_child_count: 0,
                                      effort_days: 2,
                                      progress: 30
                                  }
                                : undefined
                    }))
                    const statistics = {
                        top_level: {
                            total: 7,
                            statuses: states.map(s => ({
                                ...s,
                                count: tasks.filter(t => !t.parent && t.status_id === s.id).length
                            }))
                        },
                        all_tasks: {
                            total: 8,
                            statuses: states.map(s => ({
                                ...s,
                                count: tasks.filter(t => t.status_id === s.id).length
                            }))
                        }
                    }
                    window.__TAURI_INTERNALS__ = {
                        invoke: async (command, args) => {
                            window.__EASY_PROJECT_CALLS__.push({ command, args })
                            if (command !== 'crud_action') return null
                            if (args.action !== 'get_all')
                                throw Error('Read-only refinement fixture')
                            if (args.model === 'project')
                                return {
                                    success: true,
                                    data: {
                                        list: [
                                            {
                                                id: 'p1',
                                                name: 'Refinement fixture',
                                                status: 'InProgress',
                                                type: 'Private',
                                                owner: '',
                                                version: '1.0'
                                            }
                                        ],
                                        total: 1
                                    }
                                }
                            if (args.model === 'task_status')
                                return { success: true, data: { list: states } }
                            if (args.model === 'task') {
                                const filtered = args.data?.status
                                    ? tasks.filter(task => task.status_id === args.data.status)
                                    : tasks
                                const counts = args.data?.status
                                    ? Object.fromEntries(
                                          Object.entries(statistics).map(([scope, group]) => [
                                              scope,
                                              {
                                                  total: filtered.length,
                                                  statuses: group.statuses.map(state => ({
                                                      ...state,
                                                      count: filtered.filter(
                                                          task => task.status_id === state.id
                                                      ).length
                                                  }))
                                              }
                                          ])
                                      )
                                    : statistics
                                return {
                                    success: true,
                                    data: {
                                        list: filtered,
                                        total: filtered.length,
                                        statistics: counts
                                    }
                                }
                            }
                            return { success: true, data: { list: [], total: 0 } }
                        }
                    }
                },
                { dark }
            )
            for (const route of ['/#/tasks', '/#/project/p1']) {
                await page.goto(route)
                await expect(page.locator('.statistics-cards .status-stat')).toHaveCount(7)
                await expect(page.locator('.statistics-cards')).not.toContainText('No tasks')
                await expect(page.locator('.hierarchy-statistics [role="combobox"]')).toHaveCount(0)
                const stats = page.locator('.hierarchy-statistics')
                expect(await stats.evaluate(el => getComputedStyle(el).overflowY)).toBe('visible')
                const scopeToggle = page.getByRole('button', {
                    name: '当前：顶层任务；点击切换为全部任务',
                    exact: true
                })
                await scopeToggle.hover()
                await expect(page.getByRole('tooltip')).toHaveText(
                    '当前：顶层任务；点击切换为全部任务'
                )
                await page.mouse.move(0, 0)
                await scopeToggle.press('Enter')
                await expect(page.locator('.statistics-cards .status-stat')).toHaveCount(8)
                await page
                    .getByRole('button', {
                        name: '当前：全部任务；点击切换为顶层任务',
                        exact: true
                    })
                    .click()
                const overviewBefore = await page.locator('.status-stat').allTextContents()
                await expect(page.locator('.status-name').first()).toHaveText(
                    route.includes('project') ? '待办' : '待办 · Refinement fixture'
                )
                expect((await page.locator('.status-stat').first().boundingBox()).width).toBe(192)
                const phase = page.locator('.status-stat').filter({ hasText: 'Phase 3' })
                await phase.click()
                await expect
                    .poll(() =>
                        page.evaluate(
                            () =>
                                window.__EASY_PROJECT_CALLS__
                                    .filter(
                                        c =>
                                            c.args?.model === 'task' &&
                                            c.args?.action === 'get_all' &&
                                            c.args.data.pageSize === 20 &&
                                            Object.hasOwn(c.args.data, 'status')
                                    )
                                    .at(-1)?.args.data.status
                        )
                    )
                    .toBe('s3')
                await expect(page.locator('.filter-bar .p-select').first()).toContainText('Phase 3')
                await expect(page.locator('.statistics-cards .status-stat')).toHaveCount(7)
                await expect(page.locator('.status-stat')).toHaveText(overviewBefore)
                expect((await phase.boundingBox()).width).toBe(192)
                const tag = page.locator('tbody .pill').filter({ hasText: 'Phase 3' })
                const accent = await phase
                    .locator('.status-dot')
                    .evaluate(el => getComputedStyle(el).backgroundColor)
                expect(accent).toBe(await tag.evaluate(el => getComputedStyle(el).backgroundColor))
                expect(await phase.evaluate(el => getComputedStyle(el).backgroundColor)).not.toBe(
                    accent
                )
                await phase.click()
                await expect
                    .poll(() =>
                        page.evaluate(
                            () =>
                                window.__EASY_PROJECT_CALLS__
                                    .filter(
                                        c =>
                                            c.args?.model === 'task' &&
                                            c.args?.action === 'get_all' &&
                                            c.args.data.pageSize === 20 &&
                                            Object.hasOwn(c.args.data, 'status')
                                    )
                                    .at(-1)?.args.data.status
                        )
                    )
                    .toBe('')
                const table = page.locator('.table-card')
                await table.scrollIntoViewIfNeeded()
                const before = (await table.boundingBox()).height
                await page.getByRole('button', { name: '折叠状态统计', exact: true }).press('Enter')
                await expect(page.locator('.statistics-cards')).toHaveCount(0)
                await table.scrollIntoViewIfNeeded()
                expect((await table.boundingBox()).height).toBeGreaterThanOrEqual(before)
                if (width >= 1280)
                    expect((await table.boundingBox()).height).toBeGreaterThan(before + 1)
                const filterBar = page.locator('.filter-bar')
                const searchButton = filterBar.getByRole('button', { name: '搜索', exact: true })
                await expect(searchButton).toBeVisible()
                for (const name of ['搜索', '清除']) {
                    const button = filterBar.getByRole('button', { name, exact: true })
                    expect(await button.evaluate(el => getComputedStyle(el).whiteSpace)).toBe(
                        'nowrap'
                    )
                    expect((await button.boundingBox()).height).toBeLessThanOrEqual(42)
                }
                if (width === 960) {
                    expect(
                        await filterBar.evaluate(
                            el => getComputedStyle(el).gridTemplateColumns.split(' ').length
                        )
                    ).toBe(4)
                }
                const expanded = page.getByRole('button', { name: '折叠任务', exact: true }).first()
                if (await expanded.count()) await expanded.click()
                await page.getByRole('button', { name: '展开任务', exact: true }).first().click()
                const drawer = page.locator('.child-drawer').first()
                await expect(drawer).toContainText('Child with a long complete name')
                const drawerBox = await drawer.boundingBox(),
                    tableBox = await table.boundingBox()
                expect(tableBox.x + tableBox.width - drawerBox.x - drawerBox.width).toBeGreaterThan(
                    8
                )
                expect(tableBox.x + tableBox.width - drawerBox.x - drawerBox.width).toBeLessThan(50)
                expect(
                    await page.evaluate(
                        () => document.documentElement.scrollWidth <= innerWidth + 1
                    )
                ).toBe(true)
                await page.screenshot({
                    path: `test-results/task-refinement-${route.includes('project') ? 'project' : 'global'}-${width}-${dark}.png`
                })
            }
        })
    }
}
