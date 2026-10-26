import { describe, expect, it } from 'vitest'
import { buildIdentity } from '../../../scripts/build-identity.js'

const clean = { appVersion: '0.1.2', commit: 'a'.repeat(40), dirty: false }
describe('release build provenance gate', () => {
    it('keeps untagged clean builds internal and accepts matching prerelease tags', () => {
        expect(buildIdentity(clean).releaseTag).toBe('')
        expect(buildIdentity({ ...clean, releaseTag: 'v0.1.2-beta.1' }).releaseTag).toBe(
            'v0.1.2-beta.1'
        )
    })
    it.each(['v0.1.3', '0.1.2', 'v0.1.2-beta.01', 'v0.1.2+build', 'v0.1.2/evil'])(
        'rejects mismatching or malformed tag %s',
        releaseTag => expect(() => buildIdentity({ ...clean, releaseTag })).toThrow()
    )
    it.each([
        { dirty: true },
        { dirty: undefined },
        { commit: 'unknown' },
        { commit: 'abcd' },
        { commit: '' }
    ])('rejects tagged source without clean full commit: %j', invalid => {
        expect(() => buildIdentity({ ...clean, ...invalid, releaseTag: 'v0.1.2-beta.1' })).toThrow(
            'clean identified source'
        )
    })
    it('labels unknown or dirty untagged builds unverified', () => {
        expect(buildIdentity({ appVersion: '0.1.2' })).toEqual({
            commit: 'unknown',
            dirty: true,
            releaseTag: ''
        })
        expect(buildIdentity({ ...clean, dirty: true }).dirty).toBe(true)
    })
    it.each(['0.1.2-beta.1', 'bad', '0.01.2'])('rejects invalid application base %s', appVersion =>
        expect(() => buildIdentity({ ...clean, appVersion })).toThrow()
    )
})
