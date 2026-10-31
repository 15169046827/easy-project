import { expect } from '@playwright/test'

export async function verifyGanttNavigation(page) {
    const scroller = page.locator('.gantt-scroller')
    const bar = page.locator('[data-row-task-id="child"] .task-bar')
    const initial = await bar.evaluate(el => ({
        x: el.getBoundingClientRect().x,
        left: el.offsetLeft
    }))
    const initialScroll = await scroller.evaluate(el => el.scrollLeft)
    const x = () => bar.evaluate(el => el.getBoundingClientRect().x)
    await page.locator('.timeline-nav-right').click()
    await expect.poll(async () => Math.abs((await x()) - initial.x + 14 * 42)).toBeLessThan(2)
    await page.locator('.timeline-nav-left').click()
    await expect.poll(async () => Math.abs((await x()) - initial.x)).toBeLessThan(2)
    // Both directions must move the view, including after extending its date range.
    await page.locator('.timeline-nav-left').click()
    await expect.poll(async () => Math.abs((await x()) - initial.x - 14 * 42)).toBeLessThan(2)
    const bounds = await scroller.boundingBox()
    await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2)
    const horizontal = await scroller.evaluate(el => el.scrollLeft)
    await page.mouse.wheel(0, 100)
    await expect.poll(() => scroller.evaluate(el => el.scrollLeft)).toBe(horizontal)
    const beforeWheel = await x()
    await page.keyboard.down('Shift')
    await page.mouse.wheel(0, 200)
    await page.keyboard.up('Shift')
    await expect.poll(async () => Math.abs((await x()) - beforeWheel + 200)).toBeLessThan(2)
    const dayCount = await page.locator('.date-cell').count()
    await page.keyboard.down('Shift')
    await page.mouse.wheel(0, -2500)
    await page.keyboard.up('Shift')
    await expect.poll(() => page.locator('.date-cell').count()).toBeGreaterThan(dayCount)
    const leftCount = await page.locator('.date-cell').count()
    await page.keyboard.down('Shift')
    await page.mouse.wheel(0, 7000)
    await page.keyboard.up('Shift')
    await expect.poll(() => page.locator('.date-cell').count()).toBeGreaterThan(leftCount)
    // Restore the same visible date, not the old pixel coordinate after prepending.
    const offset = await bar.evaluate(el => el.offsetLeft)
    await scroller.evaluate(
        (el, left) => {
            el.scrollLeft = left
        },
        initialScroll + offset - initial.left
    )
    for (const selector of ['.date-actions button', '.timeline-nav']) {
        for (const button of await page.locator(selector).all()) {
            await expect(button.locator('svg.gantt-arrow-icon')).toHaveCount(1)
            const centered = await button.evaluate(el => {
                const a = el.getBoundingClientRect(),
                    b = el.querySelector('svg').getBoundingClientRect()
                return Math.abs(a.y + a.height / 2 - b.y - b.height / 2)
            })
            expect(centered).toBeLessThan(1)
        }
    }
}
