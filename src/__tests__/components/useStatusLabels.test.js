import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { describe, expect, it } from 'vitest'
import { useStatusLabels } from '../../composables/useStatusLabels'

function label(status, model = 'project') {
    const wrapper = mount(
        defineComponent({
            setup: useStatusLabels,
            template:
                '<span>{{ model === "project" ? projectStatusLabel(status) : taskStatusLabel(status) }}</span>',
            props: ['status', 'model']
        }),
        {
            props: { status, model },
            global: {
                plugins: [
                    createI18n({
                        legacy: false,
                        locale: 'zh',
                        messages: {
                            zh: {
                                projects: { statusDraft: '草稿', statusInProgress: '进行中' },
                                common: { pending: '待办', active: '进行中', done: '完成' }
                            }
                        }
                    })
                ]
            }
        }
    )
    const text = wrapper.text()
    wrapper.unmount()
    return text
}

describe('status labels with real vue-i18n validation', () => {
    it('translates known enum values and uses the empty-state fallback', () => {
        expect(label('Draft')).toBe('草稿')
        expect(label('InProgress')).toBe('进行中')
        for (const empty of ['', null, undefined, 12]) expect(label(empty)).toBe('草稿')
    })
    it('preserves custom/imported project statuses rather than translating undefined', () => {
        for (const status of ['进行中', 'Active', 'Waiting', 'constructor', '__proto__'])
            expect(label(status)).toBe(status)
    })
    it('treats both legacy Todo and Pending as pending', () => {
        expect(label('Todo', 'task')).toBe('待办')
        expect(label('Pending', 'task')).toBe('待办')
        expect(label('InProgress', 'task')).toBe('进行中')
        expect(label('Done', 'task')).toBe('完成')
    })
    it('keeps unknown task statuses safe and does not interpret their content', () => {
        expect(label('Custom status', 'task')).toBe('Custom status')
        expect(label('<img src=x onerror=alert(1)>', 'task')).toBe('<img src=x onerror=alert(1)>')
        expect(label(null, 'task')).toBe('')
    })
})
