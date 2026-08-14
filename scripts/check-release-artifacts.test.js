import { spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

const script = path.resolve('scripts/check-release-artifacts.js')
const roots = []

function createRoot() {
    const root = mkdtempSync(path.join(tmpdir(), 'easyproject-release-'))
    roots.push(root)
    return root
}

function runCheck(root, expected) {
    return spawnSync(process.execPath, [script], {
        env: { ...process.env, BUNDLE_ROOT: root, EXPECTED_BUNDLES: expected },
        encoding: 'utf8'
    })
}

afterEach(() => {
    for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
})

describe('release artifact validation', () => {
    it('accepts a non-empty installer file', () => {
        const root = createRoot()
        const bundle = path.join(root, 'release', 'bundle', 'msi')
        mkdirSync(bundle, { recursive: true })
        writeFileSync(path.join(bundle, 'EasyProject.msi'), 'installer')

        const result = runCheck(root, 'msi')
        expect(result.status).toBe(0)
        expect(result.stdout).toContain('Validated 1 .msi bundle(s).')
    })

    it('rejects an empty installer file', () => {
        const root = createRoot()
        const bundle = path.join(root, 'release', 'bundle', 'nsis')
        mkdirSync(bundle, { recursive: true })
        writeFileSync(path.join(bundle, 'EasyProject.exe'), '')

        const result = runCheck(root, 'exe')
        expect(result.status).not.toBe(0)
        expect(result.stderr).toContain('Empty release artifact')
    })

    it('rejects an empty app bundle directory', () => {
        const root = createRoot()
        mkdirSync(path.join(root, 'release', 'bundle', 'macos', 'EasyProject.app'), {
            recursive: true
        })

        const result = runCheck(root, 'app')
        expect(result.status).not.toBe(0)
        expect(result.stderr).toContain('Empty release bundle directory')
    })

    it('accepts an app bundle containing a non-empty file', () => {
        const root = createRoot()
        const executable = path.join(
            root,
            'release',
            'bundle',
            'macos',
            'EasyProject.app',
            'Contents',
            'MacOS'
        )
        mkdirSync(executable, { recursive: true })
        writeFileSync(path.join(executable, 'EasyProject'), 'binary')

        const result = runCheck(root, 'app')
        expect(result.status).toBe(0)
        expect(result.stdout).toContain('Validated 1 .app bundle(s).')
    })
})
