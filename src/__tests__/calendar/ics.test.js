import { describe, expect, it } from 'vitest'
import {
    generateProjectIcs,
    mergeIcsAvailability,
    parseIcsEvents
} from '../../modules/calendar/utils/ics.js'

describe('ICS calendar exchange', () => {
    it('exports tasks as inclusive all-day events with escaped text', () => {
        const result = generateProjectIcs(
            { name: 'Launch, phase 1' },
            [
                {
                    id: 'task-1',
                    name: 'Review; plan',
                    start_time: '2026-07-01',
                    end_time: '2026-07-03',
                    progress: 50
                }
            ],
            { now: new Date('2026-06-01T00:00:00Z') }
        )
        expect(result).toContain('X-WR-CALNAME:Launch\\, phase 1')
        expect(result).toContain('DTSTART;VALUE=DATE:20260701')
        expect(result).toContain('DTEND;VALUE=DATE:20260704')
        expect(result).toContain('SUMMARY:Review\\; plan')
        expect(result).toContain('UID:task-1@easyproject')
    })

    it('parses folded, all-day and timed events while ignoring transparent events', () => {
        const events = parseIcsEvents(
            'BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nUID:busy-1\r\nDTSTART;VALUE=DATE:20260701\r\nDTEND;VALUE=DATE:20260704\r\nSUMMARY:Customer\\, wor\r\n kshop\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nDTSTART:20260708T090000Z\r\nDTEND:20260709T000000Z\r\nSUMMARY:Travel\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nDTSTART;VALUE=DATE:20260710\r\nTRANSP:TRANSPARENT\r\nEND:VEVENT\r\nEND:VCALENDAR'
        )
        expect(events).toEqual([
            {
                uid: 'busy-1',
                summary: 'Customer, workshop',
                startDate: '2026-07-01',
                endDate: '2026-07-03'
            },
            { uid: '', summary: 'Travel', startDate: '2026-07-08', endDate: '2026-07-08' }
        ])
    })

    it('uses the start date when DTEND is omitted', () => {
        expect(
            parseIcsEvents('BEGIN:VEVENT\nDTSTART;VALUE=DATE:20260712\nSUMMARY:Leave\nEND:VEVENT')
        ).toEqual([{ uid: '', summary: 'Leave', startDate: '2026-07-12', endDate: '2026-07-12' }])
    })

    it('merges events into member availability and skips repeated UIDs', () => {
        const existing = [
            {
                name: 'Existing',
                start_date: '2026-07-01',
                end_date: '2026-07-01',
                type: 'leave',
                source_uid: 'busy-1'
            }
        ]
        const result = mergeIcsAvailability(existing, [
            { uid: 'busy-1', summary: 'Duplicate', startDate: '2026-07-02', endDate: '2026-07-02' },
            { uid: 'busy-2', summary: 'Conference', startDate: '2026-07-03', endDate: '2026-07-04' }
        ])
        expect(result.imported).toBe(1)
        expect(result.skipped).toBe(1)
        expect(result.items.at(-1)).toMatchObject({
            name: 'Conference',
            start_date: '2026-07-03',
            end_date: '2026-07-04',
            source: 'ics',
            source_uid: 'busy-2'
        })
    })
})
