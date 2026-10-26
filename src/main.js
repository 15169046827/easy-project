import { createApp, watch } from 'vue'
import { isTauri } from '@tauri-apps/api/core'
import { isLandingEntry } from './utils/entryMode'

// PrimeVue
import PrimeVue from 'primevue/config'
import Tooltip from 'primevue/tooltip'
import ConfirmationService from 'primevue/confirmationservice'
import Aura from '@primeuix/themes/aura'
import { definePreset } from '@primeuix/themes'
import 'primeicons/primeicons.css'
import './assets/workspace-layout.css'
import { i18n } from './i18n'
import { getPrimeLocale } from './i18n/primeLocales'
import { getStyleNonce } from './security/styleNonce'

const floating =
    window.__EASYPROJECT_FLOATING_WINDOW__ || window.location.hash.split('?')[0] === '#/floating'
const landing = isLandingEntry(
    window.location,
    isTauri() || Boolean(window.__EASYPROJECT_STORAGE_INFO__),
    Boolean(floating)
)
const EasyProjectPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
            950: '#172554'
        }
    }
})

async function start() {
    const { default: Root } = landing
        ? await import('./modules/landing/LandingPage.vue')
        : floating
          ? await import('./modules/floating/FloatingTaskWindow.vue')
          : await import('./components/RemoteRoot.vue')
    const app = createApp(Root)
    if (floating) document.documentElement.classList.add('floating-document')
    app.use(PrimeVue, {
        csp: { nonce: getStyleNonce() },
        theme: {
            preset: EasyProjectPreset,
            options: {
                darkModeSelector: '.app-dark'
            }
        }
    })
    watch(
        i18n.global.locale,
        value => {
            app.config.globalProperties.$primevue.config.locale = getPrimeLocale(value)
        },
        { immediate: true }
    )
    if (!floating && !landing) app.use((await import('./router')).default)
    app.use(i18n)
    app.directive('tooltip', Tooltip)
    app.use(ConfirmationService)

    app.mount('#app')
}

start().catch(() => {
    // No credentials, exception details or real workspace content in the public fallback.
    document.getElementById('app').textContent = i18n.global.t('app.loadFailed')
})
