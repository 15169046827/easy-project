import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const host = process.env.TAURI_DEV_HOST

// https://vite.dev/config/
export default defineConfig(async () => ({
    plugins: [vue()],

    build: {
        rollupOptions: {
            output: {
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
                    return 'vendor'
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
