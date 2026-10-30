import { defineComponent, ref } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useGanttTaskDragging } from '../../modules/gantt/composables/useGanttTaskDragging.js'
import { dateKey } from '../../modules/calendar/utils/workCalendar.js'
const { crudAction } = vi.hoisted(() => ({ crudAction: vi.fn() }))
vi.mock('../../api', () => ({ crudAction }))
const wrappers = []
afterEach(() => wrappers.splice(0).forEach(wrapper => wrapper.unmount()))
const task = { id: 't1', name: 'Task', start_time: '2026-11-02', end_time: '2026-11-03' }
function setup() {
    const context = {
        scroller: ref(null),
        viewRange: ref({ start: new Date(2026, 10, 1), end: new Date(2026, 10, 30) }),
        nameWidth: 0,
        headerHeight: 0,
        dayWidth: ref(42),
        activeProject: ref({ calendar_country: 'US', weekend_days: '[0,6]' }),
        parse: value => {
            const date = new Date(value)
            return Number.isNaN(date.getTime()) ? null : date
        },
        format: date => `${dateKey(date)} 00:00:00`,
        message: ref(''),
        messageType: ref(''),
        t: key => key,
        load: vi.fn().mockResolvedValue(undefined),
        applyAutoSchedule: vi.fn().mockResolvedValue(undefined),
        openEditor: vi.fn()
    }
    /** @type {{drag?: ReturnType<typeof useGanttTaskDragging>}} */
    const state = {}
    const wrapper = mount(
        defineComponent({
            setup() {
                state.drag = useGanttTaskDragging(context)
                return () => null
            }
        })
    )
    wrappers.push(wrapper)
    if (!state.drag) throw new Error('Setup failed')
    return { ...context, drag: state.drag, wrapper }
}
describe('Gantt task bar dragging', () => {
    beforeEach(() => {
        crudAction.mockReset().mockResolvedValue({})
    })
    it('does not treat a click or a short zero-day drag as editing', async () => {
        const state = setup()
        state.drag.onBarMouseDown(task, new MouseEvent('mousedown', { clientX: 100 }))
        document.dispatchEvent(new MouseEvent('mouseup', { clientX: 100 }))
        await flushPromises()
        expect(state.openEditor).not.toHaveBeenCalled()
        expect(crudAction).not.toHaveBeenCalled()
        expect(state.drag.dragState.value).toBeNull()
        state.drag.onBarMouseDown(task, new MouseEvent('mousedown', { clientX: 100 }))
        document.dispatchEvent(new MouseEvent('mouseup', { clientX: 110 }))
        await flushPromises()
        expect(state.openEditor).not.toHaveBeenCalled()
        expect(crudAction).not.toHaveBeenCalled()
    })
    it('persists a two-day move before refreshing and scheduling', async () => {
        const state = setup()
        state.drag.onBarMouseDown(task, new MouseEvent('mousedown', { clientX: 100 }))
        document.dispatchEvent(new MouseEvent('mousemove', { clientX: 184 }))
        document.dispatchEvent(new MouseEvent('mouseup', { clientX: 184 }))
        await flushPromises()
        expect(crudAction).toHaveBeenCalledExactlyOnceWith('task', 'update', {
            id: 't1',
            start_time: '2026-11-04 00:00:00',
            end_time: '2026-11-05 00:00:00'
        })
        expect(state.load).toHaveBeenCalledOnce()
        expect(state.applyAutoSchedule).toHaveBeenCalledOnce()
    })
    it('recalculates effort when resizing the right edge', async () => {
        const state = setup()
        state.drag.onBarMouseDown(
            task,
            new MouseEvent('mousedown', { clientX: 100 }),
            'resize-right'
        )
        document.dispatchEvent(new MouseEvent('mousemove', { clientX: 142 }))
        document.dispatchEvent(new MouseEvent('mouseup', { clientX: 142 }))
        await flushPromises()
        expect(crudAction.mock.calls[0][2]).toMatchObject({
            end_time: '2026-11-04 00:00:00',
            effort_days: 3
        })
    })
    it('rejects non-left-button and invalid-date starts', () => {
        const state = setup()
        state.drag.onBarMouseDown(task, new MouseEvent('mousedown', { button: 1 }))
        state.drag.onBarMouseDown({ ...task, start_time: 'invalid' }, new MouseEvent('mousedown'))
        expect(state.drag.dragState.value).toBeNull()
        expect(crudAction).not.toHaveBeenCalled()
    })
    it('does not write after unmount and releases state on an API failure', async () => {
        const first = setup()
        first.drag.onBarMouseDown(task, new MouseEvent('mousedown', { clientX: 100 }))
        first.wrapper.unmount()
        document.dispatchEvent(new MouseEvent('mousemove', { clientX: 142 }))
        document.dispatchEvent(new MouseEvent('mouseup', { clientX: 142 }))
        await flushPromises()
        expect(crudAction).not.toHaveBeenCalled()
        const second = setup()
        crudAction.mockRejectedValueOnce(new Error('drag failed'))
        second.drag.onBarMouseDown(task, new MouseEvent('mousedown', { clientX: 100 }))
        document.dispatchEvent(new MouseEvent('mousemove', { clientX: 142 }))
        document.dispatchEvent(new MouseEvent('mouseup', { clientX: 142 }))
        await flushPromises()
        expect(second.message.value).toBe('drag failed')
        expect(second.messageType.value).toBe('error')
        expect(second.drag.dragState.value).toBeNull()
    })
    it('uses a coalesced release position and suppresses a following double click', async () => {
        const state = setup()
        state.drag.onBarMouseDown(task, new MouseEvent('mousedown', { clientX: 100 }))
        document.dispatchEvent(new MouseEvent('mouseup', { clientX: 184 }))
        await flushPromises()
        expect(crudAction).toHaveBeenCalledOnce()
        state.drag.onBarEdit(task, new MouseEvent('dblclick'))
        expect(state.openEditor).not.toHaveBeenCalled()
        state.drag.onBarEdit(task, new KeyboardEvent('keydown', { key: 'Enter' }))
        expect(state.openEditor).toHaveBeenCalledWith(task)
    })
    it('keeps parent bars read-only until explicit editing and cancels on blur', async () => {
        const state = setup()
        const parent = { ...task, summary: { has_children: true } }
        state.drag.onBarMouseDown(parent, new MouseEvent('mousedown', { clientX: 100 }))
        expect(state.openEditor).not.toHaveBeenCalled()
        state.drag.onBarEdit(parent, new MouseEvent('dblclick'))
        expect(state.openEditor).toHaveBeenCalledWith(parent)
        state.drag.onBarMouseDown(task, new MouseEvent('mousedown', { clientX: 100 }))
        document.dispatchEvent(new MouseEvent('mousemove', { clientX: 184 }))
        window.dispatchEvent(new Event('blur'))
        document.dispatchEvent(new MouseEvent('mouseup', { clientX: 184 }))
        await flushPromises()
        expect(state.drag.dragState.value).toBeNull()
        expect(crudAction).not.toHaveBeenCalled()
    })
})
