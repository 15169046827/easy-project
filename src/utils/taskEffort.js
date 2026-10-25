export function effortPayload(form) {
    const effort = form.effort_days
    return {
        effort_days: effort == null ? 0 : Number(effort),
        effort_state: effort == null ? 'unestimated' : form.effort_state || 'estimated'
    }
}
export function effortLabel(task, t) {
    const summary = task.summary
    if (summary?.has_children) {
        if (summary.effort_days > 0) return String(summary.effort_days)
        if (summary.legacy_unknown_count) return t('taskHierarchy.legacyUnknown')
        if (summary.unestimated_count) return t('taskHierarchy.unestimated')
        return t('taskHierarchy.zeroEffort')
    }
    if (task.effort_state === 'legacy_unknown') return t('taskHierarchy.legacyUnknown')
    if (task.effort_state === 'unestimated' || task.effort_days == null)
        return t('taskHierarchy.unestimated')
    return Number(task.effort_days) === 0 ? t('taskHierarchy.zeroEffort') : String(task.effort_days)
}
export function summaryHint(task, t) {
    if (!task.summary?.has_children) return ''
    const missing = task.summary.unestimated_count + task.summary.legacy_unknown_count
    return [
        t('taskHierarchy.derived'),
        missing ? t('taskHierarchy.missingEstimates', { count: missing }) : '',
        task.summary.schedule_incomplete ? t('taskHierarchy.incompleteSchedule') : ''
    ]
        .filter(Boolean)
        .join('\n')
}
