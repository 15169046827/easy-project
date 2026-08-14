import { invoke } from '@tauri-apps/api/core'
import { ref } from 'vue'
import { i18n } from '../i18n'
import { demoAction } from './demo.js'

const undoStack = []
const redoStack = []
let historyEnabled = false
let historyBusy = false
export const canUndo = ref(false)
export const canRedo = ref(false)

const mutationActions = new Set([
    'add',
    'update',
    'delete',
    'save',
    'clear',
    'set_for_task',
    'import_json',
    'restore'
])

function syncHistoryState() {
    canUndo.value = undoStack.length > 0
    canRedo.value = redoStack.length > 0
}

async function invokeAction(model, action, data = {}) {
    if (
        import.meta.env.DEV &&
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).has('demo')
    ) {
        return demoAction(model, action, data)
    }
    try {
        const res = await invoke('crud_action', { model, action, data })
        if (res && res.success) {
            return res.data ?? null
        } else {
            const msg = res?.message || i18n.global.t('common.unknownError')
            console.error(`❌ ${model}.${action} 调用失败:`, msg)
            throw new Error(msg)
        }
    } catch (err) {
        console.error(`⚠️ Tauri 调用异常 (${model}.${action}):`, err)
        throw err
    }
}

export function enableHistory() {
    historyEnabled = true
}

export async function crudAction(model, action, data = {}) {
    const shouldCapture = historyEnabled && !historyBusy && mutationActions.has(action)
    let snapshot = null
    if (shouldCapture) {
        try {
            snapshot = await invokeAction('data', 'export_json')
        } catch (error) {
            console.warn('Unable to create undo snapshot:', error)
        }
    }
    const result = await invokeAction(model, action, data)
    if (snapshot) {
        undoStack.push({ snapshot, label: `${model}.${action}` })
        if (undoStack.length > 30) undoStack.shift()
        redoStack.length = 0
        syncHistoryState()
    }
    return result
}

async function restoreHistorySnapshot(snapshot) {
    historyBusy = true
    try {
        await invokeAction('data', 'import_json', { payload: snapshot })
        window.dispatchEvent(new CustomEvent('easyproject:data-changed'))
    } finally {
        historyBusy = false
    }
}

export async function undoLastAction() {
    const entry = undoStack.pop()
    if (!entry) return null
    const current = await invokeAction('data', 'export_json')
    await restoreHistorySnapshot(entry.snapshot)
    redoStack.push({ snapshot: current, label: entry.label })
    syncHistoryState()
    return entry.label
}

export async function redoLastAction() {
    const entry = redoStack.pop()
    if (!entry) return null
    const current = await invokeAction('data', 'export_json')
    await restoreHistorySnapshot(entry.snapshot)
    undoStack.push({ snapshot: current, label: entry.label })
    syncHistoryState()
    return entry.label
}
