import { computed, ref } from 'vue'
import { taskViewRange, viewportDays, viewportMonths } from '../utils/viewportCalendar.js'

export function useGanttViewport({ tasks, activeProject, parse, dayStart, t }) {
    const dayWidth = ref(42)
    const viewRange = ref({ start: new Date(), end: new Date() })
    const todayStart = dayStart(new Date()).getTime()
    const days = computed(() =>
        viewportDays(viewRange.value, activeProject.value, todayStart, dayStart)
    )
    const months = computed(() => viewportMonths(days.value, t))
    const zoomLevel = computed(() => {
        if (dayWidth.value >= 36) return t('gantt.zoomDay')
        if (dayWidth.value >= 18) return t('gantt.zoomWeek')
        return t('gantt.zoomMonth')
    })
    const offset = date =>
        Math.round((dayStart(date).getTime() - viewRange.value.start.getTime()) / 86400000)
    function initViewRange() {
        viewRange.value = taskViewRange(tasks.value, parse, dayStart)
    }
    return { dayWidth, viewRange, days, months, zoomLevel, offset, initViewRange }
}
