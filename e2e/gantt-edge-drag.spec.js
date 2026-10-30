import { expect, test } from '@playwright/test'

for (const width of [1920, 1280, 960])
    for (const dark of [false, true]) {
        test(`Gantt edge pan and explicit editing ${width} dark=${dark}`, async ({ page }) => {
            await page.setViewportSize({ width, height: 800 })
            await page.route('http://127.0.0.1:4173/', async route => {
                const response = await route.fetch()
                await route.fulfill({
                    response,
                    body: (await response.text()).replace(
                        /<style>/g,
                        '<style nonce="gantt-edge-response">'
                    ),
                    headers: {
                        ...response.headers(),
                        'content-security-policy':
                            "default-src 'self'; script-src 'self'; style-src 'self' 'nonce-gantt-edge-response'; style-src-attr 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'"
                    }
                })
            })
            await page.addInitScript(dark => {
                localStorage.setItem('easyproject-lang', 'zh-CN')
                localStorage.setItem('easyproject-theme', dark ? 'dark' : 'light')
                localStorage.setItem('easyproject-onboarding-done', 'true')
                sessionStorage.setItem('easyproject.local-launch', 'desktop-preview')
                window.isTauri = true
                const tasks = [
                    {
                        id: 't',
                        project_id: 'p',
                        name: 'Edge drag synthetic task',
                        parent: '',
                        type: 'Task',
                        priority: '3',
                        status: 'Pending',
                        status_id: 's',
                        progress: 0,
                        effort_days: 3,
                        effort_state: 'estimated',
                        schedule_mode: 'fixed_dates',
                        start_time: '2026-10-28',
                        end_time: '2026-10-30',
                        sort_order: 1
                    }
                ]
                window.__EASY_PROJECT_CALLS__ = []
                window.__TAURI_INTERNALS__ = {
                    invoke: async (command, args) => {
                        window.__EASY_PROJECT_CALLS__.push({ command, args })
                        if (command !== 'crud_action') return null
                        if (args.model === 'task' && args.action === 'update') {
                            Object.assign(tasks[0], args.data)
                            return { success: true, data: {} }
                        }
                        if (!['get_all', 'get_by_project'].includes(args.action))
                            throw Error('Unexpected fixture write')
                        const list =
                            args.model === 'task'
                                ? tasks
                                : args.model === 'project'
                                  ? [
                                        {
                                            id: 'p',
                                            name: 'Synthetic edge project',
                                            type: 'private',
                                            status: 'InProgress'
                                        }
                                    ]
                                  : args.model === 'task_status'
                                    ? [
                                          {
                                              id: 's',
                                              project_id: 'p',
                                              name: '待办',
                                              builtin_key: 'Pending',
                                              color: '#64748b',
                                              is_default: true,
                                              is_completed: false
                                          }
                                      ]
                                    : []
                        return { success: true, data: { list, total: list.length } }
                    }
                }
            }, dark)
            await page.goto('/#/project/p')
            await page.locator('.view-switch button').nth(1).click()
            const scroller = page.locator('.gantt-scroller')
            const bar = page.locator('[data-task-id="t"]')
            await expect(bar).toBeVisible()
            const bounds = await scroller.boundingBox()
            const nameWidth = (await page.locator('.corner').boundingBox()).width
            const right = await scroller.evaluate(
                el => el.getBoundingClientRect().left + el.clientWidth - 4
            )
            const left = bounds.x + nameWidth + 2
            const viewportWidth = right - left
            const grid = await page.locator('.row-grid').boundingBox()
            const y = grid.y + 20
            const columns = await page.locator('.date-cell').count()

            // Continue beyond the visible and initially loaded range while the
            // mouse is stationary at the right edge, not merely on mousemove.
            await page.mouse.move(left + 84, y)
            await page.mouse.down()
            await page.mouse.move(right, y, { steps: 12 })
            await expect.poll(() => page.locator('.date-cell').count()).toBeGreaterThan(columns)
            await expect
                .poll(async () => (await page.locator('.create-preview').boundingBox()).width)
                .toBeGreaterThan(viewportWidth + 84)
            const firstPan = await scroller.evaluate(el => el.scrollLeft)
            await expect
                .poll(() => scroller.evaluate(el => el.scrollLeft))
                .toBeGreaterThan(firstPan + 80)
            await page.screenshot({ path: `test-results/gantt-edge-preview-${width}-${dark}.png` })
            await page.mouse.up()
            await expect(page.locator('.create-panel')).toBeVisible()
            const start = await page.locator('#gantt-create-start').inputValue()
            const end = await page.locator('#gantt-create-end').inputValue()
            expect((Date.parse(end) - Date.parse(start)) / 86400000).toBeGreaterThan(
                Math.floor(viewportWidth / 42)
            )
            await page.getByRole('dialog').locator('.btn-cancel').click()
            await expect(page.getByRole('dialog')).toHaveCount(0)
            await scroller.evaluate(el => {
                el.scrollLeft = 0
            })

            // Editing is explicit. Ordinary clicks and sub-day drags never open it.
            await bar.click()
            await expect(page.locator('.edit-panel')).toHaveCount(0)
            await bar.dblclick()
            await expect(page.locator('.edit-panel')).toBeVisible()
            await page.getByRole('dialog').locator('.btn-cancel').click()
            await expect(page.getByRole('dialog')).toHaveCount(0)
            await bar.focus()
            await bar.press('Enter')
            await expect(page.locator('.edit-panel')).toBeVisible()
            await page.getByRole('dialog').locator('.btn-cancel').click()
            await expect(page.getByRole('dialog')).toHaveCount(0)
            let box = await bar.boundingBox()
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
            await page.mouse.down()
            await page.mouse.move(box.x + box.width / 2 + 10, box.y + box.height / 2)
            await expect(bar).toHaveClass(/dragging/)
            await page.mouse.up()
            await bar.dispatchEvent('dblclick')
            await expect(page.locator('.edit-panel')).toHaveCount(0)

            // Cancelling an edge move stops both the RAF loop and persistence.
            box = await bar.boundingBox()
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
            await page.mouse.down()
            await page.mouse.move(right, box.y + box.height / 2, { steps: 12 })
            await expect.poll(() => scroller.evaluate(el => el.scrollLeft)).toBeGreaterThan(120)
            expect(await bar.evaluate(el => Number(getComputedStyle(el).zIndex))).toBeLessThan(
                await page
                    .locator('.task-label')
                    .first()
                    .evaluate(el => Number(getComputedStyle(el).zIndex))
            )
            expect(
                await page
                    .locator('.task-label')
                    .first()
                    .evaluate(el => Number(getComputedStyle(el).zIndex))
            ).toBeLessThan(
                await page
                    .locator('.gantt-header')
                    .evaluate(el => Number(getComputedStyle(el).zIndex))
            )
            await page.keyboard.press('Escape')
            const stopped = await scroller.evaluate(el => el.scrollLeft)
            await page.evaluate(
                () =>
                    new Promise(resolve =>
                        requestAnimationFrame(() => requestAnimationFrame(() => resolve(true)))
                    )
            )
            expect(await scroller.evaluate(el => el.scrollLeft)).toBe(stopped)
            await page.mouse.up()
            expect(
                await page.evaluate(
                    () =>
                        window.__EASY_PROJECT_CALLS__.filter(c => c.args?.action === 'update')
                            .length
                )
            ).toBe(0)

            // Right-edge resize persists exactly once without opening the editor.
            await scroller.evaluate(el => {
                el.scrollLeft = 0
            })
            box = await bar.boundingBox()
            await page.mouse.move(box.x + 20, box.y + 10)
            box = await bar.locator('.resize-right').boundingBox()
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
            await page.mouse.down()
            await page.mouse.move(right, box.y + box.height / 2, { steps: 12 })
            await expect.poll(() => scroller.evaluate(el => el.scrollLeft)).toBeGreaterThan(120)
            await page.mouse.up()
            await expect
                .poll(() =>
                    page.evaluate(
                        () =>
                            window.__EASY_PROJECT_CALLS__.filter(c => c.args?.action === 'update')
                                .length
                    )
                )
                .toBe(1)
            await expect(page.locator('.edit-panel')).toHaveCount(0)
            await expect(page.locator('.gantt-banner.success')).toBeVisible()
            let updates = await page.evaluate(() =>
                window.__EASY_PROJECT_CALLS__.filter(c => c.args?.action === 'update')
            )
            expect(Date.parse(updates[0].args.data.end_time.slice(0, 10))).toBeGreaterThan(
                Date.parse('2026-10-30')
            )

            // Prepending on the left keeps date coordinates stable, even though
            // scrollLeft must jump to preserve the currently visible calendar.
            await scroller.evaluate(el => {
                el.scrollLeft = 0
            })
            const beforeLeft = await page.locator('.date-cell').count()
            box = await bar.boundingBox()
            await page.mouse.move(box.x + 20, box.y + 10)
            box = await bar.locator('.resize-left').boundingBox()
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
            await page.mouse.down()
            await page.mouse.move(left, box.y + box.height / 2, { steps: 12 })
            await expect.poll(() => page.locator('.date-cell').count()).toBeGreaterThan(beforeLeft)
            await page.mouse.up()
            await expect
                .poll(() =>
                    page.evaluate(
                        () =>
                            window.__EASY_PROJECT_CALLS__.filter(c => c.args?.action === 'update')
                                .length
                    )
                )
                .toBe(2)
            updates = await page.evaluate(() =>
                window.__EASY_PROJECT_CALLS__.filter(c => c.args?.action === 'update')
            )
            expect(Date.parse(updates[1].args.data.start_time.slice(0, 10))).toBeLessThan(
                Date.parse('2026-10-28')
            )
            expect(updates[1].args.data.end_time).toBe(updates[0].args.data.end_time)
            await expect(page.locator('.gantt-banner.success')).toBeVisible()
            await scroller.evaluate(el => {
                el.scrollLeft = 0
            })
            box = await bar.boundingBox()
            await page.mouse.move(box.x + 20, box.y + box.height / 2)
            await page.mouse.down()
            await page.mouse.move(right, box.y + box.height / 2, { steps: 12 })
            await expect.poll(() => scroller.evaluate(el => el.scrollLeft)).toBeGreaterThan(120)
            await page.mouse.up()
            await expect
                .poll(() =>
                    page.evaluate(
                        () =>
                            window.__EASY_PROJECT_CALLS__.filter(c => c.args?.action === 'update')
                                .length
                    )
                )
                .toBe(3)
            updates = await page.evaluate(() =>
                window.__EASY_PROJECT_CALLS__.filter(c => c.args?.action === 'update')
            )
            const startShift =
                Date.parse(updates[2].args.data.start_time.slice(0, 10)) -
                Date.parse(updates[1].args.data.start_time.slice(0, 10))
            const endShift =
                Date.parse(updates[2].args.data.end_time.slice(0, 10)) -
                Date.parse(updates[1].args.data.end_time.slice(0, 10))
            expect(startShift).toBeGreaterThan(0)
            expect(endShift).toBe(startShift)
            expect(updates[2].args.data).not.toHaveProperty('effort_days')
            await expect(page.locator('.edit-panel')).toHaveCount(0)
            expect(
                await page
                    .locator('style[data-primevue-style-id]')
                    .evaluateAll(
                        nodes =>
                            nodes.length > 0 && nodes.every(n => n.nonce === 'gantt-edge-response')
                    )
            ).toBe(true)
            await page.mouse.move(0, 0)
            await expect(page.getByRole('tooltip')).toHaveCount(0)
            box = await bar.boundingBox()
            await page.mouse.move(box.x + 25, box.y + box.height / 2)
            const tooltip = page.getByRole('tooltip')
            await expect(tooltip).toBeVisible()
            expect(
                await tooltip
                    .locator('.p-tooltip-text')
                    .evaluate(el => getComputedStyle(el).backgroundColor)
            ).not.toBe('rgba(0, 0, 0, 0)')
            await page.mouse.move(0, 0)
            await expect(tooltip).toHaveCount(0)
            await page.screenshot({ path: `test-results/gantt-edge-final-${width}-${dark}.png` })
        })
    }
