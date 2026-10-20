import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@tauri-apps/api/core', () => ({ isTauri: () => true, invoke: vi.fn() }))

describe('optional remote workspace transport', () => {
    beforeEach(() => {
        vi.resetModules()
        localStorage.clear()
        sessionStorage.clear()
        document.querySelector('meta[name="easyproject-web"]')?.remove()
    })
    afterEach(() => vi.unstubAllGlobals())

    it('does not require login or perform network requests in default local mode', async () => {
        const network = vi.fn()
        vi.stubGlobal('fetch', network)
        const remote = await import('../../api/remote')
        expect(remote.remoteActive.value).toBe(false)
        expect(remote.remoteUser.value).toBeNull()
        expect(network).not.toHaveBeenCalled()
    })
    it('rejects insecure origins, embedded credentials and URL paths', async () => {
        const { validateEndpoint } = await import('../../api/remote')
        for (const url of [
            'http://home-host',
            'https://u:p@home-host',
            'https://home-host/path',
            'https://home-host/?token=x'
        ]) {
            expect(() => validateEndpoint(url)).toThrow()
        }
        expect(validateEndpoint('https://home-host.tail2956dd.ts.net/')).toBe(
            'https://home-host.tail2956dd.ts.net'
        )
    })
    it('keeps desktop tokens only in memory and sends them to the selected server', async () => {
        const network = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ user: { username: 'alice' }, token: 'private-test-token' })
        })
        vi.stubGlobal('fetch', network)
        const remote = await import('../../api/remote')
        remote.remoteEndpoint.value = 'https://example.test'
        await remote.loginRemote('alice', 'a-test-password')
        await remote.remoteRequest('/api/auth/session')
        expect(network.mock.calls[1][1].headers.Authorization).toBe('Bearer private-test-token')
        expect(JSON.stringify(localStorage)).not.toContain('private-test-token')
        expect(JSON.stringify(sessionStorage)).not.toContain('private-test-token')
    })
    it('does not retry uncertain mutations and blocks stale writes', async () => {
        const network = vi
            .fn()
            .mockResolvedValueOnce({ ok: true, json: async () => ({ revision: 4 }) })
            .mockResolvedValueOnce({
                ok: false,
                status: 409,
                json: async () => ({ error: 'Conflict' })
            })
        vi.stubGlobal('fetch', network)
        const remote = await import('../../api/remote')
        remote.remoteEndpoint.value = 'https://example.test'
        await expect(remote.remoteAction('project', 'add', { name: 'test' })).rejects.toThrow(
            'Conflict'
        )
        expect(remote.remoteStale.value).toBe(true)
        await expect(remote.remoteAction('project', 'add', { name: 'test' })).rejects.toThrow(
            'refresh'
        )
        expect(network).toHaveBeenCalledTimes(2)
    })
    it('uses same-origin cookies rather than a JavaScript token in web mode', async () => {
        const marker = document.createElement('meta')
        marker.name = 'easyproject-web'
        document.head.append(marker)
        const network = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ user: { username: 'alice' }, token: null })
        })
        vi.stubGlobal('fetch', network)
        const remote = await import('../../api/remote')
        expect(remote.remoteActive.value).toBe(true)
        await remote.loginRemote('alice', 'test-password')
        expect(network.mock.calls[0][1].credentials).toBe('same-origin')
        expect(network.mock.calls[0][1].headers.Authorization).toBeUndefined()
    })
})
