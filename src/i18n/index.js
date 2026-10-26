import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN'
import enUS from './locales/en-US'
import esES from './locales/es-ES'
import landingZh from './locales/landing-zh'
import landingEn from './locales/landing-en'
import landingEs from './locales/landing-es'
import taskStatusZh from './locales/task-status-zh'
import taskStatusEn from './locales/task-status-en'
import taskStatusEs from './locales/task-status-es'

const STORAGE_KEY = 'easyproject-lang'
export const localeOptions = [
    { label: '中文', value: 'zh-CN' },
    { label: 'English', value: 'en-US' },
    { label: 'Español', value: 'es-ES' }
]
export const SUPPORTED_LOCALES = localeOptions.map(option => option.value)

function detectLocale() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (SUPPORTED_LOCALES.includes(saved)) return saved
    } catch {
        /* localStorage unavailable */
    }
    return 'zh-CN'
}

export const i18n = createI18n({
    legacy: false,
    locale: detectLocale(),
    fallbackLocale: 'en-US',
    messages: {
        'zh-CN': { ...zhCN, landing: landingZh, taskStatuses: taskStatusZh },
        'en-US': { ...enUS, landing: landingEn, taskStatuses: taskStatusEn },
        'es-ES': { ...esES, landing: landingEs, taskStatuses: taskStatusEs }
    }
})

export function setLocale(locale) {
    if (!SUPPORTED_LOCALES.includes(locale)) return
    i18n.global.locale.value = locale
    try {
        localStorage.setItem(STORAGE_KEY, locale)
    } catch {
        /* ignore */
    }
    syncDocumentLocale()
}

export function getLocale() {
    return i18n.global.locale.value
}

function syncDocumentLocale() {
    document.documentElement.setAttribute('lang', i18n.global.locale.value)
    document
        .querySelector('meta[name="description"]')
        ?.setAttribute('content', i18n.global.t('landing.intro'))
}

// Initialize document language and description without checking an account or workspace.
syncDocumentLocale()
