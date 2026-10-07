import { describe, expect, it } from 'vitest'
import {
    baselineDeviation,
    baselineBarStyle,
    baselineTooltip
} from '../../modules/gantt/utils/baselinePresentation.js'

const parse = value => {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
}
const baseline = { start_time: '2026-10-05', end_time: '2026-10-06' }
const task = { name: 'Task', type: 'Task', start_time: '2026-10-06', end_time: '2026-10-07' }
const project = { calendar_country: '', weekend_days: '[0,6]' }
const geometry = {
    parse,
    offset: date => (date.getTime() - parse('2026-10-05').getTime()) / 86400000,
    nameWidth: 280,
    dayWidth: 42
}

describe('baseline presentation calculations', () => {
    it('calculates working-day delay without changing source dates', () => {
        expect(baselineDeviation(baseline, task, project, parse)).toMatchObject({
            startSlip: 1,
            endSlip: 1,
            delayed: true,
            advanced: false
        })
        expect(baseline.start_time).toBe('2026-10-05')
    })
    it('rejects missing and malformed dates', () => {
        expect(baselineDeviation(null, task, project, parse)).toBeNull()
        expect(
            baselineDeviation(baseline, { ...task, end_time: 'invalid' }, project, parse)
        ).toBeNull()
        expect(baselineBarStyle({ ...baseline, start_time: 'invalid' }, task, geometry)).toBeNull()
    })
    it('preserves task and milestone baseline geometry', () => {
        expect(baselineBarStyle(baseline, task, geometry)).toEqual({
            left: '286px',
            width: '72px',
            top: '34px'
        })
        expect(baselineBarStyle(baseline, { ...task, type: 'Milestone' }, geometry)).toEqual({
            left: '299px',
            top: '34px'
        })
    })
    it('preserves tooltip/fallback semantics', () => {
        const t = (key, values) => `${key}:${values?.count || 0}`
        expect(baselineTooltip(baseline, task, { endSlip: 2 }, t)).toContain(
            'gantt.baselineDelay:2'
        )
        expect(baselineTooltip(baseline, task, { endSlip: -2 }, t)).toContain(
            'gantt.baselineAdvance:2'
        )
        expect(baselineTooltip(null, task, null, t)).toBe('Task')
    })
})
