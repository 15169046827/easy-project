import { dateKey } from './workCalendar.js'

function escapeText(value = '') {
    return String(value)
        .replace(/\\/g, '\\\\')
        .replace(/\r?\n/g, '\\n')
        .replace(/,/g, '\\,')
        .replace(/;/g, '\\;')
}

function unescapeText(value = '') {
    return String(value)
        .replace(/\\[nN]/g, '\n')
        .replace(/\\([,;\\])/g, '$1')
}

function compactDate(value) {
    return dateKey(value).replaceAll('-', '')
}

function shiftDate(key, days) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key)
    if (!match) return ''
    const value = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
    value.setUTCDate(value.getUTCDate() + days)
    return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, '0')}-${String(
        value.getUTCDate()
    ).padStart(2, '0')}`
}

function formatTimestamp(value) {
    const date = value instanceof Date ? value : new Date(value)
    return date
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}Z$/, 'Z')
}

function foldLine(line) {
    const chunks = []
    let remaining = line
    while (remaining.length > 75) {
        chunks.push(remaining.slice(0, 75))
        remaining = remaining.slice(75)
    }
    chunks.push(remaining)
    return chunks.join('\r\n ')
}

export function generateProjectIcs(project = {}, tasks = [], options = {}) {
    const now = options.now || new Date()
    const projectName = project.name || 'EasyProject'
    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//EasyProject//Project Calendar//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        `X-WR-CALNAME:${escapeText(projectName)}`
    ]

    for (const task of tasks) {
        const start = dateKey(task.start_time)
        const end = dateKey(task.end_time)
        if (!start || !end || start > end) continue
        const details = [
            project.name ? `Project: ${project.name}` : '',
            task.status ? `Status: ${task.status}` : '',
            task.progress !== undefined && task.progress !== null
                ? `Progress: ${task.progress}%`
                : '',
            task.assignee_name || task.assignee
                ? `Assignee: ${task.assignee_name || task.assignee}`
                : ''
        ].filter(Boolean)

        lines.push(
            'BEGIN:VEVENT',
            `UID:${escapeText(`${task.id || `${start}-${task.name || 'task'}`}@easyproject`)}`,
            `DTSTAMP:${formatTimestamp(now)}`,
            `DTSTART;VALUE=DATE:${compactDate(start)}`,
            `DTEND;VALUE=DATE:${compactDate(shiftDate(end, 1))}`,
            `SUMMARY:${escapeText(task.name || 'Untitled task')}`,
            `DESCRIPTION:${escapeText(details.join('\n'))}`,
            `CATEGORIES:EasyProject,${task.is_milestone ? 'Milestone' : 'Task'}`,
            'END:VEVENT'
        )
    }
    lines.push('END:VCALENDAR')
    return `${lines.map(foldLine).join('\r\n')}\r\n`
}

function unfoldLines(text) {
    return String(text || '')
        .replace(/\r?\n[ \t]/g, '')
        .split(/\r?\n/)
}

function property(line) {
    const separator = line.indexOf(':')
    if (separator < 0) return null
    const left = line.slice(0, separator)
    const [name, ...parameters] = left.split(';')
    return {
        name: name.toUpperCase(),
        parameters: Object.fromEntries(
            parameters.map(item => {
                const [key, ...values] = item.split('=')
                return [key.toUpperCase(), values.join('=')]
            })
        ),
        value: line.slice(separator + 1)
    }
}

function parseCalendarDate(value) {
    const match = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?)?/.exec(value || '')
    if (!match) return null
    return {
        date: `${match[1]}-${match[2]}-${match[3]}`,
        dateTime: Boolean(match[4]),
        midnight: Boolean(match[4]) && match[4] === '00' && match[5] === '00'
    }
}

export function parseIcsEvents(text) {
    const events = []
    let current = null
    for (const line of unfoldLines(text)) {
        if (line.toUpperCase() === 'BEGIN:VEVENT') {
            current = {}
            continue
        }
        if (line.toUpperCase() === 'END:VEVENT') {
            if (current && current.status !== 'CANCELLED' && current.transp !== 'TRANSPARENT') {
                const start = parseCalendarDate(current.start?.value)
                const end = parseCalendarDate(current.end?.value)
                if (start) {
                    let endDate = end?.date || start.date
                    const allDayEnd = current.end?.parameters?.VALUE === 'DATE' || !end?.dateTime
                    if (end && endDate > start.date && (allDayEnd || end.midnight)) {
                        endDate = shiftDate(endDate, -1)
                    }
                    if (endDate < start.date) endDate = start.date
                    events.push({
                        uid: unescapeText(current.uid || ''),
                        summary: unescapeText(current.summary || ''),
                        startDate: start.date,
                        endDate
                    })
                }
            }
            current = null
            continue
        }
        if (!current) continue
        const item = property(line)
        if (!item) continue
        if (item.name === 'DTSTART') current.start = item
        if (item.name === 'DTEND') current.end = item
        if (item.name === 'UID') current.uid = item.value
        if (item.name === 'SUMMARY') current.summary = item.value
        if (item.name === 'STATUS') current.status = item.value.toUpperCase()
        if (item.name === 'TRANSP') current.transp = item.value.toUpperCase()
    }
    return events
}

export function mergeIcsAvailability(existing = [], events = []) {
    const items = Array.isArray(existing) ? [...existing] : []
    const identities = new Set(
        items.map(item =>
            item.source_uid
                ? `uid:${item.source_uid}`
                : `range:${item.start_date}:${item.end_date}:${item.name || ''}`
        )
    )
    let imported = 0
    let skipped = 0
    for (const event of events) {
        const identity = event.uid
            ? `uid:${event.uid}`
            : `range:${event.startDate}:${event.endDate}:${event.summary || ''}`
        if (identities.has(identity)) {
            skipped += 1
            continue
        }
        items.push({
            name: event.summary || 'Calendar busy',
            start_date: event.startDate,
            end_date: event.endDate,
            type: 'leave',
            source: 'ics',
            ...(event.uid ? { source_uid: event.uid } : {})
        })
        identities.add(identity)
        imported += 1
    }
    return { items, imported, skipped }
}
