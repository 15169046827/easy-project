import { expect, test } from '@playwright/test'

for (const width of [1920, 1280, 960])
    for (const dark of [false, true]) {
        test(`complete Gantt hierarchy ${width} dark=${dark}`, async ({ page }) => {
            await page.setViewportSize({ width, height: 800 })
            await page.route('http://127.0.0.1:4173/', async route => {
                const response = await route.fetch()
                await route.fulfill({
                    response,
                    body: (await response.text()).replace(
                        /<style>/g,
                        '<style nonce="gantt-hierarchy">'
                    ),
                    headers: {
                        ...response.headers(),
                        'content-security-policy':
                            "default-src 'self'; script-src 'self'; style-src 'self' 'nonce-gantt-hierarchy'; style-src-attr 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'"
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
                    const tasks = [
                        {
                            id: 'root',
                            name: 'Parent envelope',
                            parent: '',
                            start_time: '',
                            end_time: '',
                            sort_order: 1
                        },
                        {
                            id: 'child',
                            name: 'Dated child',
                            parent: 'root',
                            start_time: '2026-10-28',
                            end_time: '2026-10-30',
                            sort_order: 1
                        },
                        {
                            id: 'empty',
                            name: 'Unscheduled child',
                            parent: 'root',
                            start_time: '',
                            end_time: '',
                            sort_order: 2
                        },
                        {
                            id: 'other',
                            name: 'Conflicting successor',
                            parent: '',
                            start_time: '2026-10-28',
                            end_time: '2026-10-29',
                            sort_order: 2
                        }
                    ].map(t => ({
                        project_id: 'p',
                        type: 'Task',
                        priority: 'Normal',
                        status: 'Pending',
                        progress: 0,
                        effort_days: 1,
                        schedule_mode: 'fixed_dates',
                        ...t
                    }))
                    window.__TAURI_INTERNALS__ = {
                        invoke: async (command, args) => {
                            window.__EASY_PROJECT_CALLS__.push({ command, args })
                            if (command !== 'crud_action') return null
                            if (args.model === 'task' && args.action === 'swap_order') {
                                const a = tasks.find(t => t.id === args.data.source_id),
                                    b = tasks.find(t => t.id === args.data.target_id)
                                if (a.parent !== b.parent) throw Error('Non-sibling reorder')
                                ;[a.sort_order, b.sort_order] = [b.sort_order, a.sort_order]
                                return { success: true, data: {} }
                            }
                            if (args.action !== 'get_all' && args.action !== 'get_by_project')
                                throw Error('Unexpected write')
                            const list =
                                args.model === 'task'
                                    ? tasks
                                    : args.model === 'project'
                                      ? [
                                            {
                                                id: 'p',
                                                name: 'Gantt fixture',
                                                type: 'private',
                                                status: 'InProgress'
                                            }
                                        ]
                                      : args.model === 'task_dependency'
                                        ? [
                                              {
                                                  id: 'edge',
                                                  predecessor_task_id: 'child',
                                                  successor_task_id: 'other',
                                                  dependency_type: 'FS',
                                                  lag_minutes: 0
                                              }
                                          ]
                                        : []
                            return { success: true, data: { list, total: list.length } }
                        }
                    }
                },
                { dark }
            )
            await page.goto('/#/project/p')
            await page.getByRole('button', { name: /甘特图$/ }).click()
            const chart = page.locator('.gantt')
            await expect(page.locator('.gantt-row')).toHaveCount(4)
            const size = await page.locator('.gantt-scroller').evaluate(el => ({
                client: el.clientWidth,
                chart: el.querySelector('.gantt').getBoundingClientRect().width
            }))
            expect(size.chart).toBeGreaterThanOrEqual(size.client - 1)
            const label = await page.locator('.task-label').first().boundingBox(),
                nav = await page.locator('.timeline-nav-left').boundingBox()
            expect(nav.x).toBeGreaterThanOrEqual(label.x + label.width)
            const empty = page.locator('[data-row-task-id="empty"]')
            await expect(empty).toContainText('Unscheduled child')
            await expect(empty.locator('.task-bar')).toHaveCount(0)
            await expect(page.locator('.gantt-banner.warning')).toContainText(
                'Conflicting successor'
            )
            await expect(page.locator('[data-row-task-id="other"]')).toHaveClass(
                /schedule-conflict/
            )
            const root = page.locator('[data-row-task-id="root"]')
            await expect(root.locator('.bar-dates')).toHaveText('10/28 – 10/30')
            await root.getByRole('button', { name: '折叠任务', exact: true }).click()
            await expect(page.locator('.gantt-row')).toHaveCount(2)
            await root.getByRole('button', { name: '展开任务', exact: true }).click()
            await expect(page.locator('.gantt-row')).toHaveCount(4)
            await root
                .locator('.reorder-handle')
                .dragTo(page.locator('[data-row-task-id="other"] .task-label'))
            await expect
                .poll(() =>
                    page.evaluate(() =>
                        window.__EASY_PROJECT_CALLS__.some(c => c.args?.action === 'swap_order')
                    )
                )
                .toBe(true)
            await expect(chart.locator('.gantt-row').first()).toHaveAttribute(
                'data-row-task-id',
                'other'
            )
            await page.mouse.move(0, 0)
            await page.screenshot({ path: `test-results/gantt-hierarchy-${width}-${dark}.png` })
        })
    }
