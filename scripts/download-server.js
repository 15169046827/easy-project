import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { lstatSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const run = process.argv[2]
const source = process.argv[3]
if (!/^\d+$/.test(run || '') || !/^[a-f0-9]{40}$/.test(source || ''))
    throw new Error('Exact run and source SHA required')
const repository = 'repos/15169046827/easy-project'
const api = endpoint =>
    JSON.parse(execFileSync('gh', ['api', `${repository}/${endpoint}`], { encoding: 'utf8' }))
const workflow = api(`actions/runs/${run}`)
if (workflow.head_sha !== source || workflow.conclusion !== 'success')
    throw new Error('Source or successful workflow mismatch')
const artifacts = api(`actions/runs/${run}/artifacts`).artifacts.filter(
    artifact => artifact.name === 'easyproject-server-linux-x64' && !artifact.expired
)
if (artifacts.length !== 1 || !artifacts[0].digest?.startsWith('sha256:'))
    throw new Error('Expected one artifact with official SHA256')
const artifact = artifacts[0]
const bytes = execFileSync('gh', ['api', `${repository}/actions/artifacts/${artifact.id}/zip`], {
    maxBuffer: 64 * 1024 * 1024
})
const digest = createHash('sha256').update(bytes).digest('hex')
if (artifact.digest !== `sha256:${digest}`) throw new Error('Official archive digest mismatch')
const directory = resolve('server/target', `linux-server-${run}`)
mkdirSync(directory)
const archive = join(directory, 'artifact.zip')
writeFileSync(archive, bytes)
const entries = execFileSync('tar', ['-tf', archive], { encoding: 'utf8' }).trim().split(/\r?\n/)
if (entries.length !== 1 || entries[0] !== 'easyproject-server')
    throw new Error('Unexpected archive entries')
execFileSync('tar', ['-xf', archive, '-C', directory])
const binary = join(directory, 'easyproject-server')
if (!lstatSync(binary).isFile()) throw new Error('Expected a regular executable')
const content = readFileSync(binary)
if (
    !content.subarray(0, 4).equals(Buffer.from([127, 69, 76, 70])) ||
    content.readUInt16LE(18) !== 62
)
    throw new Error('Expected x64 ELF')
const verified = {
    source,
    run,
    artifactId: artifact.id,
    archiveSha256: digest,
    binarySha256: createHash('sha256').update(content).digest('hex'),
    size: content.length
}
writeFileSync(join(directory, 'verified.json'), JSON.stringify(verified, null, 2) + '\n')
console.log(JSON.stringify(verified))
