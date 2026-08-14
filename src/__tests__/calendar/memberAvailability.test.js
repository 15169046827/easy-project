import { describe, expect, it } from 'vitest'
import {
    availabilityConflictDates,
    parseAvailabilityExceptions,
    taskAvailabilityConflict
} from '../../modules/calendar/utils/memberAvailability.js'

const project = {
    calendar_country: 'XX',
    weekend_days: '[0,6]',
    calendar_exceptions: '[]'
}

const member = {
    id: 'member-1',
    name: 'Alice',
    availability_exceptions: JSON.stringify([
        { start_date: '2026-07-20', end_date: '2026-07-21', type: 'leave', name: 'Annual leave' }
    ])
}

describe('member availability', () => {
    it('parses malformed values safely', () => {
        expect(parseAvailabilityExceptions({ availability_exceptions: 'bad json' })).toEqual([])
    })

    it('reports only working-day overlaps', () => {
        expect(
            availabilityConflictDates(
                { start_time: '2026-07-18', end_time: '2026-07-21' },
                member,
                project
            )
        ).toEqual(['2026-07-20', '2026-07-21'])
    })

    it('resolves the assignee from a member collection', () => {
        expect(
            taskAvailabilityConflict(
                {
                    assignee: 'member-1',
                    start_time: '2026-07-20',
                    end_time: '2026-07-20'
                },
                [member],
                project
            )
        ).toMatchObject({ conflict: true, dates: ['2026-07-20'] })
    })
})
