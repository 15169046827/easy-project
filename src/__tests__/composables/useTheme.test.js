/**
 * useTheme composable 测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock matchMedia for jsdom
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
    }))
})

beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('app-dark')
    vi.resetModules()
})

describe('useTheme', () => {
    it('默认使用 light 模式', async () => {
        const { useTheme } = await import('../../composables/useTheme.js')
        const { isDark } = useTheme()
        expect(isDark.value).toBe(false)
        expect(document.documentElement.classList.contains('app-dark')).toBe(false)
    })

    it('从 localStorage 读取 dark 主题', async () => {
        localStorage.setItem('easyproject-theme', 'dark')
        const { useTheme } = await import('../../composables/useTheme.js')
        const { isDark } = useTheme()
        expect(isDark.value).toBe(true)
        expect(document.documentElement.classList.contains('app-dark')).toBe(true)
    })

    it('toggle() 可以来回切换', async () => {
        const { useTheme } = await import('../../composables/useTheme.js')
        const { isDark, toggle } = useTheme()

        expect(isDark.value).toBe(false)
        toggle()
        expect(isDark.value).toBe(true)
    })

    it('切换后 localStorage 保存 dark', async () => {
        const { useTheme } = await import('../../composables/useTheme.js')
        const { isDark, toggle } = useTheme()
        toggle()
        expect(isDark.value).toBe(true)
    })

    it('再次切换 localStorage 保存 light', async () => {
        const { useTheme } = await import('../../composables/useTheme.js')
        const { toggle } = useTheme()
        toggle()
        toggle()
        expect(localStorage.getItem('easyproject-theme')).toBe('light')
    })
})
