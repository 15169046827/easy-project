/** Produce a small, metadata-free square avatar; never keep the original file. */
export async function prepareAvatar(file) {
    if (!file || !['image/png', 'image/jpeg', 'image/webp'].includes(file.type))
        throw new Error('avatarType')
    if (file.size > 5 * 1024 * 1024) throw new Error('avatarSize')
    const image = await createImageBitmap(file, { imageOrientation: 'from-image' })
    try {
        if (!image.width || !image.height || image.width * image.height > 20_000_000)
            throw new Error('avatarDimensions')
        const canvas = document.createElement('canvas')
        canvas.width = canvas.height = 128
        const context = canvas.getContext('2d')
        if (!context) throw new Error('avatarProcessing')
        const side = Math.min(image.width, image.height)
        context.drawImage(
            image,
            (image.width - side) / 2,
            (image.height - side) / 2,
            side,
            side,
            0,
            0,
            128,
            128
        )
        const result = canvas.toDataURL('image/png')
        if (!result.startsWith('data:image/png;base64,') || result.length > 180_000)
            throw new Error('avatarSize')
        return result
    } finally {
        image.close()
    }
}
