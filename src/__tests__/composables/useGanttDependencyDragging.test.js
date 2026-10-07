import { defineComponent, ref } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useGanttDependencyDragging } from '../../modules/gantt/composables/useGanttDependencyDragging.js'
const { crudAction } = vi.hoisted(() => ({ crudAction: vi.fn() }))
vi.mock('../../api', () => ({ crudAction }))
const wrappers = []
afterEach(() => {
    wrappers.splice(0).forEach(wrapper => wrapper.unmount())
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
})
const first = { id: 'first', name: 'First', end_time: '2026-07-03' }
const second = { id: 'second', name: 'Second', end_time: '2026-07-04' }
function setup(targetId = 'second') {
    const context = {
        datedTasks: ref([first, second]),
        dependencies: ref([]),
        parse: value => new Date(value),
        offset: () => 3,
        dayWidth: ref(42),
        nameWidth: 280,
        headerHeight: 62,
        rowHeight: 48,
        message: ref(''),
        messageType: ref(''),
        load: vi.fn().mockResolvedValue(undefined),
        applyAutoSchedule: vi.fn().mockResolvedValue(undefined),
        t: key => key
    }
    const target = document.createElement('div')
    target.className = 'task-bar'
    target.dataset.taskId = targetId
    Object.defineProperty(document, 'elementFromPoint', {
        value: vi.fn(() => target),
        configurable: true
    })
    const gantt = document.createElement('div')
    gantt.className = 'gantt'
    const handle = document.createElement('span')
    gantt.append(handle)
    /** @type {{drag?: ReturnType<typeof useGanttDependencyDragging>}} */
    const state = {}
    const wrapper = mount(
        defineComponent({
            setup() {
                state.drag = useGanttDependencyDragging(context)
                return () => null
            }
        })
    )
    wrappers.push(wrapper)
    if (!state.drag) throw new Error('Setup failed')
    const event = {
        currentTarget: handle,
        clientX: 20,
        clientY: 30,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn()
    }
    state.drag.startLink(first, event)
    return { ...context, drag: state.drag, wrapper }
}
describe('dependency drag identity', () => {
    beforeEach(() => crudAction.mockReset().mockResolvedValue({}))
    it('uses the stable target ID regardless of bar and row coordinates', async () => {
        const state = setup()
        document.dispatchEvent(new MouseEvent('mouseup', { clientX: 60, clientY: 110 }))
        await flushPromises()
        expect(crudAction).toHaveBeenCalledExactlyOnceWith('task_dependency', 'set_for_task', {
            taskId: 'second',
            predecessorIds: ['first']
        })
        expect(state.load).toHaveBeenCalledOnce()
        expect(state.applyAutoSchedule).toHaveBeenCalledOnce()
        expect(state.drag.linking.value).toBeNull()
    })
    it.each(['first', 'missing'])('does not mutate for invalid target %s', async id => {
        setup(id)
        document.dispatchEvent(new MouseEvent('mouseup'))
        await flushPromises()
        expect(crudAction).not.toHaveBeenCalled()
    })
    it('rejects a duplicate dependency before the API call', async () => {
        const state = setup()
        state.dependencies.value = [{ predecessor_task_id: 'first', successor_task_id: 'second' }]
        document.dispatchEvent(new MouseEvent('mouseup'))
        await flushPromises()
        expect(crudAction).not.toHaveBeenCalled()
        expect(state.messageType.value).toBe('error')
    })
    it('does not schedule or announce success after readback fails', async () => {
        const state = setup()
        state.load.mockRejectedValueOnce(new Error('Read failed'))
        document.dispatchEvent(new MouseEvent('mouseup'))
        await flushPromises()
        expect(state.applyAutoSchedule).not.toHaveBeenCalled()
        expect(state.messageType.value).toBe('error')
        expect(state.message.value).toBe('Read failed')
    })
    it('cleans document listeners when unmounted during a drag', async () => {
        const state = setup()
        state.wrapper.unmount()
        document.dispatchEvent(new MouseEvent('mouseup'))
        await flushPromises()
        expect(crudAction).not.toHaveBeenCalled()
    })
})
