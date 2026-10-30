import { nextTick, onBeforeUnmount, watch } from 'vue'
import { calendarDayNumber } from '../utils/dragCoordinates.js'

/** Horizontal edge pan shared by creation, movement and resize gestures. */
export function useGanttEdgeScrolling({
    scroller,
    viewRange,
    dayWidth,
    nameWidth,
    headerHeight = 0,
    onScroll,
    onCancel
}) {
    let active = false
    let frame = null
    let generation = 0
    let previousTime = 0
    let point = { x: 0, y: 0 }
    const zone = 48

    function position(clientX) {
        const element = scroller.value
        if (!element) return clientX
        const rect = element.getBoundingClientRect()
        const x = Math.max(
            0,
            Math.min(element.clientWidth - nameWidth - 1, clientX - rect.left - nameWidth)
        )
        return calendarDayNumber(viewRange.value.start) * dayWidth.value + element.scrollLeft + x
    }
    function speed(element) {
        const rect = element.getBoundingClientRect()
        if (point.y < rect.top + headerHeight || point.y > rect.bottom) return 0
        const left = rect.left + nameWidth
        const right = rect.left + element.clientWidth
        const edge = Math.min(zone, Math.max(0, (right - left) / 3))
        if (!edge) return 0
        if (point.x < left + edge)
            return -Math.min(600, 120 + (480 * (left + edge - point.x)) / edge)
        if (point.x > right - edge)
            return Math.min(600, 120 + (480 * (point.x - right + edge)) / edge)
        return 0
    }
    async function tick(time) {
        // Reserve the frame while nextTick is pending; mousemove must not
        // start a concurrent extension of the same calendar boundary.
        frame = -1
        if (!active || !scroller.value) {
            frame = null
            return
        }
        const token = generation
        const element = scroller.value
        const velocity = speed(element)
        if (!velocity) {
            previousTime = 0
            frame = null
            return
        }
        const elapsed = previousTime ? Math.min(48, time - previousTime) : 16
        previousTime = time
        if (
            (velocity < 0 && element.scrollLeft < 32) ||
            (velocity > 0 && element.scrollLeft >= element.scrollWidth - element.clientWidth - 32)
        ) {
            const range = viewRange.value
            const boundary = new Date(velocity < 0 ? range.start : range.end)
            boundary.setDate(boundary.getDate() + (velocity < 0 ? -21 : 21))
            const oldLeft = element.scrollLeft
            viewRange.value =
                velocity < 0 ? { ...range, start: boundary } : { ...range, end: boundary }
            await nextTick()
            if (!active || token !== generation) return
            if (velocity < 0) element.scrollLeft = oldLeft + 21 * dayWidth.value
        }
        if (!active || token !== generation) return
        element.scrollLeft += (speed(element) * elapsed) / 1000
        onScroll(point.x)
        if (active && frame === -1) frame = window.requestAnimationFrame(tick)
    }
    function stop() {
        active = false
        generation++
        previousTime = 0
        if (frame !== null) window.cancelAnimationFrame(frame)
        frame = null
        window.removeEventListener('blur', cancel)
        document.removeEventListener('visibilitychange', visibility)
        document.removeEventListener('keydown', keydown)
    }
    function cancel() {
        stop()
        onCancel()
    }
    function visibility() {
        if (document.hidden) cancel()
    }
    function keydown(event) {
        if (event.key === 'Escape') {
            event.preventDefault()
            cancel()
        }
    }
    function start(event) {
        stop()
        active = true
        point = { x: event.clientX, y: event.clientY }
        window.addEventListener('blur', cancel)
        document.addEventListener('visibilitychange', visibility)
        document.addEventListener('keydown', keydown)
    }
    function update(event, dragging) {
        point = { x: event.clientX, y: event.clientY }
        if (active && dragging && frame === null) frame = window.requestAnimationFrame(tick)
    }
    watch(dayWidth, () => {
        if (active) cancel()
    })
    onBeforeUnmount(stop)
    return { position, start, update, stop }
}
