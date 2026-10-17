import { expect, test } from '@playwright/test'

const edges = {
    left: { position: { x: 0, y: 300 }, transform: 'matrix(1, 0, 0, 1, -32, 0)', point: [14, 32] },
    right: {
        position: { x: 1216, y: 300 },
        transform: 'matrix(1, 0, 0, 1, 32, 0)',
        point: [50, 32]
    },
    top: { position: { x: 400, y: 0 }, transform: 'matrix(1, 0, 0, 1, 0, -32)', point: [32, 14] },
    bottom: {
        position: { x: 400, y: 976 },
        transform: 'matrix(1, 0, 0, 1, 0, 32)',
        point: [32, 50]
    }
}

// Exercise the real collapse/snap path, replacing only the OS IPC boundary.
async function openNativePreview(page, position, dark = false) {
    await page.setViewportSize({ width: 340, height: 360 })
    await page.addInitScript(
        ({ position, dark }) => {
            localStorage.setItem('easyproject-theme', dark ? 'dark' : 'light')
            window.__EASYPROJECT_FLOATING_WINDOW__ = true
            window.isTauri = true
            let size = { width: 340, height: 360 }
            let location = position
            window.__TAURI_INTERNALS__ = {
                metadata: { currentWindow: { label: 'task-floating' } },
                invoke: async (command, args) => {
                    if (command === 'crud_action') {
                        if (args.action !== 'get_all') throw new Error('Unexpected data mutation')
                        return { success: true, data: { list: [], totalPage: 1 } }
                    }
                    const action = command.replace('plugin:window|', '')
                    switch (action) {
                        case 'scale_factor':
                            return 1
                        case 'inner_size':
                        case 'outer_size':
                            return { ...size }
                        case 'outer_position':
                            return { ...location }
                        case 'set_size':
                            size = JSON.parse(JSON.stringify(args.value)).Logical
                            return
                        case 'set_position':
                            location = JSON.parse(JSON.stringify(args.value)).Physical
                            return
                        case 'set_min_size':
                        case 'set_resizable':
                            return
                        case 'current_monitor':
                            return {
                                name: 'Test monitor',
                                scaleFactor: 1,
                                position: { x: 0, y: 0 },
                                size: { width: 1280, height: 1080 },
                                workArea: {
                                    position: { x: 0, y: 0 },
                                    size: { width: 1280, height: 1040 }
                                }
                            }
                        default:
                            throw new Error('Unexpected native command: ' + command)
                    }
                }
            }
        },
        { position, dark }
    )
    await page.route('http://127.0.0.1:4173/', async route => {
        const response = await route.fetch()
        await route.fulfill({
            response,
            body: (await response.text()).replace(
                /<style>/g,
                '<style nonce="peek-response-nonce">'
            ),
            headers: {
                ...response.headers(),
                'content-security-policy': "style-src 'self' 'nonce-peek-response-nonce'"
            }
        })
    })
    await page.goto('/')
    await page.getByRole('button', { name: '收起', exact: true }).click()
    await expect(page.locator('.floating-ball')).toBeEnabled()
    await page.mouse.move(200, 200)
}

for (const dark of [false, true]) {
    for (const [edge, config] of Object.entries(edges)) {
        test(`peeks, pops out and retracts at ${edge} in ${dark ? 'dark' : 'light'} under nonce CSP`, async ({
            page
        }, testInfo) => {
            await openNativePreview(page, config.position, dark)
            const root = page.getByTestId('floating-window')
            const ball = page.locator('.floating-ball')
            await expect(root).toHaveAttribute('data-dock-edge', edge)
            await expect(ball).toHaveCSS('transform', config.transform)
            const visible = await ball.evaluate(node => {
                const ball = node.getBoundingClientRect(),
                    parent = node.parentElement.getBoundingClientRect()
                return {
                    width: Math.max(
                        0,
                        Math.min(ball.right, parent.right) - Math.max(ball.left, parent.left)
                    ),
                    height: Math.max(
                        0,
                        Math.min(ball.bottom, parent.bottom) - Math.max(ball.top, parent.top)
                    )
                }
            })
            expect(visible).toEqual(
                ['left', 'right'].includes(edge)
                    ? { width: 28, height: 56 }
                    : { width: 56, height: 28 }
            )
            await page.screenshot({
                path: testInfo.outputPath('peek.png'),
                clip: { x: 0, y: 0, width: 64, height: 64 }
            })
            await page.mouse.move(config.point[0], config.point[1])
            await expect(ball).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
            await page.screenshot({
                path: testInfo.outputPath('popped.png'),
                clip: { x: 0, y: 0, width: 64, height: 64 }
            })
            await page.mouse.move(200, 200)
            await expect(ball).toHaveCSS('transform', config.transform)
            await page.keyboard.press('Tab')
            await expect(ball).toBeFocused()
            await expect(ball).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
            expect(
                await page
                    .locator('style[data-primevue-style-id]')
                    .evaluateAll(styles =>
                        styles.every(style => style.nonce === 'peek-response-nonce')
                    )
            ).toBe(true)
            await ball.press('Enter')
            await expect(root).toHaveClass('floating-root expanded')
            await expect(root).toHaveAttribute('data-dock-edge', '')
        })
    }
}

test('keeps an undocked ball whole and respects reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await openNativePreview(page, { x: 400, y: 300 })
    const ball = page.locator('.floating-ball')
    await expect(page.getByTestId('floating-window')).toHaveAttribute('data-dock-edge', '')
    await expect(ball).toHaveCSS('transform', 'none')
    await expect(ball).toHaveCSS('transition-duration', '0s')
    expect((await ball.boundingBox()).width).toBe(56)
})
