import { writeFileSync, readFileSync } from 'node:fs'
import { desktopRelease } from '../src/modules/landing/downloadRelease.js'
import { parseVersion, validateReleaseInfo } from '../src/utils/releaseVersion.js'

const info = desktopRelease.ready
    ? {
          schemaVersion: 1,
          ready: true,
          version: desktopRelease.tag.slice(1),
          tag: desktopRelease.tag,
          publishedDate: desktopRelease.publishedDate
      }
    : { schemaVersion: 1, ready: false }
const validated = validateReleaseInfo(info)
if (validated && validated.url !== desktopRelease.url)
    throw new Error('Release page binding mismatch')
if (
    validated &&
    (parseVersion(validated.version).base !== desktopRelease.version ||
        desktopRelease.base !== validated.url.replace('/tag/', '/download/') + '/')
)
    throw new Error('Landing release version/download binding mismatch')
const content = JSON.stringify(info, null, 4) + '\n'
if (process.argv.includes('--check')) {
    if (readFileSync('public/release-info.json', 'utf8').replaceAll('\r\n', '\n') !== content)
        throw new Error('Public release metadata is stale; regenerate it')
} else writeFileSync('public/release-info.json', content)
console.log('Public release metadata matches the verified landing download entry')
