import { defineComponent, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useGanttNavigation } from '../../modules/gantt/composables/useGanttNavigation.js'
const dayStart = date => new Date(date.getFullYear(), date.getMonth(), date.getDate())
const wrappers = []
afterEach(() => {
    wrappers.splice(0).forEach(wrapper => wrapper.unmount())
    vi.useRealTimers()
    vi.restoreAllMocks()
})
function setup() {
    const frames = new Map()
    let frameId = 0
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
        frames.set(++frameId, callback)
        return frameId
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(id => frames.delete(id))
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
    function finishAnimation() {
        for (const time of [0, 80, 160]) {
            const callbacks = [...frames.values()]
            frames.clear()
            callbacks.forEach(callback => callback(time))
        }
    }
    return { ...context, element, navigation: state.navigation, wrapper, finishAnimation, frames }
}
describe('Gantt viewport navigation', () => {
    it('uses ordinary wheel vertically and trackpad deltaX horizontally', async () => {
        const state = setup()
        Object.defineProperties(state.element, {
            scrollHeight: { value: 2000 },
            clientHeight: { value: 200 }
        })
        state.navigation.onWheel(new WheelEvent('wheel', { deltaY: 120 }))
        expect(state.element.scrollBy).toHaveBeenCalledWith({ top: 120, behavior: 'auto' })
        await state.navigation.onWheel(new WheelEvent('wheel', { deltaX: 40 }))
        expect(state.element.scrollLeft).toBe(40)
    })
    it('scrolls to today and preserves the centered coordinate calculation', async () => {
        const state = setup()
        await state.navigation.scrollToday()
        expect(state.element.scrollTo).toHaveBeenCalledWith({ left: 72, behavior: 'smooth' })
    })
    it('clamps zoom and uses shift-wheel horizontally', async () => {
        const state = setup()
        state.viewport.dayWidth.value = 6
        state.navigation.onWheel(new WheelEvent('wheel', { ctrlKey: true, deltaY: 80 }))
        expect(state.viewport.dayWidth.value).toBe(6)
        state.viewport.dayWidth.value = 60
        state.navigation.onWheel(new WheelEvent('wheel', { ctrlKey: true, deltaY: -80 }))
        expect(state.viewport.dayWidth.value).toBe(60)
        await state.navigation.onWheel(new WheelEvent('wheel', { shiftKey: true, deltaY: 80 }))
        expect(state.element.scrollLeft).toBe(80)
        expect(state.element.scrollBy).not.toHaveBeenCalled()
    })
    it('extends edges and actually pans the visible date by fourteen days', async () => {
        const state = setup()
        await state.navigation.scrollDays(-14)
        expect(state.viewport.viewRange.value.start).toEqual(new Date(2026, 9, 11))
        expect(state.element.scrollLeft).toBe(882)
        state.finishAnimation()
        expect(state.element.scrollLeft).toBe(294)
        state.element.scrollLeft = 1500
        await state.navigation.scrollDays(14)
        expect(state.viewport.viewRange.value.end).toEqual(new Date(2026, 11, 21))
        state.finishAnimation()
        expect(state.element.scrollLeft).toBe(2088)
    })
    it('keeps ordinary wheel vertical even when the task rows fit', () => {
        const state = setup()
        state.navigation.onWheel(new WheelEvent('wheel', { deltaY: 80 }))
        expect(state.element.scrollBy).toHaveBeenCalledWith({ top: 80, behavior: 'auto' })
        expect(state.viewport.viewRange.value.start).toEqual(new Date(2026, 10, 1))
    })
    it('serializes wheel bursts and preserves the absolute date while prepending', async () => {
        const state = setup()
        await Promise.all(
            Array.from({ length: 4 }, () =>
                state.navigation.onWheel(new WheelEvent('wheel', { deltaY: -80, shiftKey: true }))
            )
        )
        expect(state.viewport.viewRange.value.start).toEqual(new Date(2026, 9, 11))
        expect(state.element.scrollLeft).toBe(882 - 320)
    })
    it('accumulates repeated button presses instead of losing the animated distance', async () => {
        const state = setup()
        await Promise.all([state.navigation.scrollDays(14), state.navigation.scrollDays(14)])
        state.finishAnimation()
        expect(state.element.scrollLeft).toBe(1176)
    })
    it('normalizes line deltas and does not double OS-remapped shift deltas', async () => {
        const state = setup()
        await state.navigation.onWheel(
            new WheelEvent('wheel', { shiftKey: true, deltaX: 3, deltaY: 3, deltaMode: 1 })
        )
        expect(state.element.scrollLeft).toBe(48)
    })
    it('cancels scheduled pan frames and queued work on unmount', async () => {
        const state = setup()
        await state.navigation.scrollDays(14)
        expect(state.frames.size).toBe(1)
        state.wrapper.unmount()
        expect(state.frames.size).toBe(0)
        const start = state.viewport.viewRange.value.start
        await state.navigation.scrollDays(-14)
        expect(state.viewport.viewRange.value.start).toEqual(start)
    })
    it('respects reduced motion and cancels an animation when focus is lost', async () => {
        const state = setup()
        const original = window.matchMedia
        window.matchMedia = vi.fn(() =>
            Object.assign(new EventTarget(), {
                matches: true,
                media: '(prefers-reduced-motion: reduce)',
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn()
            })
        )
        try {
            await state.navigation.scrollDays(14)
            expect(state.element.scrollLeft).toBe(588)
            expect(state.frames.size).toBe(0)
        } finally {
            window.matchMedia = original
        }
        await state.navigation.scrollDays(1)
        expect(state.frames.size).toBe(1)
        window.dispatchEvent(new Event('blur'))
        expect(state.frames.size).toBe(0)
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
