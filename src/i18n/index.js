import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN'
import enUS from './locales/en-US'

const STORAGE_KEY = 'easyproject-lang'
export const SUPPORTED_LOCALES = ['zh-CN', 'en-US']

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
        'zh-CN': zhCN,
        'en-US': enUS
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
    document.documentElement.setAttribute('lang', locale)
}

export function getLocale() {
    return i18n.global.locale.value
}

// Initialize document lang on load
document.documentElement.setAttribute('lang', i18n.global.locale.value)
