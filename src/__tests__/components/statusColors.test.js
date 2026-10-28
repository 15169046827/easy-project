// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import {
    STATUS_COLORS,
    suggestStatusColor,
    statusColor,
    statusColorStyle,
    storedStatusColor
} from '../../utils/statusColors'

describe('status color suggestions', () => {
    it('offers eight unique portable hex colors', () => {
        expect(new Set(STATUS_COLORS.map(item => item.value)).size).toBe(8)
        expect(STATUS_COLORS.every(item => /^#[0-9a-f]{6}$/.test(item.value))).toBe(true)
    })
    it('prefers unused colors and treats hex case consistently', () => {
        expect(suggestStatusColor([{ color: '#3B82F6' }], () => 0)).toBe('#8b5cf6')
        expect(suggestStatusColor([{ color: '#64748b' }], () => 0)).toBe('#3b82f6')
    })
    it('reuses the least-used color only after all are used', () => {
        const states = STATUS_COLORS.map(item => ({ color: item.value }))
        states.push({ color: '#3b82f6' })
        expect(suggestStatusColor(states, () => 0)).toBe('#8b5cf6')
        expect(states).toHaveLength(9)
    })
    it('randomizes among equally unused colors without changing stored choices', () => {
        const states = [{ color: '#123456' }]
        expect(suggestStatusColor(states, () => 0)).not.toBe(suggestStatusColor(states, () => 0.9))
        expect(states).toEqual([{ color: '#123456' }])
        expect(statusColor(states[0])).toBe('#123456')
    })
    it('keeps built-in accents consistent and text neutral without changing stored colors', () => {
        expect(storedStatusColor({ color: '#f43f5e' })).toBe('#f43f5e')
        expect(storedStatusColor({ builtin_key: 'Done', color: '#123456' })).toBe('#22c55e')
        expect(statusColor({ builtin_key: 'Done', color: '#123456' })).toBe('#629579')
        expect(statusColor({ builtin_key: 'InProgress', color: '#000000' })).toBe('#6284ad')
        expect(statusColor({ builtin_key: 'Pending', color: '#ffffff' })).toBe('#718096')
        for (const color of ['#000000', '#ffffff', ...STATUS_COLORS.map(c => c.value)]) {
            const style = statusColorStyle({ color })
            expect(style.backgroundColor).toBe('var(--p-content-background)')
            expect(style.color).toBe('var(--p-text-color)')
            expect(style['--status-color']).toBe(statusColor({ color }))
        }
    })
})
it('leaves Windows HTML5 drag/drop to the frontend main webview', () => {
    const config = JSON.parse(
        readFileSync(new URL('../../../src-tauri/tauri.conf.json', import.meta.url), 'utf8')
    )
    expect(config.app.windows[0].dragDropEnabled).toBe(false)
})
