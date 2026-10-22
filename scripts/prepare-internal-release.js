import { appendFileSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

export function releasePlan(version, sha, internal, number = '2', beta = false, betaNumber = '1') {
    if (
        !/^\d+\.\d+\.\d+$/.test(version) ||
        version.trim() !== version ||
        !/^[a-f0-9]{40}$/.test(sha) ||
        sha.length !== 40
    ) {
        throw new Error('Release requires a stable version and exact source SHA')
    }
    const parsedNumber = Number(number)
    if (internal && beta) throw new Error('Internal and public beta modes are mutually exclusive')
    if (beta && (!/^[1-9]\d{0,3}$/.test(betaNumber) || Number(betaNumber) > 9999)) {
        throw new Error('Beta number must be an integer from 1 to 9999')
    }
    if (
        internal &&
        (!Number.isSafeInteger(parsedNumber) ||
            parsedNumber < 2 ||
            parsedNumber > 9999 ||
            String(parsedNumber) !== number)
    ) {
        throw new Error('Internal number must be an integer from 2 to 9999')
    }
    return {
        tag_name: `v${version}${beta ? `-beta.${betaNumber}` : internal ? `-internal.${number}` : ''}`,
        name: `EasyProject v${version}${beta ? ` — Public Beta ${betaNumber} (unsigned)` : internal ? ` — Internal Test ${number} (unsigned)` : ''}`,
        target_commitish: sha,
        draft: true,
        prerelease: internal || beta,
        body: beta
            ? 'Unsigned public beta candidate. Keep draft until independent artifact verification completes. Formal production-release acceptance is NOT complete; signing, notarization and clean-device/platform acceptance remain pending.'
            : 'Unsigned internal test only. Formal release acceptance is NOT complete. Signing, notarization and platform acceptance remain pending. Do not publish this draft.'
    }
}

export async function reserveInternalRelease(plan, request) {
    if (!plan.draft || !plan.prerelease) throw new Error('Only prerelease drafts may be reserved')
    const ref = await request(`git/ref/tags/${encodeURIComponent(plan.tag_name)}`)
    if (ref.status !== 404) throw new Error('Tag is occupied or its availability is unknown')
    let exhausted = false
    for (let page = 1; page <= 100; page++) {
        const response = await request(`releases?per_page=100&page=${page}`)
        if (!response.ok) throw new Error('Cannot verify existing releases')
        const releases = await response.json()
        if (!Array.isArray(releases)) throw new Error('Invalid release listing')
        if (releases.some(release => release.tag_name === plan.tag_name)) {
            throw new Error('Release is occupied; existing drafts must not be overwritten')
        }
        if (releases.length < 100) {
            exhausted = true
            break
        }
    }
    if (!exhausted) throw new Error('Release listing limit reached; fail closed')
    const created = await request('releases', { method: 'POST', body: JSON.stringify(plan) })
    if (!created.ok) throw new Error('Cannot reserve a new internal draft')
    const release = await created.json()
    if (
        !Number.isSafeInteger(release.id) ||
        release.id <= 0 ||
        !release.draft ||
        !release.prerelease ||
        release.tag_name !== plan.tag_name ||
        release.target_commitish !== plan.target_commitish
    ) {
        throw new Error('Created draft does not match the exact candidate')
    }
    return release.id
}

async function main() {
    const internal = process.env.INTERNAL_TEST === 'true'
    const beta = process.env.PUBLIC_BETA === 'true'
    const { version } = JSON.parse(readFileSync('package.json', 'utf8'))
    const plan = releasePlan(
        version,
        process.env.GITHUB_SHA,
        internal,
        process.env.INTERNAL_NUMBER,
        beta,
        process.env.BETA_NUMBER
    )
    let id = ''
    if (internal || beta) {
        const repository = process.env.GITHUB_REPOSITORY
        if (!/^[\w.-]+\/[\w.-]+$/.test(repository) || !process.env.GITHUB_TOKEN) {
            throw new Error('Authenticated GitHub repository context is required')
        }
        id = await reserveInternalRelease(plan, (endpoint, options = {}) =>
            fetch(`https://api.github.com/repos/${repository}/${endpoint}`, {
                ...options,
                headers: {
                    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                    Accept: 'application/vnd.github+json',
                    'Content-Type': 'application/json',
                    'X-GitHub-Api-Version': '2022-11-28'
                },
                signal: AbortSignal.timeout(30_000)
            })
        )
    }
    appendFileSync(
        process.env.GITHUB_OUTPUT,
        `release_id=${id}\nrelease_tag=${plan.tag_name}\nrelease_name=${plan.name}\n`
    )
    console.log(`Prepared ${plan.tag_name} at ${plan.target_commitish}; internal=${internal}`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
    await main()
}
