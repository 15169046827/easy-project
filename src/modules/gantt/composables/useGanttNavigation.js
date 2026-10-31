import { nextTick, onBeforeUnmount } from 'vue'
import { useGanttHorizontalNavigation } from './useGanttHorizontalNavigation.js'

export function useGanttNavigation({
    scroller,
    viewport,
    nameWidth,
    message,
    messageType,
    t,
    clearMessage,
    dayStart
}) {
    const { days, dayWidth, viewRange } = viewport
    const horizontal = useGanttHorizontalNavigation({ scroller, viewRange, dayWidth, dayStart })
    let messageTimer = null
    onBeforeUnmount(() => {
        if (messageTimer !== null) clearTimeout(messageTimer)
    })

    async function scrollToday() {
        horizontal.cancel()
        await nextTick()
        const index = days.value.findIndex(day => day.today)
        if (!scroller.value) return
        if (index < 0) {
            messageType.value = 'warning'
            message.value = t('gantt.todayOutside')
            if (messageTimer !== null) clearTimeout(messageTimer)
            messageTimer = setTimeout(clearMessage, 3500)
            return
        }
        scroller.value.scrollTo({
            left: Math.max(0, nameWidth + index * dayWidth.value - scroller.value.clientWidth / 2),
            behavior: 'smooth'
        })
    }

    function scrollDays(delta) {
        return horizontal.pan(delta * dayWidth.value, true)
    }

    function onWheel(event) {
        if (event.ctrlKey) {
            horizontal.cancel()
            event.preventDefault()
            dayWidth.value = Math.max(6, Math.min(60, dayWidth.value + (event.deltaY > 0 ? -4 : 4)))
        } else if (event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
            event.preventDefault()
            const delta = event.shiftKey ? event.deltaX || event.deltaY : event.deltaX
            const scale =
                event.deltaMode === 1
                    ? 16
                    : event.deltaMode === 2
                      ? scroller.value?.clientWidth || 1
                      : 1
            return horizontal.pan(delta * scale)
        } else {
            horizontal.cancel()
            const scale =
                event.deltaMode === 1
                    ? 16
                    : event.deltaMode === 2
                      ? scroller.value?.clientHeight || 1
                      : 1
            scroller.value?.scrollBy({ top: event.deltaY * scale, behavior: 'auto' })
        }
    }
    return { scrollToday, scrollDays, onWheel }
}
