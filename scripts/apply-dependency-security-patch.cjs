// Scoped mitigation for GHSA-gcqx-w48m-w2h4. Upstream MIT license is retained.
// Keep the original dependency version/audit warning visible; fail on source drift.
const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
const root = path.resolve(__dirname, '..', 'node_modules', 'deepmerge')
const expected = {
    'index.js': '12440C84957C1990EA2D5E33DC0091722DC1DC1585C6D20E0C780E568FFA9D30',
    'dist/cjs.js': '2E5160F84A1141BD927264AFE4D15766F1E6CF07DAEF182B37FF53FEA121DE7D',
    'dist/umd.js': 'F33E6596482D1FB5C7C427F8EF92F2AA849EEA9223ACD974176B2FB27DDBF73A'
}
if (JSON.parse(fs.readFileSync(path.join(root, 'package.json'))).version !== '4.3.1') {
    throw new Error('Review security mitigation for changed deepmerge version')
}
const plans = Object.entries(expected).map(([name, hash]) => {
    const file = path.join(root, name)
    const current = fs.readFileSync(file, 'utf8')
    const original = current.replace(
        /Object\.defineProperty\(destination, key, \{ value: (.+?), enumerable: true, configurable: true, writable: true \}\)/g,
        'destination[key] = $1'
    )
    if (crypto.createHash('sha256').update(original).digest('hex').toUpperCase() !== hash) {
        throw new Error('Unexpected deepmerge source: ' + name)
    }
    let count = 0
    const patched = original.replace(/destination\[key\] = ([^\n;]+)/g, (_match, value) => {
        count++
        return `Object.defineProperty(destination, key, { value: ${value}, enumerable: true, configurable: true, writable: true })`
    })
    if (count !== 3) throw new Error('Unexpected deepmerge assignment count')
    return { file, current, patched }
})
for (const { file, current, patched } of plans) {
    if (current !== patched) fs.writeFileSync(file, patched)
}
console.log('deepmerge 4.3.1 scoped own-property mitigation verified (3 entry points)')
