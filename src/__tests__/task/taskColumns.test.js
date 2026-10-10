import { describe, expect, it } from 'vitest'
import {
    defaultTaskColumns,
    normalizeTaskColumns,
    readTaskColumns
} from '../../modules/task/utils/taskColumns.js'

describe('task column preferences', () => {
    it('keeps parent and predecessors visible by default', () => {
        expect(defaultTaskColumns).toEqual(expect.arrayContaining(['parent', '_predecessorIds']))
    })
    it('ignores unknown and duplicate columns, with name always independently pinned', () => {
        expect(normalizeTaskColumns(['parent', 'parent', 'invalid', 'name'])).toEqual(['parent'])
    })
    it('allows hiding every optional column', () => {
        expect(normalizeTaskColumns([])).toEqual([])
    })
    it('recovers from broken or inaccessible preference storage', () => {
        expect(readTaskColumns({ getItem: () => '{bad' }, 'key')).toEqual(defaultTaskColumns)
        expect(
            readTaskColumns(
                {
                    getItem: () => {
                        throw new Error('denied')
                    }
                },
                'key'
            )
        ).toEqual(defaultTaskColumns)
    })
})
