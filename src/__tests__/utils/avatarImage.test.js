import { afterEach, describe, expect, it, vi } from 'vitest'
import { prepareAvatar } from '../../utils/avatarImage'

afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
})
describe('account avatar normalization', () => {
    it('rejects unsafe formats and size before decoding', async () => {
        const decode = vi.fn()
        vi.stubGlobal('createImageBitmap', decode)
        await expect(prepareAvatar({ type: 'image/svg+xml', size: 20 })).rejects.toThrow(
            'avatarType'
        )
        await expect(prepareAvatar({ type: 'image/png', size: 6 * 1024 * 1024 })).rejects.toThrow(
            'avatarSize'
        )
        expect(decode).not.toHaveBeenCalled()
    })
    it('center-crops landscape images to a bounded square and releases pixels', async () => {
        const image = { width: 800, height: 400, close: vi.fn() }
        const draw = vi.fn()
        vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue(image))
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
            /** @type {CanvasRenderingContext2D} */ (/** @type {unknown} */ ({ drawImage: draw }))
        )
        vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(
            'data:image/png;base64,c3ludGhldGlj'
        )
        expect(await prepareAvatar({ type: 'image/jpeg', size: 1000 })).toContain(
            'data:image/png;base64,'
        )
        expect(draw).toHaveBeenCalledWith(image, 200, 0, 400, 400, 0, 0, 128, 128)
        expect(image.close).toHaveBeenCalledOnce()
    })
    it('rejects excessive dimensions and always releases the decoded image', async () => {
        const image = { width: 10000, height: 10000, close: vi.fn() }
        vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue(image))
        await expect(prepareAvatar({ type: 'image/webp', size: 1000 })).rejects.toThrow(
            'avatarDimensions'
        )
        expect(image.close).toHaveBeenCalledOnce()
    })
})
