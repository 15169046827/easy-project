import { ref, watchEffect } from 'vue'

const DARK_CLASS = 'app-dark'
const STORAGE_KEY = 'easyproject-theme'

const isDark = ref(localStorage.getItem(STORAGE_KEY) === 'dark')

const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
if (localStorage.getItem(STORAGE_KEY) === null && mediaQuery.matches) {
    isDark.value = true
}

function applyTheme(dark) {
    document.documentElement.classList.toggle(DARK_CLASS, dark)
}

watchEffect(() => {
    applyTheme(isDark.value)
    localStorage.setItem(STORAGE_KEY, isDark.value ? 'dark' : 'light')
})

mediaQuery.addEventListener('change', e => {
    if (localStorage.getItem(STORAGE_KEY) === null) {
        isDark.value = e.matches
    }
})

export function useTheme() {
    function toggle() {
        isDark.value = !isDark.value
    }

    return { isDark, toggle }
}
