import Holidays from 'date-holidays'

const holidayCache = new Map()

export const DEFAULT_CALENDAR = Object.freeze({
    calendar_country: 'CN',
    calendar_region: '',
    weekend_days: '[0,6]',
    calendar_exceptions: '[]'
})

function parseJson(value, fallback) {
    if (Array.isArray(value)) return value
    try {
        const parsed = JSON.parse(value || '')
        return Array.isArray(parsed) ? parsed : fallback
    } catch {
        return fallback
    }
}

export function dateKey(value) {
    const date = value instanceof Date ? value : new Date(String(value || '').replace(' ', 'T'))
    if (Number.isNaN(date.getTime())) return ''
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
        date.getDate()
    ).padStart(2, '0')}`
}

export function normalizeCalendar(project = {}) {
    return {
        country: project.calendar_country || DEFAULT_CALENDAR.calendar_country,
        region: project.calendar_region || '',
        weekendDays: parseJson(project.weekend_days, [0, 6]).map(Number),
        exceptions: parseJson(project.calendar_exceptions, []).filter(item => item?.date)
    }
}

function holidaysForYear(config, year) {
    const cacheKey = `${config.country}:${config.region}:${year}`
    if (holidayCache.has(cacheKey)) return holidayCache.get(cacheKey)
    let holidays = []
    try {
        const calendar = new Holidays(config.country, config.region || undefined)
        holidays = calendar
            .getHolidays(year)
            .filter(item => item.type === 'public')
            .map(item => ({ date: item.date.slice(0, 10), name: item.name }))
    } catch {
        holidays = []
    }
    const map = new Map(holidays.map(item => [item.date, item.name]))
    holidayCache.set(cacheKey, map)
    return map
}

export function getWorkdayInfo(value, project = {}) {
    const date =
        value instanceof Date ? new Date(value) : new Date(String(value || '').replace(' ', 'T'))
    if (Number.isNaN(date.getTime())) return { working: false, reason: 'invalid', name: '' }
    const config = normalizeCalendar(project)
    const key = dateKey(date)
    const custom = config.exceptions.find(item => item.date === key)
    if (custom) {
        return {
            working: custom.type === 'working',
            reason: custom.type === 'working' ? 'custom-working' : 'custom-holiday',
            name: custom.name || ''
        }
    }
    const holidayName = holidaysForYear(config, date.getFullYear()).get(key)
    if (holidayName) return { working: false, reason: 'public-holiday', name: holidayName }
    if (config.weekendDays.includes(date.getDay())) {
        return { working: false, reason: 'weekend', name: '' }
    }
    return { working: true, reason: 'workday', name: '' }
}

export function calculateEndDate(startValue, effortDays, project = {}) {
    const start =
        startValue instanceof Date
            ? new Date(startValue)
            : new Date(String(startValue || '').replace(' ', 'T'))
    const effort = Number(effortDays)
    if (Number.isNaN(start.getTime()) || !Number.isFinite(effort) || effort <= 0) return null

    const requiredDays = Math.ceil(effort)
    const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate())
    let completed = 0
    let guard = 0
    while (completed < requiredDays && guard < 3660) {
        if (getWorkdayInfo(cursor, project).working) completed += 1
        if (completed < requiredDays) cursor.setDate(cursor.getDate() + 1)
        guard += 1
    }
    return completed === requiredDays ? cursor : null
}

export function countWorkingDays(startValue, endValue, project = {}) {
    const start =
        startValue instanceof Date
            ? new Date(startValue)
            : new Date(String(startValue || '').replace(' ', 'T'))
    const end =
        endValue instanceof Date
            ? new Date(endValue)
            : new Date(String(endValue || '').replace(' ', 'T'))
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return 0
    const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate())
    const last = new Date(end.getFullYear(), end.getMonth(), end.getDate())
    let count = 0
    while (cursor <= last) {
        if (getWorkdayInfo(cursor, project).working) count += 1
        cursor.setDate(cursor.getDate() + 1)
    }
    return count
}

export function nextWorkingDay(value, project = {}, offset = 0) {
    const source =
        value instanceof Date ? new Date(value) : new Date(String(value || '').replace(' ', 'T'))
    if (Number.isNaN(source.getTime())) return null
    const cursor = new Date(source.getFullYear(), source.getMonth(), source.getDate())
    cursor.setDate(cursor.getDate() + 1)
    let remaining = Math.max(0, Math.ceil(Number(offset) || 0))
    let guard = 0
    while (guard < 3660) {
        if (getWorkdayInfo(cursor, project).working) {
            if (remaining === 0) return cursor
            remaining -= 1
        }
        cursor.setDate(cursor.getDate() + 1)
        guard += 1
    }
    return null
}

export function workingDayDelta(fromValue, toValue, project = {}) {
    const from =
        fromValue instanceof Date
            ? new Date(fromValue)
            : new Date(String(fromValue || '').replace(' ', 'T'))
    const to =
        toValue instanceof Date
            ? new Date(toValue)
            : new Date(String(toValue || '').replace(' ', 'T'))
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return 0
    const fromKey = dateKey(from)
    const toKey = dateKey(to)
    if (fromKey === toKey) return 0
    if (from < to) return countWorkingDays(nextWorkingDay(from, project), to, project)
    return -countWorkingDays(nextWorkingDay(to, project), from, project)
}

export function getCountries(locale = 'en') {
    const names = new Holidays().getCountries(locale) || {}
    return Object.entries(names)
        .map(([value, label]) => ({ value, label }))
        .sort((left, right) => left.label.localeCompare(right.label, locale))
}

export function getRegions(country, locale = 'en') {
    if (!country) return []
    const names = new Holidays().getStates(country, locale) || {}
    return Object.entries(names)
        .map(([value, label]) => ({ value, label }))
        .sort((left, right) => left.label.localeCompare(right.label, locale))
}
