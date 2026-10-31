import { defineComponent, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useGanttCreationDragging } from '../../modules/gantt/composables/useGanttCreationDragging.js'
const wrappers = []
const fixtures = []
afterEach(() => {
    wrappers.splice(0).forEach(wrapper => wrapper.unmount())
    fixtures.splice(0).forEach(element => element.remove())
})
function setup() {
    const openCreateEditor = vi.fn()
    const scroller = document.createElement('div')
    Object.defineProperty(scroller, 'clientWidth', { value: 364 })
    scroller.getBoundingClientRect = () => ({
        left: 0,
        top: 0,
        right: 364,
        bottom: 200,
        width: 364,
        height: 200,
        x: 0,
        y: 0,
        toJSON() {}
    })
    const context = {
        scroller: ref(scroller),
        viewRange: ref({ start: new Date(2026, 6, 1), end: new Date(2026, 6, 2) }),
        days: ref([{ key: '2026-07-01' }, { key: '2026-07-02' }]),
        dayWidth: ref(42),
        nameWidth: 280,
        headerHeight: 62,
        rows: ref([{}]),
        rowHeight: 48,
        confirmSelection: openCreateEditor
    }
    /** @type {{drag?: ReturnType<typeof useGanttCreationDragging>}} */
    const state = {}
    const wrapper = mount(
        defineComponent({
            setup() {
                state.drag = useGanttCreationDragging(context)
                return () => null
            }
        })
    )
    wrappers.push(wrapper)
    if (!state.drag) throw new Error('Setup failed')
    const gantt = document.createElement('div')
    gantt.className = 'gantt'
    const grid = document.createElement('div')
    gantt.append(grid)
    scroller.append(gantt)
    document.body.append(scroller)
    fixtures.push(scroller)
    const event = x => ({
        button: 0,
        currentTarget: grid,
        clientX: x,
        clientY: 80,
        preventDefault: vi.fn()
    })
    return { drag: state.drag, event, grid, wrapper, openCreateEditor }
}
describe('Gantt creation drag boundary', () => {
    it('hands the selected range to the editor and clears preview state', () => {
        const state = setup()
        state.drag.onGridMouseDown(state.event(290), null, 0)
        expect(state.drag.createPreviewStyle.value).toMatchObject({ left: '286px', height: '48px' })
        state.grid.dispatchEvent(new MouseEvent('mousemove', { clientX: 330, bubbles: true }))
        document.dispatchEvent(new MouseEvent('mouseup', { clientX: 330, clientY: 80 }))
        expect(state.openCreateEditor).not.toHaveBeenCalled()
        state.drag.confirmPending()
        expect(state.openCreateEditor).toHaveBeenCalledWith(
            null,
            new Date(2026, 6, 1),
            new Date(2026, 6, 2)
        )
        expect(state.drag.createDrag.value).toBeNull()
    })
    it('does not replace existing dates or parent summaries', () => {
        const state = setup()
        for (const task of [
            { start_time: '2026-07-01' },
            { end_time: '2026-07-01' },
            { hasChildren: true }
        ]) {
            state.drag.onGridMouseDown(state.event(290), task, 0)
            expect(state.drag.createDrag.value).toBeNull()
        }
    })
    it('anchors the preview to its source row and supports same-day selection and Escape', () => {
        const state = setup()
        const task = { id: 'unplanned', start_time: '', end_time: '' }
        state.drag.onGridMouseDown(state.event(290), task, 3)
        expect(state.drag.createPreviewStyle.value.top).toBe('206px')
        document.dispatchEvent(new MouseEvent('mouseup', { clientX: 305, clientY: 80 }))
        expect(state.openCreateEditor).not.toHaveBeenCalled()
        expect(state.drag.pendingStyle.value.height).toBe('26px')
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
        expect(state.drag.pendingSelection.value).toBeNull()
        state.drag.confirmPending()
        expect(state.openCreateEditor).not.toHaveBeenCalled()
    })
    it('rejects clicks before the timeline or after the final date', () => {
        const state = setup()
        state.drag.onGridMouseDown(state.event(250))
        state.drag.onGridMouseDown(state.event(400))
        expect(state.drag.createDrag.value).toBeNull()
    })
    it('cleans listeners before an unmounted preview can open an editor', () => {
        const state = setup()
        state.drag.onGridMouseDown(state.event(290))
        state.wrapper.unmount()
        document.dispatchEvent(new MouseEvent('mouseup'))
        expect(state.openCreateEditor).not.toHaveBeenCalled()
    })
})
