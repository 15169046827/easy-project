import { describe, expect, it } from 'vitest'
import {
    taskViewRange,
    viewportDays,
    viewportMonths
} from '../../modules/gantt/utils/viewportCalendar.js'
const parse = value => {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
}
const dayStart = date => new Date(date.getFullYear(), date.getMonth(), date.getDate())
const project = { calendar_country: 'US', weekend_days: '[0,6]' }
describe('Gantt viewport calendar calculations', () => {
    it('pads the task range and preserves a minimum 35-day inclusive view', () => {
        const range = taskViewRange(
            [{ start_time: '2026-11-02', end_time: '2026-11-03' }],
            parse,
            dayStart
        )
        expect(range.start).toEqual(new Date(2026, 9, 30))
        expect(range.end).toEqual(new Date(2026, 11, 3))
    })
    it('uses the supplied current date for an empty or invalid schedule', () => {
        const now = new Date(2026, 10, 2)
        const range = taskViewRange(
            [{ start_time: 'invalid', end_time: 'invalid' }],
            parse,
            dayStart,
            now
        )
        expect(range.start).toEqual(new Date(2026, 9, 30))
        expect(now).toEqual(new Date(2026, 10, 2))
    })
    it('produces inclusive days with workday and today flags', () => {
        const start = new Date(2026, 10, 6),
            end = new Date(2026, 10, 9)
        const days = viewportDays({ start, end }, project, start.getTime(), dayStart)
        expect(days).toHaveLength(4)
        expect(days.map(day => day.working)).toEqual([true, false, false, true])
        expect(days.map(day => day.today)).toEqual([true, false, false, false])
        expect(start.getDate()).toBe(6)
    })
    it('groups month boundaries without losing today ownership', () => {
        const start = new Date(2026, 9, 31),
            end = new Date(2026, 10, 2)
        const days = viewportDays({ start, end }, project, end.getTime(), dayStart)
        const months = viewportMonths(days, (_key, values) => `${values.year}/${values.month}`)
        expect(months.map(month => month.count)).toEqual([1, 2])
        expect(months.map(month => month.containsToday)).toEqual([false, true])
        expect(months[1].label).toBe('2026/11')
    })
})
