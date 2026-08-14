import { describe, expect, it } from 'vitest'
import {
    canMoveTask,
    flattenTaskTree,
    getDescendantIds,
    getParentOptions,
    getTaskSiblings
} from '../../modules/task/utils/taskTree.js'

const task = (id, parent = '', sortOrder = 0, projectId = 'p1') => ({
    id,
    name: id,
    parent,
    sort_order: sortOrder,
    project_id: projectId
})

describe('task tree utilities', () => {
    it('flattens expanded task trees in sibling order', () => {
        const tasks = [task('child-b', 'root', 2), task('root'), task('child-a', 'root', 1)]

        expect(flattenTaskTree(tasks, new Set(['root']))).toMatchObject([
            { id: 'root', _level: 0, _hasChildren: true },
            { id: 'child-a', _level: 1, _hasChildren: false },
            { id: 'child-b', _level: 1, _hasChildren: false }
        ])
    })

    it('hides descendants of collapsed tasks', () => {
        const result = flattenTaskTree([task('root'), task('child', 'root')])

        expect(result.map(({ id }) => id)).toEqual(['root'])
    })

    it('promotes orphaned and cross-project children to roots', () => {
        const result = flattenTaskTree([
            task('orphan', 'missing'),
            task('foreign-parent', '', 0, 'p2'),
            task('cross-project', 'foreign-parent')
        ])

        expect(result).toHaveLength(3)
        expect(result.every(({ _level }) => _level === 0)).toBe(true)
    })

    it('handles cyclic parent data without recursion or missing tasks', () => {
        const result = flattenTaskTree([task('a', 'b'), task('b', 'a')], new Set(['a', 'b']))

        expect(result.map(({ id }) => id).sort()).toEqual(['a', 'b'])
        expect(result.every(({ _level }) => _level === 0)).toBe(true)
    })

    it('finds descendants safely when malformed data contains a cycle', () => {
        const descendants = getDescendantIds(
            [
                task('root'),
                task('child', 'root'),
                task('grandchild', 'child'),
                task('root', 'grandchild')
            ],
            'root',
            'p1'
        )

        expect([...descendants].sort()).toEqual(['child', 'grandchild'])
    })

    it('excludes self, descendants, and other projects from parent options', () => {
        const root = task('root')
        const child = task('child', 'root')
        const sibling = task('sibling')
        const foreign = task('foreign', '', 0, 'p2')

        expect(getParentOptions([root, child, sibling, foreign], root).map(({ id }) => id)).toEqual(
            ['sibling']
        )
    })

    it('restricts movement to ordered siblings in the same project', () => {
        const first = task('first', 'root', 1)
        const second = task('second', 'root', 2)
        const otherParent = task('other', '', 0)
        const foreign = task('foreign', 'root', 0, 'p2')
        const tasks = [second, otherParent, foreign, first]

        expect(getTaskSiblings(tasks, first).map(({ id }) => id)).toEqual(['first', 'second'])
        expect(canMoveTask(tasks, first, -1)).toBe(false)
        expect(canMoveTask(tasks, first, 1)).toBe(true)
        expect(canMoveTask(tasks, second, 1)).toBe(false)
    })
})
