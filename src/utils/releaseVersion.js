const RELEASE_ROOT = 'https://github.com/15169046827/easy-project/releases/tag/'

export function parseVersion(value) {
    if (typeof value !== 'string' || value.length > 80) return null
    const match =
        /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/.exec(
            value
        )
    if (!match) return null
    const numbers = match.slice(1, 4).map(Number)
    const prerelease = match[4]?.split('.') || []
    if (
        numbers.some(number => !Number.isSafeInteger(number)) ||
        prerelease.some(
            part =>
                /^\d+$/.test(part) &&
                ((part.length > 1 && part.startsWith('0')) || !Number.isSafeInteger(Number(part)))
        )
    )
        return null
    return { numbers, prerelease, base: numbers.join('.') }
}

export function compareVersions(left, right) {
    const a = parseVersion(left),
        b = parseVersion(right)
    if (!a || !b) throw new Error('Invalid release version')
    for (let index = 0; index < 3; index++) {
        if (a.numbers[index] !== b.numbers[index])
            return Math.sign(a.numbers[index] - b.numbers[index])
    }
    if (!a.prerelease.length || !b.prerelease.length)
        return a.prerelease.length ? -1 : b.prerelease.length ? 1 : 0
    for (let index = 0; index < Math.max(a.prerelease.length, b.prerelease.length); index++) {
        const x = a.prerelease[index],
            y = b.prerelease[index]
        if (x === undefined || y === undefined) return x === undefined ? -1 : 1
        if (x === y) continue
        const numericX = /^\d+$/.test(x),
            numericY = /^\d+$/.test(y)
        if (numericX && numericY) return Math.sign(Number(x) - Number(y))
        if (numericX !== numericY) return numericX ? -1 : 1
        return x < y ? -1 : 1
    }
    return 0
}

export function validateReleaseInfo(value) {
    if (
        !value ||
        typeof value !== 'object' ||
        Array.isArray(value) ||
        value.schemaVersion !== 1 ||
        typeof value.ready !== 'boolean'
    )
        throw new Error('Invalid release metadata')
    if (
        Object.keys(value).some(
            key => !['schemaVersion', 'ready', 'version', 'tag', 'publishedDate'].includes(key)
        )
    )
        throw new Error('Unknown release metadata fields')
    if (!value.ready) {
        if (Object.keys(value).length !== 2)
            throw new Error('Unpublished metadata has release fields')
        return null
    }
    if (
        !parseVersion(value.version) ||
        value.tag !== `v${value.version}` ||
        typeof value.publishedDate !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value.publishedDate)
    )
        throw new Error('Invalid published release')
    const date = new Date(value.publishedDate + 'T00:00:00Z')
    if (!Number.isFinite(date.valueOf()) || date.toISOString().slice(0, 10) !== value.publishedDate)
        throw new Error('Invalid publication date')
    return Object.freeze({
        version: String(value.version),
        tag: String(value.tag),
        publishedDate: String(value.publishedDate),
        url: RELEASE_ROOT + encodeURIComponent(value.tag)
    })
}

export function isInternalBuildTag(tag) {
    const version =
        typeof tag === 'string' && tag.startsWith('v') ? parseVersion(tag.slice(1)) : null
    return !version || version.prerelease[0] === 'internal'
}

export function releaseRelationship(currentTag, version) {
    if (isInternalBuildTag(currentTag)) return 'internal'
    const difference = compareVersions(version, currentTag.slice(1))
    return difference > 0 ? 'available' : difference < 0 ? 'ahead' : 'current'
}
