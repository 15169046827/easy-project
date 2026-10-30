import { computed, onBeforeUnmount, ref } from 'vue'
import { useDocumentDragListeners } from './useDocumentDragListeners.js'
import { useGanttEdgeScrolling } from './useGanttEdgeScrolling.js'
import { calendarDate, calendarDayNumber, isDragGesture } from '../utils/dragCoordinates.js'

export function useGanttCreationDragging(context) {
    const {
        viewRange,
        dayWidth,
        nameWidth,
        headerHeight,
        datedTasks,
        rowHeight,
        openCreateEditor,
        scroller
    } = context
    const createDrag = ref(null)
    const { addDocumentListener, removeDocumentListener } = useDocumentDragListeners()
    const edge = useGanttEdgeScrolling({
        scroller,
        viewRange,
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
    // ---------- 新建任务预览样式 ----------
    const createPreviewStyle = computed(() => {
        if (!createDrag.value) return { display: 'none' }
        const s = Math.min(createDrag.value.startDay, createDrag.value.endDay)
        const e = Math.max(createDrag.value.startDay, createDrag.value.endDay)
        const origin = calendarDayNumber(viewRange.value.start)
        return {
            left: `${nameWidth + (s - origin) * dayWidth.value + 6}px`,
            width: `${Math.max(2, (e - s + 1) * dayWidth.value - 12)}px`,
            top: `${headerHeight}px`,
            height: `${datedTasks.value.length * rowHeight}px`
        }
    })

    // ---------- 新建任务拖拽 ----------
    function onGridMouseDown(e) {
        if (e.button !== 0) return
        const ganttEl = e.currentTarget.closest('.gantt')
        const element = scroller.value
        if (!ganttEl || !element?.contains(ganttEl)) return
        const rect = element.getBoundingClientRect()
        if (e.clientX < rect.left + nameWidth || e.clientX >= rect.left + element.clientWidth)
            return
        e.preventDefault()
        cancelDrag()
        const day = Math.floor(edge.position(e.clientX) / dayWidth.value)
        createDrag.value = {
            startClientX: e.clientX,
            startClientY: e.clientY,
            startDay: day,
            endDay: day,
            active: false
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
        if (!cd) return
        openCreateEditor(
            calendarDate(Math.min(cd.startDay, cd.endDay)),
            calendarDate(Math.max(cd.startDay, cd.endDay))
        )
    }
    onBeforeUnmount(cancelDrag)
    return { createDrag, createPreviewStyle, onGridMouseDown }
}
