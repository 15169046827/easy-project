import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createI18n } from 'vue-i18n'
import PrimeVue from 'primevue/config'
import Tooltip from 'primevue/tooltip'
import TaskStatusSelect from '../../components/TaskStatusSelect.vue'
import TaskStatusManager from '../../components/TaskStatusManager.vue'
import TaskBoard from '../../modules/task/components/TaskBoard.vue'
import { crudAction } from '../../api'
import { findStatusNameConflict, isTaskCompleted } from '../../utils/taskStatus.js'
import en from '../../i18n/locales/task-status-en.js'
vi.mock('../../api', () => ({ crudAction: vi.fn() }))
const Dialog = defineComponent({
    props: { visible: Boolean },
    setup:
        (props, { slots }) =>
        () =>
            props.visible ? h('section', [slots.default?.(), slots.footer?.()]) : null
})
const Select = defineComponent({
    props: ['options'],
    setup:
        (_, { slots }) =>
        () =>
            h('div', slots.footer?.())
})
const states = [
    {
        id: 's1',
        project_id: 'p',
        name: 'Pending',
        builtin_key: 'Pending',
        is_default: true,
        is_completed: false,
        color: '#64748b',
        sort_order: 0
    },
    {
        id: 's2',
        project_id: 'p',
        name: 'Testing',
        builtin_key: '',
        is_default: false,
        is_completed: false,
        color: '#3b82f6',
        sort_order: 1
    }
]
function setup(component, props) {
    return mount(component, {
        props,
        global: {
            directives: { tooltip: Tooltip },
            plugins: [
                PrimeVue,
                createI18n({
                    legacy: false,
                    locale: 'en',
                    messages: {
                        en: {
                            taskStatuses: en,
                            tasks: {
                                statusPending: 'Pending',
                                statusInProgress: 'In progress',
                                statusDone: 'Done'
                            },
                            common: {
                                pending: 'Pending',
                                active: 'Active',
                                done: 'Done',
                                cancel: 'Cancel',
                                save: 'Save',
                                delete: 'Delete',
                                edit: 'Edit'
                            },
                            board: {
                                pending: 'Pending',
                                inProgress: 'In progress',
                                done: 'Done',
                                moved: 'Moved {name} to {status}',
                                total: '{count} tasks'
                            }
                        }
                    },
                    missingWarn: false,
                    fallbackWarn: false
                })
            ],
            stubs: { Dialog, Select }
        }
    })
}
beforeEach(() => {
    vi.mocked(crudAction)
        .mockReset()
        .mockImplementation(async (_model, action) =>
            action === 'get_all'
                ? { list: structuredClone(states) }
                : action === 'get_usage'
                  ? { list: [], total: 0, pageIndex: 1 }
                  : { id: 'new-status' }
        )
})
describe('project status UI logic', () => {
    it('recognizes case, surrounding whitespace and built-in display aliases without merging identities', () => {
        expect(findStatusNameConflict(states, ' 待办 ')?.id).toBe('s1')
        expect(findStatusNameConflict(states, ' PENDING ')?.id).toBe('s1')
        expect(findStatusNameConflict(states, ' PENDIENTE ')?.id).toBe('s1')
        expect(findStatusNameConflict(states, ' testing ')?.id).toBe('s2')
        expect(findStatusNameConflict(states, 'Testing', 's2')).toBeUndefined()
        expect(findStatusNameConflict(states, 'Review')).toBeUndefined()
    })
    it('prevents duplicate quick-add writes and keeps the draft open', async () => {
        const wrapper = setup(TaskStatusSelect, { projectId: 'p', modelValue: 's1' })
        await flushPromises()
        await wrapper.find('button').trigger('click')
        await wrapper.find('input').setValue(' 待办 ')
        await wrapper
            .findAll('button')
            .find(button => button.text() === 'Save')
            .trigger('click')
        await flushPromises()
        expect(wrapper.find('input').element.value).toBe(' 待办 ')
        expect(wrapper.find('[role="alert"]').text()).toContain(en.duplicateName)
        expect(vi.mocked(crudAction).mock.calls.every(call => call[1] === 'get_all')).toBe(true)
        wrapper.unmount()
    })
    it('cancels quick add without a write or selection change', async () => {
        const wrapper = setup(TaskStatusSelect, { projectId: 'p', modelValue: 's1' })
        await flushPromises()
        await wrapper.find('button').trigger('click')
        await wrapper.find('input').setValue('Review')
        const cancel = wrapper.findAll('button').find(button => button.text() === 'Cancel')
        await cancel.trigger('click')
        expect(crudAction).toHaveBeenCalledTimes(1)
        expect(wrapper.emitted('update:modelValue')).toBeUndefined()
        wrapper.unmount()
    })
    it('creates in the current project and immediately selects the new ID', async () => {
        const wrapper = setup(TaskStatusSelect, { projectId: 'p', modelValue: 's1' })
        await flushPromises()
        await wrapper.find('button').trigger('click')
        await wrapper.find('input').setValue('Review')
        await wrapper
            .findAll('button')
            .find(button => button.text() === 'Save')
            .trigger('click')
        await flushPromises()
        expect(crudAction).toHaveBeenCalledWith('task_status', 'add', {
            project_id: 'p',
            name: 'Review',
            color: '#8b5cf6',
            is_completed: false
        })
        expect(wrapper.emitted('update:modelValue').at(-1)).toEqual(['new-status'])
        wrapper.unmount()
    })
    it('ignores stale dictionary responses after project switches', async () => {
        let resolve = _value => {}
        vi.mocked(crudAction).mockImplementationOnce(
            () =>
                new Promise(done => {
                    resolve = done
                })
        )
        const wrapper = setup(TaskStatusSelect, { projectId: 'p' })
        await wrapper.setProps({ projectId: 'q' })
        await flushPromises()
        resolve({ list: [{ id: 'old' }] })
        await flushPromises()
        expect(wrapper.emitted('loaded')).toHaveLength(1)
        expect(wrapper.emitted('update:modelValue')).toEqual([['']])
        wrapper.unmount()
    })
    it('shows conflicting tasks without offering deletion', async () => {
        vi.mocked(crudAction).mockImplementation(async (_model, action) =>
            action === 'get_all'
                ? { list: states }
                : {
                      list: [{ id: 'task1', name: 'Release blocker', deleted: true }],
                      total: 1,
                      pageIndex: 1
                  }
        )
        const wrapper = setup(TaskStatusManager, { projectId: 'p' })
        await flushPromises()
        await wrapper
            .findAll('button')
            .find(button => button.attributes('aria-label') === 'Delete Testing')
            .trigger('click')
        await flushPromises()
        expect(wrapper.text()).toContain('Release blocker')
        expect(wrapper.text()).toContain('Deleted task')
        expect(
            wrapper.findAll('section section button').some(button => button.text() === 'Delete')
        ).toBe(false)
        expect(vi.mocked(crudAction).mock.calls.some(call => call[1] === 'delete')).toBe(false)
        wrapper.unmount()
    })
    it('renders custom and unknown tasks instead of silently dropping them', async () => {
        const wrapper = setup(TaskBoard, {
            projectId: 'p',
            tasks: [
                { id: 'a', name: 'Custom task', status_id: 's2', status: 'Testing' },
                { id: 'b', name: 'Legacy task', status: 'Blocked' }
            ]
        })
        await flushPromises()
        expect(wrapper.findAll('.board-column')).toHaveLength(3)
        expect(wrapper.text()).toContain('Custom task')
        expect(wrapper.text()).toContain('Legacy task')
        wrapper.unmount()
    })
    it('dragging uses a stable state ID, not a label', async () => {
        const wrapper = setup(TaskBoard, {
            projectId: 'p',
            tasks: [{ id: 'a', name: 'First', status_id: 's1', status: 'Pending' }]
        })
        await flushPromises()
        const original = document.elementFromPoint
        document.elementFromPoint = vi.fn(() => wrapper.findAll('.board-column')[1].element)
        wrapper.find('.board-card').element.dispatchEvent(
            new PointerEvent('pointerdown', {
                bubbles: true,
                button: 0,
                pointerType: 'mouse',
                pointerId: 1,
                clientX: 10,
                clientY: 10
            })
        )
        window.dispatchEvent(
            new PointerEvent('pointermove', { pointerId: 1, clientX: 100, clientY: 20 })
        )
        window.dispatchEvent(
            new PointerEvent('pointerup', { pointerId: 1, clientX: 100, clientY: 20 })
        )
        await flushPromises()
        expect(crudAction).toHaveBeenCalledWith('task', 'update', { id: 'a', status_id: 's2' })
        document.elementFromPoint = original
        wrapper.unmount()
    })
    it('explicit completion overrides labels for renamed/custom states', () => {
        expect(isTaskCompleted({ status: 'Testing', is_completed: true })).toBe(true)
        expect(isTaskCompleted({ status: 'Done', is_completed: false })).toBe(false)
        expect(isTaskCompleted({ status: 'Done' })).toBe(true)
    })
    it('ignores external, cancelled and stationary pointer gestures', async () => {
        const wrapper = setup(TaskBoard, {
            projectId: 'p',
            tasks: [{ id: 'a', name: 'First', status_id: 's1' }]
        })
        await flushPromises()
        window.dispatchEvent(
            new PointerEvent('pointerup', { pointerId: 2, clientX: 100, clientY: 20 })
        )
        const card = wrapper.find('.board-card')
        card.element.dispatchEvent(
            new PointerEvent('pointerdown', {
                bubbles: true,
                button: 0,
                pointerType: 'mouse',
                pointerId: 2,
                clientX: 10,
                clientY: 10
            })
        )
        window.dispatchEvent(new PointerEvent('pointercancel', { pointerId: 2 }))
        window.dispatchEvent(
            new PointerEvent('pointerup', { pointerId: 2, clientX: 100, clientY: 20 })
        )
        card.element.dispatchEvent(
            new PointerEvent('pointerdown', {
                bubbles: true,
                button: 0,
                pointerType: 'mouse',
                pointerId: 3,
                clientX: 10,
                clientY: 10
            })
        )
        window.dispatchEvent(
            new PointerEvent('pointerup', { pointerId: 3, clientX: 11, clientY: 10 })
        )
        await card.trigger('click')
        expect(wrapper.emitted('open')).toHaveLength(1)
        expect(vi.mocked(crudAction).mock.calls.every(call => call[1] === 'get_all')).toBe(true)
        wrapper.unmount()
    })
    it('supports coalesced native movements and never opens the editor after a drag', async () => {
        const wrapper = setup(TaskBoard, {
            projectId: 'p',
            tasks: [{ id: 'a', name: 'First', status_id: 's1' }]
        })
        await flushPromises()
        const original = document.elementFromPoint
        document.elementFromPoint = vi.fn(() => wrapper.findAll('.board-column')[1].element)
        wrapper.find('.board-card').element.dispatchEvent(
            new PointerEvent('pointerdown', {
                bubbles: true,
                button: 0,
                pointerType: 'mouse',
                pointerId: 4,
                clientX: 10,
                clientY: 10
            })
        )
        window.dispatchEvent(
            new PointerEvent('pointerup', { pointerId: 4, clientX: 100, clientY: 20 })
        )
        await wrapper.find('.board-card').trigger('click')
        await flushPromises()
        expect(crudAction).toHaveBeenCalledWith('task', 'update', { id: 'a', status_id: 's2' })
        expect(wrapper.emitted('open')).toBeUndefined()
        document.elementFromPoint = original
        wrapper.unmount()
    })
})
