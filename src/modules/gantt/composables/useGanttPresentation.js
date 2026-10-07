import { computed } from 'vue'
import { calculateCriticalPath } from '../utils/criticalPath.js'
import { taskAvailabilityConflict } from '../../calendar/utils/memberAvailability.js'
import { calculateDragDelta, calculateDragUpdate } from '../utils/interaction.js'

function taskBarStyle(task, context) {
    const { dragState, dragCursorX, dayWidth, parse, dayStart, nameWidth, offset } = context
    const ds = dragState.value
    const isDragging = ds && ds.task.id === task.id

    let start = parse(task.start_time)
    let end = parse(task.end_time)

    // 拖拽预览：基于原始日期 + delta 计算新位置
    if (isDragging) {
        const delta = Math.round((dragCursorX.value - ds.startX) / dayWidth.value)
        if (ds.mode === 'move') {
            start = new Date(ds.origStart)
            start.setDate(start.getDate() + delta)
            end = new Date(ds.origEnd)
            end.setDate(end.getDate() + delta)
        } else if (ds.mode === 'resize-left') {
            start = new Date(ds.origStart)
            start.setDate(start.getDate() + delta)
            if (dayStart(start).getTime() >= dayStart(ds.origEnd).getTime())
                start = new Date(ds.origEnd.getTime() - 86400000)
            end = ds.origEnd
        } else if (ds.mode === 'resize-right') {
            end = new Date(ds.origEnd)
            end.setDate(end.getDate() + delta)
            if (dayStart(end).getTime() <= dayStart(ds.origStart).getTime())
                end = new Date(ds.origStart.getTime() + 86400000)
            start = ds.origStart
        }
    }

    const left = nameWidth + offset(start) * dayWidth.value + 6
    if (task.type === 'Milestone')
        return {
            left: `${left + dayWidth.value / 2 - 8}px`,
            top: '16px'
        }
    const barW = Math.max(
        dayWidth.value - 10,
        (offset(end) - offset(start) + 1) * dayWidth.value - 12
    )
    return {
        left: `${left}px`,
        width: `${barW}px`,
        top: '11px'
    }
}

/** @returns {Array<{id: string, name: string, parent: string, start_time: string, end_time: string, type: string, status: string, level: number, progress?: number, assignee?: string}>} */
function datedTaskRows(tasks, parse) {
    const source = tasks.filter(task => parse(task.start_time) && parse(task.end_time))
    const ids = new Set(source.map(task => task.id))
    const level = task => {
        let count = 0
        let parent = task.parent
        while (parent && ids.has(parent) && count < 20) {
            count++
            parent = source.find(item => item.id === parent)?.parent
        }
        return count
    }
    return source.map(task => ({ ...task, level: level(task) }))
}

export function useGanttPresentation(context) {
    const {
        tasks,
        parse,
        dragState,
        dragCursorX,
        dayWidth,
        dayStart,
        nameWidth,
        offset,
        dependencies,
        headerHeight,
        rowHeight,
        showCritical,
        activeProject,
        members,
        t
    } = context
    function taskSchedule(task) {
        let start = parse(task.start_time)
        let end = parse(task.end_time)
        const ds = dragState.value
        if (ds && ds.task.id === task.id) {
            const delta = calculateDragDelta(ds.startX, dragCursorX.value, dayWidth.value)
            const update = calculateDragUpdate(ds.origStart, ds.origEnd, delta, ds.mode)
            if (update?.kind === 'update') {
                start = update.start
                end = update.end
            }
        }
        return { start, end }
    }
    function fmtShortRange(task) {
        const { start: s, end: e } = taskSchedule(task)
        if (!s || !e) return ''
        return `${s.getMonth() + 1}/${s.getDate()} – ${e.getMonth() + 1}/${e.getDate()}`
    }

    // ---------- 含日期的任务 ----------
    const datedTasks = computed(() => datedTaskRows(tasks.value, parse))

    const barStyle = task => taskBarStyle(task, context)

    // ---------- 依赖连线 ----------
    const dependencyPaths = computed(() =>
        dependencies.value
            .map(edge => {
                const a = datedTasks.value.findIndex(t => t.id === edge.predecessor_task_id)
                const b = datedTasks.value.findIndex(t => t.id === edge.successor_task_id)
                if (a < 0 || b < 0) return null
                const pred = datedTasks.value[a]
                const succ = datedTasks.value[b]
                const x1 = (offset(parse(pred.end_time)) + 1) * dayWidth.value - 5
                const x2 = offset(parse(succ.start_time)) * dayWidth.value + 5
                const y1 = headerHeight + a * rowHeight + 24
                const y2 = headerHeight + b * rowHeight + 24
                const mid = Math.max(x1 + 12, (x1 + x2) / 2)
                const critical = showCritical.value && criticalData.value.edges.has(edge.id)
                return { id: edge.id, path: `M ${x1} ${y1} H ${mid} V ${y2} H ${x2}`, critical }
            })
            .filter(Boolean)
    )

    // ---------- 关键路径 (CPM) ----------
    // 计算最早/最晚开始与完成时间、时差，并标注关键路径（时差为 0 的链路）。
    const criticalData = computed(() =>
        calculateCriticalPath(datedTasks.value, dependencies.value, activeProject.value)
    )

    function criticalTip(task) {
        const c = criticalData.value.info.get(task.id)
        if (!c) return task.name
        const tag = c.slack <= 0 ? t('gantt.criticalPath') : t('gantt.slack', { count: c.slack })
        return `${task.name}\n最早: ${c.esText} → ${c.efText}\n最晚: ${c.lsText} → ${c.lfText}\n${tag}`
    }

    function availabilityInfo(task) {
        return taskAvailabilityConflict(task, members.value, activeProject.value)
    }

    function taskTip(task) {
        const base = criticalTip(task)
        const availability = availabilityInfo(task)
        if (!availability.conflict) return base
        return `${base}\n${t('gantt.availabilityConflict', {
            name: availability.member?.name || task.assignee,
            count: availability.dates.length,
            dates: availability.dates.join(', ')
        })}`
    }
    return {
        datedTasks,
        fmtShortRange,
        barStyle,
        dependencyPaths,
        criticalData,
        availabilityInfo,
        taskTip
    }
}
