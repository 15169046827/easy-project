import { describe, expect, it } from 'vitest'
import { describePageFailure } from '../../utils/pageFailure'

describe('local page failure diagnostics', () => {
    it('identifies the JavaScript error and owned component', () => {
        expect(
            describePageFailure(
                new TypeError("Cannot read properties of undefined (reading 'id')"),
                {
                    $options: { __name: 'ProjectWorkspace' }
                }
            )
        ).toBe("TypeError · ProjectWorkspace · Cannot read properties of undefined (reading 'id')")
    })
    it('does not display arbitrary API error messages', () => {
        expect(describePageFailure(new Error('password or account data'))).toBe('Error · Page')
    })
    it('removes URLs, credentials, record IDs and email addresses', () => {
        const text = describePageFailure(
            new TypeError(
                'https://example.test/?secret=secret PROJECT:0123456789abcdef0123456789abcdef ' +
                    'someone@example.test abcdefghijklmnopqrstuvwxyz0123456789'
            )
        )
        for (const value of ['example.test', '0123456789abcdef', 'abcdefghijklmnopqrstuvwxyz'])
            expect(text).not.toContain(value)
        expect(text).toContain('[URL] [ID] [email] [redacted]')
    })
})
