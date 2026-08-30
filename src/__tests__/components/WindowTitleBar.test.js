import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import WindowTitleBar from '../../components/WindowTitleBar.vue'
import { i18n } from '../../i18n'

const windowApi = vi.hoisted(() => ({
    close: vi.fn(),
    isMaximized: vi.fn(),
    minimize: vi.fn(),
    onResized: vi.fn(),
    toggleMaximize: vi.fn()
}))

vi.mock('@tauri-apps/api/window', () => ({
    getCurrentWindow: () => windowApi
}))

describe('WindowTitleBar', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        windowApi.isMaximized.mockResolvedValue(false)
        windowApi.onResized.mockResolvedValue(vi.fn())
        windowApi.minimize.mockResolvedValue(undefined)
        windowApi.toggleMaximize.mockResolvedValue(undefined)
        windowApi.close.mockResolvedValue(undefined)
    })

    it('connects the three controls to the native window', async () => {
        const wrapper = mount(WindowTitleBar, {
            props: { native: true },
            global: { plugins: [i18n] }
        })
        await flushPromises()

        await wrapper.get('[data-testid="window-minimize"]').trigger('click')
        await wrapper.get('[data-testid="window-maximize"]').trigger('click')
        await wrapper.get('[data-testid="window-close"]').trigger('click')
        await flushPromises()

        expect(windowApi.minimize).toHaveBeenCalledOnce()
        expect(windowApi.toggleMaximize).toHaveBeenCalledOnce()
        expect(windowApi.close).toHaveBeenCalledOnce()
    })

    it('shows the restore label after the window becomes maximized', async () => {
        windowApi.isMaximized.mockResolvedValueOnce(false).mockResolvedValueOnce(true)
        const wrapper = mount(WindowTitleBar, {
            props: { native: true },
            global: { plugins: [i18n] }
        })
        await flushPromises()

        await wrapper.get('[data-testid="window-maximize"]').trigger('click')
        await flushPromises()

        expect(wrapper.get('[data-testid="window-maximize"]').attributes('aria-label')).toBe('还原')
    })

    it('renders a safe visual preview without invoking native commands', async () => {
        const wrapper = mount(WindowTitleBar, {
            props: { native: false },
            global: { plugins: [i18n] }
        })

        await wrapper.get('[data-testid="window-close"]').trigger('click')

        expect(windowApi.close).not.toHaveBeenCalled()
        expect(wrapper.get('[data-testid="window-close"]').attributes('aria-disabled')).toBe('true')
    })
})
