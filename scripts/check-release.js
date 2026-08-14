import { readFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const packageJson = JSON.parse(await readFile(new URL('package.json', root), 'utf8'))
const tauriConfig = JSON.parse(await readFile(new URL('src-tauri/tauri.conf.json', root), 'utf8'))
const cargoToml = await readFile(new URL('src-tauri/Cargo.toml', root), 'utf8')
const cargoVersion = cargoToml.match(/^version\s*=\s*"([^"]+)"/m)?.[1]

const versions = {
    'package.json': packageJson.version,
    'tauri.conf.json': tauriConfig.version,
    'Cargo.toml': cargoVersion
}
const uniqueVersions = new Set(Object.values(versions))
if (uniqueVersions.size !== 1 || uniqueVersions.has(undefined)) {
    throw new Error(`Release versions do not match: ${JSON.stringify(versions)}`)
}

const version = packageJson.version
if (process.env.GITHUB_REF_TYPE === 'tag') {
    const expectedTag = `v${version}`
    if (process.env.GITHUB_REF_NAME !== expectedTag) {
        throw new Error(
            `Release tag ${process.env.GITHUB_REF_NAME} does not match application version ${expectedTag}`
        )
    }
}

console.log(`EasyProject release metadata is consistent at v${version}.`)

const requiredFiles = [
    'README.md',
    'LICENSE',
    'CONTRIBUTING.md',
    'CHANGELOG.md',
    'docs/RELEASING.md',
    'public/examples/easy-project-example.json'
]
await Promise.all(requiredFiles.map(file => readFile(new URL(file, root), 'utf8')))
const example = JSON.parse(
    await readFile(new URL('public/examples/easy-project-example.json', root), 'utf8')
)
if (example.schemaVersion !== 5 || !example.projects?.length || !example.tasks?.length) {
    throw new Error('Example project must be a non-empty schemaVersion 5 snapshot.')
}
if (!tauriConfig.identifier || tauriConfig.identifier === 'com.tauri.dev') {
    throw new Error('Tauri bundle identifier must be release-safe.')
}
console.log('Release documentation, license, and example project are present and valid.')
