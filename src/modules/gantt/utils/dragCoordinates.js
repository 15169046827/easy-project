export const DRAG_THRESHOLD = 8

// Calendar-day coordinates avoid DST-dependent elapsed-hour arithmetic.
export function calendarDayNumber(date) {
    return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000
}

export function calendarDate(day) {
    const utc = new Date(day * 86400000)
    return new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate())
}

export function isDragGesture(start, event) {
    return (
        Math.hypot(event.clientX - start.startClientX, event.clientY - start.startClientY) >=
        DRAG_THRESHOLD
    )
}
