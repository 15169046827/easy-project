import { describe, expect, it } from 'vitest'
import { calculateDependencySchedule } from '../../modules/calendar/utils/scheduling.js'

const project = {
    calendar_country: 'XX',
    weekend_days: '[0,6]',
    calendar_exceptions: '[]'
}

const task = (id, start, end, extras = {}) => ({
    id,
    name: id,
    start_time: start,
    end_time: end,
    effort_days: 1,
    schedule_mode: 'fixed_effort',
    type: 'Task',
    ...extras
})

const dependency = (from, to, lag = 0) => ({
    predecessor_task_id: from,
    successor_task_id: to,
    dependency_type: 'FS',
    lag_minutes: lag
})

describe('dependency scheduling', () => {
    it('cascades fixed-effort successors across weekends', () => {
        const result = calculateDependencySchedule(
            [
                task('A', '2026-07-17', '2026-07-17'),
                task('B', '2026-07-17', '2026-07-17', { effort_days: 2 }),
                task('C', '2026-07-17', '2026-07-17')
            ],
            [dependency('A', 'B'), dependency('B', 'C')],
            project
        )
        expect(result.updates).toEqual([
            { id: 'B', start_time: '2026-07-20 00:00:00', end_time: '2026-07-21 00:00:00' },
            { id: 'C', start_time: '2026-07-22 00:00:00', end_time: '2026-07-22 00:00:00' }
        ])
    })

    it('reports fixed-date conflicts without moving the task', () => {
        const result = calculateDependencySchedule(
            [
                task('A', '2026-07-20', '2026-07-21'),
                task('B', '2026-07-20', '2026-07-20', { schedule_mode: 'fixed_dates' })
            ],
            [dependency('A', 'B')],
            project
        )
        expect(result.updates).toEqual([])
        expect(result.conflicts).toEqual([{ taskId: 'B', requiredStart: '2026-07-22 00:00:00' }])
    })

    it('applies lag as extra working days', () => {
        const result = calculateDependencySchedule(
            [task('A', '2026-07-17', '2026-07-17'), task('B', '2026-07-17', '2026-07-17')],
            [dependency('A', 'B', 1440)],
            project
        )
        expect(result.updates[0].start_time).toBe('2026-07-21 00:00:00')
    })
})
