import { expect, test } from '@playwright/test'

for (const dark of [false, true]) {
    for (const width of [960, 1280]) {
        test(`storage setup is usable with CSP, keyboard, ${width}px, dark=${dark}`, async ({
            page
        }) => {
            await page.setViewportSize({ width, height: 800 })
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
                        '<style nonce="storage-test-nonce">'
                    ),
                    headers: {
                        ...response.headers(),
                        'content-security-policy': "style-src 'self' 'nonce-storage-test-nonce'"
                    }
                })
            })
            await page.addInitScript(value => {
                document.addEventListener('DOMContentLoaded', () => {
                    if (value) document.documentElement.classList.add('app-dark')
                })
                const info = {
                    ready: false,
                    activeDir: 'E:/App/data',
                    databasePath: 'E:/App/data/project_manager.db',
                    defaultDir: 'E:/App/data',
                    profileDir: 'E:/App/webview',
                    configPath: 'E:/App/easyproject-storage.json',
                    pendingDir: null,
                    error: 'Migration needs a new destination'
                }
                window.__EASYPROJECT_STORAGE_INFO__ = info
                window.__TAURI_INTERNALS__ = {
                    invoke: async (command, args) => {
                        if (command === 'storage_info') return info
                        if (command === 'set_data_directory')
                            return { ...info, pendingDir: args.directory }
                        throw new Error(
                            'Business commands must not run after storage startup failure'
                        )
                    }
                }
            }, dark)
            await page.goto('/')
            await expect(page.getByRole('alert')).toContainText('Migration needs a new destination')
            const input = page.getByLabel('新的数据目录')
            await input.fill('E:/EasyProject-custom')
            await input.press('Tab')
            await page.getByRole('button', { name: '设置数据目录', exact: true }).press('Enter')
            const dialog = page.getByRole('dialog')
            await expect(dialog).toBeVisible()
            await dialog.getByRole('button', { name: '确认', exact: true }).press('Enter')
            await expect(page.getByRole('status')).toContainText('E:/EasyProject-custom')
            await expect(page.getByRole('button', { name: '关闭程序，稍后重新打开' })).toBeVisible()
            expect(
                await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
            ).toBe(true)
            expect(
                await page
                    .locator('style[data-primevue-style-id]')
                    .evaluateAll(styles =>
                        styles.every(style => style.nonce === 'storage-test-nonce')
                    )
            ).toBe(true)
            expect(violations).toEqual([])
        })
    }
}
