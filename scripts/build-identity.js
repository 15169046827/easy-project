import { parseVersion } from '../src/utils/releaseVersion.js'

// Pure gate: an explicit release label must never attest unknown or dirty source.
export function buildIdentity({ appVersion, releaseTag = '', commit = 'unknown', dirty = true }) {
    if (!parseVersion(appVersion) || parseVersion(appVersion).base !== appVersion)
        throw new Error('Invalid application base version')
    if (
        releaseTag &&
        (!releaseTag.startsWith('v') || parseVersion(releaseTag.slice(1))?.base !== appVersion)
    )
        throw new Error('Release tag must match the application version')
    const identified = /^[0-9a-f]{40}$/.test(commit)
    const unverified = dirty !== false || !identified
    if (releaseTag && unverified)
        throw new Error('A tagged release requires clean identified source')
    return {
        commit: identified ? commit : 'unknown',
        dirty: unverified,
        releaseTag: unverified ? '' : releaseTag
    }
}
