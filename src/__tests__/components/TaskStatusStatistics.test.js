import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createI18n } from 'vue-i18n'
import PrimeVue from 'primevue/config'
import Tooltip from 'primevue/tooltip'
import TaskStatusStatistics from '../../modules/task/components/TaskStatusStatistics.vue'
import en from '../../i18n/locales/en-US'
const states = [
    { id: 'one', name: 'Review', color: '#8b5cf6', count: 2 },
    { id: 'two', name: 'Review', color: '#14b8a6', count: 1 },
    { id: 'empty', name: 'Empty', color: '#f59e0b', count: 0 }
]
function setup(extra = {}) {
    return mount(TaskStatusStatistics, {
        props: {
            modelValue: 'top_level',
            data: { total: 3, statuses: states },
            label: s => s.name,
            inputId: 'test-statistics',
            ...extra
        },
        global: {
            plugins: [PrimeVue, createI18n({ legacy: false, locale: 'en', messages: { en } })],
            directives: { tooltip: Tooltip }
        }
    })
}
describe('task state statistics controls', () => {
    it('hides zero counts and selects stable IDs instead of duplicate names', async () => {
        const w = setup()
        expect(w.findAll('.status-stat')).toHaveLength(2)
        expect(w.text()).not.toContain('Empty')
        expect(w.find('select').exists()).toBe(false)
        await w.findAll('.status-stat')[1].trigger('click')
        expect(w.emitted('select-status')[0]).toEqual(['two'])
        await w.setProps({ selectedStatus: 'two' })
        expect(w.findAll('.status-stat')[1].attributes('aria-pressed')).toBe('true')
        await w.findAll('.status-stat')[1].trigger('click')
        expect(w.emitted('select-status').at(-1)).toEqual([''])
        w.unmount()
    })
    it('toggles scope with an accessible icon and can collapse the entire card grid', async () => {
        const w = setup()
        const buttons = w.find('.statistics-controls').findAll('button')
        expect(buttons[0].attributes('title')).toContain('Top-level tasks')
        await buttons[0].trigger('click')
        expect(w.emitted('update:modelValue')[0]).toEqual(['all_tasks'])
        await buttons[1].trigger('click')
        expect(w.find('.statistics-cards').exists()).toBe(false)
        expect(buttons[1].attributes('aria-expanded')).toBe('false')
        await buttons[1].trigger('click')
        expect(w.findAll('.status-stat')).toHaveLength(2)
        w.unmount()
    })
    it('uses dictionary color as an accent without filling the entire card', () => {
        const w = setup()
        const element = /** @type {HTMLElement} */ (w.find('.status-stat').element)
        expect(element.style.backgroundColor).toBe('')
        expect(element.style.getPropertyValue('--status-color')).toBe('#8b5cf6')
        expect(w.find('.status-dot').attributes('aria-hidden')).toBe('true')
        expect(element.style.opacity).toBe('')
        w.unmount()
    })
})
