import { calculateEndDate, dateKey } from '../../calendar/utils/workCalendar.js'

/** @typedef {{start_time: string, end_time: string, effort_days: number, schedule_mode: string}} ScheduleForm */

/** @param {ScheduleForm} form */
export function recalculateFormEffort(form, project) {
    void project
    return form.effort_days
}

/** @param {ScheduleForm} form */
export function recalculateFormEnd(form, project) {
    if (form.effort_days == null || Number(form.effort_days) <= 0) return
    if (form.schedule_mode === 'fixed_dates') {
        recalculateFormEffort(form, project)
        return
    }
    const end = calculateEndDate(form.start_time, form.effort_days, project)
    if (end) form.end_time = dateKey(end)
}
