import { expect, it } from 'vitest'
import { desktopRelease } from '../../modules/landing/downloadRelease'

it('binds all download links to one exact prerelease in the project repository', () => {
    const prefix = 'https://github.com/15169046827/easy-project/releases/'
    expect(desktopRelease.url).toBe(prefix + 'tag/' + desktopRelease.tag)
    expect(desktopRelease.base).toBe(prefix + 'download/' + desktopRelease.tag + '/')
    expect(new Set(desktopRelease.assets.map(asset => asset.file)).size).toBe(6)
    for (const asset of desktopRelease.assets) {
        expect(asset.file).toMatch(/^EasyProject_0\.1\.1_[a-z0-9_.-]+$/)
        expect(asset.file).not.toContain('..')
    }
    if (desktopRelease.ready) expect(desktopRelease.publishedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
})
