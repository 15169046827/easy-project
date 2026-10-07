import { getWorkdayInfo } from '../../calendar/utils/workCalendar.js'

export function taskViewRange(tasks, parse, dayStart, now = new Date()) {
    const timestamps = tasks
        .flatMap(task => [parse(task.start_time), parse(task.end_time)])
        .filter(Boolean)
        .map(date => date.getTime())
    const start = timestamps.length ? new Date(Math.min(...timestamps)) : new Date(now)
    const end = timestamps.length ? new Date(Math.max(...timestamps)) : new Date(now)
    start.setDate(start.getDate() - 3)
    end.setDate(end.getDate() + 7)
    const minimumEnd = new Date(start)
    minimumEnd.setDate(minimumEnd.getDate() + 34)
    if (end < minimumEnd) end.setTime(minimumEnd.getTime())
    return { start: dayStart(start), end: dayStart(end) }
}

export function viewportDays(range, project, todayStart, dayStart) {
    const result = []
    for (let date = new Date(range.start); date <= range.end; date.setDate(date.getDate() + 1)) {
        const copy = new Date(date)
        const workday = getWorkdayInfo(copy, project)
        result.push({
            key: copy.toISOString(),
            day: copy.getDate(),
            weekday: copy.toLocaleDateString(undefined, { weekday: 'short' }),
            today: dayStart(copy).getTime() === todayStart,
            working: workday.working,
            name: workday.name
        })
    }
    return result
}

export function viewportMonths(days, t) {
    const result = []
    let current = null
    for (const day of days) {
        const date = new Date(day.key)
        const key = `${date.getFullYear()}-${date.getMonth()}`
        const label = t('gantt.monthFormat', {
            year: date.getFullYear(),
            month: date.getMonth() + 1
        })
        if (!current || current.key !== key) {
            current = { key, label, count: 1, containsToday: day.today }
            result.push(current)
        } else {
            current.count++
            if (day.today) current.containsToday = true
        }
    }
    return result
}
