import { describe, expect, it } from 'vitest'
import { snapshotToXlsx, xlsxToSnapshot } from '../../modules/data/utils/xlsx.js'

describe('XLSX data exchange', () => {
    it('preserves schema7 status definitions and stable task references', async () => {
        const snapshot = {
            schemaVersion: 7,
            projects: [],
            tasks: [
                [
                    'TASK:1',
                    'PROJECT:1',
                    0,
                    'Review',
                    '',
                    '',
                    '',
                    '',
                    'Task',
                    '2',
                    'Review',
                    0,
                    1,
                    'fixed_effort',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '0',
                    'TASK_STATUS:1'
                ]
            ],
            task_statuses: [
                ['TASK_STATUS:1', 'PROJECT:1', 'Review', '#64748b', 0, 0, 1, '', '', '', '0']
            ],
            dependencies: [],
            members: [],
            project_members: [],
            plan_baselines: []
        }
        const result = await xlsxToSnapshot(await snapshotToXlsx(snapshot))
        expect(result.payload).toMatchObject(snapshot)
        expect(result.preview.mappings).toHaveLength(7)
        expect(result.preview.warnings).toEqual([])
    }, 20000)
    it('round-trips all EasyProject model worksheets with field mappings', async () => {
        const snapshot = {
            schemaVersion: 5,
            exportedAt: '2026-07-21T00:00:00Z',
            projects: [
                [
                    'project-1',
                    'Alpha',
                    'v1.0',
                    'private',
                    'InProgress',
                    '',
                    'CN',
                    '',
                    '[0,6]',
                    '[]',
                    '',
                    '',
                    '',
                    '0'
                ]
            ],
            tasks: [
                [
                    'task-1',
                    'project-1',
                    1,
                    'Plan',
                    '',
                    '',
                    '2026-07-01',
                    '2026-07-02',
                    'Task',
                    '2',
                    'Pending',
                    0,
                    2,
                    'fixed_effort',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '0'
                ]
            ],
            dependencies: [],
            members: [['member-1', 'Alice', '', '', 'PM', '', '[]', '', '', '0']],
            project_members: [['pm-1', 'project-1', 'member-1', 'Owner', '', '0']],
            plan_baselines: [
                ['baseline-1', 'project-1', 'task-1', 'Plan', '2026-07-01', '2026-07-02', '']
            ]
        }
        const buffer = await snapshotToXlsx(snapshot)
        const result = await xlsxToSnapshot(buffer)

        expect(result.payload).toMatchObject(snapshot)
        expect(result.preview.warnings).toEqual([])
        expect(result.preview.mappings).toHaveLength(6)
        expect(result.preview.counts).toMatchObject({ Projects: 1, Tasks: 1, Members: 1 })
    }, 20_000)
})
