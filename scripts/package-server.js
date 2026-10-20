import { cpSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { resolve, join } from 'node:path'

const source = process.argv[2]
const buildRun = process.argv[3]
if (!/^[a-f0-9]{40}$/.test(source || '') || !/^\d+$/.test(buildRun || '')) {
    throw new Error('Provide the exact verified Linux build source SHA and Actions run ID')
}
const current = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
const stage = resolve('server/target', `delivery-${current.slice(0, 12)}`)
mkdirSync(stage, { recursive: false })
mkdirSync(join(stage, 'bin'))
cpSync('server/target/linux-deploy/easyproject-server', join(stage, 'bin/easyproject-server'))
cpSync('dist', join(stage, 'web'), { recursive: true })
cpSync('server/deploy', join(stage, 'deploy'), { recursive: true })
const files = {}
function collect(directory, prefix = '') {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const relative = prefix + entry.name
        if (entry.isDirectory()) collect(join(directory, entry.name), `${relative}/`)
        else if (entry.isFile())
            files[relative] = createHash('sha256')
                .update(readFileSync(join(directory, entry.name)))
                .digest('hex')
        else throw new Error('Symlinks and special files are not allowed in delivery')
    }
}
collect(stage)
writeFileSync(
    join(stage, 'manifest.json'),
    JSON.stringify({ serverSource: source, frontendSource: current, buildRun, files }, null, 2) +
        '\n'
)
const archive = stage + '.tgz'
execFileSync('tar', ['-czf', archive, '-C', stage, '.'])
console.log(
    JSON.stringify({
        archive,
        files: Object.keys(files).length,
        sha256: createHash('sha256').update(readFileSync(archive)).digest('hex')
    })
)
