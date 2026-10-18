import { describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { releasePlan, reserveInternalRelease } from './prepare-internal-release.js'

const sha = 'a'.repeat(40)
const plan = releasePlan('0.1.0', sha, true)
const response = (status, value) => ({
    status,
    ok: status >= 200 && status < 300,
    json: async () => value
})

describe('independent internal candidates', () => {
    it('keeps TypeScript declarations LF on Windows checkouts', () => {
        expect(readFileSync('.gitattributes', 'utf8')).toContain('*.ts text eol=lf')
        expect(readFileSync('e2e/test-globals.d.ts', 'utf8')).not.toContain('\r')
    })
    it('uses internal.2 with exact source and a private draft', () => {
        expect(plan).toMatchObject({
            tag_name: 'v0.1.0-internal.2',
            target_commitish: sha,
            draft: true,
            prerelease: true
        })
        expect(releasePlan('0.1.0', sha, false).tag_name).toBe('v0.1.0')
    })
    it('rejects old, invalid and injected candidate values', () => {
        for (const number of ['1', '0', '02', '2\nrelease_id=1', '10000', '-2']) {
            expect(() => releasePlan('0.1.0', sha, true, number)).toThrow()
        }
        expect(() => releasePlan('0.1.0\n', sha, true)).toThrow()
        expect(() => releasePlan('0.1.0', 'main', true)).toThrow()
    })
    it('reserves a new draft without changing old assets', async () => {
        const request = vi
            .fn()
            .mockResolvedValueOnce(response(404))
            .mockResolvedValueOnce(response(200, [{ tag_name: 'v0.1.0-internal.1' }]))
            .mockResolvedValueOnce(response(201, { ...plan, id: 123 }))
        expect(await reserveInternalRelease(plan, request)).toBe(123)
        expect(request.mock.calls[2][1]).toEqual({ method: 'POST', body: JSON.stringify(plan) })
    })
    it('blocks an existing tag or failed availability check before writing', async () => {
        for (const status of [200, 403, 500]) {
            const request = vi.fn().mockResolvedValue(response(status))
            await expect(reserveInternalRelease(plan, request)).rejects.toThrow()
            expect(request).toHaveBeenCalledTimes(1)
        }
    })
    it('blocks a matching draft even when the tag is not yet created', async () => {
        const request = vi
            .fn()
            .mockResolvedValueOnce(response(404))
            .mockResolvedValueOnce(response(200, [plan]))
        await expect(reserveInternalRelease(plan, request)).rejects.toThrow('occupied')
        expect(request).toHaveBeenCalledTimes(2)
    })
    it('checks later pages before reserving a draft', async () => {
        const request = vi
            .fn()
            .mockResolvedValueOnce(response(404))
            .mockResolvedValueOnce(
                response(
                    200,
                    Array.from({ length: 100 }, () => ({ tag_name: 'old' }))
                )
            )
            .mockResolvedValueOnce(response(200, [plan]))
        await expect(reserveInternalRelease(plan, request)).rejects.toThrow('occupied')
        expect(request.mock.calls[2][0]).toContain('page=2')
    })
    it('fails closed on listing errors or an incorrect returned source', async () => {
        const failed = vi
            .fn()
            .mockResolvedValueOnce(response(404))
            .mockResolvedValueOnce(response(403))
        await expect(reserveInternalRelease(plan, failed)).rejects.toThrow()
        const changed = vi
            .fn()
            .mockResolvedValueOnce(response(404))
            .mockResolvedValueOnce(response(200, []))
            .mockResolvedValueOnce(
                response(201, { ...plan, target_commitish: 'b'.repeat(40), id: 123 })
            )
        await expect(reserveInternalRelease(plan, changed)).rejects.toThrow('exact candidate')
    })
})
