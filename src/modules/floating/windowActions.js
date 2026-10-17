import { invoke, isTauri } from '@tauri-apps/api/core'
import {
    getCurrentWindow,
    LogicalSize,
    PhysicalPosition,
    currentMonitor,
    cursorPosition
} from '@tauri-apps/api/window'
import { ballSize, expandedMinimum, fitWindow, snapBall } from './windowGeometry'

let expandedSize = { ...expandedMinimum }

async function windowArea() {
    const monitor = await currentMonitor()
    if (!monitor) throw new Error('Monitor work area is unavailable')
    return {
        x: monitor.workArea.position.x,
        y: monitor.workArea.position.y,
        width: monitor.workArea.size.width,
        height: monitor.workArea.size.height
    }
}

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
        const nativeWindow = getCurrentWindow()
        const scale = await nativeWindow.scaleFactor()
        if (!expanded) {
            const size = (await nativeWindow.innerSize()).toLogical(scale)
            expandedSize = { width: size.width, height: size.height }
        }
        const minimum = expanded ? expandedMinimum : { width: ballSize, height: ballSize }
        const area = await windowArea()
        await nativeWindow.setMinSize(new LogicalSize(minimum.width, minimum.height))
        await nativeWindow.setSize(
            new LogicalSize(
                expanded
                    ? Math.max(
                          expandedMinimum.width,
                          Math.min(expandedSize.width, area.width / scale)
                      )
                    : ballSize,
                expanded
                    ? Math.max(
                          expandedMinimum.height,
                          Math.min(expandedSize.height, area.height / scale)
                      )
                    : ballSize
            )
        )
        await nativeWindow.setResizable(expanded)
        return keepFloatingVisible(!expanded)
    }
    return ''
}

export async function keepFloatingVisible(snap = false) {
    if (!isFloatingNative()) return ''
    const nativeWindow = getCurrentWindow()
    const [position, size, area, scale] = await Promise.all([
        nativeWindow.outerPosition(),
        nativeWindow.outerSize(),
        windowArea(),
        nativeWindow.scaleFactor()
    ])
    const result = snap
        ? snapBall(position, size, area, 24 * scale)
        : { ...fitWindow(position, size, area), edge: '' }
    await nativeWindow.setPosition(new PhysicalPosition(result.x, result.y))
    return result.edge
}

/** @param {{x: number, y: number}} [point] Pointer-down client coordinates, captured before IPC. */
export async function beginBallMove(point) {
    if (!isFloatingNative()) return null
    const [position, scale] = await Promise.all([
        getCurrentWindow().outerPosition(),
        getCurrentWindow().scaleFactor()
    ])
    const cursor = point
        ? { x: position.x + point.x * scale, y: position.y + point.y * scale }
        : await cursorPosition()
    return { position, cursor }
}

export async function moveBall(origin) {
    if (!origin || !isFloatingNative()) return
    const cursor = await cursorPosition()
    await getCurrentWindow().setPosition(
        new PhysicalPosition(
            origin.position.x + cursor.x - origin.cursor.x,
            origin.position.y + cursor.y - origin.cursor.y
        )
    )
}

export async function nudgeBall(dx, dy) {
    if (!isFloatingNative()) return ''
    const nativeWindow = getCurrentWindow()
    const position = await nativeWindow.outerPosition()
    const scale = await nativeWindow.scaleFactor()
    await nativeWindow.setPosition(
        new PhysicalPosition(position.x + dx * scale, position.y + dy * scale)
    )
    return keepFloatingVisible()
}

export async function startFloatingResize(direction) {
    if (isFloatingNative()) await getCurrentWindow().startResizeDragging(direction)
}

export async function keyboardFloatingResize(key) {
    if (!isFloatingNative()) return
    const nativeWindow = getCurrentWindow()
    const size = (await nativeWindow.innerSize()).toLogical(await nativeWindow.scaleFactor())
    const dx = key === 'ArrowRight' ? 16 : key === 'ArrowLeft' ? -16 : 0
    const dy = key === 'ArrowDown' ? 16 : key === 'ArrowUp' ? -16 : 0
    await nativeWindow.setSize(
        new LogicalSize(
            Math.max(expandedMinimum.width, size.width + dx),
            Math.max(expandedMinimum.height, size.height + dy)
        )
    )
    await keepFloatingVisible()
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
