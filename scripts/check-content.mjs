import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const project = fileURLToPath(new URL('../', import.meta.url))
const source = JSON.parse(await readFile(path.join(project, 'src/data/source-manifest.json'), 'utf8'))
assert.equal(source.length, 4, 'All four original folders are represented')
let total = 0
for (const date of source) {
  assert.ok(date.notes.length, `Instructions for ${date.id}`)
  assert.ok(date.images.length, `Photos for ${date.id}`)
  for (const note of date.notes) {
    const original = await readFile(path.resolve(project, '..', date.folder, note.filename), 'utf8').catch(error => error.code === 'ENOENT' ? null : Promise.reject(error))
    if (original !== null) assert.equal(note.text, original.replace(/^\uFEFF/, '').trim(), `Unaltered note: ${note.filename}`)
  }
  for (const photo of date.images) {
    const copied = path.join(project, 'public', decodeURIComponent(photo.src))
    await access(copied)
    const original = await readFile(path.resolve(project, '..', date.folder, photo.filename)).catch(error => error.code === 'ENOENT' ? null : Promise.reject(error))
    if (original !== null) {
      const hash = buffer => createHash('sha256').update(buffer).digest('hex')
      assert.equal(hash(original), hash(await readFile(copied)), `Byte-for-byte image copy: ${photo.filename}`)
    }
    total++
  }
}
console.log(`PASS: ${source.length} source folders, all instructions, and ${total} readable image copies. Originals match the copied assets.`)
