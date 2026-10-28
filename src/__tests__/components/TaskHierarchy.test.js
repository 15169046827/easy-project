import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createI18n } from 'vue-i18n'
import PrimeVue from 'primevue/config'
import Tooltip from 'primevue/tooltip'
import InputNumber from 'primevue/inputnumber'
import TaskEffortInput from '../../components/TaskEffortInput.vue'
import TaskChildrenDrawer from '../../modules/task/components/TaskChildrenDrawer.vue'
import en from '../../i18n/locales/en-US.js'
import { effortLabel, effortPayload, summaryHint } from '../../utils/taskEffort.js'

const global = {
    plugins: [PrimeVue, createI18n({ legacy: false, locale: 'en', messages: { en } })],
    directives: { tooltip: Tooltip }
}
describe('estimate provenance and inline child drawers', () => {
    it('distinguishes empty, explicit zero and historical zero', async () => {
        const wrapper = mount(TaskEffortInput, {
            props: { modelValue: 0, state: 'legacy_unknown' },
            global
        })
        expect(wrapper.text()).toContain('confirmation')
        wrapper.findComponent(InputNumber).vm.$emit('update:modelValue', null)
        expect(wrapper.emitted('update:state').at(-1)).toEqual(['unestimated'])
        wrapper.findComponent(InputNumber).vm.$emit('update:modelValue', 0)
        expect(wrapper.emitted('update:state').at(-1)).toEqual(['estimated'])
        expect(effortPayload({ effort_days: null })).toEqual({
            effort_days: 0,
            effort_state: 'unestimated'
        })
        expect(effortPayload({ effort_days: 0 })).toEqual({
            effort_days: 0,
            effort_state: 'estimated'
        })
        wrapper.unmount()
    })
    it('shows zero-weight aggregate meaning rather than a fabricated percentage', () => {
        const t = key => key
        expect(
            effortLabel(
                { summary: { has_children: true, effort_days: 0, unestimated_count: 1 } },
                t
            )
        ).toBe('taskHierarchy.unestimated')
        expect(
            effortLabel(
                { summary: { has_children: true, effort_days: 0, legacy_unknown_count: 1 } },
                t
            )
        ).toBe('taskHierarchy.legacyUnknown')
        expect(effortLabel({ summary: { has_children: true, effort_days: 0 } }, t)).toBe(
            'taskHierarchy.zeroEffort'
        )
        expect(
            summaryHint(
                {
                    summary: {
                        has_children: true,
                        unestimated_count: 1,
                        legacy_unknown_count: 1,
                        schedule_incomplete: true
                    }
                },
                t
            )
        ).toContain('taskHierarchy.incompleteSchedule')
    })
    it('expands descendants inside a drawer without extra tables or pagination', async () => {
        const parent = { id: 'p', name: 'Goal' }
        const tasks = [
            {
                id: 'c',
                parent: 'p',
                name: 'Child with a complete long title',
                status: 'Review',
                progress: 25,
                effort_days: 1,
                effort_state: 'estimated'
            },
            { id: 'g', parent: 'c', name: 'Grandchild', context_only: true }
        ]
        const wrapper = mount(TaskChildrenDrawer, {
            props: { parent, tasks, labelStatus: value => value },
            global
        })
        expect(wrapper.find('table').exists()).toBe(false)
        expect(wrapper.find('.truncate').attributes('title')).toBe(tasks[0].name)
        expect(wrapper.text()).not.toContain('Grandchild')
        await wrapper.find('button[aria-expanded]').trigger('click')
        expect(wrapper.text()).toContain('Grandchild')
        expect(wrapper.text()).toContain('Ancestor context')
        await wrapper
            .find('button[aria-label="Edit: Child with a complete long title"]')
            .trigger('click')
        expect(wrapper.emitted('edit')[0]).toMatchObject([{ id: 'c' }])
        wrapper.unmount()
    })
    it('keeps status and progress in separate slots for short, long and unknown values', async () => {
        const tasks = [
            {
                id: 'zero',
                parent: 'p',
                name: 'Zero',
                status: 'Waiting for a decision',
                progress: 0
            },
            { id: 'done', parent: 'p', name: 'Done', status: 'Done', progress: 100 },
            {
                id: 'unknown',
                parent: 'p',
                name: 'Unknown',
                status: 'Review',
                summary: { has_children: true, progress: null, unestimated_count: 1 }
            }
        ]
        const wrapper = mount(TaskChildrenDrawer, {
            props: { parent: { id: 'p', name: 'Goal' }, tasks, labelStatus: value => value },
            global
        })
        expect(wrapper.findAll('.child-status')).toHaveLength(3)
        const progress = wrapper.findAll('.child-progress')
        expect(progress.map(cell => cell.text())).toEqual(['0%', '100%', 'Not estimated'])
        expect(progress.map(cell => cell.attributes('title'))).toEqual([
            '0%',
            '100%',
            'Not estimated'
        ])
        await wrapper.setProps({ showStatus: false })
        expect(wrapper.findAll('.child-status')).toHaveLength(0)
        expect(wrapper.findAll('.child-progress')).toHaveLength(3)
        await wrapper.setProps({ showProgress: false })
        expect(wrapper.findAll('.child-progress')).toHaveLength(0)
        wrapper.unmount()
    })
})
