// @vitest-environment node
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const config = JSON.parse(readFileSync(resolve('src-tauri/tauri.conf.json'), 'utf8'))
const cargo = readFileSync(resolve('src-tauri/Cargo.toml'), 'utf8')

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
