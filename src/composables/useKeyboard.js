import { onMounted, onUnmounted } from 'vue'

/**
 * 全局快捷键注册 composable
 * @param {Array<{ key: string, ctrl?: boolean, shift?: boolean, alt?: boolean, handler: Function, description: string }>} shortcuts
 * @param {boolean} [enabled=true] 是否启用
 */
export function useKeyboard(shortcuts, enabled = true) {
    function onKeydown(e) {
        if (!enabled) return
        // 忽略在输入框内的按键
        const tag = document.activeElement?.tagName?.toLowerCase()
        if (
            tag === 'input' ||
            tag === 'textarea' ||
            tag === 'select' ||
            document.activeElement?.isContentEditable
        ) {
            return
        }

        for (const s of shortcuts) {
            const keyMatch = e.key.toLowerCase() === s.key.toLowerCase()
            const ctrlMatch = s.ctrl ? e.ctrlKey || e.metaKey : true
            const shiftMatch = s.shift ? e.shiftKey : !e.shiftKey
            const altMatch = s.alt ? e.altKey : !e.altKey

            if (keyMatch && ctrlMatch && shiftMatch && altMatch && s.handler) {
                e.preventDefault()
                s.handler(e)
                return
            }
        }
    }

    onMounted(() => window.addEventListener('keydown', onKeydown))
    onUnmounted(() => window.removeEventListener('keydown', onKeydown))
}

export const SHORTCUTS_HELP = [
    { keys: 'Ctrl+D', description: 'shortcut.toggleDark' },
    { keys: 'Ctrl+1', description: 'shortcut.dashboard' },
    { keys: 'Ctrl+2', description: 'shortcut.projects' },
    { keys: 'Ctrl+3', description: 'shortcut.tasks' },
    { keys: 'Ctrl+4', description: 'shortcut.data' },
    { keys: 'Ctrl+5', description: 'shortcut.members' },
    { keys: 'Ctrl+Z', description: 'shortcut.undo' },
    { keys: 'Ctrl+Y', description: 'shortcut.redo' },
    { keys: '?', description: 'shortcut.help' },
    { keys: 'Escape', description: 'shortcut.escape' }
]
