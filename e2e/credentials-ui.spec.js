import { expect, test } from '@playwright/test'

test('desktop opt-in password saving fills but never auto-submits and can be cleared', async ({
    page
}) => {
    /** @type {{username:string,password:string}|null} */
    let saved = null
    const operations = []
    await page.exposeFunction('__testSavedCredentials', async args => {
        operations.push(args.action)
        if (args.action === 'save') saved = { ...args.credentials }
        if (args.action === 'clear') saved = null
        return args.action === 'read' ? saved : null
    })
    await page.addInitScript(() => {
        window.isTauri = true
        Object.defineProperty(navigator, 'userAgent', {
            get: () => 'Windows credential UI fixture'
        })
        window.__EASYPROJECT_STORAGE_INFO__ = {
            ready: true,
            activeDir: 'E:\\fixture\\data',
            databasePath: 'E:\\fixture\\data\\project_manager.db',
            defaultDir: 'E:\\fixture\\data',
            profileDir: 'E:\\fixture\\webview',
            configPath: 'E:\\fixture\\easyproject-storage.json',
            pendingDir: null,
            error: null
        }
        localStorage.setItem('easyproject-onboarding-done', 'true')
        window.__TAURI_INTERNALS__ = {
            metadata: { currentWindow: { label: 'main' } },
            invoke: async (command, args) => {
                if (command === 'desktop_credentials')
                    return window.__testSavedCredentials({
                        action: args.action,
                        credentials: args.credentials
                    })
                if (command.startsWith('plugin:window|') || command.startsWith('plugin:event|'))
                    return false
                throw new Error('Unexpected native command in credential fixture')
            }
        }
    })
    let logins = 0
    await page.route('https://home-host.tail2956dd.ts.net/api/**', async route => {
        const path = new URL(route.request().url()).pathname
        let data
        if (path === '/api/auth/login') {
            logins++
            data = {
                user: {
                    id: 'ACCOUNT:0000000000004000a000000000000000',
                    username: 'saved_user',
                    avatar: '',
                    admin: false,
                    mustChangePassword: false
                },
                token: 'synthetic-session-only'
            }
        } else if (path === '/api/workspace/revision') data = { revision: 1 }
        else data = { revision: 1, data: { list: [], total: 0, totalPage: 0 } }
        await route.fulfill({ json: data })
    })
    await page.goto('/')
    const checkbox = page.getByRole('checkbox', { name: /保存密码|Save password/ })
    await expect(checkbox).not.toBeChecked()
    expect(logins).toBe(0)
    await page.locator('#remote-username').fill('saved_user')
    await page.locator('#remote-password').fill('abc123')
    await checkbox.focus()
    await page.keyboard.press('Space')
    await page.getByRole('button', { name: /^(登录|Sign in)$/ }).click()
    await expect.poll(() => operations.includes('save')).toBe(true)
    expect(saved).toEqual({ username: 'saved_user', password: 'abc123' })
    await page.reload()
    await expect(page.locator('#remote-username')).toHaveValue('saved_user')
    await expect(page.locator('#remote-password')).toHaveValue('abc123')
    await expect(checkbox).toBeChecked()
    expect(logins).toBe(1)
    const stores = await page.evaluate(
        () => JSON.stringify(localStorage) + JSON.stringify(sessionStorage)
    )
    expect(stores).not.toContain('abc123')
    await checkbox.uncheck()
    await expect.poll(() => saved).toBeNull()
    await page.reload()
    await expect(page.locator('#remote-password')).toHaveValue('')
    await expect(checkbox).not.toBeChecked()
})
