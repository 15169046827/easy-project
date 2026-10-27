import { expect, test } from '@playwright/test'

const origin = process.env.EASYPROJECT_WEB_TEST_URL
test.skip(!origin, 'Run with the isolated real HTTP server runner')
test.beforeAll(() => {
    if (origin && new URL(origin).hostname !== '127.0.0.1')
        throw new Error('Real-data targets are prohibited')
})

async function login(page, username = 'test_admin', password = 'Synthetic-changed-456!') {
    await page.addInitScript(() => localStorage.setItem('easyproject-onboarding-done', 'true'))
    await page.goto(origin + '/index.html')
    await page.locator('#remote-username').fill(username)
    await page.locator('#remote-password').fill(password)
    await page
        .locator('form')
        .getByRole('button', { name: /^(登录|Sign in)$/ })
        .click()
    await expect(page.locator('.account-menu-entry')).toBeVisible()
    const skip = page.locator('.onboard-skip').first()
    if (await skip.isVisible()) await skip.click()
}

async function accountAction(page, name) {
    await page.getByRole('button', { name: /^(用户菜单|User menu)$/ }).click()
    await page.getByRole('menuitem', { name, exact: true }).click()
}

test('real hierarchy keeps roots, weighted estimates, drawer edits and filter context consistent', async ({
    page
}) => {
    const session = await page.request.post(origin + '/api/auth/login', {
        headers: {
            Origin: origin,
            'X-EasyProject-Request': '1',
            'X-EasyProject-Client': 'desktop'
        },
        data: { username: 'test_admin', password: 'Synthetic-changed-456!' }
    })
    const { token } = await session.json()
    const headers = {
        Origin: origin,
        'X-EasyProject-Request': '1',
        Authorization: `Bearer ${token}`
    }
    async function action(model, operation, data, expected = 200) {
        const revision = (
            await (await page.request.get(origin + '/api/workspace/revision', { headers })).json()
        ).revision
        const response = await page.request.post(origin + '/api/workspace/action', {
            headers: { ...headers, 'X-Workspace-Revision': String(revision) },
            data: { model, action: operation, data }
        })
        expect(response.status()).toBe(expected)
        return response.json()
    }
    const project = (
        await action('project', 'add', {
            name: `Hierarchy acceptance ${Date.now()}`,
            version: 'v1.0',
            type: 'private',
            status: 'InProgress',
            owner: ''
        })
    ).data.id
    const states = (await action('task_status', 'get_all', { projectId: project })).data.list
    const pending = states.find(state => state.is_default).id,
        done = states.find(state => state.is_completed).id
    for (let index = 0; index < 6; index++)
        await action('task_status', 'add', {
            project_id: project,
            name: `Synthetic review ${index}`
        })
    const data = {
        project_id: project,
        parent: '',
        dependence: '',
        start_time: '',
        end_time: '',
        type: 'Task',
        priority: '3',
        status_id: pending,
        comment: '',
        assignee: ''
    }
    const parent = (await action('task', 'add', { ...data, name: 'Delivery goal' })).data.id
    const leaf = (
        await action('task', 'add', {
            ...data,
            name: 'Execution needle',
            parent,
            effort_days: 2,
            progress: 50,
            start_time: '2026-10-25',
            end_time: '2026-10-28'
        })
    ).data.id
    await action('task', 'add', { ...data, name: 'Unestimated execution', parent })
    const snapshot = (
        await action('task', 'get_all', { projectId: project, hierarchy: true, pageSize: 1 })
    ).data
    expect(snapshot.total).toBe(1)
    expect(snapshot.list).toHaveLength(3)
    expect(snapshot.list.find(task => task.id === parent).summary).toMatchObject({
        effort_days: 2,
        progress: 50,
        unestimated_count: 1
    })
    const rejected = await action('task', 'update', { id: parent, status_id: done }, 400)
    expect(JSON.stringify(rejected)).toContain(leaf)
    await action('task', 'add', {
        ...data,
        name: 'Completed overview sibling',
        status_id: done,
        progress: 100
    })
    await login(page)
    await page.goto(origin + '/index.html#/project/' + project)
    const overviewCards = page.locator('.statistics-cards .status-stat')
    await expect(overviewCards).toHaveCount(2)
    const overviewText = await overviewCards.allTextContents()
    await overviewCards.filter({ hasText: '待办' }).click()
    await expect(page.locator('.task-name-text')).not.toContainText(['Completed overview sibling'])
    await expect(overviewCards).toHaveText(overviewText)
    await overviewCards.filter({ hasText: '待办' }).click()
    await expect(
        page.locator('.task-name-text').filter({ hasText: 'Completed overview sibling' })
    ).toBeVisible()
    for (const width of [1280, 960])
        for (const dark of [false, true]) {
            await page.setViewportSize({ width, height: width === 960 ? 640 : 800 })
            await page.addInitScript(
                dark => localStorage.setItem('easyproject-theme', dark ? 'dark' : 'light'),
                dark
            )
            await page.goto(origin + '/index.html#/project/' + project)
            // Same hash navigation preserves Vue filter/expanded state. Start
            // each viewport/theme case with a fresh document and nonce.
            await page.reload()
            const root = page.locator('.task-name-text').filter({ hasText: 'Delivery goal' })
            await expect(root).toBeVisible()
            if (width === 960) {
                const statistics = await page.locator('.hierarchy-statistics').boundingBox()
                const table = await page.locator('.p-datatable-table-container').boundingBox()
                // Statistics now include an accessible toolbar and fully visible cards.
                // Check card geometry, not the previous scroll-clipped section height.
                expect(statistics.height).toBeGreaterThanOrEqual(76)
                const cards = page.locator('.statistics-cards')
                await expect(cards).toBeVisible()
                expect(
                    await cards.evaluate(element => element.scrollHeight <= element.clientHeight)
                ).toBe(true)
                expect((await cards.locator('button').first().boundingBox()).height).toBe(76)
                expect(table.height).toBeGreaterThanOrEqual(120)
            }
            await page.getByRole('button', { name: /^(展开任务|Expand task)$/ }).click()
            const drawer = page.locator('.child-drawer').first()
            await expect(drawer).toContainText('Execution needle')
            await expect(drawer.locator('table')).toHaveCount(0)
            await drawer.getByRole('button', { name: /^(编辑|Edit): Execution needle$/ }).click()
            await expect(page.locator('#task-edit-parent')).toContainText('Delivery goal')
            await expect(page.locator('#task-edit-effort_days')).toHaveValue('2')
            await page
                .getByRole('dialog')
                .getByRole('button', { name: /^(取消|Cancel)$/ })
                .click()
            await page.screenshot({
                path: `test-results/hierarchy-${width}-${dark ? 'dark' : 'light'}.png`
            })
            await page.getByPlaceholder(/搜索任务|Search tasks/).fill('needle')
            await page.getByPlaceholder(/搜索任务|Search tasks/).press('Enter')
            await expect(page.locator('.child-drawer')).toContainText('Execution needle')
            await expect(page.locator('.child-drawer')).not.toContainText('Unestimated execution')
            await expect(page.locator('.pi-filter[title]')).toBeVisible()
            if (width === 960) {
                await page.goto(origin + '/index.html#/tasks')
                await page.reload()
                await expect(
                    page.locator('.task-name-text').filter({ hasText: 'Delivery goal' })
                ).toBeVisible()
                await page.locator('.p-paginator').scrollIntoViewIfNeeded()
                const footer = await page.locator('.p-paginator').boundingBox()
                expect(footer.y).toBeGreaterThanOrEqual(0)
                expect(footer.y + footer.height).toBeLessThanOrEqual(640)
                await expect(
                    page.getByRole('button', { name: /^(仪表盘|Dashboard)$/ })
                ).toBeVisible()
            }
        }
})

