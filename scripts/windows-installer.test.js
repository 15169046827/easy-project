import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const root = new URL('../', import.meta.url)
const config = JSON.parse(readFileSync(new URL('src-tauri/tauri.conf.json', root), 'utf8'))
const cargo = readFileSync(new URL('src-tauri/Cargo.toml', root), 'utf8')

describe('Windows first-install dependencies', () => {
    it('embeds the full runtime, not a bootstrapper that still needs the network', () => {
        expect(config.bundle.windows.webviewInstallMode).toEqual({
            type: 'offlineInstaller',
            silent: true
        })
    })

    it('compiles SQLite in and does not add external sidecars or resource downloads', () => {
        expect(cargo).toMatch(/rusqlite\s*=\s*\{[^\n]*features\s*=\s*\[[^\]]*"bundled"/)
        expect(config.bundle.externalBin ?? []).toEqual([])
        expect(config.bundle.resources ?? []).toEqual([])
    })
})
