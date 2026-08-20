/*
 * Copy checks over the BUILT html, not the source.
 *
 * Astro trims the newline between a text node and an adjacent element, so
 * `by\n<a>DFW Strategy</a>` renders as "byDFW Strategy". This has shipped three
 * separate times because it is invisible in the source. It is only visible
 * after render, so that is where we check.
 *
 * Also enforces the standing copy rules from README: American English, no em
 * dashes, and no asserting what a link does.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const pages = []
const walk = (d) => {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name)
    if (e.isDirectory()) { if (e.name !== '.prerender') walk(p) }
    else if (e.name.endsWith('.html')) pages.push(p)
  }
}
walk('dist')

// Elements laid out with flex/grid gap legitimately have no whitespace between
// their children; fused text there is not a bug.
const SPACED_BY_CSS = /class="[^"]*\b(toc|chips|peers|in|tags|facts|tier-h|src|cities|links|industries|right|others|markets|crumb)\b/

const BANNED = [
  [/—/, 'em dash'],
  [/\b(centre|colour|neighbourhood|labelled|organis(e|ed|ing)|analys(e|ing)|defence|licence|favour|whilst)\b/i, 'British spelling'],
  [/\b(carries|carry|carrying) no (measurable )?authority\b/i, 'asserts what a link does; name the metric instead'],
  [/\bworthless\b/i, 'asserts what a link does; say "scores zero"'],
  [/\bGoogle returned\b/i, 'states a sample count as the market; say "we sampled"'],
]

let issues = 0
const reported = new Set()
const report = (kind, detail, file) => {
  const key = kind + detail
  if (reported.has(key)) return
  reported.add(key)
  issues++
  console.log(`  [${kind}] ${detail}\n      ${file}`)
}

for (const f of pages) {
  const html = readFileSync(f, 'utf8')
  const body = html.slice(html.indexOf('<body'))
  const rel = f.replace('dist', '') || '/'

  // A gap-spaced container renders its children apart even with no whitespace
  // in the markup, so look BACK for the container, not at the inline element.
  // Astro stamps a long data-astro-cid on every element, so a container's class
  // can sit well over a thousand characters behind its later children.
  const inGapContainer = (i) => SPACED_BY_CSS.test(body.slice(Math.max(0, i - 1400), i))

  for (const m of body.matchAll(/([a-z,)\]])<(a|span|strong|b|em|code)\b([^>]*)>([A-Za-z0-9"$])/g)) {
    if (SPACED_BY_CSS.test(m[3]) || inGapContainer(m.index)) continue
    const ctx = body.slice(Math.max(0, m.index - 30), m.index + 40).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
    report('fused', `"${ctx}"`, rel)
  }
  for (const m of body.matchAll(/<\/(a|span|strong|b|em|code)>([A-Za-z0-9])/g)) {
    if (inGapContainer(m.index)) continue
    const ctx = body.slice(Math.max(0, m.index - 34), m.index + 30).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
    report('fused', `"${ctx}"`, rel)
  }

  const text = body.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ')
  for (const [re, why] of BANNED) {
    const m = text.match(re)
    if (!m) continue
    // The methodology page discusses these terms in quotes to explain why we do
    // not use them. Naming a banned phrase is not the same as asserting it.
    const around = text.slice(Math.max(0, m.index - 3), m.index + m[0].length + 3)
    if (/["\u201c\u201d]/.test(around)) continue
    report('copy', `${why}: "${m[0]}"`, rel)
  }
}

console.log(issues
  ? `\n${issues} copy issue${issues === 1 ? '' : 's'} across ${pages.length} pages`
  : `no copy issues across ${pages.length} pages`)
process.exit(issues ? 1 : 0)