test('real HTTP homepage is public and online entry retains same-origin login', async ({
    page
}) => {
    const api = []
    const errors = []
    page.on('request', request => {
        if (new URL(request.url()).pathname.startsWith('/api/')) api.push(request.url())
    })
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(origin)
    await expect(page.locator('.landing-page')).toBeVisible()
    await expect(page.locator('.landing-preview img')).toHaveJSProperty('naturalWidth', 1280)
    expect(api).toEqual([])
    await page.locator('.landing-actions a').first().click()
    await expect(page.locator('#remote-username')).toBeVisible()
    await expect(page).toHaveURL(origin + '/index.html#/dashboard')
    expect(api.some(url => url.endsWith('/api/auth/session'))).toBe(true)
    expect(errors).toEqual([])
})

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
            await page.goto(origin + '/index.html')
            const passwordBox = await page.locator('.p-password').first().boundingBox()
            const recoveryBox = await page.locator('.password-recovery-link').boundingBox()
            expect(passwordBox && recoveryBox).toBeTruthy()
            expect(
                Math.abs(passwordBox.x + passwordBox.width - recoveryBox.x - recoveryBox.width)
            ).toBeLessThan(2)
            expect(recoveryBox.y).toBeGreaterThanOrEqual(passwordBox.y + passwordBox.height)
            expect(recoveryBox.y - passwordBox.y - passwordBox.height).toBeLessThan(16)
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
            await expect(page.getByRole('dialog').locator('#profile-username')).toHaveValue(
                'test_admin'
            )
            await page.getByRole('tab', { name: /修改密码|Change password/ }).focus()
            await page.keyboard.press('Enter')
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
    await expect(b.locator('.account-menu-entry')).toBeVisible()
    await expect(b.locator('#remote-username')).toHaveCount(0)
    await expect(b.getByText(name, { exact: true })).toBeVisible()
    await b.locator('.project-link').filter({ hasText: name }).click()
    await expect(b.locator('.project-workspace h2')).toHaveText(name)
    await expect(b.locator('.panel.embedded')).toBeVisible()
    await b.getByRole('button', { name: /返回项目列表|Back to projects/ }).click()
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

