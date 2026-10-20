import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { randomUUID } from 'node:crypto'
import { createServer } from 'node:net'

const reservation = createServer()
await new Promise(resolveReady =>
    reservation.listen({ port: 0, host: '127.0.0.1' }, () => resolveReady(undefined))
)
const address = reservation.address()
if (!address || typeof address === 'string') throw new Error('Unable to reserve a test port')
const origin = `http://127.0.0.1:${address.port}`
await new Promise(resolveClosed => reservation.close(resolveClosed))
const root = resolve('server/target', `web-e2e-${randomUUID()}`)
mkdirSync(root, { recursive: true })
const binary = resolve(
    'server/target/debug',
    `easyproject-server${process.platform === 'win32' ? '.exe' : ''}`
)
const environment = {
    ...process.env,
    EASYPROJECT_DATA_DIR: root,
    EASYPROJECT_ASSETS_DIR: resolve('dist'),
    EASYPROJECT_ORIGIN: origin,
    EASYPROJECT_LISTEN: `127.0.0.1:${address.port}`
}
// Synthetic credentials are for a new isolated loopback-only test instance.
const initial = 'Synthetic-initial-123!'
const password = 'Synthetic-changed-456!'
const bootstrap = spawn(binary, ['bootstrap-admin', 'test_admin'], {
    env: environment,
    windowsHide: true,
    stdio: ['pipe', 'ignore', 'inherit']
})
bootstrap.stdin.end(initial)
if (await new Promise(resolveExit => bootstrap.once('exit', resolveExit)))
    throw new Error('Test bootstrap failed')
const server = spawn(binary, [], {
    env: environment,
    windowsHide: true,
    stdio: ['ignore', 'ignore', 'inherit']
})
function stop() {
    if (!server.killed) server.kill()
}
process.once('exit', stop)
process.once('SIGINT', () => {
    stop()
    process.exit(130)
})

async function request(path, body, token = '') {
    const response = await fetch(origin + path, {
        method: 'POST',
        headers: {
            Origin: origin,
            'Content-Type': 'application/json',
            'X-EasyProject-Request': '1',
            'X-EasyProject-Client': 'desktop',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000)
    })
    if (!response.ok) throw new Error(`Test setup request failed: ${response.status}`)
    return response.json()
}

try {
    let ready = false
    for (let count = 0; count < 100; count++) {
        if (server.exitCode !== null) throw new Error('Test server exited before readiness')
        try {
            if ((await fetch(origin + '/api/health')).ok) {
                ready = true
                break
            }
        } catch {
            /* bounded startup */
        }
        await new Promise(resolveWait => setTimeout(resolveWait, 100))
    }
    if (!ready) throw new Error('Test server startup timed out')
    const login = await request('/api/auth/login', { username: 'test_admin', password: initial })
    await request(
        '/api/auth/password',
        { currentPassword: initial, newPassword: password },
        login.token
    )
    const runner = spawn(
        process.execPath,
        ['./node_modules/@playwright/test/cli.js', 'test', 'e2e/web-server.spec.js', '--workers=1'],
        {
            env: { ...process.env, EASYPROJECT_WEB_TEST_URL: origin },
            windowsHide: true,
            stdio: 'inherit'
        }
    )
    process.exitCode = Number(await new Promise(resolveExit => runner.once('exit', resolveExit)))
} finally {
    stop()
}
