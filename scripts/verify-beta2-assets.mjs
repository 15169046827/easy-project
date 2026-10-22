// One-candidate, read-only transport bridge. Never builds, publishes or changes a release.
import { mkdir, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'

const source = '34de5f2edb090b897f6eb98ccbc5a376f4a7aece'
const runId = 39799550769
const releaseId = 420856621
const tag = 'v0.1.1-beta.2'
const repo = '15169046827/easy-project'
const expected = new Map([
    [
        'EasyProject_0.1.1_darwin_aarch64.app.tar.gz',
        '50331c8b493f4aca3006572ce77480edcd28cfbd2683dd63b04d0b4112e178c9'
    ],
    [
        'EasyProject_0.1.1_darwin_aarch64.dmg',
        'f60d6a09299f771e13b6a14ae7d49c9a3932641af436e8d91ba857accccdfb88'
    ],
    [
        'EasyProject_0.1.1_darwin_x64.app.tar.gz',
        '70abce9f69640c42bc12f188fd581e672aa048b2d35a68986fe5423bb03f9312'
    ],
    [
        'EasyProject_0.1.1_darwin_x64.dmg',
        '0bacfbfe85ad71bc36899ae500de9c1f3c33d3b7bbb7536f622ec80acb387ab9'
    ],
    [
        'EasyProject_0.1.1_windows_x64-setup.exe',
        '053604b675209fb498d2d45adb2173f9b0ed3bed68da2d5ac492aedf6351249c'
    ],
    [
        'EasyProject_0.1.1_windows_x64.msi',
        '419617acaaf4537761bd93ac166697180bfd24e6889f5ed4872b867bf469d2e4'
    ]
])
const token = process.env.GITHUB_TOKEN
if (!token || process.env.GITHUB_REPOSITORY !== repo)
    throw new Error('Expected repository token context')
const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
}
async function get(endpoint) {
    const response = await fetch(`https://api.github.com/repos/${repo}/${endpoint}`, {
        headers,
        signal: AbortSignal.timeout(30000)
    })
    if (!response.ok) throw new Error(`Metadata request failed: ${response.status}`)
    return response.json()
}
const run = await get(`actions/runs/${runId}`)
if (
    run.head_sha !== source ||
    run.status !== 'completed' ||
    run.conclusion !== 'success' ||
    run.path !== '.github/workflows/release.yml'
)
    throw new Error('Prior quality/build run gate failed')
const release = await get(`releases/${releaseId}`)
if (
    !release.draft ||
    !release.prerelease ||
    release.tag_name !== tag ||
    release.target_commitish !== source ||
    release.assets.length !== expected.size
)
    throw new Error('Exact draft candidate gate failed')
if (new Set(release.assets.map(asset => asset.name)).size !== expected.size)
    throw new Error('Duplicate assets')
await mkdir('.verified-beta2', { recursive: false })
const verified = []
for (const asset of release.assets) {
    const digest = expected.get(asset.name)
    if (
        !digest ||
        asset.digest !== `sha256:${digest}` ||
        asset.size < 1000000 ||
        asset.size > 20000000
    )
        throw new Error('Unexpected asset metadata')
    let response = await fetch(`https://api.github.com/repos/${repo}/releases/assets/${asset.id}`, {
        headers: { ...headers, Accept: 'application/octet-stream' },
        redirect: 'manual',
        signal: AbortSignal.timeout(30000)
    })
    if (response.status === 302) {
        const target = new URL(response.headers.get('location'))
        if (
            target.protocol !== 'https:' ||
            target.hostname !== 'release-assets.githubusercontent.com' ||
            target.port ||
            target.username ||
            target.password
        )
            throw new Error('Unexpected transfer host')
        response = await fetch(target, { redirect: 'error', signal: AbortSignal.timeout(90000) })
    }
    if (!response.ok) throw new Error(`Asset transfer failed: ${response.status}`)
    const bytes = Buffer.from(await response.arrayBuffer())
    if (bytes.length !== asset.size || createHash('sha256').update(bytes).digest('hex') !== digest)
        throw new Error('Independent byte digest mismatch')
    await writeFile(`.verified-beta2/${asset.name}`, bytes, { flag: 'wx' })
    verified.push({ name: asset.name, size: bytes.length, sha256: digest })
    console.log(`Verified original bytes: ${asset.name} (${bytes.length})`)
}
await writeFile(
    '.verified-beta2/bridge-verification.json',
    JSON.stringify({ source, runId, releaseId, tag, verified }, null, 2),
    { flag: 'wx' }
)