test('desktop bearer conflict refresh reloads data without navigating or signing out', async ({
    page,
    request
}) => {
    // Real HTTP/SQLite fixture, but no real desktop account or production traffic.
    // Strip only the Web marker to exercise the desktop memory-Bearer adapter.
    await page.addInitScript(() => {
        window.isTauri = true
        Object.defineProperty(navigator, 'userAgent', {
            get: () => 'Desktop bearer transport test'
        })
        localStorage.setItem('easyproject-onboarding-done', 'true')
        window.__TAURI_INTERNALS__ = {
            invoke: async () => {
                throw new Error('Unexpected native IPC')
            }
        }
    })
    await page.route(origin + '/index.html', async route => {
        const response = await route.fetch()
        await route.fulfill({
            response,
            // This fixture runs the desktop adapter in a loopback browser.
            // Allow only its exact intercepted target; production CSP is unchanged.
            headers: {
                ...response.headers(),
                'content-security-policy': response
                    .headers()
                    [
                        'content-security-policy'
                    ].replace("connect-src 'self'", "connect-src 'self' https://home-host.tail2956dd.ts.net")
            },
            body: (await response.text()).replace(
                /<meta name="easyproject-web" content="true">/g,
                ''
            )
        })
    })
    const bearerHeaders = []
    let loginCount = 0
    await page.route('https://home-host.tail2956dd.ts.net/api/**', async route => {
        const original = route.request()
        const path = new URL(original.url()).pathname
        if (path === '/api/auth/login') loginCount += 1
        if (original.headers().authorization) bearerHeaders.push(original.headers().authorization)
        const response = await route.fetch({
            url: origin + path,
            headers: { ...original.headers(), origin: 'tauri://localhost' }
        })
        await route.fulfill({
            response,
            headers: { ...response.headers(), 'access-control-allow-origin': origin }
        })
    })
    await login(page)
    const session = await request.post(origin + '/api/auth/login', {
        headers: {
            Origin: origin,
            'X-EasyProject-Request': '1',
            'X-EasyProject-Client': 'desktop'
        },
        data: { username: 'test_admin', password: 'Synthetic-changed-456!' }
    })
    const { token } = await session.json()
    const headers = {
        Origin: origin,
        'X-EasyProject-Request': '1',
        Authorization: `Bearer ${token}`
    }
    const revision = (
        await (await request.get(origin + '/api/workspace/revision', { headers })).json()
    ).revision
    const name = `Desktop refresh ${Date.now()}`
    const write = await request.post(origin + '/api/workspace/action', {
        headers: { ...headers, 'X-Workspace-Revision': String(revision) },
        data: {
            model: 'project',
            action: 'add',
            data: { name, version: 'v1.0', type: 'private', status: 'Draft', owner: '' }
        }
    })
    expect(write.status()).toBe(200)
    await page.getByRole('button', { name: /项目管理|Projects/, exact: true }).click()
    const refresh = page.getByRole('button', { name: /刷新（放弃|Refresh \(discard/ })
    await expect(refresh).toBeVisible({ timeout: 20000 })
    // The conflict banner belongs to RemoteRoot and can appear while the lazy
    // Projects navigation is still pending. Finish that navigation before
    // measuring whether the subsequent refresh itself navigates/reloads.
    await expect(page).toHaveURL(/#\/projects$/)
    await expect(page.locator('.projects-page')).toBeVisible()
    let navigations = 0
    page.on('framenavigated', frame => {
        if (frame === page.mainFrame()) navigations += 1
    })
    await refresh.click()
    await expect(page.locator('.account-menu-entry')).toBeVisible()
    await expect(page.locator('#remote-username')).toHaveCount(0)
    await expect(page.getByText(name, { exact: true })).toBeVisible()
    expect(navigations).toBe(0)
    await page.locator('.project-link').filter({ hasText: name }).click()
    await expect(page.locator('.project-workspace h2')).toHaveText(name)
    await expect(page.locator('.panel.embedded')).toBeVisible()
    expect(loginCount).toBe(1)
    expect(new Set(bearerHeaders).size).toBe(1)
    expect(bearerHeaders.length).toBeGreaterThan(1)
    const stored = await page.evaluate(
        () => JSON.stringify(localStorage) + JSON.stringify(sessionStorage)
    )
    expect(bearerHeaders.some(header => stored.includes(header.slice(7)))).toBe(false)
})

for (const [width, dark] of /** @type {[number,boolean][]} */ ([
    [1280, false],
    [375, true]
])) {
    test(`profile avatar rename and administrator reset dialog at ${width}px dark=${dark}`, async ({
        page,
        request
    }) => {
        await page.setViewportSize({ width, height: 800 })
        await page.addInitScript(
            dark => localStorage.setItem('easyproject-theme', dark ? 'dark' : 'light'),
            dark
        )
        const original = `profile_${width}_${Date.now()}`
        const renamed = original + '_new'
        const oldPassword = 'Profile-password-123!'
        const created = await request.post(origin + '/api/auth/register', {
            headers: { Origin: origin, 'X-EasyProject-Request': '1' },
            data: { username: original, password: oldPassword }
        })
        expect(created.status()).toBe(200)
        await login(page, original, oldPassword)
        await accountAction(page, /用户设置|User settings/)
        const settings = page.getByRole('dialog', { name: /^(用户设置|User settings)$/ })
        const image = await page.evaluate(() => {
            const canvas = document.createElement('canvas')
            canvas.width = 400
            canvas.height = 200
            const context = canvas.getContext('2d')
            context.fillStyle = '#34b3c0'
            context.fillRect(0, 0, 400, 200)
            return canvas.toDataURL('image/png').split(',')[1]
        })
        await settings.locator('input[type=file]').setInputFiles({
            name: 'synthetic-avatar.png',
            mimeType: 'image/png',
            buffer: Buffer.from(image, 'base64')
        })
        const preview = settings.locator('.avatar-square img')
        await expect(preview).toBeVisible()
        await expect
            .poll(() =>
                preview.evaluate(img =>
                    img instanceof HTMLImageElement ? [img.naturalWidth, img.naturalHeight] : [0, 0]
                )
            )
            .toEqual([128, 128])
        await settings.locator('#profile-username').fill(renamed)
        await settings.locator('#profile-password').fill(oldPassword)
        await settings
            .getByRole('button', { name: /保存头像和用户名|Save avatar and username/ })
            .click()
        await expect(settings).not.toBeVisible()
        const avatar = page.locator('.account-menu-entry .p-avatar')
        await expect(avatar.locator('img')).toBeVisible()
        const shape = await avatar.evaluate(element => {
            const box = element.getBoundingClientRect()
            return {
                width: box.width,
                height: box.height,
                radius: getComputedStyle(element).borderRadius
            }
        })
        expect(Math.abs(shape.width - shape.height)).toBeLessThan(0.1)
        expect(shape.radius).toBe('50%')
        await accountAction(page, /用户设置|User settings/)
        await expect(settings.locator('#profile-username')).toHaveValue(renamed)
        await settings.screenshot({
            animations: 'disabled',
            path: `test-results/profile-${width}-${dark}.png`
        })
        await page.keyboard.press('Escape')
        await accountAction(page, /退出登录|Sign out/)
        await login(page)
        await accountAction(page, /账号管理|Accounts/)
        const accounts = page.getByRole('dialog', { name: /^(账号管理|Accounts)$/ })
        await accounts
            .locator('li')
            .filter({ hasText: renamed })
            .getByRole('button', { name: /生成重置码|Generate reset code/ })
            .click()
        const secret = page.getByRole('dialog', {
            name: /一次性密码重置码|One-time password reset code/
        })
        await expect(secret).toBeVisible()
        await expect(secret.locator('input,textarea,[contenteditable=true]')).toHaveCount(0)
        const code = await secret.locator('code').innerText()
        expect(code).toMatch(/^epreset_[a-f0-9]{64}$/)
        await page.keyboard.press('Escape')
        await expect(secret).not.toBeVisible()
        await page.keyboard.press('Escape')
        await accountAction(page, /退出登录|Sign out/)
        await page.getByRole('button', { name: /忘记密码|Forgot password/ }).click()
        const recovery = page.getByRole('dialog', { name: /忘记密码|Forgot password/ })
        await recovery.locator('#reset-username').fill(renamed)
        await recovery.locator('#reset-code').fill(code)
        await recovery.locator('#reset-new-password').fill('abc123')
        await recovery.locator('#reset-confirm-password').fill('abc123')
        await recovery.getByRole('button', { name: /^(重置密码|Reset password)$/ }).click()
        await expect(recovery.getByRole('alert')).toContainText(/密码已重置|Password reset/)
        await expect(recovery.locator('#reset-code')).toHaveValue('')
        await expect(recovery.locator('#reset-new-password')).toHaveValue('')
        await page.keyboard.press('Escape')
        await login(page, renamed, 'abc123')
        await expect(page.locator('.account-menu-entry .p-avatar img')).toBeVisible()
    })
}
