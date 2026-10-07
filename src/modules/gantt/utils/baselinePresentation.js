import { workingDayDelta } from '../../calendar/utils/workCalendar.js'

export function baselineDeviation(baseline, task, project, parse) {
    if (
        !baseline ||
        ![task.start_time, task.end_time, baseline.start_time, baseline.end_time].every(parse)
    )
        return null
    const startSlip = workingDayDelta(baseline.start_time, task.start_time, project)
    const endSlip = workingDayDelta(baseline.end_time, task.end_time, project)
    return {
        startSlip,
        endSlip,
        delayed: endSlip > 0 || startSlip > 0,
        advanced: endSlip < 0 && startSlip <= 0
    }
}

export function baselineBarStyle(baseline, task, { parse, offset, nameWidth, dayWidth }) {
    if (!baseline) return null
    const start = parse(baseline.start_time)
    const end = parse(baseline.end_time)
    if (!start || !end) return null
    const left = nameWidth + offset(start) * dayWidth + 6
    if (task.type === 'Milestone') return { left: `${left + dayWidth / 2 - 8}px`, top: '34px' }
    const width = Math.max(dayWidth - 10, (offset(end) - offset(start) + 1) * dayWidth - 12)
    return { left: `${left}px`, width: `${width}px`, top: '34px' }
}

export function baselineTooltip(baseline, task, deviation, t) {
    if (!baseline || !deviation) return task.name
    const slip = deviation.endSlip
    const verb =
        slip > 0
            ? t('gantt.baselineDelay', { count: slip })
            : slip < 0
              ? t('gantt.baselineAdvance', { count: Math.abs(slip) })
              : t('gantt.baselineMatch')
    return `${task.name}\n基线: ${baseline.start_time?.slice(0, 10)} → ${baseline.end_time?.slice(0, 10)}\n实际: ${task.start_time?.slice(0, 10)} → ${task.end_time?.slice(0, 10)}\n${verb}`
}
