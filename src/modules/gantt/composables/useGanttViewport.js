import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { taskViewRange, viewportDays, viewportMonths } from '../utils/viewportCalendar.js'
import { ganttTaskRows } from '../utils/taskRows.js'

export function useGanttViewport({ tasks, activeProject, parse, dayStart, t }) {
    const { locale } = useI18n()
    const dayWidth = ref(42)
    const viewRange = ref({ start: new Date(), end: new Date() })
    const todayStart = dayStart(new Date()).getTime()
    const days = computed(() =>
        viewportDays(viewRange.value, activeProject.value, todayStart, dayStart, locale.value)
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
        viewRange.value = taskViewRange(ganttTaskRows(tasks.value, parse), parse, dayStart)
    }
    return { dayWidth, viewRange, days, months, zoomLevel, offset, initViewRange }
}
