import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(process.env.BUNDLE_ROOT || 'src-tauri/target')
const expected = (process.env.EXPECTED_BUNDLES || '')
    .split(',')
    .map(value => value.trim().toLowerCase())
    .filter(Boolean)

async function walk(directory, entries = []) {
    for (const item of await readdir(directory, { withFileTypes: true })) {
        const itemPath = path.join(directory, item.name)
        if (item.isDirectory()) {
            entries.push({ path: itemPath, directory: true })
            await walk(itemPath, entries)
        } else {
            entries.push({ path: itemPath, directory: false })
        }
    }
    return entries
}

const entries = await walk(root)
const bundleEntries = entries.filter(entry => {
    const parts = entry.path.split(path.sep)
    const bundleIndex = parts.lastIndexOf('bundle')
    return bundleIndex > 0 && parts[bundleIndex - 1] === 'release'
})

if (!expected.length) throw new Error('EXPECTED_BUNDLES must contain at least one extension')

for (const bundle of expected) {
    const suffix = `.${bundle}`
    const matches = bundleEntries.filter(entry => entry.path.toLowerCase().endsWith(suffix))
    if (!matches.length) throw new Error(`Missing ${suffix} bundle under ${root}`)
    for (const match of matches.filter(entry => !entry.directory)) {
        if ((await stat(match.path)).size === 0)
            throw new Error(`Empty release artifact: ${match.path}`)
    }
    console.log(`Validated ${matches.length} ${suffix} bundle(s).`)
}
