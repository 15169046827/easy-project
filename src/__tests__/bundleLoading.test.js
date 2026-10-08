import { describe, expect, it } from 'vitest'
import { checkBundleLoading } from '../../scripts/check-bundle-loading.js'

function chunk(fileName, modules = {}, imports = [], dynamicImports = [], isEntry = false) {
    return { type: 'chunk', fileName, modules, imports, dynamicImports, isEntry }
}

describe('production loading boundary', () => {
    it('allows large features behind dynamic imports without discarding their data', () => {
        const output = [
            chunk('app.js', {}, ['vue.js'], ['calendar.js', 'xlsx.js'], true),
            chunk('vue.js'),
            chunk('calendar.js', { '/repo/node_modules/date-holidays/src/data.js': {} }),
            chunk('xlsx.js', { '/repo/node_modules/exceljs/dist/exceljs.min.js': {} })
        ]
        expect(checkBundleLoading(output)).toEqual(['app.js', 'vue.js'])
    })

    it('rejects a holiday dataset hidden in a transitively imported shared chunk', () => {
        const output = [
            chunk('app.js', {}, ['shared.js'], [], true),
            chunk('shared.js', {}, ['data.js']),
            chunk('data.js', { '/repo/node_modules/date-holidays/src/data.js': {} })
        ]
        expect(() => checkBundleLoading(output)).toThrow('date-holidays is eagerly loaded')
    })

    it('rejects eagerly loaded Excel on Windows paths regardless of the chunk name', () => {
        const output = [
            chunk('app.js', {}, ['renamed.js'], [], true),
            chunk('renamed.js', { 'E:\\repo\\node_modules\\exceljs\\dist\\exceljs.min.js': {} })
        ]
        expect(() => checkBundleLoading(output)).toThrow('exceljs is eagerly loaded')
    })

    it('fails closed when no entry is supplied', () => {
        expect(() => checkBundleLoading([])).toThrow('requires an entry chunk')
    })
})
