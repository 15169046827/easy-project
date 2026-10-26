import { mount, flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PrimeVue from 'primevue/config'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import VersionCheck from '../../components/VersionCheck.vue'
import { checkPublicRelease } from '../../utils/releaseCheck'

vi.mock('../../utils/releaseCheck', () => ({ checkPublicRelease: vi.fn() }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))
const render = () =>
    mount(VersionCheck, {
        global: { plugins: [PrimeVue], directives: { tooltip: {} }, stubs: { teleport: true } }
    })
const button = (wrapper, label) =>
    wrapper.findAllComponents(Button).find(item => item.props('label') === label)
beforeEach(() => vi.clearAllMocks())
describe('manual version dialog', () => {
    it('uses real PrimeVue controls without any startup or open-time request', async () => {
        const wrapper = render()
        expect(checkPublicRelease).not.toHaveBeenCalled()
        await wrapper.findAllComponents(Button)[0].trigger('click')
        expect(wrapper.getComponent(Dialog).props('visible')).toBe(true)
        expect(checkPublicRelease).not.toHaveBeenCalled()
        wrapper.unmount()
    })
    it('reports failures instead of pretending the current version is latest', async () => {
        vi.mocked(checkPublicRelease).mockRejectedValue(new Error('Offline'))
        const wrapper = render()
        await wrapper.findAllComponents(Button)[0].trigger('click')
        await button(wrapper, 'updates.check').trigger('click')
        await flushPromises()
        expect(wrapper.text()).toContain('updates.checkFailed')
        expect(wrapper.text()).not.toContain('updates.current')
        wrapper.unmount()
    })
    it('aborts on hide and ignores late responses without reopening or updating the dialog', async () => {
        /** @type {(value: unknown) => void} */
        let resolve = () => {
            throw new Error('Deferred version request was not started')
        }
        vi.mocked(checkPublicRelease).mockImplementation(
            () =>
                new Promise(done => {
                    resolve = done
                })
        )
        const wrapper = render()
        await wrapper.findAllComponents(Button)[0].trigger('click')
        await button(wrapper, 'updates.check').trigger('click')
        const signal = vi.mocked(checkPublicRelease).mock.calls[0][0].signal
        await button(wrapper, 'common.close').trigger('click')
        wrapper.getComponent(Dialog).vm.$emit('hide')
        expect(signal.aborted).toBe(true)
        resolve({
            version: '0.1.2',
            tag: 'v0.1.2',
            publishedDate: '2026-10-23',
            url: 'https://github.com/15169046827/easy-project/releases/tag/v0.1.2'
        })
        await flushPromises()
        expect(wrapper.getComponent(Dialog).props('visible')).toBe(false)
        expect(button(wrapper, 'updates.openRelease')).toBeUndefined()
        wrapper.unmount()
    })
})
