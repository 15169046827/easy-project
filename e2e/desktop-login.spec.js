import { expect, test } from '@playwright/test'

for (const width of [1280, 960]) {
    for (const dark of [false, true]) {
        test(`desktop starts at login and explicitly enters local mode ${width} dark=${dark}`, async ({
            page
        }) => {
            await page.setViewportSize({ width, height: 800 })
            await page.route('http://127.0.0.1:4173/', async route => {
                const response = await route.fetch()
                await route.fulfill({
                    response,
                    body: (await response.text()).replace(
                        /<style>/g,
                        '<style nonce="login-test-nonce">'
                    ),
                    headers: {
                        ...response.headers(),
                        'Content-Security-Policy': "style-src 'self' 'nonce-login-test-nonce'"
                    }
                })
            })
            const violations = []
            page.on('console', message => {
                if (/Refused to apply.*style/i.test(message.text())) violations.push(message.text())
            })
            await page.addInitScript(dark => {
                window.isTauri = true
                window.__EASYPROJECT_LAUNCH_ID__ = 'login-test-launch'
                Object.defineProperty(navigator, 'userAgent', { get: () => 'Desktop login layout' })
                localStorage.setItem('easyproject-theme', dark ? 'dark' : 'light')
                localStorage.setItem('easyproject-onboarding-done', 'true')
                window.__EASY_PROJECT_CALLS__ = []
                window.__TAURI_INTERNALS__ = {
                    invoke: async (command, args) => {
                        window.__EASY_PROJECT_CALLS__.push({ command, args })
                        if (command !== 'crud_action') throw new Error('Unexpected IPC')
                        return { success: true, data: { list: [], total: 0 } }
                    }
                }
            }, dark)
            await page.goto('/?windowChrome=1#/dashboard')
            await expect(page.locator('#remote-username')).toBeVisible()
            const recovery = page.getByRole('button', { name: '忘记密码', exact: true })
            const passwordBox = await page.locator('.p-password').first().boundingBox()
            const recoveryBox = await recovery.boundingBox()
            expect(passwordBox && recoveryBox).toBeTruthy()
            expect(
                Math.abs(passwordBox.x + passwordBox.width - recoveryBox.x - recoveryBox.width)
            ).toBeLessThan(2)
            expect(recoveryBox.y).toBeGreaterThanOrEqual(passwordBox.y + passwordBox.height)
            expect(recoveryBox.y - passwordBox.y - passwordBox.height).toBeLessThan(16)
            await recovery.focus()
            await page.keyboard.press('Enter')
            await expect(page.getByRole('dialog')).toBeVisible()
            await page.keyboard.press('Escape')
            await expect(page.getByRole('dialog')).toHaveCount(0)
            await expect(page.locator('#login-server-url')).toHaveCount(0)
            await expect(page.locator('input[type="url"]')).toHaveCount(0)
            expect(await page.evaluate(() => window.__EASY_PROJECT_CALLS__.length)).toBe(0)
            expect(
                await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight)
            ).toBe(true)
            const local = page.getByRole('button', { name: '不登录，本地使用', exact: true })
            await local.focus()
            await page.keyboard.press('Enter')
            await expect(page.locator('.dashboard')).toBeVisible()
            await page.reload()
            await expect(page.locator('.dashboard')).toBeVisible()
            await page.addInitScript(() => {
                window.__EASYPROJECT_LAUNCH_ID__ = 'next-desktop-launch'
            })
            await page.reload()
            await expect(page.locator('#remote-username')).toBeVisible()
            expect(await page.evaluate(() => window.__EASY_PROJECT_CALLS__.length)).toBe(0)
            expect(violations).toEqual([])
        })
    }
}
