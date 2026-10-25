import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createI18n } from 'vue-i18n'
import ResourceLoadPanel from '../../components/ResourceLoadPanel.vue'
import en from '../../i18n/locales/en-US.js'
describe('resource load for delivery parents', () => {
    it('counts only executable leaves rather than the parent rollup again', () => {
        const base = { assignee: 'm', start_time: '2026-10-25', end_time: '2026-10-26' }
        const wrapper = mount(ResourceLoadPanel, {
            props: {
                members: [{ id: 'm', name: 'Synthetic member' }],
                tasks: [{ ...base, summary: { has_children: true } }, base],
                project: { calendar_country: 'US', weekend_days: '[0,6]' }
            },
            global: { plugins: [createI18n({ legacy: false, locale: 'en', messages: { en } })] }
        })
        expect(wrapper.find('.rl-stats strong').text()).toBe('1')
        expect(wrapper.find('.rl-peak').text()).toContain('1')
        wrapper.unmount()
    })
})
