import { isTauri } from '@tauri-apps/api/core'

export function isWindowsUserAgent(userAgent = window.navigator.userAgent) {
    return /Windows/i.test(userAgent)
}

export function isWindowChromePreview(search = window.location.search) {
    return new URLSearchParams(search).has('windowChrome')
}

export function getWindowChromeMode({
    tauri = isTauri(),
    userAgent = window.navigator.userAgent,
    search = window.location.search
} = {}) {
    const native = tauri && isWindowsUserAgent(userAgent)
    return {
        native,
        visible: native || isWindowChromePreview(search)
    }
}
