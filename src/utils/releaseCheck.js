import { isTauri } from '@tauri-apps/api/core'
import { DESKTOP_SERVER_ORIGIN } from '../api/remote'
import { validateReleaseInfo } from './releaseVersion'

let cached = null
const MAX_BYTES = 16 * 1024

export async function checkPublicRelease({ signal, fetcher = fetch, now = Date.now() }) {
    signal.throwIfAborted()
    if (cached && now - cached.time >= 0 && now - cached.time < 5 * 60 * 1000) return cached.info
    const origin = isTauri() ? DESKTOP_SERVER_ORIGIN : window.location.origin
    const response = await fetcher(new URL('/release-info.json', origin).href, {
        method: 'GET',
        credentials: 'omit',
        redirect: 'error',
        cache: 'no-store',
        signal,
        headers: { Accept: 'application/json' }
    })
    if (!response.ok || response.redirected || !response.body)
        throw new Error('Release metadata unavailable')
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let bytes = 0,
        text = ''
    try {
        while (true) {
            signal.throwIfAborted()
            const chunk = await reader.read()
            if (chunk.done) break
            bytes += chunk.value.byteLength
            if (bytes > MAX_BYTES) throw new Error('Release metadata too large')
            text += decoder.decode(chunk.value, { stream: true })
        }
        signal.throwIfAborted()
        const info = validateReleaseInfo(JSON.parse(text + decoder.decode()))
        cached = { time: now, info }
        return info
    } finally {
        await reader.cancel().catch(() => {})
        reader.releaseLock()
    }
}
