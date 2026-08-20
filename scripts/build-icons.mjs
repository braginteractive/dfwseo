/**
 * Icon set, generated from one glyph definition.
 *
 * The sibling DFW repos each ship a favicon.ico and four of them ship the
 * *same* one, byte for byte — a template default that nobody replaced. Rather
 * than hand-cut six files and let them drift the same way, the geometry lives
 * here once and every raster falls out of it. Change the glyph, re-run,
 * everything moves together.
 *
 * The mark is the site's headline finding drawn small: one domain reaching
 * most of a market, everything else orbiting it. Colours are global.css
 * verbatim so the tab matches the page.
 */
import fs from 'node:fs'
import { Resvg } from '@resvg/resvg-js'

const INK = '#0c0e13'
const EMBER = '#e0763a'
const PAPER = '#eceadf'
const EDGE = '#5a6377'

/**
 * Authored on a 32 grid, not 512, so at the size that actually decides
 * legibility every edge lands on a whole pixel instead of being resampled off
 * a large canvas. Edges are drawn before the discs so the discs cap them; at
 * 16px a line crossing a node reads as a smudge.
 *
 * `scale` insets the glyph for icons that get masked. `rx` is the background
 * corner: rounded for the browser tab, square everywhere the platform applies
 * its own mask and would otherwise round an already-rounded corner twice.
 */
function icon({ scale = 1, rx = 0 } = {}) {
  const o = (1 - scale) * 16 // re-centre after scaling about the origin
  return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="${rx}" fill="${INK}"/>
  <g transform="translate(${o.toFixed(3)} ${o.toFixed(3)}) scale(${scale})">
    <g stroke="${EDGE}" stroke-width="1.9" stroke-linecap="round">
      <path d="M16 16 L7 7.5"/>
      <path d="M16 16 L25 8"/>
      <path d="M16 16 L23 25.5"/>
    </g>
    <g fill="${PAPER}">
      <circle cx="7" cy="7.5" r="3"/>
      <circle cx="25" cy="8" r="3"/>
      <circle cx="23" cy="25.5" r="3"/>
    </g>
    <circle cx="16" cy="16" r="4.9" fill="${EMBER}"/>
  </g>
</svg>`
}

const png = (svg, width) =>
  new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng()

/**
 * ICO is a directory of images, and every modern consumer accepts PNG payloads
 * rather than the BMP-with-separate-mask the format originally specified, so
 * the entries below are the same PNGs written elsewhere in this script.
 *
 * A 16px-only .ico was the old default; retina tabs ask for 32 and Windows
 * shortcuts ask for 48, and both upscale a lone 16 into mush.
 */
function ico(images) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(images.length, 4)

  let offset = 6 + images.length * 16
  const entries = images.map(({ size, data }) => {
    const e = Buffer.alloc(16)
    e.writeUInt8(size >= 256 ? 0 : size, 0) // 0 means 256 in a single byte
    e.writeUInt8(size >= 256 ? 0 : size, 1)
    e.writeUInt8(0, 2) // palette size: not paletted
    e.writeUInt8(0, 3) // reserved
    e.writeUInt16LE(1, 4) // colour planes
    e.writeUInt16LE(32, 6) // bits per pixel
    e.writeUInt32LE(data.length, 8)
    e.writeUInt32LE(offset, 12)
    offset += data.length
    return e
  })

  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)])
}

const tab = icon({ rx: 6 })
const square = icon({ rx: 0 })
/**
 * Android crops a maskable icon to whatever shape the launcher prefers and
 * only guarantees the centre 80% survives. Scaling the glyph to 0.62 keeps the
 * outer nodes inside that circle even under the most aggressive crop.
 */
const maskable = icon({ scale: 0.62, rx: 0 })

fs.writeFileSync('public/favicon.svg', tab + '\n')
fs.writeFileSync(
  'public/favicon.ico',
  ico([16, 32, 48].map((size) => ({ size, data: png(tab, size) }))),
)
// iOS ignores transparency and rounds the corners itself, so this one is square.
fs.writeFileSync('public/apple-touch-icon.png', png(square, 180))
fs.writeFileSync('public/icon-192.png', png(square, 192))
fs.writeFileSync('public/icon-512.png', png(square, 512))
fs.writeFileSync('public/icon-maskable-512.png', png(maskable, 512))

console.log('icons: favicon.svg, favicon.ico, apple-touch-icon, 192, 512, maskable')
