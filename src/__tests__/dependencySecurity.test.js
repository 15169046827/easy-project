import { createRequire } from 'node:module'
import fs from 'node:fs'
import vm from 'node:vm'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const merge = require('deepmerge')

describe('deepmerge own-property mitigation', () => {
    it('rejects source drift before writing any dependency file', () => {
        const script = path.resolve('scripts/apply-dependency-security-patch.cjs')
        let writes = 0
        const mockFs = {
            readFileSync(file, encoding) {
                const text = fs.readFileSync(file, encoding)
                return String(file).endsWith('index.js') ? text + '\nsource drift' : text
            },
            writeFileSync() {
                writes++
            }
        }
        expect(() =>
            vm.runInNewContext(fs.readFileSync(script, 'utf8'), {
                require: name => (name === 'node:fs' ? mockFs : require(name)),
                __dirname: path.dirname(script),
                console
            })
        ).toThrow('Unexpected deepmerge source')
        expect(writes).toBe(0)
    })
    it('reproduces the upstream target-copy attack before mitigation', () => {
        const source = fs
            .readFileSync(require.resolve('deepmerge'), 'utf8')
            .replace(
                /Object\.defineProperty\(destination, key, \{ value: (.+?), enumerable: true, configurable: true, writable: true \}\)/g,
                'destination[key] = $1'
            )
        const vulnerable = vm.runInNewContext(
            `(function(){const module={exports:{}};const exports=module.exports;${source}\nreturn module.exports})()`,
            { require: createRequire(require.resolve('deepmerge')) }
        )
        const result = vulnerable(JSON.parse('{"__proto__":{"auditMarker":true}}'), {})
        expect(result.auditMarker).toBe(true)
    })

    it('keeps hostile target keys as own data, never the result prototype', () => {
        const result = merge(JSON.parse('{"__proto__":{"auditMarker":true}}'), {})
        expect(Object.getPrototypeOf(result)).toBe(Object.prototype)
        expect(Object.hasOwn(result, '__proto__')).toBe(true)
        expect(result.auditMarker).toBeUndefined()
        expect({}.auditMarker).toBeUndefined()
    })

    it('preserves nested, array, date, symbol and custom-array semantics', () => {
        const symbol = Symbol('key')
        const date = new Date('2026-11-02T00:00:00Z')
        const result = merge(
            { nested: { a: 1 }, list: [1], [symbol]: 2 },
            {
                nested: { b: 2 },
                list: [3],
                date
            }
        )
        expect(result.nested).toEqual({ a: 1, b: 2 })
        expect(result.list).toEqual([1, 3])
        expect(result[symbol]).toBe(2)
        expect(result.date).toBe(date)
        expect(merge({ list: [1] }, { list: [2] }, { arrayMerge: (_a, b) => b }).list).toEqual([2])
        expect(merge.all([{ a: 1 }, { b: 2 }])).toEqual({ a: 1, b: 2 })
    })
})
