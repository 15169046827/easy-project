import {
    countWorkingDays,
    dateKey,
    getWorkdayInfo,
    workingDayDelta
} from '../../calendar/utils/workCalendar.js'

const DAY_MS = 86_400_000

function parseDate(value) {
    const date = new Date(String(value || '').replace(' ', 'T'))
    return Number.isNaN(date.getTime()) ? null : date
}

function dayIndex(value) {
    const date = value instanceof Date ? value : parseDate(value)
    if (!date) return null
    return Math.round(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS)
}

function formatDay(index) {
    const date = new Date(index * DAY_MS)
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
}

/**
 * Calculate CPM timing for dated tasks connected by finish-to-start dependencies.
 * Invalid tasks and dangling dependencies are ignored. Cycles produce an empty
 * critical result so callers never render misleading path information.
 */
export function calculateCriticalPath(tasks = [], dependencies = [], project = null) {
    const useWorkCalendar = Boolean(project)
    const parsedStarts = tasks.map(task => parseDate(task.start_time)).filter(Boolean)
    const origin = parsedStarts.length
        ? new Date(Math.min(...parsedStarts.map(date => date.getTime())))
        : null
    const timeIndex = value => {
        if (!parseDate(value)) return null
        return useWorkCalendar ? workingDayDelta(origin, value, project) : dayIndex(value)
    }
    const formatTime = index => {
        if (!useWorkCalendar) return formatDay(index)
        const cursor = new Date(origin)
        let remaining = Math.abs(index)
        const direction = index < 0 ? -1 : 1
        while (remaining > 0) {
            cursor.setDate(cursor.getDate() + direction)
            if (getWorkdayInfo(cursor, project).working) remaining -= 1
        }
        return dateKey(cursor)
    }
    const datedTasks = tasks.filter(
        task => timeIndex(task.start_time) !== null && timeIndex(task.end_time) !== null
    )
    const byId = new Map(datedTasks.map(task => [task.id, task]))
    const ids = datedTasks.map(task => task.id)
    const emptyResult = {
        critical: new Set(),
        edges: new Set(),
        info: new Map(),
        projectFinish: null
    }

    if (ids.length === 0) return { ...emptyResult, hasCycle: false }

    const durationOf = task => {
        if (task.type === 'Milestone') return 0
        return useWorkCalendar
            ? Math.max(1, countWorkingDays(task.start_time, task.end_time, project))
            : Math.max(1, dayIndex(task.end_time) - dayIndex(task.start_time) + 1)
    }
    const edges = dependencies.filter(
        edge => byId.has(edge.predecessor_task_id) && byId.has(edge.successor_task_id)
    )
    const predecessors = new Map(ids.map(id => [id, []]))
    const successors = new Map(ids.map(id => [id, []]))

    for (const edge of edges) {
        const lag = Math.ceil((edge.lag_minutes || 0) / 1440)
        predecessors.get(edge.successor_task_id).push({ id: edge.predecessor_task_id, lag })
        successors.get(edge.predecessor_task_id).push({ id: edge.successor_task_id, lag })
    }

    const indegree = new Map(ids.map(id => [id, predecessors.get(id).length]))
    const queue = ids.filter(id => indegree.get(id) === 0)
    const order = []
    let queueIndex = 0

    while (queueIndex < queue.length) {
        const id = queue[queueIndex++]
        order.push(id)
        for (const { id: successorId } of successors.get(id)) {
            indegree.set(successorId, indegree.get(successorId) - 1)
            if (indegree.get(successorId) === 0) queue.push(successorId)
        }
    }

    if (order.length !== ids.length) return { ...emptyResult, hasCycle: true }

    const earliestStart = new Map()
    const earliestFinish = new Map()
    for (const id of order) {
        const task = byId.get(id)
        let start = timeIndex(task.start_time)
        for (const { id: predecessorId, lag } of predecessors.get(id)) {
            start = Math.max(start, earliestFinish.get(predecessorId) + 1 + lag)
        }
        earliestStart.set(id, start)
        earliestFinish.set(id, start + durationOf(task) - 1)
    }

    const projectFinish = Math.max(...ids.map(id => earliestFinish.get(id)))
    const latestStart = new Map()
    const latestFinish = new Map()
    for (let index = order.length - 1; index >= 0; index--) {
        const id = order[index]
        const outgoing = successors.get(id)
        let finish = outgoing.length === 0 ? projectFinish : Infinity
        for (const { id: successorId, lag } of outgoing) {
            finish = Math.min(finish, latestStart.get(successorId) - 1 - lag)
        }
        latestFinish.set(id, finish)
        latestStart.set(id, finish - durationOf(byId.get(id)) + 1)
    }

    const info = new Map()
    const critical = new Set()
    for (const id of ids) {
        const slack = latestStart.get(id) - earliestStart.get(id)
        const timing = {
            es: earliestStart.get(id),
            ef: earliestFinish.get(id),
            ls: latestStart.get(id),
            lf: latestFinish.get(id),
            slack,
            duration: durationOf(byId.get(id))
        }
        info.set(id, {
            ...timing,
            esText: formatTime(timing.es),
            efText: formatTime(timing.ef),
            lsText: formatTime(timing.ls),
            lfText: formatTime(timing.lf)
        })
        if (slack <= 0) critical.add(id)
    }

    const criticalEdges = new Set()
    for (const edge of edges) {
        if (!critical.has(edge.predecessor_task_id) || !critical.has(edge.successor_task_id))
            continue
        const lag = Math.ceil((edge.lag_minutes || 0) / 1440)
        const constrained =
            latestStart.get(edge.successor_task_id) -
                earliestFinish.get(edge.predecessor_task_id) -
                1 -
                lag ===
            0
        if (constrained) criticalEdges.add(edge.id)
    }

    return { critical, edges: criticalEdges, info, projectFinish, hasCycle: false }
}
