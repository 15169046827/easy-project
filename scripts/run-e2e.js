import { spawn } from 'node:child_process'

const root = new URL('../', import.meta.url)
const server = spawn(
    process.execPath,
    ['./node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '4173'],
    { cwd: root, stdio: 'ignore', windowsHide: true }
)

function stopServer() {
    if (!server.killed) server.kill()
}

process.once('exit', stopServer)
process.once('SIGINT', () => {
    stopServer()
    process.exit(130)
})

async function waitForServer() {
    const deadline = Date.now() + 30_000
    while (Date.now() < deadline) {
        if (server.exitCode !== null) throw new Error('Vite exited before becoming ready.')
        try {
            const response = await fetch('http://127.0.0.1:4173')
            if (response.ok) return
        } catch {
            // The server is still starting.
        }
        await new Promise(resolve => setTimeout(resolve, 200))
    }
    throw new Error('Timed out waiting for the E2E Vite server.')
}

try {
    await waitForServer()
    const runner = spawn(process.execPath, ['./node_modules/@playwright/test/cli.js', 'test'], {
        cwd: root,
        stdio: 'inherit',
        windowsHide: true
    })
    const exitCode = await new Promise((resolve, reject) => {
        runner.once('error', reject)
        runner.once('exit', code => resolve(code ?? 1))
    })
    process.exitCode = exitCode
} finally {
    stopServer()
}
