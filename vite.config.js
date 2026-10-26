import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { bundleLoadingGate } from './scripts/check-bundle-loading.js'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { parseVersion } from './src/utils/releaseVersion.js'

const host = process.env.TAURI_DEV_HOST
const appVersion = JSON.parse(
    readFileSync(new URL('./package.json', import.meta.url), 'utf8')
).version
const releaseTag = process.env.VITE_RELEASE_TAG || ''
if (
    releaseTag &&
    (!releaseTag.startsWith('v') || parseVersion(releaseTag.slice(1))?.base !== appVersion)
)
    throw new Error('Release tag must match the application version')
let buildCommit = 'unknown',
    buildDirty = true
try {
    buildCommit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
    buildDirty = Boolean(
        execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim()
    )
} catch {
    /* Unidentified source stays explicitly internal, never a verified release. */
}
if (releaseTag && buildDirty) throw new Error('A tagged release requires clean identified source')

// https://vite.dev/config/
export default defineConfig(async () => ({
    plugins: [vue(), bundleLoadingGate()],
    define: {
        'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion),
        'import.meta.env.VITE_BUILD_COMMIT': JSON.stringify(buildCommit),
        'import.meta.env.VITE_BUILD_DIRTY': JSON.stringify(String(buildDirty)),
        'import.meta.env.VITE_RELEASE_TAG': JSON.stringify(buildDirty ? '' : releaseTag)
    },

    build: {
        rollupOptions: {
            output: {
                onlyExplicitManualChunks: true,
                manualChunks(id) {
                    if (!id.includes('node_modules')) return undefined
                    if (id.includes('exceljs')) return 'xlsx-vendor'
                    if (id.includes('html2canvas')) return 'capture-vendor'
                    if (id.includes('@primeuix')) return 'theme-vendor'
                    if (id.includes('primevue')) return undefined
                    if (
                        id.includes('/vue/') ||
                        id.includes('vue-router') ||
                        id.includes('vue-i18n')
                    ) {
                        return 'vue-vendor'
                    }
                    // Let Rollup preserve route-level loading for unrelated dependencies.
                    // A catch-all vendor chunk pulls the full holiday engine into startup.
                    return undefined
                }
            }
        }
    },

    // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
    //
    // 1. prevent Vite from obscuring rust errors
    clearScreen: false,
    // 2. tauri expects a fixed port, fail if that port is not available
    server: {
        port: 1420,
        strictPort: true,
        host: host || false,
        hmr: host
            ? {
                  protocol: 'ws',
                  host,
                  port: 1421
              }
            : undefined,
        watch: {
            // 3. tell Vite to ignore watching `src-tauri`
            ignored: ['**/src-tauri/**']
        }
    }
}))
