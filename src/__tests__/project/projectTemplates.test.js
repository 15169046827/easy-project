import { describe, expect, it } from 'vitest'
import {
    buildTemplateTasks,
    PROJECT_TEMPLATES
} from '../../modules/project/templates/projectTemplates.js'

const calendar = {
    calendar_country: 'US',
    calendar_region: '',
    weekend_days: '[0,6]',
    calendar_exceptions: '[]'
}
const translate = key => key.split('.').at(-1)

describe('project templates', () => {
    it('keeps the blank template empty', () => {
        expect(
            buildTemplateTasks(PROJECT_TEMPLATES[0], new Date(2026, 6, 17), calendar, translate)
        ).toEqual([])
    })

    it('creates a workday schedule and linear dependencies', () => {
        const template = PROJECT_TEMPLATES.find(item => item.id === 'software-release')
        const tasks = buildTemplateTasks(
            template,
            new Date(2026, 6, 17),
            calendar,
            translate,
            'member-1'
        )

        expect(tasks).toHaveLength(5)
        expect(tasks[0]).toMatchObject({
            key: 'requirements',
            start_time: '2026-07-17',
            end_time: '2026-07-21',
            predecessor_keys: [],
            assignee: 'member-1'
        })
        expect(tasks[1].start_time).toBe('2026-07-22')
        expect(tasks[1].predecessor_keys).toEqual(['requirements'])
        expect(tasks.at(-1).type).toBe('Milestone')
    })

    it('moves a weekend start to the next working day', () => {
        const template = PROJECT_TEMPLATES.find(item => item.id === 'writing-project')
        const tasks = buildTemplateTasks(template, new Date(2026, 6, 18), calendar, translate)
        expect(tasks[0].start_time).toBe('2026-07-20')
    })
})
