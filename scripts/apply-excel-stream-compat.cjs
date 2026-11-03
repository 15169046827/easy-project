// Restore the standard pipe() return contract only for ExcelJS's private Node StreamBuf.
// Original MIT source/license and browser bundle stay intact. Fail on version/source drift.
const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
const root = path.resolve(__dirname, '../node_modules/exceljs')
if (JSON.parse(fs.readFileSync(path.join(root, 'package.json'))).version !== '4.4.0') {
    throw new Error('Review ExcelJS stream compatibility for changed version')
}
const file = path.join(root, 'lib/utils/stream-buf.js')
const before = `  pipe(destination) {
    // add destination to pipe list & write current buffer
    this.pipes.push(destination);
    if (!this.paused && this.buffers.length) {
      this.end();
    }
  },`
const after = before.replace('\n  },', '\n    return destination;\n  },')
const current = fs.readFileSync(file, 'utf8')
const original = current.replace(after, before)
const hash = crypto.createHash('sha256').update(original).digest('hex')
if (hash !== '40dc7250baefde463a2aa348044033317aab9ce6c530132d5d8a821ed285d2ad') {
    throw new Error('Unexpected ExcelJS StreamBuf source')
}
if (original.split(before).length !== 2) throw new Error('Unexpected ExcelJS pipe contract')
const patched = original.replace(before, after)
if (current !== patched) fs.writeFileSync(file, patched)
console.log('ExcelJS 4.4.0 private Node pipe return compatibility verified')
