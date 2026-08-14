import {
    calculateEndDate,
    dateKey,
    getWorkdayInfo,
    nextWorkingDay
} from '../../calendar/utils/workCalendar.js'

export const PROJECT_TEMPLATES = Object.freeze([
    {
        id: 'blank',
        icon: 'pi pi-file',
        titleKey: 'projectTemplates.blankTitle',
        descriptionKey: 'projectTemplates.blankDescription',
        tasks: []
    },
    {
        id: 'software-release',
        icon: 'pi pi-code',
        titleKey: 'projectTemplates.softwareTitle',
        descriptionKey: 'projectTemplates.softwareDescription',
        tasks: [
            { key: 'requirements', nameKey: 'requirements', effortDays: 3, priority: 'High' },
            { key: 'design', nameKey: 'design', effortDays: 3, priority: 'Normal' },
            { key: 'implementation', nameKey: 'implementation', effortDays: 8, priority: 'High' },
            { key: 'testing', nameKey: 'testing', effortDays: 4, priority: 'High' },
            {
                key: 'release',
                nameKey: 'release',
                effortDays: 1,
                type: 'Milestone',
                priority: 'High'
            }
        ]
    },
    {
        id: 'marketing-campaign',
        icon: 'pi pi-megaphone',
        titleKey: 'projectTemplates.marketingTitle',
        descriptionKey: 'projectTemplates.marketingDescription',
        tasks: [
            { key: 'research', nameKey: 'research', effortDays: 3, priority: 'Normal' },
            { key: 'strategy', nameKey: 'strategy', effortDays: 2, priority: 'High' },
            { key: 'creative', nameKey: 'creative', effortDays: 5, priority: 'Normal' },
            { key: 'preparation', nameKey: 'preparation', effortDays: 3, priority: 'High' },
            {
                key: 'launch',
                nameKey: 'campaignLaunch',
                effortDays: 1,
                type: 'Milestone',
                priority: 'High'
            }
        ]
    },
    {
        id: 'writing-project',
        icon: 'pi pi-pencil',
        titleKey: 'projectTemplates.writingTitle',
        descriptionKey: 'projectTemplates.writingDescription',
        tasks: [
            { key: 'outline', nameKey: 'outline', effortDays: 2, priority: 'High' },
            { key: 'first-draft', nameKey: 'firstDraft', effortDays: 8, priority: 'Normal' },
            { key: 'review', nameKey: 'review', effortDays: 3, priority: 'Normal' },
            { key: 'revision', nameKey: 'revision', effortDays: 4, priority: 'High' },
            {
                key: 'publish',
                nameKey: 'publish',
                effortDays: 1,
                type: 'Milestone',
                priority: 'High'
            }
        ]
    }
])

function firstWorkingDay(value, calendar) {
    const source =
        value instanceof Date ? new Date(value) : new Date(String(value).replace(' ', 'T'))
    if (Number.isNaN(source.getTime())) return null
    const cursor = new Date(source.getFullYear(), source.getMonth(), source.getDate())
    for (let guard = 0; guard < 3660; guard += 1) {
        if (getWorkdayInfo(cursor, calendar).working) return cursor
        cursor.setDate(cursor.getDate() + 1)
    }
    return null
}

export function buildTemplateTasks(template, startDate, calendar, translate, assignee = '') {
    if (!template?.tasks?.length) return []
    let cursor = firstWorkingDay(startDate, calendar)
    if (!cursor) throw new Error('Invalid project start date')

    return template.tasks.map((definition, index) => {
        const effortDays = Math.max(1, Number(definition.effortDays) || 1)
        const end = calculateEndDate(cursor, effortDays, calendar)
        if (!end) throw new Error('Unable to calculate template schedule')
        const task = {
            key: definition.key,
            name: translate(`projectTemplates.tasks.${definition.nameKey}`),
            parent_key: '',
            predecessor_keys: index > 0 ? [template.tasks[index - 1].key] : [],
            start_time: dateKey(cursor),
            end_time: dateKey(end),
            type: definition.type || 'Task',
            priority: definition.priority || 'Normal',
            status: 'Todo',
            effort_days: effortDays,
            schedule_mode: 'fixed_effort',
            comment: '',
            assignee
        }
        cursor = nextWorkingDay(end, calendar)
        return task
    })
}
