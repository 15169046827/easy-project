import { describe, expect, it } from 'vitest'
import { isLandingEntry } from '../../utils/entryMode'

describe('public landing entry boundary', () => {
    const location = (path = '/') => new URL(path, 'https://example.test')
    it('shows the homepage and section anchors without loading the workspace', () => {
        expect(isLandingEntry(location())).toBe(true)
        expect(isLandingEntry(location('/#features'))).toBe(true)
    })
    it('preserves all historical links and explicit app entry', () => {
        for (const path of [
            '/index.html',
            '/#/dashboard',
            '/#/project/PROJECT:abcd',
            '/?demo=1',
            '/other'
        ])
            expect(isLandingEntry(location(path))).toBe(false)
    })
    it('never replaces desktop or floating entry', () => {
        expect(isLandingEntry(location(), true)).toBe(false)
        expect(isLandingEntry(location(), false, true)).toBe(false)
    })
})
