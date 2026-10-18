import { readdir, readFile, mkdir, copyFile, writeFile, access } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const project = fileURLToPath(new URL('../', import.meta.url))
const root = path.resolve(project, '..')
const mapping = [
  { id: 'chess', folder: 'e4 chess bar' },
  { id: 'theatre', folder: 'Амьтны ферм жүжиг' },
  { id: 'exhibition', folder: 'Социализмаар аялцгаая' },
  { id: 'basketball', folder: 'Үндэсний дээд лиг' },
  { id: 'canvas', folder: 'Canvas art', instructionFile: 'content/canvas.md' },
]
const output = path.join(project, 'src/data/source-manifest.json')
const existing = await readFile(output, 'utf8').then(JSON.parse).catch(() => null)
const manifest = []

function dimensions(bytes) {
  if (bytes.subarray(1, 4).toString() === 'PNG') return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) }
  if (bytes.readUInt16BE(0) === 0xffd8) {
    let offset = 2
    while (offset + 9 < bytes.length) {
      if (bytes[offset] !== 0xff) break
      const marker = bytes[offset + 1]
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) return { width: bytes.readUInt16BE(offset + 7), height: bytes.readUInt16BE(offset + 5) }
      const length = bytes.readUInt16BE(offset + 2)
      if (length < 2) break
      offset += 2 + length
    }
  }
  return {}
}

for (const date of mapping) {
  const source = path.join(root, date.folder)
  const projectNotes = date.instructionFile ? [{ filename: date.instructionFile, source: 'project', text: (await readFile(path.join(project, date.instructionFile), 'utf8')).replace(/^\uFEFF/, '').trim() }] : []
  const available = await access(source).then(() => true).catch(() => false)
  // Hosted source checkouts retain the copied assets and generated manifest.
  if (!available) {
    const saved = existing?.find(item => item.id === date.id)
    if (!saved) throw new Error(`Missing source folder: ${date.folder}`)
    for (const image of saved.images) await access(path.join(project, 'public', decodeURIComponent(image.src)))
    manifest.push({ ...saved, notes: [...saved.notes.filter(note => note.source !== 'project'), ...projectNotes] })
    continue
  }
  const files = (await readdir(source, { withFileTypes: true })).filter(item => item.isFile()).map(item => item.name).sort()
  const noteFiles = files.filter(name => /\.(txt|md)$/i.test(name))
  if (!noteFiles.length && !date.instructionFile) throw new Error(`No instructions found: ${date.folder}`)
  const notes = await Promise.all(noteFiles.map(async filename => ({ filename, text: (await readFile(path.join(source, filename), 'utf8')).replace(/^\uFEFF/, '').trim() })))
  // Explicit instructions supplied in chat live in the app when no original
  // notepad exists. Never create or overwrite files in the source folder.
  notes.push(...projectNotes)
  const images = files.filter(name => /\.(jpe?g|png|webp|avif)$/i.test(name))
  if (!images.length) throw new Error(`No photographs found: ${date.folder}`)
  const destination = path.join(project, 'public/dates', date.id)
  await mkdir(destination, { recursive: true })
  for (const filename of images) await copyFile(path.join(source, filename), path.join(destination, filename))
  const imageManifest = await Promise.all(images.map(async filename => ({ filename, src: `/dates/${date.id}/${encodeURIComponent(filename)}`, ...dimensions(await readFile(path.join(source, filename))) })))
  manifest.push({ ...date, notes, images: imageManifest })
}
await mkdir(path.dirname(output), { recursive: true })
await writeFile(output, JSON.stringify(manifest, null, 2) + '\n')
console.log(`Content ready: ${manifest.length} date ideas, ${manifest.reduce((sum, date) => sum + date.images.length, 0)} original images. Source files untouched.`)
