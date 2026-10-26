import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'

// Deliberately capture only the built-in, in-memory demo. Never accept a remote URL or account.
const origin = 'http://127.0.0.1:1420'
const output = resolve('public/landing')
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ channel: 'chrome', headless: true })
try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } })
    await context.addInitScript(() => {
        localStorage.setItem('easyproject-lang', 'zh-CN')
        localStorage.setItem('easyproject-theme', 'light')
    })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    // A screenshot run must not contact accounts or an external server.
    await page.route('**/*', route => {
        const url = new URL(route.request().url())
        if (url.origin !== origin || url.pathname.startsWith('/api/'))
            return route.abort('blockedbyclient')
        return route.continue()
    })
    await page.goto(origin + '/?demo=1#/project/demo-project')
    await page.locator('.project-workspace').waitFor({ state: 'visible' })
    await page.locator('.table-card table').waitFor({ state: 'visible', timeout: 10000 })
    await page.getByRole('button', { name: '跳过引导', exact: true }).click({ timeout: 10000 })
    await page.locator('.onboard-overlay').waitFor({ state: 'hidden' })
    await page.evaluate(() => document.fonts.ready)
    await page.locator('.view-switch').getByRole('button', { name: /任务$/ }).focus()
    await page.screenshot({
        path: resolve(output, 'project-tasks-20261026.png'),
        animations: 'disabled'
    })
    await page.locator('.view-switch').getByRole('button', { name: /看板$/ }).click()
    await page.locator('.board-card').first().waitFor({ state: 'visible' })
    await page.locator('.view-switch').getByRole('button', { name: /看板$/ }).focus()
    await page.screenshot({
        path: resolve(output, 'project-board-20261026.png'),
        animations: 'disabled'
    })
    if (errors.length) throw new Error('Product preview rendered with errors')
    console.log('Captured two 1280x800 current-source PNG previews using in-memory demo data only')
    await context.close()
} finally {
    await browser.close()
}
