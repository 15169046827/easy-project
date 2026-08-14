import { dateKey, getWorkdayInfo } from './workCalendar.js'

export function parseAvailabilityExceptions(member = {}) {
    if (Array.isArray(member.availability_exceptions)) return member.availability_exceptions
    try {
        const parsed = JSON.parse(member.availability_exceptions || '[]')
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}

export function availabilityConflictDates(task, member, project = {}) {
    if (!task?.start_time || !task?.end_time || !member) return []
    const start = new Date(String(task.start_time).replace(' ', 'T'))
    const end = new Date(String(task.end_time).replace(' ', 'T'))
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return []

    const ranges = parseAvailabilityExceptions(member).filter(
        item => item?.start_date && item?.end_date && item.type !== 'available'
    )
    if (!ranges.length) return []

    const conflicts = []
    const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate())
    const last = new Date(end.getFullYear(), end.getMonth(), end.getDate())
    while (cursor <= last) {
        const key = dateKey(cursor)
        if (
            getWorkdayInfo(cursor, project).working &&
            ranges.some(range => key >= range.start_date && key <= range.end_date)
        ) {
            conflicts.push(key)
        }
        cursor.setDate(cursor.getDate() + 1)
    }
    return conflicts
}

export function taskAvailabilityConflict(task, members, project = {}) {
    const member = Array.isArray(members)
        ? members.find(item => item.id === task?.assignee)
        : members?.[task?.assignee]
    const dates = availabilityConflictDates(task, member, project)
    return { conflict: dates.length > 0, dates, member }
}
