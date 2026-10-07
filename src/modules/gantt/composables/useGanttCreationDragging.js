import { computed, ref } from 'vue'
import { useDocumentDragListeners } from './useDocumentDragListeners.js'

export function useGanttCreationDragging(context) {
    const { days, dayWidth, nameWidth, headerHeight, datedTasks, rowHeight, openCreateEditor } =
        context
    const createDrag = ref(null)
    const { addDocumentListener, removeDocumentListener } = useDocumentDragListeners()
    // ---------- 新建任务预览样式 ----------
    const createPreviewStyle = computed(() => {
        if (!createDrag.value) return { display: 'none' }
        const s = Math.min(createDrag.value.startIdx, createDrag.value.endIdx)
        const e = Math.max(createDrag.value.startIdx, createDrag.value.endIdx)
        return {
            left: `${nameWidth + s * dayWidth.value + 6}px`,
            width: `${(e - s + 1) * dayWidth.value - 12}px`,
            top: `${headerHeight}px`,
            height: `${datedTasks.value.length * rowHeight}px`
        }
    })

    // ---------- 新建任务拖拽 ----------
    function onGridMouseDown(e) {
        if (e.button !== 0) return
        const ganttEl = e.currentTarget.closest('.gantt')
        if (!ganttEl) return
        const rect = ganttEl.getBoundingClientRect()
        const x = e.clientX - rect.left - nameWidth
        if (x < 0) return
        const idx = Math.floor(x / dayWidth.value)
        if (idx < 0 || idx >= days.value.length) return
        e.preventDefault()
        createDrag.value = { startX: e.clientX, startIdx: idx, endIdx: idx }
        addDocumentListener('mousemove', onGridMouseMove)
        addDocumentListener('mouseup', onGridMouseUp)
    }
    function onGridMouseMove(e) {
        if (!createDrag.value) return
        const ganttEl = e.target?.closest?.('.gantt')
        if (!ganttEl) return
        const rect = ganttEl.getBoundingClientRect()
        const x = e.clientX - rect.left - nameWidth
        const idx = Math.max(0, Math.min(days.value.length - 1, Math.floor(x / dayWidth.value)))
        createDrag.value.endIdx = idx
    }
    function onGridMouseUp(_e) {
        removeDocumentListener('mousemove', onGridMouseMove)
        removeDocumentListener('mouseup', onGridMouseUp)
        const cd = createDrag.value
        createDrag.value = null
        if (!cd) return
        const s = Math.min(cd.startIdx, cd.endIdx)
        const e = Math.max(cd.startIdx, cd.endIdx)
        if (!days.value[s] || !days.value[e]) return
        const startDate = new Date(days.value[s].key)
        const endDate = new Date(days.value[e].key)
        openCreateEditor(startDate, endDate)
    }
    return { createDrag, createPreviewStyle, onGridMouseDown }
}
