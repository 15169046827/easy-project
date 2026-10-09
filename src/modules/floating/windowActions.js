import { invoke, isTauri } from '@tauri-apps/api/core'
import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window'

export function isFloatingNative() {
    return Boolean(window.__EASYPROJECT_FLOATING_WINDOW__) && isTauri()
}

function previewUrl(hash) {
    const url = new URL(window.location.href)
    url.hash = hash
    return url.href
}

export async function openFloatingWindow() {
    if (isTauri()) return invoke('open_task_window')
    window.open(previewUrl('/floating'), 'easyproject-floating-preview', 'width=340,height=360')
}

export async function resizeFloatingWindow(expanded) {
    if (isFloatingNative()) {
        await getCurrentWindow().setSize(new LogicalSize(340, expanded ? 360 : 72))
    }
}

export async function closeFloatingWindow() {
    if (isFloatingNative()) await getCurrentWindow().close()
    else window.close()
}

export async function setFloatingOnTop(enabled) {
    if (isFloatingNative()) await getCurrentWindow().setAlwaysOnTop(enabled)
}

export async function returnToMain(projectId = '') {
    if (isFloatingNative()) return invoke('show_main_window', { projectId })
    window.open(
        previewUrl(projectId ? `/project/${encodeURIComponent(projectId)}` : '/dashboard'),
        'easyproject-main'
    )
}
