import { describe, expect, it } from 'vitest'
import {
    calculateEndDate,
    countWorkingDays,
    dateKey,
    getWorkdayInfo,
    nextWorkingDay,
    workingDayDelta
} from '../../modules/calendar/utils/workCalendar.js'

const calendar = exceptions => ({
    calendar_country: 'XX',
    weekend_days: '[0,6]',
    calendar_exceptions: JSON.stringify(exceptions || [])
})

describe('work calendar scheduling', () => {
    it('skips weekends when converting effort into an inclusive end date', () => {
        expect(dateKey(calculateEndDate('2026-07-17', 2, calendar()))).toBe('2026-07-20')
    })

    it('lets custom holidays and working days override the weekly calendar', () => {
        const project = calendar([
            { date: '2026-07-20', name: 'Company holiday', type: 'holiday' },
            { date: '2026-07-18', name: 'Release day', type: 'working' }
        ])

        expect(getWorkdayInfo('2026-07-18', project)).toMatchObject({
            working: true,
            reason: 'custom-working'
        })
        expect(dateKey(calculateEndDate('2026-07-17', 2, project))).toBe('2026-07-18')
    })

    it('rounds partial person-days up to the containing calendar day', () => {
        expect(dateKey(calculateEndDate('2026-07-20', 2.5, calendar()))).toBe('2026-07-22')
    })

    it('counts only effective workdays in a manually resized range', () => {
        expect(countWorkingDays('2026-07-17', '2026-07-20', calendar())).toBe(2)
    })

    it('uses the selected country public-holiday calendar offline', () => {
        expect(getWorkdayInfo('2026-10-01', { calendar_country: 'CN' })).toMatchObject({
            working: false,
            reason: 'public-holiday'
        })
        expect(dateKey(calculateEndDate('2026-09-30', 2, { calendar_country: 'CN' }))).toBe(
            '2026-10-05'
        )
    })

    it('finds successor starts and signed variance in working days', () => {
        expect(dateKey(nextWorkingDay('2026-07-17', calendar()))).toBe('2026-07-20')
        expect(dateKey(nextWorkingDay('2026-07-17', calendar(), 1))).toBe('2026-07-21')
        expect(workingDayDelta('2026-07-17', '2026-07-21', calendar())).toBe(2)
        expect(workingDayDelta('2026-07-21', '2026-07-17', calendar())).toBe(-2)
    })
})
