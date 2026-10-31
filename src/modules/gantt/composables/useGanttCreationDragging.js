import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useDocumentDragListeners } from './useDocumentDragListeners.js'
import { useGanttEdgeScrolling } from './useGanttEdgeScrolling.js'
import { calendarDate, calendarDayNumber, isDragGesture } from '../utils/dragCoordinates.js'

function selectionStyle(selection, context, preview = false) {
    if (!selection) return { display: 'none' }
    const { viewRange, dayWidth, nameWidth, headerHeight, rowHeight } = context
    const s = Math.min(selection.startDay, selection.endDay)
    const e = Math.max(selection.startDay, selection.endDay)
    const origin = calendarDayNumber(viewRange.value.start)
    return {
        left: `${nameWidth + (s - origin) * dayWidth.value + 6}px`,
        width: `${Math.max(2, (e - s + 1) * dayWidth.value - 12)}px`,
        top: `${headerHeight + selection.index * rowHeight + (preview ? 0 : 11)}px`,
        height: `${preview ? rowHeight : 26}px`
    }
}

export function useGanttCreationDragging(context) {
    const { dayWidth, nameWidth, headerHeight, rows, confirmSelection, scroller } = context
    const createDrag = ref(null)
    const pendingSelection = ref(null)
    watch(rows, () => {
        pendingSelection.value = null
    })
    const { addDocumentListener, removeDocumentListener } = useDocumentDragListeners()
    const edge = useGanttEdgeScrolling({
        scroller,
        viewRange: context.viewRange,
        dayWidth,
        nameWidth,
        headerHeight,
        onScroll: x => updateEnd(x),
        onCancel: cancelDrag
    })
    function updateEnd(x) {
        if (createDrag.value)
            createDrag.value.endDay = Math.floor(edge.position(x) / dayWidth.value)
    }
    function cancelDrag() {
        removeDocumentListener('mousemove', onGridMouseMove)
        removeDocumentListener('mouseup', onGridMouseUp)
        createDrag.value = null
        edge.stop()
    }
    function dismiss(event) {
        if (event.key === 'Escape') pendingSelection.value = null
    }
    document.addEventListener('keydown', dismiss)
    const createPreviewStyle = computed(() => selectionStyle(createDrag.value, context, true))
    const pendingStyle = computed(() => selectionStyle(pendingSelection.value, context))
    function confirmPending() {
        const selection = pendingSelection.value
        if (!selection) return
        pendingSelection.value = null
        confirmSelection(
            selection.task,
            calendarDate(Math.min(selection.startDay, selection.endDay)),
            calendarDate(Math.max(selection.startDay, selection.endDay))
        )
    }

    // ---------- 新建任务拖拽 ----------
    function onGridMouseDown(e, task, index) {
        if (e.button !== 0) return
        if (task && (task.start_time || task.end_time || task.hasChildren)) return
        const ganttEl = e.currentTarget.closest('.gantt')
        const element = scroller.value
        if (!ganttEl || !element?.contains(ganttEl)) return
        const rect = element.getBoundingClientRect()
        if (e.clientX < rect.left + nameWidth || e.clientX >= rect.left + element.clientWidth)
            return
        e.preventDefault()
        cancelDrag()
        pendingSelection.value = null
        const day = Math.floor(edge.position(e.clientX) / dayWidth.value)
        createDrag.value = {
            startClientX: e.clientX,
            startClientY: e.clientY,
            startDay: day,
            endDay: day,
            active: false,
            task,
            index
        }
        edge.start(e)
        addDocumentListener('mousemove', onGridMouseMove)
        addDocumentListener('mouseup', onGridMouseUp)
    }
    function onGridMouseMove(e) {
        if (!createDrag.value) return
        createDrag.value.active ||= isDragGesture(createDrag.value, e)
        updateEnd(e.clientX)
        edge.update(e, createDrag.value.active)
    }
    function onGridMouseUp(event) {
        if (event.button !== 0) return
        onGridMouseMove(event)
        const cd = createDrag.value
        cancelDrag()
        if (!cd?.active) return
        pendingSelection.value = cd
    }
    onBeforeUnmount(() => {
        cancelDrag()
        document.removeEventListener('keydown', dismiss)
    })
    return {
        createDrag,
        createPreviewStyle,
        pendingSelection,
        pendingStyle,
        confirmPending,
        onGridMouseDown
    }
}
