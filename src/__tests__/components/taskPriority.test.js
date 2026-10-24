import { describe, expect, it } from 'vitest'
import { priorityRank } from '../../utils/taskPriority'
describe('shared priority presentation', () => {
    it('maps documented aliases and numeric values consistently without rewriting data', () => {
        for (const [input, rank] of [
            ['1', 1],
            ['High', 2],
            ['Normal', 3],
            ['Low', 4],
            ['5', 5]
        ])
            expect(priorityRank(input)).toBe(rank)
        for (const input of ['Urgent', '', 0, 6, '1.5']) expect(priorityRank(input)).toBeNull()
    })
})
