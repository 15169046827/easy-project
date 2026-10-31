import { onBeforeUnmount, ref } from 'vue'

// Pointer gestures avoid WebView native HTML-drag interception. Name-column
// presses use a threshold; placement is validated again in the shared service.
export function useGanttRowReordering({
    tasks,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
    onPlace
}) {
    let pointer = null
    let suppressClickUntil = 0
    const rowGesture = ref(null)
    const rowTarget = ref(null)
    function ignoreRowClick() {
        return performance.now() < suppressClickUntil
    }
    function finish() {
        if (pointer?.started) suppressClickUntil = performance.now() + 650
        pointer = null
        rowGesture.value = null
        rowTarget.value = null
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerup', end)
        window.removeEventListener('pointercancel', finish)
        window.removeEventListener('blur', finish)
        window.removeEventListener('keydown', cancelKey)
        onDragEnd()
    }
    function cancelKey(event) {
        if (event.key === 'Escape') finish()
    }
    function targetAt(event) {
        const label = document
            .elementFromPoint(event.clientX, event.clientY)
            ?.closest('.task-label')
        if (!label || !pointer.root?.contains(label)) return null
        const id = label.closest('.gantt-row')?.getAttribute('data-row-task-id')
        return tasks.value.find(task => task.id === id) || null
    }
    function beginGesture(event) {
        if (!pointer || event.pointerId !== pointer.id) return false
        if (!pointer.started) {
            if (Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) < 8) return false
            pointer.started = true
            onDragStart({}, pointer.task)
        }
        return true
    }
    function move(event) {
        if (!beginGesture(event)) return
        const target = targetAt(event)
        rowGesture.value = {
            id: pointer.task.id,
            name: pointer.task.name,
            x: event.clientX,
            y: event.clientY
        }
        rowTarget.value = null
        if (target) {
            const label = document
                .elementFromPoint(event.clientX, event.clientY)
                ?.closest('.task-label')
            const rect = label.getBoundingClientRect()
            const ratio = (event.clientY - rect.top) / rect.height
            const position = ratio < 0.25 ? 'before' : ratio > 0.75 ? 'after' : 'inside'
            const parent = position === 'inside' ? target.id : target.parent || ''
            let ancestor = parent
            const visited = new Set()
            while (ancestor && !visited.has(ancestor)) {
                if (ancestor === pointer.task.id) return
                visited.add(ancestor)
                ancestor = tasks.value.find(task => task.id === ancestor)?.parent
            }
            if (target.project_id !== pointer.task.project_id) return
            rowTarget.value = { id: target.id, position, parent }
            onDragOver(event, target)
        }
    }
    function end(event) {
        // Coalesced native move events still require the original handle press
        // and threshold; arbitrary pointerup events cannot cause writes.
        if (!pointer || event.pointerId !== pointer.id) return
        move(event)
        const target = pointer.started ? targetAt(event) : null
        if (target && onPlace && rowTarget.value)
            void onPlace(pointer.task, target, rowTarget.value)
        else if (target && !onPlace) void onDrop(target)
        finish()
    }
    function startRowDrag(event, task) {
        if (event.button !== 0 || (event.pointerType && event.pointerType !== 'mouse')) return
        finish()
        if (event.target?.closest('.date-actions, .tree-toggle')) return
        pointer = {
            id: event.pointerId,
            task,
            x: event.clientX,
            y: event.clientY,
            root: event.currentTarget.closest('.scroller-wrap'),
            started: false
        }
        window.addEventListener('pointermove', move)
        window.addEventListener('pointerup', end)
        window.addEventListener('pointercancel', finish)
        window.addEventListener('blur', finish)
        window.addEventListener('keydown', cancelKey)
    }
    onBeforeUnmount(finish)
    return { startRowDrag, rowGesture, rowTarget, ignoreRowClick }
}
