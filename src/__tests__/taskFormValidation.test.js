import { describe, expect, it } from 'vitest'
import { validateTaskForm, requiredTaskFields } from '../modules/task/utils/taskFormValidation.js'
import zh from '../i18n/locales/zh-CN.js'
import en from '../i18n/locales/en-US.js'
import es from '../i18n/locales/es-ES.js'

describe('task required-field validation', () => {
    for (const locale of [zh, en, es]) {
        it(`uses localized field errors: ${locale.tasks.requiredField}`, () => {
            const t = (key, params) => {
                const value = key.split('.').reduce((item, name) => item[name], locale)
                return params ? value.replace('{field}', params.field) : value
            }
            const errors = validateTaskForm({ name: '  ' }, t)
            expect(Object.keys(errors)).toEqual(Object.keys(requiredTaskFields))
            expect(errors.name).toContain(locale.tasks.columnName)
            const valid = Object.fromEntries(
                Object.keys(requiredTaskFields).map(key => [key, 'valid'])
            )
            expect(validateTaskForm(valid, t)).toEqual({})
        })
    }
})
