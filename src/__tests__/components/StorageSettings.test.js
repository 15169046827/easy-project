import { mount, flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PrimeVue from 'primevue/config'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import StorageSettings from '../../components/StorageSettings.vue'
import { getStorageInfo, setDataDirectory } from '../../api/storage'

vi.mock('../../api/storage', () => ({ getStorageInfo: vi.fn(), setDataDirectory: vi.fn() }))
const info = {
    ready: true,
    activeDir: 'E:/App/data',
    databasePath: 'E:/App/data/project_manager.db',
    defaultDir: 'E:/App/data',
    profileDir: 'E:/App/webview',
    configPath: 'E:/App/easyproject-storage.json',
    pendingDir: null,
    error: null
}
const render = () =>
    mount(StorageSettings, {
        global: { plugins: [PrimeVue], mocks: { $t: key => key }, stubs: { teleport: true } }
    })
beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getStorageInfo).mockResolvedValue({ ...info })
})
describe('installation-local storage settings', () => {
    it('uses actual PrimeVue controls and defers configuration until confirmation', async () => {
        const wrapper = render()
        await flushPromises()
        expect(wrapper.text()).toContain(info.databasePath)
        await wrapper.getComponent(InputText).setValue('E:/MyData')
        const configure = wrapper
            .findAllComponents(Button)
            .find(button => button.props('label') === 'storage.configure')
        await configure.trigger('click')
        expect(wrapper.getComponent(Dialog).props('visible')).toBe(true)
        expect(setDataDirectory).not.toHaveBeenCalled()
        vi.mocked(setDataDirectory).mockResolvedValue({ ...info, pendingDir: 'E:/MyData' })
        await wrapper
            .findAllComponents(Button)
            .find(button => button.props('label') === 'common.confirm')
            .trigger('click')
        await flushPromises()
        expect(setDataDirectory).toHaveBeenCalledWith('E:/MyData')
        expect(wrapper.find('[role="status"]').exists()).toBe(true)
        expect(wrapper.text()).toContain(info.databasePath)
        wrapper.unmount()
    })
    it('keeps failed changes visible without claiming migration succeeded', async () => {
        vi.mocked(setDataDirectory).mockRejectedValue('Destination is occupied')
        const wrapper = render()
        await flushPromises()
        await wrapper.getComponent(InputText).setValue('E:/Occupied')
        await wrapper
            .findAllComponents(Button)
            .find(button => button.props('label') === 'storage.configure')
            .trigger('click')
        await wrapper
            .findAllComponents(Button)
            .find(button => button.props('label') === 'common.confirm')
            .trigger('click')
        await flushPromises()
        expect(wrapper.get('[role="alert"]').text()).toBe('Destination is occupied')
        expect(wrapper.getComponent(Dialog).props('visible')).toBe(true)
        expect(wrapper.find('[role="status"]').exists()).toBe(false)
        wrapper.unmount()
    })
    it('does not offer a filesystem change in browser-only mode', async () => {
        vi.mocked(getStorageInfo).mockResolvedValue(null)
        const wrapper = render()
        await flushPromises()
        expect(wrapper.text()).toContain('storage.desktopOnly')
        expect(wrapper.findComponent(InputText).exists()).toBe(false)
        wrapper.unmount()
    })
})
