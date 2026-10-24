// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { STATUS_COLORS, suggestStatusColor } from '../../utils/statusColors'

describe('status color suggestions', () => {
    it('offers eight unique portable hex colors', () => {
        expect(new Set(STATUS_COLORS.map(item => item.value)).size).toBe(8)
        expect(STATUS_COLORS.every(item => /^#[0-9a-f]{6}$/.test(item.value))).toBe(true)
    })
    it('prefers unused colors and treats hex case consistently', () => {
        expect(suggestStatusColor([{ color: '#3B82F6' }])).toBe('#8b5cf6')
        expect(suggestStatusColor([{ color: '#64748b' }])).toBe('#3b82f6')
    })
    it('reuses the least-used color only after all are used', () => {
        const states = STATUS_COLORS.map(item => ({ color: item.value }))
        states.push({ color: '#3b82f6' })
        expect(suggestStatusColor(states)).toBe('#8b5cf6')
        expect(states).toHaveLength(9)
    })
})
it('leaves Windows HTML5 drag/drop to the frontend main webview', () => {
    const config = JSON.parse(
        readFileSync(new URL('../../../src-tauri/tauri.conf.json', import.meta.url), 'utf8')
    )
    expect(config.app.windows[0].dragDropEnabled).toBe(false)
})
