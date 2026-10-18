import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { inflateSync } from 'node:zlib'

function glyph(woff, code) {
  assert.equal(woff.readUInt32BE(0), 0x774f4646)
  let cmap
  for (let i = 0; i < woff.readUInt16BE(12); i++) {
    const at = 44 + i * 20
    if (woff.toString('ascii', at, at + 4) !== 'cmap') continue
    const start = woff.readUInt32BE(at + 4)
    const compressed = woff.readUInt32BE(at + 8)
    const original = woff.readUInt32BE(at + 12)
    const table = woff.subarray(start, start + compressed)
    cmap = compressed < original ? inflateSync(table) : table
  }
  assert.ok(cmap)
  for (let i = 0; i < cmap.readUInt16BE(2); i++) {
    const offset = cmap.readUInt32BE(4 + i * 8 + 4)
    if (cmap.readUInt16BE(offset) !== 4) continue
    const segments = cmap.readUInt16BE(offset + 6) / 2
    const end = offset + 14, start = end + segments * 2 + 2, delta = start + segments * 2, ranges = delta + segments * 2
    for (let segment = 0; segment < segments; segment++) {
      const first = cmap.readUInt16BE(start + segment * 2), last = cmap.readUInt16BE(end + segment * 2)
      if (code < first || code > last) continue
      const adjustment = cmap.readInt16BE(delta + segment * 2), range = cmap.readUInt16BE(ranges + segment * 2)
      if (!range) return (code + adjustment) & 0xffff
      const id = cmap.readUInt16BE(ranges + segment * 2 + range + (code - first) * 2)
      return id ? (id + adjustment) & 0xffff : 0
    }
  }
  return 0
}
for (const [family, styles] of Object.entries({ 'noto-serif': ['400-normal', '400-italic', '500-normal'], 'noto-sans': ['400-normal', '500-normal', '600-normal'] })) {
  for (const style of styles) {
    const font = await readFile(`node_modules/@fontsource/${family}/files/${family}-cyrillic-ext-${style}.woff`)
    for (const character of 'ҮүӨө') assert.ok(glyph(font, character.codePointAt(0)), `${family} ${style} contains ${character}`)
  }
}
const css = await readFile('src/styles/fonts.css', 'utf8')
assert.ok(css.includes('unicode-range: U+0460-052F'))
console.log('PASS: all six font faces contain real Ү ү Ө ө glyphs; extended-Cyrillic Unicode ranges are configured.')
