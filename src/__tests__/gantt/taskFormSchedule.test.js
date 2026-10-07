import { describe, expect, it } from 'vitest'
import {
    recalculateFormEnd,
    recalculateFormEffort
} from '../../modules/gantt/utils/taskFormSchedule.js'

const project = { calendar_country: 'US', weekend_days: '[0,6]' }
const form = () => ({
    start_time: '2026-11-06',
    end_time: '2026-11-09',
    effort_days: 2,
    schedule_mode: 'fixed_effort'
})

describe('shared task form workday recalculation', () => {
    it('skips weekends when deriving a fixed-effort end date', () => {
        const value = form()
        value.end_time = ''
        recalculateFormEnd(value, project)
        expect(value.end_time).toBe('2026-11-09')
    })
    it('keeps fixed dates and derives effort instead', () => {
        const value = { ...form(), schedule_mode: 'fixed_dates', effort_days: 100 }
        recalculateFormEnd(value, project)
        expect(value.end_time).toBe('2026-11-09')
        expect(value.effort_days).toBe(2)
    })
    it('does not overwrite effort for the fixed-effort mode', () => {
        const value = form()
        recalculateFormEffort(value, project)
        expect(value.effort_days).toBe(2)
    })
    it('preserves the end date if the start date is invalid', () => {
        const value = { ...form(), start_time: 'invalid' }
        recalculateFormEnd(value, project)
        expect(value.end_time).toBe('2026-11-09')
    })
})
