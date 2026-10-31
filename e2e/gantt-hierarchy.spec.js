import { expect, test } from '@playwright/test'
import { verifyGanttNavigation } from './helpers/ganttNavigation.js'

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
                    window.__GANTT_TASKS__ = tasks
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
                            if (args.model === 'task' && args.action === 'update') {
                                const source = tasks.find(task => task.id === args.data.id)
                                const target = tasks.find(
                                    task => task.id === args.data.order_placement.target_id
                                )
                                source.parent = args.data.parent
                                source.sort_order =
                                    target.sort_order +
                                    (args.data.order_placement.position === 'before' ? -1 : 1)
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
            await expect(page.locator('.gantt-row:not(.add-task-row)')).toHaveCount(4)
            await expect(page.locator('.add-task-row')).toHaveCount(1)
            await verifyGanttNavigation(page)
            const calendarX =
                (await page.locator('.gantt-scroller').boundingBox()).x +
                (await page.locator('.task-label').first().boundingBox()).width
            // Blank dates on an already scheduled task are inert.
            const scheduledGrid = await page
                .locator('[data-row-task-id="child"] .row-grid')
                .boundingBox()
            await page.mouse.move(calendarX + 90, scheduledGrid.y + 20)
            await page.mouse.down()
            await page.mouse.move(calendarX + 160, scheduledGrid.y + 20)
            await page.mouse.up()
            await expect(page.locator('.pending-schedule')).toHaveCount(0)
            const emptyGrid = await page
                .locator('[data-row-task-id="empty"] .row-grid')
                .boundingBox()
            await page.mouse.move(calendarX + 90, emptyGrid.y + 20)
            await page.mouse.down()
            await page.mouse.move(calendarX + 160, emptyGrid.y + 20)
            const preview = await page.locator('.create-preview').boundingBox()
            expect(preview.height).toBe(48)
            expect(Math.abs(preview.y - emptyGrid.y)).toBeLessThan(2)
            await page.mouse.up()
            await expect(page.getByRole('dialog')).toHaveCount(0)
            await page.locator('.pending-schedule').click()
            await expect(page.locator('#gantt-edit-name')).toHaveValue('Unscheduled child')
            await expect(page.locator('#gantt-edit-start')).not.toHaveValue('')
            await expect(page.locator('#gantt-edit-end')).not.toHaveValue('')
            await page.getByRole('dialog').locator('.btn-cancel').click()
            await expect(page.getByRole('dialog')).toHaveCount(0)
            await expect(page.locator('[data-row-task-id="empty"] .task-bar')).toHaveCount(0)
            const creationGrid = await page.locator('.row-grid').last().boundingBox()
            await page.mouse.move(calendarX + 100, creationGrid.y + 20)
            await page.mouse.down()
            await page.mouse.move(calendarX + 170, creationGrid.y + 20)
            await page.mouse.up()
            await page.locator('.pending-schedule').click()
            const creation = page.getByRole('dialog')
            await expect(creation.locator('.required-marker')).toHaveCount(5)
            await creation.locator('.btn-save').click()
            await expect(creation.locator('#gantt-create-error-name')).toContainText('请填写')
            await expect(creation.locator('#gantt-create-name')).toBeFocused()
            expect(
                await page.evaluate(() =>
                    window.__EASY_PROJECT_CALLS__.some(c => c.args?.action === 'add')
                )
            ).toBe(false)
            await creation.locator('.create-name').fill('Corrected synthetic draft')
            await expect(creation.locator('#gantt-create-error-name')).toHaveCount(0)
            await creation.locator('.btn-cancel').click()
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
            await expect(page.locator('.gantt-row:not(.add-task-row)')).toHaveCount(2)
            const foldedChart = await page.locator('.gantt-scroller').boundingBox()
            for (const button of await page.locator('.timeline-nav').all()) {
                const position = await button.boundingBox()
                expect(position.y).toBeGreaterThanOrEqual(foldedChart.y)
                expect(position.y + position.height).toBeLessThanOrEqual(
                    foldedChart.y + foldedChart.height
                )
            }
            await root.getByRole('button', { name: '展开任务', exact: true }).click()
            await expect(page.locator('.gantt-row:not(.add-task-row)')).toHaveCount(4)
            const from = await root.locator('.task-label').boundingBox()
            const to = await page.locator('[data-row-task-id="other"] .task-label').boundingBox()
            await page.mouse.move(from.x + 100, from.y + 24)
            await page.mouse.down()
            await page.mouse.move(to.x + 100, to.y + to.height - 4, { steps: 8 })
            await page.mouse.up()
            await expect
                .poll(() =>
                    page.evaluate(() =>
                        window.__EASY_PROJECT_CALLS__.some(c => c.args?.data?.order_placement)
                    )
                )
                .toBe(true)
            await expect(chart.locator('.gantt-row').first()).toHaveAttribute(
                'data-row-task-id',
                'other'
            )
            // Middle-zone drop explicitly reparents without changing descendant IDs.
            const childFrom = await page
                .locator('[data-row-task-id="empty"] .task-label')
                .boundingBox()
            const parentTo = await page
                .locator('[data-row-task-id="other"] .task-label')
                .boundingBox()
            await page.mouse.move(childFrom.x + 100, childFrom.y + 24)
            await page.mouse.down()
            await page.mouse.move(parentTo.x + 100, parentTo.y + 24, { steps: 8 })
            await expect(page.locator('[data-row-task-id="other"]')).toHaveClass(/drop-inside/)
            await page.mouse.up()
            await expect
                .poll(() =>
                    page.evaluate(
                        () => window.__GANTT_TASKS__.find(task => task.id === 'empty').parent
                    )
                )
                .toBe('other')
            await expect(page.getByRole('dialog')).toHaveCount(0)
            await page.mouse.move(0, 0)
            await page.screenshot({ path: `test-results/gantt-hierarchy-${width}-${dark}.png` })
            await page.evaluate(() => {
                const tasks = window.__GANTT_TASKS__
                for (let index = 0; index < 40; index++) {
                    tasks.push({
                        ...tasks[0],
                        id: `overflow-${index}`,
                        name: `Overflow task ${index}`,
                        parent: '',
                        start_time: '',
                        end_time: '',
                        sort_order: 100 + index
                    })
                }
            })
            await page.locator('.gantt-toolbar button:has(.pi-refresh)').click()
            await expect(page.locator('.gantt-row:not(.add-task-row)')).toHaveCount(44)
            await expect(page.locator('.add-task-row')).toHaveCount(1)
            const scroller = page.locator('.gantt-scroller')
            expect(await scroller.evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true)
            expect(await scroller.evaluate(el => getComputedStyle(el).scrollbarWidth)).not.toBe(
                'none'
            )
            await scroller.hover()
            await page.mouse.wheel(0, 500)
            await expect.poll(() => scroller.evaluate(el => el.scrollTop)).toBeGreaterThan(0)
            await scroller.evaluate(el => {
                el.scrollTop = el.scrollHeight
            })
            await expect(
                page.getByRole('button', { name: 'Overflow task 39', exact: true })
            ).toBeInViewport()
            const viewport = await scroller.boundingBox()
            expect(
                Math.abs((await page.locator('.months-row').boundingBox()).y - viewport.y)
            ).toBeLessThan(2)
            expect(
                Math.abs((await page.locator('.dates').boundingBox()).y - viewport.y - 24)
            ).toBeLessThan(2)
        })
    }
