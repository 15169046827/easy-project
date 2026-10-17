import { beforeEach, describe, expect, it, vi } from 'vitest'

const native = vi.hoisted(() => ({
    size: { width: 500, height: 600 },
    position: { x: 100, y: 100 },
    cursor: { x: 120, y: 120 },
    setMinSize: vi.fn(),
    setSize: vi.fn(),
    setResizable: vi.fn(),
    setPosition: vi.fn(),
    startResizeDragging: vi.fn()
}))
vi.mock('@tauri-apps/api/core', () => ({ isTauri: () => true, invoke: vi.fn() }))
vi.mock('@tauri-apps/api/window', () => ({
    LogicalSize: class {
        constructor(width, height) {
            this.width = width
            this.height = height
        }
    },
    PhysicalPosition: class {
        constructor(x, y) {
            this.x = x
            this.y = y
        }
    },
    currentMonitor: async () => ({
        workArea: { position: { x: 0, y: 0 }, size: { width: 1920, height: 1040 } }
    }),
    cursorPosition: async () => ({ ...native.cursor }),
    getCurrentWindow: () => ({
        scaleFactor: async () => 1,
        innerSize: async () => ({ toLogical: () => ({ ...native.size }) }),
        outerSize: async () => ({ ...native.size }),
        outerPosition: async () => ({ ...native.position }),
        setMinSize: native.setMinSize,
        setSize: native.setSize,
        setResizable: native.setResizable,
        setPosition: native.setPosition,
        startResizeDragging: native.startResizeDragging
    })
}))
import {
    beginBallMove,
    moveBall,
    nudgeBall,
    resizeFloatingWindow,
    keepFloatingVisible,
    startFloatingResize
} from '../../modules/floating/windowActions'

describe('native floating controls', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        window.__EASYPROJECT_FLOATING_WINDOW__ = true
        native.size = { width: 500, height: 600 }
        native.position = { x: 100, y: 100 }
        native.cursor = { x: 120, y: 120 }
        native.setSize.mockImplementation(async size => {
            native.size = size
        })
        native.setPosition.mockImplementation(async position => {
            native.position = position
        })
    })
    it('uses a 64px ball and restores the user-expanded size, with independent minimums', async () => {
        native.position = { x: 8, y: 100 }
        expect(await resizeFloatingWindow(false)).toBe('left')
        expect(native.setMinSize).toHaveBeenLastCalledWith({ width: 64, height: 64 })
        expect(native.setResizable).toHaveBeenLastCalledWith(false)
        expect(native.size).toEqual({ width: 64, height: 64 })
        await resizeFloatingWindow(true)
        expect(native.size).toEqual({ width: 500, height: 600 })
        expect(native.setMinSize).toHaveBeenLastCalledWith({ width: 340, height: 360 })
        expect(native.setResizable).toHaveBeenLastCalledWith(true)
    })
    it('moves by physical cursor delta and snaps only near an edge', async () => {
        native.size = { width: 64, height: 64 }
        const origin = await beginBallMove()
        native.cursor = { x: 30, y: 220 }
        await moveBall(origin)
        expect(native.position).toEqual({ x: 10, y: 200 })
        expect(await keepFloatingVisible(true)).toBe('left')
        expect(native.position).toEqual({ x: 0, y: 200 })
        await nudgeBall(160, 0)
        expect(native.position).toEqual({ x: 160, y: 200 })
        expect(await keepFloatingVisible(true)).toBe('')
        await startFloatingResize('SouthEast')
        expect(native.startResizeDragging).toHaveBeenCalledWith('SouthEast')
    })
    it('does not call native window controls in a browser preview', async () => {
        window.__EASYPROJECT_FLOATING_WINDOW__ = false
        await resizeFloatingWindow(false)
        await moveBall(null)
        await startFloatingResize('East')
        expect(native.setSize).not.toHaveBeenCalled()
        expect(native.setPosition).not.toHaveBeenCalled()
        expect(native.startResizeDragging).not.toHaveBeenCalled()
    })
    it('captures the pointer-down position even if the cursor has already moved before IPC returns', async () => {
        native.size = { width: 64, height: 64 }
        native.cursor = { x: 132, y: 102 }
        const origin = await beginBallMove({ x: 32, y: 58 })
        expect(origin.cursor).toEqual({ x: 132, y: 158 })
        await moveBall(origin)
        expect(native.position).toEqual({ x: 100, y: 44 })
    })
})
