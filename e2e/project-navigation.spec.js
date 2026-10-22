import { expect, test } from '@playwright/test'

const projectId = 'PROJECT:0123456789abcdef0123456789abcdef'
const fixtures = {
    project: [
        {
            id: projectId,
            name: '项目跳转回归 / Project navigation',
            status: 'InProgress',
            owner: ''
        }
    ],
    task: [
        {
            id: 'TASK:0123456789abcdef0123456789abcdef',
            project_id: projectId,
            name: '关联任务 / Associated task',
            status: 'InProgress',
            progress: 25,
            parent: '',
            end_time: '2026-10-30',
            sort_order: 1
        }
    ],
    member: [{ id: 'MEMBER:0123456789abcdef0123456789abcdef', name: 'Regression Member' }]
}

test.beforeEach(async ({ page }) => {
    await page.addInitScript(data => {
        localStorage.setItem('easyproject-onboarding-done', 'true')
        window.__TAURI_INTERNALS__ = {
            invoke: async (command, args) => {
                if (
                    command !== 'crud_action' ||
                    !['get_all', 'get_by_project'].includes(args.action)
                )
                    throw new Error('Read-only UI fixture rejected an unexpected operation')
                const list = (data[args.model] || []).filter(
                    row => !args.data.projectId || row.project_id === args.data.projectId
                )
                return { success: true, data: { list, total: list.length } }
            }
        }
    }, fixtures)
})

async function geometry(page) {
    return page
        .locator('.p-datatable-tbody > tr')
        .first()
        .evaluate(row =>
            [...row.children].map(cell => {
                const rect = cell.getBoundingClientRect()
                return { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
            })
        )
}

for (const size of [
    { width: 1280, height: 800 },
    { width: 960, height: 640 }
]) {
    for (const dark of [false, true]) {
        test(`project navigation and shared focus remain stable ${size.width} dark=${dark}`, async ({
            page
        }, testInfo) => {
            await page.setViewportSize(size)
            await page.addInitScript(
                value => localStorage.setItem('easyproject-theme', value),
                dark ? 'dark' : 'light'
            )
            const errors = []
            page.on('pageerror', error => errors.push(error.message))
            await page.route('http://127.0.0.1:4173/', async route => {
                const response = await route.fetch()
                await route.fulfill({
                    response,
                    body: (await response.text()).replace(
                        /<style>/g,
                        '<style nonce="project-navigation-nonce">'
                    ),
                    headers: {
                        ...response.headers(),
                        'content-security-policy':
                            "default-src 'self'; script-src 'self'; style-src 'self' 'nonce-project-navigation-nonce'; style-src-attr 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'"
                    }
                })
            })
            await page.goto('/#/projects')
            const link = page.locator('.project-link')
            await expect(link).toBeVisible()
            await page.mouse.move(0, 0)
            const before = await geometry(page)
            for (const action of ['hover', 'focus']) {
                await link[action]()
                const samples = await link.evaluate(async node => {
                    const samples = []
                    for (let frame = 0; frame < 20; frame++) {
                        await new Promise(resolve => requestAnimationFrame(resolve))
                        const style = getComputedStyle(node)
                        samples.push({
                            border: style.borderLeftWidth,
                            background: style.backgroundColor,
                            color: style.color
                        })
                    }
                    return samples
                })
                expect(await geometry(page)).toEqual(before)
                expect(samples.every(sample => sample.border === '0px')).toBe(true)
                expect(samples.every(sample => sample.background === 'rgba(0, 0, 0, 0)')).toBe(true)
            }
            await page.screenshot({ path: testInfo.outputPath('projects-focus.png') })
            await link.press('Enter')
            await expect(page).toHaveURL(new RegExp(encodeURI('/project/' + projectId) + '$'))
            await expect(page.locator('.project-workspace h2')).toHaveText(fixtures.project[0].name)
            await expect(page.locator('.task-name-text')).toHaveText(fixtures.task[0].name)
            await expect(page.locator('.workspace-content')).toBeInViewport()
            for (const index of [1, 2, 3, 4, 0]) {
                const button = page.locator('.view-switch button').nth(index)
                const before = await button.boundingBox()
                await button.hover()
                expect(await button.boundingBox()).toEqual(before)
                await button.focus()
                expect(await button.boundingBox()).toEqual(before)
                await button.click()
                await expect(page.locator('.workspace-content > *').first()).toBeVisible()
                if (index === 2) {
                    const card = page.locator('.board-card').first()
                    const before = await card.boundingBox()
                    const textColor = await card.evaluate(node => getComputedStyle(node).color)
                    for (const action of ['hover', 'focus']) {
                        await card[action]()
                        expect(await card.boundingBox()).toEqual(before)
                        expect(await card.evaluate(node => getComputedStyle(node).color)).toBe(
                            textColor
                        )
                    }
                }
            }
            await page.screenshot({ path: testInfo.outputPath('project-tasks.png') })
            for (const [route, selector] of [
                ['dashboard', '.metric-card'],
                ['tasks', '.task-tree-name'],
                ['members', '.member-trigger'],
                ['data', '.data-card']
            ]) {
                await page
                    .getByRole('navigation', { name: 'Workspace views' })
                    .getByRole('button')
                    .nth(['dashboard', 'projects', 'tasks', 'data', 'members'].indexOf(route))
                    .click()
                const target = page.locator(selector).first()
                await expect(target).toBeVisible()
                const before = await target.boundingBox()
                await target.hover()
                expect(await target.boundingBox()).toEqual(before)
                if (await target.evaluate(node => node.matches('button, a, [tabindex]'))) {
                    await target.focus()
                    expect(await target.boundingBox()).toEqual(before)
                }
            }
            expect(errors).toEqual([])
        })
    }
}

test('a failed project module has recoverable feedback instead of a blank workspace', async ({
    page
}) => {
    await page.route('**/assets/ProjectWorkspace-*.js', route =>
        route.fulfill({ status: 503, body: 'Synthetic module unavailable' })
    )
    await page.goto('/#/projects')
    await page.locator('.project-link').click()
    await expect(page.getByRole('alert')).toContainText('PAGE_MODULE_LOAD_FAILED')
    await expect(page.getByRole('navigation', { name: 'Workspace views' })).toBeVisible()
    await page.getByRole('button', { name: '返回项目列表', exact: true }).click()
    await expect(page.locator('.project-link')).toBeVisible()
    await expect(page.locator('.workspace-route-error')).toHaveCount(0)
})

test('project template cards keep their geometry and readable text on hover and focus', async ({
    page
}) => {
    await page.goto('/#/projects')
    await page.getByRole('button', { name: '新建项目', exact: true }).click()
    await expect(page.locator('.p-dialog')).toHaveCSS(
        'transform',
        /^(none|matrix\(1, 0, 0, 1, 0, 0\))$/
    )
    const cards = page.locator('.template-card')
    await expect(cards).toHaveCount(4)
    for (const card of await cards.all()) {
        const before = await card.boundingBox()
        const textColor = await card.evaluate(node => getComputedStyle(node).color)
        for (const action of ['hover', 'focus']) {
            await card[action]()
            expect(await card.boundingBox()).toEqual(before)
            expect(await card.evaluate(node => getComputedStyle(node).color)).toBe(textColor)
        }
    }
})
