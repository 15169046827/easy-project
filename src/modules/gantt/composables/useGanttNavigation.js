import { nextTick, onBeforeUnmount } from 'vue'

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
    let messageTimer = null
    onBeforeUnmount(() => {
        if (messageTimer !== null) clearTimeout(messageTimer)
    })

    async function scrollToday() {
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

    async function scrollDays(delta) {
        if (!scroller.value) return
        const element = scroller.value
        const extension = 21
        if (delta < 0 && element.scrollLeft < 60) {
            const start = new Date(viewRange.value.start)
            start.setDate(start.getDate() - extension)
            viewRange.value = { start: dayStart(start), end: viewRange.value.end }
            await nextTick()
            element.scrollLeft = extension * dayWidth.value
            return
        }
        if (delta > 0 && element.scrollLeft > element.scrollWidth - element.clientWidth - 80) {
            const end = new Date(viewRange.value.end)
            end.setDate(end.getDate() + extension)
            viewRange.value = { start: viewRange.value.start, end: dayStart(end) }
            return
        }
        element.scrollBy({ left: delta * dayWidth.value, behavior: 'smooth' })
    }

    function onWheel(event) {
        if (event.ctrlKey) {
            event.preventDefault()
            dayWidth.value = Math.max(6, Math.min(60, dayWidth.value + (event.deltaY > 0 ? -4 : 4)))
        } else if (event.shiftKey) {
            event.preventDefault()
            scroller.value?.scrollBy({ top: event.deltaY, behavior: 'auto' })
        } else {
            const direction = event.deltaY > 0 ? 1 : -1
            const steps = Math.max(1, Math.round(Math.abs(event.deltaY) / 80))
            return scrollDays(direction * steps)
        }
    }
    return { scrollToday, scrollDays, onWheel }
}
