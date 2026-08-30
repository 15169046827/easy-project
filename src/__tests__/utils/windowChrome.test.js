import { describe, expect, it } from 'vitest'
import {
    getWindowChromeMode,
    isWindowChromePreview,
    isWindowsUserAgent
} from '../../utils/windowChrome'

describe('window chrome mode', () => {
    it('enables native chrome only for a Windows Tauri webview', () => {
        expect(
            getWindowChromeMode({ tauri: true, userAgent: 'Windows NT 10.0', search: '' })
        ).toEqual({ native: true, visible: true })
        expect(getWindowChromeMode({ tauri: true, userAgent: 'Macintosh', search: '' })).toEqual({
            native: false,
            visible: false
        })
    })

    it('supports a browser-only visual preview', () => {
        expect(
            getWindowChromeMode({ tauri: false, userAgent: 'Linux', search: '?windowChrome=1' })
        ).toEqual({ native: false, visible: true })
    })

    it('detects Windows and the preview query explicitly', () => {
        expect(isWindowsUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toBe(true)
        expect(isWindowsUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X)')).toBe(false)
        expect(isWindowChromePreview('?demo=1&windowChrome=1')).toBe(true)
    })
})
