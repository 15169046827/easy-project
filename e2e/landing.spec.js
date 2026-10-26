import { expect, test } from '@playwright/test'
import { desktopRelease } from '../src/modules/landing/downloadRelease'

for (const width of [1280, 960, 375]) {
    for (const dark of [false, true]) {
        test(`public landing ${width}px dark=${dark}`, async ({ page }) => {
            await page.setViewportSize({ width, height: 800 })
            await page.addInitScript(value => {
                localStorage.setItem('easyproject-theme', value ? 'dark' : 'light')
                localStorage.setItem('easyproject-lang', 'zh-CN')
            }, dark)
            // The public page must also work under the real server's strict nonce policy.
            await page.route('http://127.0.0.1:4173/', async route => {
                const response = await route.fetch()
                await route.fulfill({
                    response,
                    body: (await response.text()).replace(
                        '<style>',
                        '<style nonce="landing-test">'
                    ),
                    headers: {
                        ...response.headers(),
                        'content-security-policy':
                            "default-src 'self'; script-src 'self'; style-src 'self' 'nonce-landing-test'; style-src-attr 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'; object-src 'none'"
                    }
                })
            })
            const errors = []
            const apiRequests = []
            page.on('pageerror', error => errors.push(error.message))
            page.on('request', request => {
                if (new URL(request.url()).pathname.startsWith('/api/'))
                    apiRequests.push(request.url())
            })
            await page.goto('/')
            await expect(page.locator('h1')).toContainText('项目有条理')
            await expect(page.locator('.landing-preview img')).toHaveJSProperty(
                'naturalWidth',
                1280
            )
            await expect(page.locator('html')).toHaveClass(dark ? /app-dark/ : /^(?!.*app-dark)/)
            await page.keyboard.press('Tab')
            await expect(page.locator('.landing-skip')).toBeFocused()
            await page.keyboard.press('Enter')
            await expect(page.locator('#main-content')).toBeFocused()
            await page.getByRole('button', { name: '看板', exact: true }).press('Enter')
            await expect(page.locator('.landing-preview img')).toHaveAttribute(
                'src',
                '/landing/project-board-20261026.png'
            )
            await expect(page.locator('.landing-preview img')).toHaveJSProperty(
                'naturalWidth',
                1280
            )
            await page.getByRole('button', { name: '任务列表', exact: true }).click()
            await expect(page.locator('.landing-preview img')).toHaveAttribute(
                'src',
                '/landing/project-tasks-20261026.png'
            )
            await page.locator('.landing-actions a').last().click()
            await expect(page).toHaveURL(/#download$/)
            await expect(page.locator('#download')).toContainText(
                desktopRelease.ready ? desktopRelease.tag : '当前未提供公开安装包'
            )
            if (desktopRelease.ready) {
                await expect(page.locator('.landing-download-links a')).toHaveCount(3)
                const otherFormats = page.locator('.landing-other-downloads')
                await expect(otherFormats.locator('.landing-secondary-downloads')).toBeHidden()
                await otherFormats.locator('button').press('Enter')
                await expect(otherFormats.locator('.landing-secondary-downloads')).toBeVisible()
                await expect(otherFormats.locator('.landing-secondary-downloads a')).toHaveCount(3)
                for (const asset of desktopRelease.assets)
                    await expect(
                        page.locator(
                            `.landing-download a[href="${desktopRelease.base + asset.file}"]`
                        )
                    ).toHaveCount(1)
                await expect(page.locator('#download')).toContainText('不要关闭系统安全功能')
                await page.locator('#download').screenshot({
                    path: `test-results/downloads-${width}-${dark}.png`
                })
            }
            await expect(page.locator('a[download]')).toHaveCount(0)
            await page.getByRole('button', { name: 'Switch to English' }).click()
            await expect(page.locator('h1')).toContainText('Clear projects.')
            await expect(page.locator('html')).toHaveAttribute('lang', 'en-US')
            expect(
                await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
            ).toBe(true)
            await page.screenshot({
                path: `test-results/landing-${width}-${dark}.png`,
                fullPage: true
            })
            expect(apiRequests).toEqual([])
            expect(errors).toEqual([])
            await expect(page.locator('.landing-actions a').first()).toHaveAttribute(
                'href',
                '/index.html#/dashboard'
            )
        })
    }
}

test('explicit and legacy links still open the workspace, not the landing page', async ({
    page
}) => {
    for (const path of ['/index.html#/projects', '/#/projects', '/?demo=1#/projects']) {
        await page.goto(path)
        await expect(page.locator('.projects-page')).toBeVisible()
        await expect(page.locator('.landing-page')).toHaveCount(0)
    }
})
