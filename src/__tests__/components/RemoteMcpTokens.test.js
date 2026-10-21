import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, watch } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createI18n } from 'vue-i18n'
import PrimeVue from 'primevue/config'
import RemoteMcpTokens from '../../components/RemoteMcpTokens.vue'
import { remoteRequest } from '../../api/remote'

vi.mock('../../api/remote', () => ({ remoteRequest: vi.fn() }))
afterEach(() => vi.unstubAllGlobals())
const secret = 'epmcp_' + 'a'.repeat(64)
// Logic-focused dialog stub; real PrimeVue layers/focus/nonce are covered by HTTP E2E.
const Dialog = defineComponent({
    props: { visible: Boolean, header: String },
    emits: ['show', 'hide', 'update:visible'],
    setup(props, { emit, slots }) {
        watch(
            () => props.visible,
            value => emit(value ? 'show' : 'hide'),
            { immediate: true }
        )
        return () =>
            props.visible
                ? h('section', { 'data-dialog': props.header }, [
                      slots.default?.(),
                      slots.footer?.()
                  ])
                : null
    }
})
function setup() {
    return mount(RemoteMcpTokens, {
        props: { visible: true },
        global: {
            plugins: [
                PrimeVue,
                createI18n({ legacy: false, locale: 'en', missingWarn: false, fallbackWarn: false })
            ],
            stubs: { Dialog }
        }
    })
}
beforeEach(() => {
    vi.stubGlobal(
        'matchMedia',
        vi.fn(query => ({
            matches: false,
            media: query,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn()
        }))
    )
    vi.mocked(remoteRequest)
        .mockReset()
        .mockImplementation(async (_path, body) =>
            body ? { secret } : { tokens: [], endpoint: 'https://example.test/mcp' }
        )
})
describe('one-time personal token presentation', () => {
    it('shows secret only in a separate non-editable dialog, copies on demand, and clears on close', async () => {
        const copy = vi.fn().mockResolvedValue(undefined)
        vi.stubGlobal('navigator', { clipboard: { writeText: copy } })
        const wrapper = setup()
        try {
            await flushPromises()
            await wrapper.get('#mcp-token-name').setValue('Synthetic agent')
            await wrapper.get('form').trigger('submit')
            await flushPromises()
            const panel = wrapper.get('[data-dialog="remote.tokenSecret"]')
            expect(panel.get('code').text()).toBe(secret)
            expect(panel.findAll('input,textarea,[contenteditable="true"]')).toHaveLength(0)
            expect(copy).not.toHaveBeenCalled()
            await panel
                .findAll('button')
                .find(button => button.text() === 'remote.copyToken')
                .trigger('click')
            await flushPromises()
            expect(copy).toHaveBeenCalledExactlyOnceWith(secret)
            await panel
                .findAll('button')
                .find(button => button.text() === 'remote.closeToken')
                .trigger('click')
            expect(wrapper.find('#mcp-secret').exists()).toBe(false)
            expect(wrapper.find('form').exists()).toBe(true)
        } finally {
            wrapper.unmount()
            vi.unstubAllGlobals()
        }
    })
    it('does not redisplay a late secret after its management dialog closed and reopened', async () => {
        /** @type {(value: {secret: string}) => void} */
        let finish = () => {
            throw new Error('No pending generation')
        }
        vi.mocked(remoteRequest).mockImplementation((_path, body) =>
            body
                ? new Promise(resolve => {
                      finish = resolve
                  })
                : Promise.resolve({ tokens: [], endpoint: 'https://example.test/mcp' })
        )
        const wrapper = setup()
        try {
            await flushPromises()
            await wrapper.get('form').trigger('submit')
            await wrapper.setProps({ visible: false })
            await wrapper.setProps({ visible: true })
            finish({ secret })
            await flushPromises()
            expect(wrapper.find('#mcp-secret').exists()).toBe(false)
            expect(wrapper.text()).not.toContain(secret)
        } finally {
            wrapper.unmount()
        }
    })
    it('keeps text available with an explicit error when clipboard access fails', async () => {
        vi.stubGlobal('navigator', {
            clipboard: { writeText: vi.fn().mockRejectedValue(new Error('blocked')) }
        })
        const wrapper = setup()
        try {
            await flushPromises()
            await wrapper.get('form').trigger('submit')
            await flushPromises()
            const panel = wrapper.get('[data-dialog="remote.tokenSecret"]')
            await panel
                .findAll('button')
                .find(button => button.text() === 'remote.copyToken')
                .trigger('click')
            await flushPromises()
            expect(panel.text()).toContain('remote.tokenCopyFailed')
            expect(panel.get('code').text()).toBe(secret)
        } finally {
            wrapper.unmount()
            vi.unstubAllGlobals()
        }
    })
})
