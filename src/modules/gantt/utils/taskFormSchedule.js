import { calculateEndDate, countWorkingDays, dateKey } from '../../calendar/utils/workCalendar.js'

/** @typedef {{start_time: string, end_time: string, effort_days: number, schedule_mode: string}} ScheduleForm */

/** @param {ScheduleForm} form */
export function recalculateFormEffort(form, project) {
    if (form.schedule_mode !== 'fixed_dates') return
    form.effort_days = countWorkingDays(form.start_time, form.end_time, project)
}

/** @param {ScheduleForm} form */
export function recalculateFormEnd(form, project) {
    if (form.schedule_mode === 'fixed_dates') {
        recalculateFormEffort(form, project)
        return
    }
    const end = calculateEndDate(form.start_time, form.effort_days, project)
    if (end) form.end_time = dateKey(end)
}
