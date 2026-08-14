import { describe, expect, it } from 'vitest'
import { calculateCriticalPath } from '../../modules/gantt/utils/criticalPath.js'

const task = (id, start, end, type = 'Task') => ({
    id,
    name: id,
    start_time: `${start} 00:00:00`,
    end_time: `${end} 00:00:00`,
    type
})

const edge = (id, predecessor, successor, lagMinutes = 0) => ({
    id,
    predecessor_task_id: predecessor,
    successor_task_id: successor,
    dependency_type: 'FS',
    lag_minutes: lagMinutes
})

describe('calculateCriticalPath', () => {
    it('marks a linear dependency chain as critical', () => {
        const result = calculateCriticalPath(
            [task('A', '2026-01-01', '2026-01-02'), task('B', '2026-01-03', '2026-01-05')],
            [edge('A-B', 'A', 'B')]
        )

        expect(result.hasCycle).toBe(false)
        expect(result.critical).toEqual(new Set(['A', 'B']))
        expect(result.edges).toEqual(new Set(['A-B']))
        expect(result.info.get('A').slack).toBe(0)
        expect(result.info.get('B').esText).toBe('2026-01-03')
    })

    it('calculates slack for a shorter parallel branch', () => {
        const result = calculateCriticalPath(
            [
                task('long', '2026-01-01', '2026-01-05'),
                task('short', '2026-01-01', '2026-01-02'),
                task('finish', '2026-01-06', '2026-01-06', 'Milestone')
            ],
            [edge('long-finish', 'long', 'finish'), edge('short-finish', 'short', 'finish')]
        )

        expect(result.critical).toEqual(new Set(['long', 'finish']))
        expect(result.info.get('short').slack).toBe(3)
        expect(result.edges).toEqual(new Set(['long-finish']))
    })

    it('applies whole-day lag to finish-to-start dependencies', () => {
        const result = calculateCriticalPath(
            [task('A', '2026-01-01', '2026-01-01'), task('B', '2026-01-01', '2026-01-01')],
            [edge('A-B', 'A', 'B', 2 * 1440)]
        )

        expect(result.info.get('B').esText).toBe('2026-01-04')
    })

    it('uses project working days when a calendar is provided', () => {
        const project = {
            calendar_country: 'XX',
            weekend_days: '[0,6]',
            calendar_exceptions: '[]'
        }
        const result = calculateCriticalPath(
            [task('A', '2026-07-17', '2026-07-17'), task('B', '2026-07-20', '2026-07-20')],
            [edge('A-B', 'A', 'B')],
            project
        )

        expect(result.info.get('B').esText).toBe('2026-07-20')
        expect(result.info.get('A').duration).toBe(1)
        expect(result.critical).toEqual(new Set(['A', 'B']))
    })

    it('ignores dangling dependencies and invalid dates', () => {
        const result = calculateCriticalPath(
            [task('A', '2026-01-01', '2026-01-01'), task('invalid', '', '')],
            [edge('missing', 'A', 'missing')]
        )

        expect(result.info.has('invalid')).toBe(false)
        expect(result.edges.size).toBe(0)
        expect(result.critical).toEqual(new Set(['A']))
    })

    it('reports cycles without returning misleading critical tasks', () => {
        const result = calculateCriticalPath(
            [task('A', '2026-01-01', '2026-01-01'), task('B', '2026-01-02', '2026-01-02')],
            [edge('A-B', 'A', 'B'), edge('B-A', 'B', 'A')]
        )

        expect(result.hasCycle).toBe(true)
        expect(result.critical.size).toBe(0)
        expect(result.info.size).toBe(0)
    })

    it('processes a 1000-task chain within the performance budget', () => {
        const tasks = []
        const dependencies = []
        for (let index = 0; index < 1000; index++) {
            const date = new Date(Date.UTC(2026, 0, 1 + index))
            const iso = date.toISOString().slice(0, 10)
            tasks.push(task(`T${index}`, iso, iso))
            if (index > 0) dependencies.push(edge(`E${index}`, `T${index - 1}`, `T${index}`))
        }

        const startedAt = performance.now()
        const result = calculateCriticalPath(tasks, dependencies)
        const elapsed = performance.now() - startedAt

        expect(result.critical.size).toBe(1000)
        expect(result.edges.size).toBe(999)
        expect(elapsed).toBeLessThan(500)
    })
})
