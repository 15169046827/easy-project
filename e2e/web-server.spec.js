import { expect, test } from '@playwright/test'

const origin = process.env.EASYPROJECT_WEB_TEST_URL
test.skip(!origin, 'Run with the isolated real HTTP server runner')
test.beforeAll(() => {
    if (origin && new URL(origin).hostname !== '127.0.0.1')
        throw new Error('Real-data targets are prohibited')
})

async function login(page, username = 'test_admin', password = 'Synthetic-changed-456!') {
    await page.addInitScript(() => localStorage.setItem('easyproject-onboarding-done', 'true'))
    await page.goto(origin)
    await page.locator('#remote-username').fill(username)
    await page.locator('#remote-password').fill(password)
    await page
        .locator('form')
        .getByRole('button', { name: /登录|Sign in/, exact: true })
        .click()
    await expect(page.locator('.account-menu-entry')).toBeVisible()
    const skip = page.locator('.onboard-skip').first()
    if (await skip.isVisible()) await skip.click()
}

async function accountAction(page, name) {
    await page.getByRole('button', { name: /^(用户菜单|User menu)$/ }).click()
    await page.getByRole('menuitem', { name, exact: true }).click()
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
            await page.goto(origin)
            await page.getByRole('button', { name: /立即注册|Register now/ }).click()
            await page.screenshot({
                path: `test-results/signup-${width}-${dark ? 'dark' : 'light'}.png`
            })
            const signupName = `signup_${width}_${dark ? 'd' : 'l'}_${Date.now()}`
            await page.locator('#remote-username').fill(signupName)
            await page.locator('#remote-password').fill('Synthetic-signup-123!')
            await page.locator('#remote-confirm-password').fill('Synthetic-mismatch-123!')
            await page.getByRole('button', { name: /^(注册|Register)$/ }).click()
            await expect(page.getByRole('alert')).toContainText(/不一致|do not match/)
            await page.locator('#remote-confirm-password').fill('Synthetic-signup-123!')
            await page.getByRole('button', { name: /^(注册|Register)$/ }).click()
            await expect(page.getByRole('alert')).toContainText(/注册成功|Registration complete/)
            await expect(page.locator('#remote-confirm-password')).toHaveCount(0)
            await expect(page.locator('#remote-password')).toHaveValue('')
            await login(page)
            await expect(page.locator('.remote-status')).toHaveCount(0)
            const account = page.locator('.account-menu-entry')
            const help = page.locator('.help-toggle')
            const accountBox = await account.boundingBox()
            const helpBox = await help.boundingBox()
            expect(
                Math.abs(accountBox.y + accountBox.height / 2 - helpBox.y - helpBox.height / 2)
            ).toBeLessThan(2)
            await account.focus()
            await page.keyboard.press('Enter')
            await expect(page.getByRole('menu')).toBeVisible()
            await expect(page.getByRole('menu')).toContainText('test_admin')
            await page.screenshot({
                animations: 'disabled',
                path: `test-results/account-menu-${width}-${dark ? 'dark' : 'light'}.png`
            })
            await page.keyboard.press('Escape')
            await expect(account).toBeFocused()
            await accountAction(page, /用户设置|User settings/)
            await expect(page.getByRole('dialog')).toContainText('test_admin')
            await expect(page.locator('#current-password')).toBeVisible()
            await page.keyboard.press('Escape')
            await expect(page.locator('html')).toHaveClass(dark ? /app-dark/ : /^(?!.*app-dark)/)
            await accountAction(page, /账号管理|Accounts/)
            await expect(page.getByRole('dialog')).toBeVisible()
            await page.keyboard.press('Escape')
            await accountAction(page, /MCP 接入|MCP access/)
            const tokenDialog = page.getByRole('dialog', { name: /^(MCP 接入|MCP access)$/ })
            await expect(tokenDialog).toContainText(/独立|independently/)
            await expect(tokenDialog).toBeVisible()
            await tokenDialog.screenshot({
                animations: 'disabled',
                path: `test-results/tokens-${width}-${dark ? 'dark' : 'light'}.png`
            })
            await page.locator('#mcp-token-name').fill(`Agent ${width} ${dark}`)
            await tokenDialog.getByRole('button', { name: /生成 Token|Generate token/ }).click()
            const secretDialog = page.getByRole('dialog', { name: /新 Token|New token/ })
            await expect(secretDialog).toBeVisible()
            await expect(secretDialog.locator('#mcp-secret')).toHaveText(/^epmcp_[a-f0-9]{64}$/)
            await expect(
                secretDialog.locator('input, textarea, [contenteditable="true"]')
            ).toHaveCount(0)
            const isAboveManager = await secretDialog.evaluate(element => {
                const manager = [...document.querySelectorAll('[role="dialog"]')].find(
                    node => node !== element
                )
                const mask = element.closest('.p-dialog-mask')
                const managerMask = manager.closest('.p-dialog-mask')
                const box = element.getBoundingClientRect()
                const hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)
                return (
                    Number(getComputedStyle(mask).zIndex) >
                        Number(getComputedStyle(managerMask).zIndex) && element.contains(hit)
                )
            })
            expect(isAboveManager).toBe(true)
            await page.evaluate(() => {
                window.__tokenCopyCount = 0
                Object.defineProperty(navigator, 'clipboard', {
                    configurable: true,
                    value: {
                        writeText: async () => {
                            window.__tokenCopyCount += 1
                        }
                    }
                })
            })
            await secretDialog.getByRole('button', { name: /复制 Token|Copy token/ }).click()
            await expect(secretDialog).toContainText(/已复制|copied/)
            expect(await page.evaluate(() => window.__tokenCopyCount)).toBe(1)
            await secretDialog.screenshot({
                animations: 'disabled',
                path: `test-results/secret-dialog-${width}-${dark ? 'dark' : 'light'}.png`,
                mask: [page.locator('#mcp-secret')]
            })
            await page.keyboard.press('Escape')
            await expect(page.locator('#mcp-secret')).toHaveCount(0)
            await expect(tokenDialog).toBeVisible()
            await page.keyboard.press('Escape')
            await accountAction(page, /MCP 接入|MCP access/)
            await expect(page.locator('#mcp-secret')).toHaveCount(0)
            await tokenDialog
                .getByRole('button', { name: /^(撤销|Revoke)$/ })
                .first()
                .click()
            await page
                .getByRole('dialog')
                .last()
                .getByRole('button', { name: /^(取消|Cancel)$/ })
                .click()
            await tokenDialog
                .getByRole('button', { name: /^(撤销|Revoke)$/ })
                .first()
                .click()
            await page
                .getByRole('dialog')
                .last()
                .getByRole('button', { name: /^(撤销|Revoke)$/ })
                .click()
            await expect(page.getByRole('dialog', { name: /^(撤销|Revoke)$/ })).toHaveCount(0)
            await expect(tokenDialog).toContainText(/暂无有效|No active/)
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
            await accountAction(page, /退出登录|Sign out/)
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
    await expect(a.locator('.account-menu-entry')).toBeVisible()
    await expect(b.locator('.account-menu-entry')).toBeVisible()
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
    await accountAction(page, /账号管理|Accounts/)
    const username = `user_${Date.now()}`
    await page.locator('#account-name').fill(username)
    await page.locator('#account-password').fill('Synthetic-initial-789!')
    await page.getByRole('button', { name: /创建账号|Create account/, exact: true }).click()
    await expect(page.getByRole('dialog').getByText(username, { exact: true })).toBeVisible()
    await page.keyboard.press('Escape')
    await accountAction(page, /退出登录|Sign out/)
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
    await page.locator('.account-menu-entry').click()
    await expect(
        page.getByRole('menuitem', { name: /账号管理|Accounts/, exact: true })
    ).toHaveCount(0)
    await page.keyboard.press('Escape')
    await page.goto(origin + '/#/projects')
    await expect(page.getByText(/Shared browser project/)).toHaveCount(0)
    await page.goto(origin + '/#/data')
    await expect(
        page.getByRole('heading', { name: /数据存储位置|Data storage location/, exact: true })
    ).toHaveCount(0)
})
