import { expect, test } from '@playwright/test'

const origin = process.env.EASYPROJECT_WEB_TEST_URL
test.skip(!origin, 'Run with the isolated real HTTP server runner')
test.beforeAll(() => {
    if (origin && new URL(origin).hostname !== '127.0.0.1')
        throw new Error('Real-data targets are prohibited')
})

async function login(page, username = 'test_admin', password = 'Synthetic-changed-456!') {
    await page.goto(origin)
    await page.locator('#remote-username').fill(username)
    await page.locator('#remote-password').fill(password)
    await page
        .locator('form')
        .getByRole('button', { name: /登录|Sign in/, exact: true })
        .click()
    await expect(page.locator('.remote-status')).toBeVisible()
    const skip = page.locator('.onboard-skip').first()
    if (await skip.isVisible()) await skip.click()
}

for (const width of [1280, 960, 375]) {
    for (const dark of [false, true]) {
        test(`real HTTP login and nonce styling at ${width}px ${dark ? 'dark' : 'light'}`, async ({
            page
        }) => {
            await page.setViewportSize({ width, height: 800 })
            await page.addInitScript(
                dark => localStorage.setItem('easyproject-theme', dark ? 'dark' : 'light'),
                dark
            )
            const violations = []
            await page.addInitScript(() => {
                window.addEventListener('securitypolicyviolation', event => {
                    if (event.violatedDirective.startsWith('style-src'))
                        window.__webStyleViolation = true
                })
            })
            page.on('console', message => {
                if (message.type() === 'error') violations.push(message.text())
            })
            await login(page)
            await expect(page.locator('.remote-status')).toContainText('test_admin')
            await expect(page.locator('html')).toHaveClass(dark ? /app-dark/ : /^(?!.*app-dark)/)
            await page.getByRole('button', { name: /账号管理|Accounts/, exact: true }).click()
            await expect(page.getByRole('dialog')).toBeVisible()
            await page.keyboard.press('Escape')
            await expect(page.locator('.dashboard')).toBeVisible()
            expect(
                await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
            ).toBe(true)
            expect(await page.evaluate(() => Boolean(window.__webStyleViolation))).toBe(false)
            const styles = await page
                .locator('style[data-primevue-style-id]')
                .evaluateAll(nodes => nodes.map(node => node.nonce))
            expect(styles.length).toBeGreaterThan(0)
            expect(styles.every(Boolean)).toBe(true)
            await page.screenshot({
                path: `test-results/web-${width}-${dark ? 'dark' : 'light'}.png`
            })
            expect(
                violations.filter(message => /Content Security Policy/i.test(message))
            ).toHaveLength(0)
            await page.getByRole('button', { name: /退出登录|Sign out/, exact: true }).click()
            await expect(page.locator('#remote-username')).toBeVisible()
            expect(
                await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
            ).toBe(true)
            await page.locator('#remote-username').focus()
            await page.keyboard.press('Tab')
            await expect(page.locator('#remote-password')).toBeFocused()
            await page.screenshot({
                path: `test-results/web-login-${width}-${dark ? 'dark' : 'light'}.png`
            })
        })
    }
}

test('two browser sessions share writes, reject stale edits and preserve data after reload', async ({
    browser
}) => {
    const first = await browser.newContext()
    const second = await browser.newContext()
    const a = await first.newPage()
    const b = await second.newPage()
    await login(a)
    await login(b)
    await expect(a.locator('.remote-status')).toContainText('test_admin')
    await expect(b.locator('.remote-status')).toContainText('test_admin')
    const revision = await a.evaluate(
        async () => (await (await fetch('/api/workspace/revision')).json()).revision
    )
    const name = `Shared browser project ${Date.now()}`
    const create = {
        model: 'project',
        action: 'add',
        data: { name, version: 'v1.0', type: 'private', status: 'InProgress', owner: '' }
    }
    const status = await a.evaluate(
        async ({ revision, create }) =>
            (
                await fetch('/api/workspace/action', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-EasyProject-Request': '1',
                        'X-Workspace-Revision': String(revision)
                    },
                    body: JSON.stringify(create)
                })
            ).status,
        { revision, create }
    )
    expect(status).toBe(200)
    const conflict = await b.evaluate(
        async ({ revision, create }) =>
            (
                await fetch('/api/workspace/action', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-EasyProject-Request': '1',
                        'X-Workspace-Revision': String(revision)
                    },
                    body: JSON.stringify(create)
                })
            ).status,
        { revision, create }
    )
    expect(conflict).toBe(409)
    await b.getByRole('button', { name: /项目管理|Projects/, exact: true }).click()
    await expect(b.getByRole('button', { name: /刷新（放弃|Refresh \(discard/ })).toBeVisible({
        timeout: 20000
    })
    await b.getByRole('button', { name: /刷新（放弃|Refresh \(discard/ }).click()
    await expect(b.getByText(name, { exact: true })).toBeVisible()
    await b.reload()
    await expect(b.getByText(name, { exact: true })).toBeVisible()
    await first.close()
    await second.close()
})

test('administrator creates an isolated account and first login requires password change', async ({
    page
}) => {
    await login(page)
    await page.getByRole('button', { name: /账号管理|Accounts/, exact: true }).click()
    const username = `user_${Date.now()}`
    await page.locator('#account-name').fill(username)
    await page.locator('#account-password').fill('Synthetic-initial-789!')
    await page.getByRole('button', { name: /创建账号|Create account/, exact: true }).click()
    await expect(page.getByRole('dialog').getByText(username, { exact: true })).toBeVisible()
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: /退出登录|Sign out/, exact: true }).click()
    await page.locator('#remote-username').fill(username)
    await page.locator('#remote-password').fill('Synthetic-initial-789!')
    await page
        .locator('form')
        .getByRole('button', { name: /登录|Sign in/, exact: true })
        .click()
    await expect(page.locator('#remote-new-password')).toBeVisible()
    await page.locator('#remote-password').fill('Synthetic-initial-789!')
    await page.locator('#remote-new-password').fill('Synthetic-account-changed-789!')
    await page
        .locator('form')
        .getByRole('button', { name: /修改密码|Change password/, exact: true })
        .click()
    await expect(page.locator('#remote-username')).toBeVisible()
    await login(page, username, 'Synthetic-account-changed-789!')
    await expect(page.getByRole('button', { name: /账号管理|Accounts/, exact: true })).toHaveCount(
        0
    )
    await page.goto(origin + '/#/projects')
    await expect(page.getByText(/Shared browser project/)).toHaveCount(0)
    await page.goto(origin + '/#/data')
    await expect(
        page.getByRole('heading', { name: /数据存储位置|Data storage location/, exact: true })
    ).toHaveCount(0)
})
