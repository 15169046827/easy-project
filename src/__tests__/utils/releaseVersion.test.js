import { describe, expect, it } from 'vitest'
import {
    compareVersions,
    isInternalBuildTag,
    parseVersion,
    releaseRelationship,
    validateReleaseInfo
} from '../../utils/releaseVersion'
import info from '../../../public/release-info.json'

describe('verified public release metadata', () => {
    it.each([
        '1.2',
        '01.2.3',
        '1.2.3-beta.01',
        '99999999999999999999.1.1',
        'https://evil.test',
        '../1.2.3',
        '1.2.3-<script>'
    ])('rejects invalid version %s', value => {
        expect(parseVersion(value)).toBeNull()
    })
    it.each([
        ['0.1.10', '0.1.2', 1],
        ['1.0.0', '0.9.9', 1],
        ['0.1.2-beta.10', '0.1.2-beta.2', 1],
        ['0.1.2', '0.1.2-rc.1', 1],
        ['0.1.2-alpha.1', '0.1.2-beta.1', -1],
        ['0.1.2-beta', '0.1.2-beta.1', -1],
        ['0.1.2-beta.1', '0.1.2-beta.1', 0]
    ])('compares %s with %s safely', (left, right, result) => {
        expect(compareVersions(left, right)).toBe(result)
    })
    it('does not label an internal build as up to date or recommend a downgrade', () => {
        expect(releaseRelationship('', '0.1.2-beta.1')).toBe('internal')
        expect(releaseRelationship('v0.1.2-internal.3', '0.1.2-beta.1')).toBe('internal')
        expect(isInternalBuildTag('v0.1.2-internal.3')).toBe(true)
        expect(isInternalBuildTag('v0.1.2-beta.1')).toBe(false)
        expect(releaseRelationship('v0.1.2', '0.1.2-beta.1')).toBe('ahead')
        expect(releaseRelationship('v0.1.2-beta.1', '0.1.3-beta.1')).toBe('available')
    })
    it('binds public metadata to the verified release, never an arbitrary destination', () => {
        const result = validateReleaseInfo(info)
        expect(result.url).toBe(
            'https://github.com/15169046827/easy-project/releases/tag/v0.1.2-beta.1'
        )
        for (const changed of [
            { tag: 'v0.1.3' },
            { publishedDate: '2026-02-31' },
            { url: 'https://evil.test' },
            { schemaVersion: 2 }
        ]) {
            expect(() => validateReleaseInfo({ ...info, ...changed })).toThrow()
        }
        expect(validateReleaseInfo({ schemaVersion: 1, ready: false })).toBeNull()
        expect(() => validateReleaseInfo({ ...info, ready: false })).toThrow()
    })
})
