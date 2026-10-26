import { describe, expect, it } from 'vitest'
import { baseCompile } from '@intlify/message-compiler'
import { defaultOptions } from 'primevue/config'
import en from '../../i18n/locales/en-US'
import zh from '../../i18n/locales/zh-CN'
import es from '../../i18n/locales/es-ES'
import landingEn from '../../i18n/locales/landing-en'
import landingZh from '../../i18n/locales/landing-zh'
import landingEs from '../../i18n/locales/landing-es'
import statusEn from '../../i18n/locales/task-status-en'
import statusZh from '../../i18n/locales/task-status-zh'
import statusEs from '../../i18n/locales/task-status-es'
import { getPrimeLocale, primeGeneratedKeys, primeTranslations } from '../../i18n/primeLocales'
import { i18n, getLocale, setLocale, SUPPORTED_LOCALES } from '../../i18n'

function flatten(value, prefix = '') {
    return Object.fromEntries(
        Object.entries(value).flatMap(([key, item]) =>
            typeof item === 'object'
                ? Object.entries(flatten(item, prefix + key + '.'))
                : [[prefix + key, item]]
        )
    )
}
const placeholders = value => [...value.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort()

describe('complete locale catalogs', () => {
    it('requires every registered language to remain complete and compilable', () => {
        expect([...i18n.global.availableLocales].sort()).toEqual([...SUPPORTED_LOCALES].sort())
        const reference = flatten(i18n.global.getLocaleMessage('en-US'))
        const errors = []
        for (const language of SUPPORTED_LOCALES) {
            const messages = flatten(i18n.global.getLocaleMessage(language))
            expect(Object.keys(messages).sort(), language).toEqual(Object.keys(reference).sort())
            for (const [key, value] of Object.entries(messages)) {
                expect(placeholders(value), language + ':' + key).toEqual(
                    placeholders(reference[key])
                )
                baseCompile(value, {
                    onError: error => errors.push(`${language}:${key}:${error.code}`)
                })
            }
        }
        expect(errors).toEqual([])
    })
    for (const [name, catalogs] of Object.entries({
        app: { en, zh, es },
        landing: { en: landingEn, zh: landingZh, es: landingEs },
        statuses: { en: statusEn, zh: statusZh, es: statusEs }
    })) {
        const reference = flatten(catalogs.en)
        it.each(['zh', 'es'])(`${name}: %s has every key and matching interpolation`, language => {
            const actual = flatten(catalogs[language])
            expect(Object.keys(actual).sort()).toEqual(Object.keys(reference).sort())
            for (const [key, value] of Object.entries(actual)) {
                expect(value, key).toBeTypeOf('string')
                expect(value.trim(), key).not.toBe('')
                expect(placeholders(value), key).toEqual(placeholders(reference[key]))
            }
        })
        it.each(['en', 'zh', 'es'])(
            `${name}: %s messages compile without invalid links`,
            language => {
                const errors = []
                for (const [key, value] of Object.entries(flatten(catalogs[language])))
                    baseCompile(value, { onError: error => errors.push(`${key}: ${error.code}`) })
                expect(errors).toEqual([])
            }
        )
    }
    it('uses an explicit persisted language and rejects unknown choices', () => {
        const previous = getLocale()
        try {
            setLocale('es-ES')
            expect(getLocale()).toBe('es-ES')
            expect(document.documentElement.lang).toBe('es-ES')
            expect(localStorage.getItem('easyproject-lang')).toBe('es-ES')
            expect(i18n.global.t('members.emailPlaceholder')).toBe('correo@ejemplo.com')
            setLocale('untrusted')
            expect(getLocale()).toBe('es-ES')
        } finally {
            setLocale(previous)
        }
    })
    it.each(['zh-CN', 'es-ES'])('covers every installed PrimeVue key for %s', language => {
        const expected = Object.keys(defaultOptions.locale)
            .filter(key => !primeGeneratedKeys.includes(key))
            .sort()
        expect(Object.keys(primeTranslations[language]).sort()).toEqual(expected)
        expect(Object.keys(primeTranslations[language].aria).sort()).toEqual(
            Object.keys(defaultOptions.locale.aria).sort()
        )
        const translated = getPrimeLocale(language)
        expect(translated.monthNames).toHaveLength(12)
        expect(translated.dayNames).toHaveLength(7)
        expect(translated.passwordPrompt).not.toBe(defaultOptions.locale.passwordPrompt)
        expect(translated.aria.close).not.toBe('Close')
    })
    it('generates Spanish calendar names independently of the host language', () => {
        expect(getPrimeLocale('es-ES').monthNames[0]).toBe('enero')
        expect(getPrimeLocale('es-ES').dayNames[0]).toBe('domingo')
        expect(getPrimeLocale('es-ES').firstDayOfWeek).toBe(1)
        const modified = getPrimeLocale('es-ES')
        modified.aria.close = 'changed'
        expect(getPrimeLocale('es-ES').aria.close).toBe('Cerrar')
        expect(defaultOptions.locale.aria.close).toBe('Close')
    })
})
