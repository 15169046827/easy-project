/**
 * useKeyboard composable 测试
 * 测试快捷键帮助列表的数据完整性
 */
import { describe, it, expect } from 'vitest'
import { SHORTCUTS_HELP } from '../../composables/useKeyboard.js'

describe('useKeyboard', () => {
    it('快捷键帮助列表非空', () => {
        expect(SHORTCUTS_HELP.length).toBeGreaterThan(0)
    })

    it('每个快捷键都有 keys 和 description 属性', () => {
        for (const shortcut of SHORTCUTS_HELP) {
            expect(shortcut).toHaveProperty('keys')
            expect(shortcut).toHaveProperty('description')
            expect(typeof shortcut.keys).toBe('string')
            expect(typeof shortcut.description).toBe('string')
        }
    })

    it('包含核心导航快捷键', () => {
        const keys = SHORTCUTS_HELP.map(s => s.keys)
        expect(keys).toContain('Ctrl+1')
        expect(keys).toContain('Ctrl+2')
        expect(keys).toContain('Ctrl+3')
        expect(keys).toContain('Ctrl+4')
        expect(keys).toContain('Ctrl+D')
        expect(keys).toContain('?')
        expect(keys).toContain('Escape')
    })

    it('只展示当前已经注册的快捷键', () => {
        const keys = SHORTCUTS_HELP.map(s => s.keys)
        expect(keys).not.toContain('Ctrl+K')
        expect(keys).not.toContain('Ctrl+N')
        expect(keys).not.toContain('Ctrl+T')
        expect(keys).not.toContain('Ctrl+S')
    })

    it('不包含重复快捷键', () => {
        const keys = SHORTCUTS_HELP.map(s => s.keys)
        expect(new Set(keys).size).toBe(keys.length)
    })
})
