import { beforeEach, describe, expect, it, vi } from 'vitest'
import info from '../../../public/release-info.json'

vi.mock('@tauri-apps/api/core', () => ({ isTauri: () => true }))
vi.mock('../../api/remote', () => ({
    DESKTOP_SERVER_ORIGIN: 'https://home-host.tail2956dd.ts.net'
}))
beforeEach(() => vi.resetModules())
describe('manual release checks', () => {
    it('uses only the controlled website and never sends session credentials', async () => {
        const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify(info)))
        const { checkPublicRelease } = await import('../../utils/releaseCheck')
        const signal = new AbortController().signal
        const result = await checkPublicRelease({ signal, fetcher, now: 100 })
        expect(result.tag).toBe(info.tag)
        expect(fetcher).toHaveBeenCalledWith(
            'https://home-host.tail2956dd.ts.net/release-info.json',
            expect.objectContaining({
                credentials: 'omit',
                redirect: 'error',
                headers: { Accept: 'application/json' }
            })
        )
        await checkPublicRelease({ signal, fetcher, now: 101 })
        expect(fetcher).toHaveBeenCalledTimes(1)
        fetcher.mockResolvedValueOnce(new Response(JSON.stringify(info)))
        await checkPublicRelease({ signal, fetcher, now: 300101 })
        expect(fetcher).toHaveBeenCalledTimes(2)
    })
    it('rejects redirects, oversized replies, invalid metadata and aborted checks', async () => {
        const { checkPublicRelease } = await import('../../utils/releaseCheck')
        const signal = new AbortController().signal
        for (const response of [
            new Response('', { status: 404 }),
            new Response('x'.repeat(17000)),
            new Response('<html>offline</html>')
        ]) {
            await expect(
                checkPublicRelease({ signal, fetcher: vi.fn().mockResolvedValue(response) })
            ).rejects.toThrow()
        }
        const controller = new AbortController()
        controller.abort()
        const fetcher = vi.fn()
        await expect(checkPublicRelease({ signal: controller.signal, fetcher })).rejects.toThrow()
        expect(fetcher).not.toHaveBeenCalled()
    })
})
