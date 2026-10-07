import { defineComponent, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useGanttNavigation } from '../../modules/gantt/composables/useGanttNavigation.js'
const dayStart = date => new Date(date.getFullYear(), date.getMonth(), date.getDate())
const wrappers = []
afterEach(() => {
    wrappers.splice(0).forEach(wrapper => wrapper.unmount())
    vi.useRealTimers()
})
function setup() {
    const element = document.createElement('div')
    Object.defineProperties(element, { scrollWidth: { value: 2000 }, clientWidth: { value: 500 } })
    element.scrollTo = vi.fn()
    element.scrollBy = vi.fn()
    const context = {
        scroller: ref(element),
        viewport: {
            days: ref([{ today: false }, { today: true }]),
            dayWidth: ref(42),
            viewRange: ref({ start: new Date(2026, 10, 1), end: new Date(2026, 10, 30) })
        },
        nameWidth: 280,
        message: ref(''),
        messageType: ref(''),
        t: key => key,
        clearMessage: vi.fn(),
        dayStart
    }
    /** @type {{navigation?: ReturnType<typeof useGanttNavigation>}} */
    const state = {}
    const wrapper = mount(
        defineComponent({
            setup() {
                state.navigation = useGanttNavigation(context)
                return () => null
            }
        })
    )
    wrappers.push(wrapper)
    if (!state.navigation) throw new Error('Setup failed')
    return { ...context, element, navigation: state.navigation, wrapper }
}
describe('Gantt viewport navigation', () => {
    it('scrolls to today and preserves the centered coordinate calculation', async () => {
        const state = setup()
        await state.navigation.scrollToday()
        expect(state.element.scrollTo).toHaveBeenCalledWith({ left: 72, behavior: 'smooth' })
    })
    it('clamps zoom and keeps shift-wheel vertical scrolling', () => {
        const state = setup()
        state.viewport.dayWidth.value = 6
        state.navigation.onWheel(new WheelEvent('wheel', { ctrlKey: true, deltaY: 80 }))
        expect(state.viewport.dayWidth.value).toBe(6)
        state.viewport.dayWidth.value = 60
        state.navigation.onWheel(new WheelEvent('wheel', { ctrlKey: true, deltaY: -80 }))
        expect(state.viewport.dayWidth.value).toBe(60)
        state.navigation.onWheel(new WheelEvent('wheel', { shiftKey: true, deltaY: 80 }))
        expect(state.element.scrollBy).toHaveBeenCalledWith({ top: 80, behavior: 'auto' })
    })
    it('extends left and right edges by 21 days', async () => {
        const state = setup()
        await state.navigation.scrollDays(-1)
        expect(state.viewport.viewRange.value.start).toEqual(new Date(2026, 9, 11))
        expect(state.element.scrollLeft).toBe(882)
        state.element.scrollLeft = 1500
        await state.navigation.scrollDays(1)
        expect(state.viewport.viewRange.value.end).toEqual(new Date(2026, 11, 21))
    })
    it('releases the transient message timer on component unmount', async () => {
        vi.useFakeTimers()
        const state = setup()
        state.viewport.days.value = []
        await state.navigation.scrollToday()
        expect(state.messageType.value).toBe('warning')
        state.wrapper.unmount()
        await vi.advanceTimersByTimeAsync(4000)
        expect(state.clearMessage).not.toHaveBeenCalled()
    })
})
