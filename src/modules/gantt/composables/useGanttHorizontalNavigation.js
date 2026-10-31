import { nextTick, onBeforeUnmount, watch } from 'vue'

/** Extend the calendar without moving its anchor, then pan to the requested date. */
export function useGanttHorizontalNavigation({ scroller, viewRange, dayWidth, dayStart }) {
    let frame = null
    let target = 0
    let generation = 0
    let disposed = false
    let queue = Promise.resolve()
    function cancel() {
        if (frame !== null) window.cancelAnimationFrame(frame)
        frame = null
    }
    function animate(element, left) {
        target = left
        const start = element.scrollLeft
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
            element.scrollLeft = left
            return
        }
        let began = null
        function step(time) {
            began ??= time
            const fraction = Math.min(1, (time - began) / 160)
            element.scrollLeft = start + (left - start) * (1 - (1 - fraction) ** 3)
            frame = fraction < 1 ? window.requestAnimationFrame(step) : null
        }
        frame = window.requestAnimationFrame(step)
    }
    async function move(pixels, smooth, token) {
        if (disposed || token !== generation || !scroller.value) return
        const element = scroller.value
        let left = (smooth && frame !== null ? target : element.scrollLeft) + pixels
        cancel()
        const width = dayWidth.value
        const max = Math.max(0, element.scrollWidth - element.clientWidth)
        const before = pixels < 0 && left < 80 ? Math.ceil((80 - left) / (21 * width)) * 21 : 0
        const after =
            pixels > 0 && left > max - 80 ? Math.ceil((left - max + 80) / (21 * width)) * 21 : 0
        if (before || after) {
            const { start, end } = viewRange.value
            const first = new Date(start),
                last = new Date(end)
            first.setDate(first.getDate() - before)
            last.setDate(last.getDate() + after)
            const originalLeft = element.scrollLeft
            viewRange.value = { start: dayStart(first), end: dayStart(last) }
            await nextTick()
            if (disposed || token !== generation || scroller.value !== element) return
            element.scrollLeft = originalLeft + before * width
            left += before * width
        }
        if (smooth) animate(element, left)
        else element.scrollLeft = left
    }
    function pan(pixels, smooth = false) {
        if (!Number.isFinite(pixels) || !pixels) return queue
        const token = generation
        queue = queue.then(() => move(pixels, smooth, token))
        return queue
    }
    function reset() {
        generation++
        cancel()
    }
    function visibility() {
        if (document.hidden) reset()
    }
    window.addEventListener('blur', reset)
    document.addEventListener('visibilitychange', visibility)
    watch(dayWidth, reset, { flush: 'sync' })
    onBeforeUnmount(() => {
        disposed = true
        reset()
        window.removeEventListener('blur', reset)
        document.removeEventListener('visibilitychange', visibility)
    })
    return { pan, cancel: reset }
}
