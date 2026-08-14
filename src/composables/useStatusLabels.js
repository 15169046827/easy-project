import { useI18n } from 'vue-i18n'

const PROJECT_STATUS = {
    Draft: 'projects.statusDraft',
    InProgress: 'projects.statusInProgress',
    Paused: 'projects.statusPaused',
    Done: 'projects.statusDone',
    Archived: 'projects.statusArchived'
}

const TASK_STATUS = {
    Pending: 'common.pending',
    InProgress: 'common.active',
    Done: 'common.done'
}

export function useStatusLabels() {
    const { t } = useI18n()

    function projectStatusLabel(status) {
        if (!status) return t('projects.statusDraft')
        return t(PROJECT_STATUS[status]) || status
    }

    function taskStatusLabel(status) {
        if (!status) return ''
        return t(TASK_STATUS[status]) || status
    }

    return { projectStatusLabel, taskStatusLabel }
}
