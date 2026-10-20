import { ref } from 'vue'
import { isTauri } from '@tauri-apps/api/core'

export const isWebServer = Boolean(document.querySelector('meta[name="easyproject-web"]'))
export const remoteActive = ref(isWebServer)
export const remoteUser = ref(null)
export const remoteStale = ref(false)
export const remoteEndpoint = ref(
    isWebServer ? window.location.origin : localStorage.getItem('easyproject.server') || ''
)
let accessToken = ''
let revision = null
let queue = Promise.resolve()

export function validateEndpoint(value) {
    const url = new URL(value)
    if (
        url.protocol !== 'https:' ||
        url.username ||
        url.password ||
        url.search ||
        url.hash ||
        url.pathname !== '/'
    ) {
        throw new Error('HTTPS server origin required')
    }
    return url.origin
}

export function leaveRemote() {
    accessToken = ''
    remoteUser.value = null
    revision = null
    remoteStale.value = false
    remoteActive.value = isWebServer
    sessionStorage.removeItem('easyproject.remote')
    window.location.reload()
}

export function selectRemote(value) {
    if (!isTauri()) throw new Error('Use the server website in this browser')
    remoteEndpoint.value = validateEndpoint(value)
    localStorage.setItem('easyproject.server', remoteEndpoint.value)
    sessionStorage.setItem('easyproject.remote', '1')
    remoteActive.value = true
    window.location.reload()
}

if (!isWebServer && isTauri() && sessionStorage.getItem('easyproject.remote') === '1') {
    remoteActive.value = true
}

export async function remoteRequest(path, body, expected = null) {
    /** @type {Record<string,string>} */
    const headers = { 'X-EasyProject-Request': '1' }
    if (!isWebServer) {
        headers['X-EasyProject-Client'] = 'desktop'
        if (accessToken) headers.Authorization = `Bearer ${accessToken}`
    }
    if (body !== undefined) headers['Content-Type'] = 'application/json'
    if (expected !== null) headers['X-Workspace-Revision'] = String(expected)
    const response = await fetch(`${remoteEndpoint.value}${path}`, {
        method: body === undefined ? 'GET' : 'POST',
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        credentials: isWebServer ? 'same-origin' : 'omit',
        signal: AbortSignal.timeout(30000),
        redirect: 'error'
    })
    const result = await response.json()
    if (!response.ok) {
        if (response.status === 401) remoteUser.value = null
        if (response.status === 409) remoteStale.value = true
        throw new Error(result.error || `Request failed (${response.status})`)
    }
    return result
}

export async function loginRemote(username, password) {
    const result = await remoteRequest('/api/auth/login', { username, password })
    accessToken = result.token || ''
    remoteUser.value = result.user
    revision = null
    remoteStale.value = false
}

export async function resumeRemote() {
    if (!isWebServer) return
    const result = await remoteRequest('/api/auth/session')
    remoteUser.value = result.user
}

export async function logoutRemote() {
    // Do not pretend the server session was revoked if the network request failed.
    await remoteRequest('/api/auth/logout', {})
    accessToken = ''
    remoteUser.value = null
    revision = null
    remoteStale.value = false
}

export function remoteAction(model, action, data) {
    const operation = async () => {
        if (remoteStale.value) throw new Error('Workspace changed; refresh before continuing')
        if (revision === null) {
            revision = (await remoteRequest('/api/workspace/revision')).revision
        }
        const result = await remoteRequest(
            '/api/workspace/action',
            { model, action, data },
            revision
        )
        const readOnly = [
            'get_all',
            'search',
            'get_by_member',
            'get_by_project',
            'export_json',
            'list_backups',
            'preview_backup',
            'fetch_ics'
        ].includes(action)
        if (readOnly && result.revision !== revision) {
            remoteStale.value = true
            throw new Error('Workspace changed; refresh before continuing')
        }
        revision = result.revision
        return result.data ?? null
    }
    const result = queue.then(operation)
    queue = result.catch(() => {})
    return result
}

export async function checkRemoteRevision() {
    if (!remoteUser.value || revision === null || remoteStale.value) return
    const result = await remoteRequest('/api/workspace/revision')
    if (result.revision !== revision) remoteStale.value = true
}
