import { describe, expect, it } from 'vitest'
import { fitWindow, snapBall } from '../../modules/floating/windowGeometry'

describe('floating window work-area geometry', () => {
    const area = { x: -1920, y: -200, width: 1920, height: 1040 }
    const size = { width: 64, height: 64 }
    it.each([
        [
            { x: -1910, y: 200 },
            { x: -1920, y: 200, edge: 'left' }
        ],
        [
            { x: -80, y: 200 },
            { x: -64, y: 200, edge: 'right' }
        ],
        [
            { x: -900, y: -180 },
            { x: -900, y: -200, edge: 'top' }
        ],
        [
            { x: -900, y: 760 },
            { x: -900, y: 776, edge: 'bottom' }
        ],
        [
            { x: -900, y: 300 },
            { x: -900, y: 300, edge: '' }
        ]
    ])(
        'docks only inside the threshold and permits a floating position: %j',
        (position, expected) => {
            expect(snapBall(position, size, area)).toEqual(expected)
        }
    )
    it('clamps off-screen positions and honors physical-pixel DPI thresholds', () => {
        expect(fitWindow({ x: 100, y: -400 }, size, area)).toEqual({ x: -64, y: -200 })
        expect(snapBall({ x: -1880, y: 200 }, size, area, 48).edge).toBe('left')
        expect(snapBall({ x: -1880, y: 200 }, size, area, 24).edge).toBe('')
    })
})
