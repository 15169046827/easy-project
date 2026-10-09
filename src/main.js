import { createApp } from 'vue'
import App from './App.vue'
import FloatingTaskWindow from './modules/floating/FloatingTaskWindow.vue'

// PrimeVue
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import { definePreset } from '@primeuix/themes'
import 'primeicons/primeicons.css'
import router from './router'
import { i18n } from './i18n'

const floating =
    window.__EASYPROJECT_FLOATING_WINDOW__ || window.location.hash.split('?')[0] === '#/floating'
const app = createApp(floating ? FloatingTaskWindow : App)
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

app.use(PrimeVue, {
    theme: {
        preset: EasyProjectPreset,
        options: {
            darkModeSelector: '.app-dark'
        }
    }
})
if (!floating) app.use(router)
app.use(i18n)

app.mount('#app')
