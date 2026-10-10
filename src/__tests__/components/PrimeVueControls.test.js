import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import DatePicker from 'primevue/datepicker'
import DatePickerDateString from '../../components/DatePickerDateString.vue'
import { getStyleNonce } from '../../security/styleNonce'

describe('PrimeVue UI contract', () => {
    it('reuses the desktop style nonce without inventing a fixed nonce', () => {
        expect(getStyleNonce()).toBeUndefined()
        const style = document.createElement('style')
        style.nonce = 'unit-test-response-nonce'
        document.head.append(style)
        expect(getStyleNonce()).toBe('unit-test-response-nonce')
        style.remove()
        expect(getStyleNonce()).toBeUndefined()
    })
    it('keeps affected generic controls as PrimeVue components', () => {
        const files = [
            'src/App.vue',
            'src/modules/floating/FloatingTaskWindow.vue',
            'src/modules/task/components/TaskList/TaskList.vue',
            'src/modules/task/components/ProjectList/ProjectList.vue',
            'src/modules/member/components/MemberList.vue',
            'src/modules/dashboard/components/DashboardView.vue',
            'src/modules/project/components/ProjectWorkspace.vue'
        ]
        for (const file of files) {
            const source = readFileSync(file, 'utf8').split('<script')[0]
            expect(source, file).not.toMatch(/<(button|input|select|textarea|progress)\b/)
        }
        const data = readFileSync('src/modules/data/components/DataView.vue', 'utf8')
        expect(data).not.toMatch(/<input[^>]*type="checkbox"/)
        expect(data).toContain('<Checkbox')
    })
    it('preserves date-only strings without UTC shifts and clears invalid dates', async () => {
        const wrapper = mount(DatePickerDateString, {
            global: { stubs: { DatePicker: { props: ['modelValue'], template: '<div />' } } },
            props: { modelValue: '2026-08-03' }
        })
        const picker = wrapper.getComponent(DatePicker)
        const date = picker.props('modelValue')
        expect(date instanceof Date && date.getDate()).toBe(3)
        picker.vm.$emit('update:modelValue', new Date(2026, 7, 5))
        expect(wrapper.emitted('update:modelValue')[0]).toEqual(['2026-08-05'])
        picker.vm.$emit('update:modelValue', null)
        expect(wrapper.emitted('update:modelValue')[1]).toEqual([''])
        await wrapper.setProps({ modelValue: '2026-02-30' })
        expect(picker.props('modelValue')).toBeNull()
    })
})
