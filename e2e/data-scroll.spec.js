import { expect, test } from '@playwright/test'

for (const size of [
    { width: 1280, height: 800 },
    { width: 960, height: 640 }
]) {
    for (const dark of [false, true]) {
        test(`data import focus stays inside the workspace ${size.width} dark=${dark}`, async ({
            page
        }) => {
            await page.setViewportSize(size)
            const violations = []
            page.on('console', message => {
                if (/Refused to apply.*style/i.test(message.text())) violations.push(message.text())
            })
            await page.route('http://127.0.0.1:4173/', async route => {
                const response = await route.fetch()
                await route.fulfill({
                    response,
                    body: (await response.text()).replace(
                        /<style>/g,
                        '<style nonce="data-scroll">'
                    ),
                    headers: {
                        ...response.headers(),
                        'content-security-policy': "style-src 'self' 'nonce-data-scroll'"
                    }
                })
            })
            await page.addInitScript(value => {
                localStorage.setItem('easyproject-theme', value ? 'dark' : 'light')
                localStorage.setItem('easyproject-onboarding-done', 'true')
            }, dark)
            await page.goto('/?demo=1&windowChrome=1#/data')
            const cards = page.locator('.data-page > .cards')
            await expect(cards).toBeVisible()
            // Focus on the old off-screen input reproduced DECK-UI-001 at 960x640.
            // It must now be non-focusable, while the real button owns keyboard input.
            await page.locator('#project-import-file').evaluate(element => element.focus())
            await expect(page.getByTestId('window-titlebar')).toBeInViewport({ ratio: 1 })
            expect(await page.evaluate(() => window.scrollY)).toBe(0)
            expect(
                await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight)
            ).toBe(true)
            const picker = page.locator('button.file-picker')
            await expect(picker).toHaveClass(/p-button/)
            await picker.focus()
            const chooserPromise = page.waitForEvent('filechooser')
            await picker.press('Enter')
            await (await chooserPromise).setFiles([])
            await expect(picker).toBeFocused()
            await expect(page.getByTestId('window-titlebar')).toBeInViewport({ ratio: 1 })
            await cards.evaluate(element => {
                element.scrollTop = element.scrollHeight
            })
            await expect(page.locator('.backup-policy')).toBeInViewport()
            await page.mouse.move(size.width - 2, size.height - 20)
            await page.mouse.wheel(0, 2000)
            await expect(page.getByTestId('window-titlebar')).toBeInViewport({ ratio: 1 })
            expect(await page.evaluate(() => window.scrollY)).toBe(0)
            expect(violations).toEqual([])
        })
    }
}
