import { defineComponent, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useGanttEdgeScrolling } from '../../modules/gantt/composables/useGanttEdgeScrolling.js'
import { calendarDate, calendarDayNumber } from '../../modules/gantt/utils/dragCoordinates.js'

let frames, time, id
const wrappers = []
beforeEach(() => {
    frames = new Map()
    time = 0
    id = 0
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
        frames.set(++id, callback)
        return id
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(key => {
        frames.delete(key)
    })
})
afterEach(() => {
    wrappers.splice(0).forEach(w => w.unmount())
    vi.restoreAllMocks()
})
function setup() {
    const element = document.createElement('div')
    const viewRange = ref({ start: new Date(2026, 6, 1), end: new Date(2026, 6, 10) })
    Object.defineProperty(element, 'clientWidth', { value: 600 })
    Object.defineProperty(element, 'scrollWidth', {
        get: () =>
            280 +
            (calendarDayNumber(viewRange.value.end) -
                calendarDayNumber(viewRange.value.start) +
                1) *
                42
    })
    element.getBoundingClientRect = () => ({
        left: 0,
        top: 0,
        right: 600,
        bottom: 300,
        width: 600,
        height: 300,
        x: 0,
        y: 0,
        toJSON() {}
    })
    const onScroll = vi.fn(),
        onCancel = vi.fn()
    /** @type {{edge?: ReturnType<typeof useGanttEdgeScrolling>}} */
    const state = {}
    const wrapper = mount(
        defineComponent({
            setup() {
                state.edge = useGanttEdgeScrolling({
                    scroller: ref(element),
                    viewRange,
                    dayWidth: ref(42),
                    nameWidth: 280,
                    headerHeight: 62,
                    onScroll,
                    onCancel
                })
                return () => null
            }
        })
    )
    wrappers.push(wrapper)
    if (!state.edge) throw new Error('Edge setup failed')
    return { element, viewRange, edge: state.edge, onScroll, onCancel, wrapper }
}
async function frame() {
    const entry = frames.entries().next().value
    expect(entry).toBeTruthy()
    frames.delete(entry[0])
    time += 16
    await entry[1](time)
}
describe('Gantt edge pan', () => {
    it('continues while stationary and extends the right boundary', async () => {
        const s = setup()
        s.element.scrollLeft = 100
        s.edge.start({ clientX: 500, clientY: 100 })
        s.edge.update({ clientX: 596, clientY: 100 }, true)
        await frame()
        expect(s.viewRange.value.end).toEqual(new Date(2026, 6, 31))
        const first = s.element.scrollLeft
        await frame()
        expect(s.element.scrollLeft).toBeGreaterThan(first)
        expect(s.onScroll).toHaveBeenCalledTimes(2)
        s.edge.stop()
        expect(frames.size).toBe(0)
    })
    it('prepends days without jumping the logical pointer by three weeks', async () => {
        const s = setup()
        s.edge.start({ clientX: 350, clientY: 100 })
        s.edge.update({ clientX: 282, clientY: 100 }, true)
        const before = s.edge.position(282)
        await frame()
        expect(s.viewRange.value.start).toEqual(new Date(2026, 5, 10))
        expect(before - s.edge.position(282)).toBeGreaterThan(0)
        expect(before - s.edge.position(282)).toBeLessThan(42)
    })
    it('does not pan above the calendar and cancels on Escape or loss of focus', async () => {
        const s = setup()
        s.edge.start({ clientX: 500, clientY: 100 })
        s.edge.update({ clientX: 596, clientY: 20 }, true)
        await frame()
        expect(s.onScroll).not.toHaveBeenCalled()
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
        expect(s.onCancel).toHaveBeenCalledOnce()
        s.edge.start({ clientX: 500, clientY: 100 })
        s.edge.update({ clientX: 596, clientY: 100 }, true)
        window.dispatchEvent(new Event('blur'))
        expect(s.onCancel).toHaveBeenCalledTimes(2)
        expect(frames.size).toBe(0)
    })
    it('does not scroll after cancellation during a pending range extension or after unmount', async () => {
        const s = setup()
        s.element.scrollLeft = 100
        s.edge.start({ clientX: 500, clientY: 100 })
        s.edge.update({ clientX: 596, clientY: 100 }, true)
        const entry = frames.entries().next().value
        frames.delete(entry[0])
        const pending = entry[1](16)
        s.edge.stop()
        await pending
        expect(s.onScroll).not.toHaveBeenCalled()
        s.edge.start({ clientX: 500, clientY: 100 })
        s.edge.update({ clientX: 596, clientY: 100 }, true)
        s.wrapper.unmount()
        expect(frames.size).toBe(0)
    })
    it('roundtrips local calendar days across a DST-season boundary', () => {
        const a = new Date(2026, 9, 31),
            b = new Date(2026, 10, 2)
        expect(calendarDayNumber(b) - calendarDayNumber(a)).toBe(2)
        expect(calendarDate(calendarDayNumber(a))).toEqual(a)
    })
})
