// @vitest-environment node
import { createRequire } from 'node:module'
import { PassThrough, Readable } from 'node:stream'
import { mkdtemp, writeFile } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const Excel = require('exceljs')
const excelRequire = createRequire(require.resolve('exceljs'))
const archiver = excelRequire('archiver')
const unzipper = excelRequire('unzipper')

describe('ExcelJS maintained transitive dependency compatibility', () => {
    it('round-trips document values, styles, dates, formulas and multiple sheets', async () => {
        const workbook = new Excel.Workbook()
        const sheet = workbook.addWorksheet('任务')
        sheet.addRow(['名称', '数量', '日期', '公式'])
        sheet.addRow([
            '合成任务',
            42,
            new Date('2026-11-03T00:00:00Z'),
            { formula: 'B2*2', result: 84 }
        ])
        sheet.getCell('A2').font = { bold: true, color: { argb: 'FF224466' } }
        sheet.getCell('C2').numFmt = 'yyyy-mm-dd'
        workbook.addWorksheet('成员').addRow(['合成人员'])
        const copy = new Excel.Workbook()
        await copy.xlsx.load(await workbook.xlsx.writeBuffer())
        expect(copy.worksheets).toHaveLength(2)
        const row = copy.getWorksheet('任务')
        expect(row.getCell('A2').value).toBe('合成任务')
        expect(row.getCell('A2').font.bold).toBe(true)
        expect(row.getCell('B2').value).toBe(42)
        const date = row.getCell('C2').value
        if (!(date instanceof Date)) throw new Error('Expected an Excel date cell')
        expect(date.toISOString()).toBe('2026-11-03T00:00:00.000Z')
        expect(row.getCell('D2').value).toEqual({ formula: 'B2*2', result: 84 })
    })

    it('supports streaming writer and reader without deprecated filesystem packages', async () => {
        const output = new PassThrough()
        const chunks = []
        output.on('data', chunk => chunks.push(chunk))
        const workbook = new Excel.stream.xlsx.WorkbookWriter({
            useSharedStrings: true,
            stream: output
        })
        const sheet = workbook.addWorksheet('Synthetic')
        sheet.addRow(['Synthetic', 123]).commit()
        sheet.commit()
        await workbook.commit()
        const copy = new Excel.Workbook()
        await copy.xlsx.read(Readable.from([Buffer.concat(chunks)]))
        expect(copy.getWorksheet('Synthetic').getCell('B1').value).toBe(123)
    })

    it('supports archiver glob traversal and unzipper buffer extraction', async () => {
        const directory = await mkdtemp(path.join(os.tmpdir(), 'easyproject-zip-'))
        await writeFile(path.join(directory, 'synthetic.txt'), 'Synthetic-only payload')
        const archive = archiver('zip')
        const output = new PassThrough()
        const chunks = []
        const finished = new Promise((resolve, reject) => {
            archive.on('error', reject)
            output.on('error', reject)
            output.on('data', chunk => chunks.push(chunk))
            output.on('end', resolve)
        })
        archive.pipe(output)
        archive.glob('*.txt', { cwd: directory })
        await archive.finalize()
        await finished
        const zip = await unzipper.Open.buffer(Buffer.concat(chunks))
        expect(zip.files.map(file => file.path)).toEqual(['synthetic.txt'])
        expect((await zip.files[0].buffer()).toString()).toBe('Synthetic-only payload')
    }, 30000)
})
