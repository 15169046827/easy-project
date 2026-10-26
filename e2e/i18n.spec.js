import { expect, test } from '@playwright/test'

for (const width of [1280, 960, 375]) {
    for (const dark of [false, true]) {
        test(`Spanish public UI and locale persistence at ${width}px dark=${dark}`, async ({
            page
        }) => {
            await page.setViewportSize({ width, height: 800 })
            await page.addInitScript(dark => {
                localStorage.setItem('easyproject-lang', 'es-ES')
                localStorage.setItem('easyproject-theme', dark ? 'dark' : 'light')
            }, dark)
            await page.route('http://127.0.0.1:4173/', async route => {
                const response = await route.fetch()
                await route.fulfill({
                    response,
                    body: (await response.text()).replace('<style>', '<style nonce="locale-test">'),
                    headers: {
                        ...response.headers(),
                        'content-security-policy':
                            "default-src 'self'; script-src 'self'; style-src 'self' 'nonce-locale-test'; style-src-attr 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; object-src 'none'"
                    }
                })
            })
            const errors = [],
                apiRequests = []
            page.on('pageerror', error => errors.push(error.message))
            page.on('request', request => {
                if (new URL(request.url()).pathname.startsWith('/api/'))
                    apiRequests.push(request.url())
            })
            await page.goto('/')
            await expect(page.locator('h1')).toContainText('Proyectos claros.')
            await expect(page.locator('html')).toHaveAttribute('lang', 'es-ES')
            await expect(
                page.getByRole('link', { name: /Contacto y comentarios/ })
            ).toHaveAttribute('href', 'mailto:li_you_mu@126.com')
            await page.keyboard.press('Tab')
            await expect(
                page.getByRole('link', { name: 'Saltar al contenido', exact: true })
            ).toBeFocused()
            await page.keyboard.press('Enter')
            await expect(page.locator('#main-content')).toBeFocused()
            await page.getByRole('combobox', { name: 'Idioma', exact: true }).click()
            await page.getByRole('option', { name: 'English', exact: true }).click()
            await expect(page.locator('html')).toHaveAttribute('lang', 'en-US')
            await page.getByRole('combobox', { name: 'Language', exact: true }).click()
            await page.getByRole('option', { name: 'Español', exact: true }).click()
            await page.reload()
            await expect(page.locator('html')).toHaveAttribute('lang', 'es-ES')
            await expect(page.getByRole('combobox', { name: 'Idioma', exact: true })).toContainText(
                'Español'
            )
            await page.locator('.landing-other-downloads button').press('Enter')
            await expect(page.locator('.landing-secondary-downloads')).toBeVisible()
            expect(
                await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
            ).toBe(true)
            expect(
                await page
                    .locator('style[data-primevue-style-id]')
                    .evaluateAll(
                        styles =>
                            styles.length > 0 &&
                            styles.every(style => style.nonce === 'locale-test')
                    )
            ).toBe(true)
            expect(apiRequests).toEqual([])
            expect(errors).toEqual([])
            await page.screenshot({
                path: `test-results/spanish-public-${width}-${dark}.png`,
                fullPage: true
            })
            await page.locator('.landing-footer').screenshot({
                path: `test-results/spanish-contact-${width}-${dark}.png`
            })
        })
    }
}

for (const width of [1280, 960])
    for (const dark of [false, true]) {
        test(`Spanish workspace controls at ${width}px dark=${dark} never write`, async ({
            page
        }) => {
            await page.setViewportSize({ width, height: 640 })
            await page.addInitScript(() => {
                localStorage.setItem('easyproject-lang', 'es-ES')
                localStorage.setItem('easyproject-onboarding-done', 'true')
                sessionStorage.setItem('easyproject.local-launch', 'desktop-preview')
                window.isTauri = true
                window.__TAURI_INTERNALS__ = {
                    invoke: async (command, args) => {
                        if (command !== 'crud_action') return null
                        if (
                            ['add', 'update', 'delete', 'create_from_template'].includes(
                                args.action
                            )
                        )
                            throw new Error('Synthetic locale test must not write')
                        return { success: true, data: { list: [], total: 0 } }
                    }
                }
            })
            await page.addInitScript(
                dark => localStorage.setItem('easyproject-theme', dark ? 'dark' : 'light'),
                dark
            )
            await page.goto('/#/projects')
            await expect(
                page.getByRole('heading', { name: 'Proyectos', exact: true })
            ).toBeVisible()
            await page.getByRole('button', { name: 'Nuevo proyecto', exact: true }).click()
            const dialog = page.getByRole('dialog', {
                name: 'Crear a partir de una plantilla',
                exact: true
            })
            await expect(dialog).toBeVisible()
            await expect(dialog.getByRole('button', { name: 'Cerrar', exact: true })).toBeVisible()
            await dialog.getByRole('button', { name: 'Elegir fecha', exact: true }).click()
            await expect(page.locator('.p-datepicker-panel')).toBeVisible()
            const month = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(new Date())
            await expect(page.locator('.p-datepicker-panel')).toContainText(month)
            await page.keyboard.press('Escape')
            await expect(page.locator('.p-datepicker-panel')).toBeHidden()
            await page.keyboard.press('Escape')
            await expect(dialog).toBeHidden()
            expect(
                await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
            ).toBe(true)
            await page.screenshot({ path: `test-results/spanish-workspace-${width}-${dark}.png` })
        })
    }
