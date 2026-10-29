import { describe, expect, it } from 'vitest'
import { ganttTaskRows } from '../../modules/gantt/utils/taskRows.js'
const parse = value => (value ? new Date(value) : null)
describe('complete Gantt hierarchy', () => {
    const tasks = [
        { id: 'second', parent: '', sort_order: 2, start_time: '' },
        {
            id: 'child2',
            parent: 'parent',
            sort_order: 2,
            start_time: '2026-11-03',
            end_time: '2026-11-05'
        },
        { id: 'parent', parent: '', sort_order: 1, start_time: '2000-01-01' },
        { id: 'empty', parent: 'parent', sort_order: 3, start_time: '' },
        { id: 'child1', parent: 'parent', sort_order: 1, start_time: '2026-11-01', end_time: '' }
    ]
    it('includes unscheduled rows in stable sibling order without mutations', () => {
        const before = JSON.stringify(tasks)
        const rows = ganttTaskRows(tasks, parse)
        expect(rows.map(row => [row.id, row.level])).toEqual([
            ['parent', 0],
            ['child1', 1],
            ['child2', 1],
            ['empty', 1],
            ['second', 0]
        ])
        expect(rows[0]).toMatchObject({
            start_time: '2026-11-01',
            end_time: '2026-11-05',
            hasChildren: true
        })
        expect(JSON.stringify(tasks)).toBe(before)
    })
    it('collapses subtrees without changing parent date envelope', () => {
        const rows = ganttTaskRows(tasks, parse, new Set(['parent']))
        expect(rows.map(row => row.id)).toEqual(['parent', 'second'])
        expect(rows[0].end_time).toBe('2026-11-05')
    })
    it('clears stale parent dates when children are unscheduled', () => {
        const rows = ganttTaskRows([tasks[2], tasks[3]], parse)
        expect(rows[0].start_time).toBe('')
        expect(rows[0].end_time).toBe('')
    })
})
