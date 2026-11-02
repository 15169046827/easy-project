import { configDefaults, defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
    plugins: [vue()],
    test: {
        environment: 'jsdom',
        globals: true,
        // Rust build output can contain archived verification checkouts, not project tests.
        exclude: [...configDefaults.exclude, 'e2e/**', 'src-tauri/target/**']
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    }
})
