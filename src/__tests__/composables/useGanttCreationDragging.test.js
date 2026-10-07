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
    const context = {
        days: ref([{ key: '2026-07-01' }, { key: '2026-07-02' }]),
        dayWidth: ref(42),
        nameWidth: 280,
        headerHeight: 62,
        datedTasks: ref([{}]),
        rowHeight: 48,
        openCreateEditor
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
    document.body.append(gantt)
    fixtures.push(gantt)
    const event = x => ({ button: 0, currentTarget: grid, clientX: x, preventDefault: vi.fn() })
    return { drag: state.drag, event, grid, wrapper, openCreateEditor }
}
describe('Gantt creation drag boundary', () => {
    it('hands the selected range to the editor and clears preview state', () => {
        const state = setup()
        state.drag.onGridMouseDown(state.event(290))
        expect(state.drag.createPreviewStyle.value).toMatchObject({ left: '286px', height: '48px' })
        state.grid.dispatchEvent(new MouseEvent('mousemove', { clientX: 330, bubbles: true }))
        document.dispatchEvent(new MouseEvent('mouseup'))
        expect(state.openCreateEditor).toHaveBeenCalledWith(
            new Date('2026-07-01'),
            new Date('2026-07-02')
        )
        expect(state.drag.createDrag.value).toBeNull()
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
