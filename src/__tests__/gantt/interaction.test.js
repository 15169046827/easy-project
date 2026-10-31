import { describe, expect, it } from 'vitest'
import {
    calculateDragDelta,
    calculateDragUpdate,
    createTaskCreatePayload,
    createTaskEditPayload,
    evaluateDependency
} from '../../modules/gantt/utils/interaction.js'

const localDate = day => new Date(2026, 6, day, 0, 0, 0)
const dayOfMonth = date => date.getDate()
const dependency = (from, to) => ({
    predecessor_task_id: from,
    successor_task_id: to
})

describe('Gantt drag calculations', () => {
    it('rounds pointer movement to the closest calendar day', () => {
        expect(calculateDragDelta(100, 149, 40)).toBe(1)
        expect(calculateDragDelta(100, 151, 40)).toBe(1)
        expect(calculateDragDelta(100, 79, 40)).toBe(-1)
        expect(calculateDragDelta(100, 200, 0)).toBe(0)
    })

    it('moves start and end dates by the same number of days', () => {
        const update = calculateDragUpdate(localDate(10), localDate(13), 2, 'move')

        expect(update.kind).toBe('update')
        expect(dayOfMonth(update.start)).toBe(12)
        expect(dayOfMonth(update.end)).toBe(15)
    })

    it('never turns a zero-day move or resize into an edit or mutation', () => {
        for (const mode of ['move', 'resize-left', 'resize-right'])
            expect(calculateDragUpdate(localDate(10), localDate(13), 0, mode)).toBeNull()
    })

    it('moves zero-duration milestones without expanding them', () => {
        const update = calculateDragUpdate(localDate(10), localDate(10), 2, 'move')

        expect(dayOfMonth(update.start)).toBe(12)
        expect(dayOfMonth(update.end)).toBe(12)
    })

    it('resizes one edge and rejects inverted ranges', () => {
        const left = calculateDragUpdate(localDate(10), localDate(13), -2, 'resize-left')
        const right = calculateDragUpdate(localDate(10), localDate(13), 2, 'resize-right')

        expect(dayOfMonth(left.start)).toBe(8)
        expect(dayOfMonth(left.end)).toBe(13)
        expect(dayOfMonth(right.start)).toBe(10)
        expect(dayOfMonth(right.end)).toBe(15)
        expect(calculateDragUpdate(localDate(10), localDate(13), 3, 'resize-left').start).toEqual(
            localDate(13)
        )
        expect(calculateDragUpdate(localDate(10), localDate(13), -3, 'resize-right').end).toEqual(
            localDate(10)
        )
        expect(calculateDragUpdate(localDate(10), localDate(13), 4, 'resize-left')).toBeNull()
        expect(calculateDragUpdate(localDate(10), localDate(13), -4, 'resize-right')).toBeNull()
    })
})

describe('Gantt dependency validation', () => {
    it('creates a unique predecessor list for a valid dependency', () => {
        expect(evaluateDependency([dependency('a', 'c')], 'b', 'c')).toEqual({
            allowed: true,
            reason: null,
            predecessorIds: ['a', 'b']
        })
    })

    it('rejects self and duplicate dependencies', () => {
        expect(evaluateDependency([], 'a', 'a').reason).toBe('self')
        expect(evaluateDependency([dependency('a', 'b')], 'a', 'b').reason).toBe('duplicate')
    })

    it('rejects dependencies that would introduce a direct or transitive cycle', () => {
        const dependencies = [dependency('a', 'b'), dependency('b', 'c')]

        expect(evaluateDependency(dependencies, 'c', 'a').reason).toBe('cycle')
        expect(evaluateDependency(dependencies, 'b', 'a').reason).toBe('cycle')
    })
})

describe('Gantt task editing', () => {
    it('builds a complete backend payload for a task created on the timeline', () => {
        expect(
            createTaskCreatePayload('project-1', {
                name: '  Plan release  ',
                start_time: '2026-07-20',
                end_time: '2026-07-22',
                type: 'Task',
                priority: '3',
                status: 'Pending',
                effort_days: 3,
                comment: 'Coordinate the launch',
                assignee: 'member-1'
            })
        ).toEqual({
            project_id: 'project-1',
            name: 'Plan release',
            parent: '',
            dependence: '',
            start_time: '2026-07-20 00:00:00',
            end_time: '2026-07-22 00:00:00',
            type: 'Task',
            priority: '3',
            status: 'Pending',
            progress: 0,
            effort_days: 3,
            effort_state: 'estimated',
            schedule_mode: 'fixed_effort',
            comment: 'Coordinate the launch',
            assignee: 'member-1'
        })
    })

    it('persists the selected assignee with the other editable task fields', () => {
        expect(
            createTaskEditPayload('task-1', {
                name: 'Build release',
                start_time: '2026-07-20',
                end_time: '2026-07-22',
                type: 'Task',
                status: 'InProgress',
                progress: '40',
                effort_days: 3,
                assignee: 'member-1'
            })
        ).toEqual({
            id: 'task-1',
            name: 'Build release',
            start_time: '2026-07-20 00:00:00',
            end_time: '2026-07-22 00:00:00',
            type: 'Task',
            status: 'InProgress',
            progress: 40,
            effort_days: 3,
            effort_state: 'estimated',
            schedule_mode: 'fixed_effort',
            assignee: 'member-1'
        })
    })
})
