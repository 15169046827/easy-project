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
    for (const match of matches) {
        if (!match.directory) {
            if ((await stat(match.path)).size === 0)
                throw new Error(`Empty release artifact: ${match.path}`)
            continue
        }

        const files = bundleEntries.filter(entry => {
            if (entry.directory) return false
            const relative = path.relative(match.path, entry.path)
            return relative && !relative.startsWith('..') && !path.isAbsolute(relative)
        })
        if (!files.length) throw new Error(`Empty release bundle directory: ${match.path}`)
        const sizes = await Promise.all(files.map(file => stat(file.path)))
        if (!sizes.some(file => file.size > 0)) {
            throw new Error(`Release bundle contains no data: ${match.path}`)
        }
    }
    console.log(`Validated ${matches.length} ${suffix} bundle(s).`)
}
