import { describe, expect, it } from 'vitest'
import { groupStatusStatistics } from '../../modules/task/utils/statusGroups.js'
describe('workspace overview groups', () => {
    it('merges counts across projects but preserves every dictionary ID and custom name', () => {
        const data = {
            total: 9,
            statuses: [
                {
                    id: 'p-pending',
                    project_id: 'p',
                    builtin_key: 'Pending',
                    name: 'Pending',
                    count: 2
                },
                {
                    id: 'q-pending',
                    project_id: 'q',
                    builtin_key: 'Pending',
                    name: 'Pendiente',
                    count: 3
                },
                { id: 'p-review', project_id: 'p', name: ' Review ', count: 1 },
                { id: 'q-review', project_id: 'q', name: 'review', count: 2 },
                { id: 'done-custom', name: 'Accepted', count: 1 }
            ]
        }
        const copy = structuredClone(data)
        const result = groupStatusStatistics(data)
        expect(result.total).toBe(9)
        expect(result.statuses.map(s => [s.id, s.count, s.statusIds])).toEqual([
            ['builtin:Pending', 5, ['p-pending', 'q-pending']],
            ['name:review', 3, ['p-review', 'q-review']],
            ['name:accepted', 1, ['done-custom']]
        ])
        expect(data).toEqual(copy)
    })
})
