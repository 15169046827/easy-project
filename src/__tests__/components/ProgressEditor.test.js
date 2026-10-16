import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Slider from 'primevue/slider'
import InputNumber from 'primevue/inputnumber'
import PrimeVue from 'primevue/config'
import ProgressEditor from '../../components/ProgressEditor.vue'

describe('shared percentage editor', () => {
    it('keeps the real slider and numeric percentage in sync and clamps/rounds values', async () => {
        const wrapper = mount(ProgressEditor, {
            props: { modelValue: 35, inputId: 'progress', label: 'Progress' },
            global: { plugins: [PrimeVue] }
        })
        expect(wrapper.getComponent(Slider).props('modelValue')).toBe(35)
        expect(wrapper.getComponent(InputNumber).props('suffix')).toBe('%')
        wrapper.getComponent(Slider).vm.$emit('update:modelValue', 44)
        expect(wrapper.emitted('update:modelValue')[0]).toEqual([44])
        await wrapper.setProps({ modelValue: 44 })
        expect(wrapper.getComponent(InputNumber).props('modelValue')).toBe(44)
        wrapper.getComponent(InputNumber).vm.$emit('update:modelValue', 150)
        wrapper.getComponent(InputNumber).vm.$emit('update:modelValue', null)
        wrapper.getComponent(InputNumber).vm.$emit('update:modelValue', 12.6)
        expect(wrapper.emitted('update:modelValue').slice(1)).toEqual([[100], [0], [13]])
        wrapper.unmount()
    })
})
