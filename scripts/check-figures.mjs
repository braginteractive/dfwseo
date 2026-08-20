/*
 * Verifies every figure cited in hand-written analysis against the graph data.
 *
 * Prose in src/lib/analysis.js names exact numbers: "reaches ten of twelve",
 * "886 shared referring domains", "69% scores zero". Every one of these drifts
 * when a refresh changes a competitor set, and a market page that confidently
 * states a wrong number is the worst failure this site has.
 *
 * This has already caught real drift: two analyses claimed six clusters after
 * a rebuild produced five.
 */
import { readFileSync } from 'node:fs'
import { ANALYSIS } from '../src/lib/analysis.js'

const W = { one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12 }
const num = (s) => W[String(s).toLowerCase()] ?? +s

let bad = 0
const fail = (m) => { console.log('  ' + m); bad++ }

for (const [tag, a] of Object.entries(ANALYSIS)) {
  const d = JSON.parse(readFileSync(`data/graphs/${tag}.json`, 'utf8'))
  const tiered = Object.values(d.tierCounts).reduce((x, y) => x + y, 0)
  const zeroPct = Math.round((d.tierCounts.unranked / tiered) * 100)
  const text = a.lede + a.sections.map((s) => s.h + s.body).join(' ')

  for (const m of text.matchAll(/<span class="mono">([a-z0-9.\-]+)<\/span>[^.]{0,90}?(?:reaches|reach|links to|at)\s+<?\/?strong?>?\s*(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\d+)/gi)) {
    const row = d.leaderboard.find((r) => r.domain === m[1])
    if (!row) fail(`${tag}: "${m[1]}" is not in the leaderboard`)
    else if (row.degree !== num(m[2])) fail(`${tag}: ${m[1]} claimed ${num(m[2])}, actual ${row.degree}`)
  }
  for (const m of text.matchAll(/([\d,]{3,})\s+(?:shared )?referring domains/g))
    if (+m[1].replace(/,/g, '') !== d.totalShared)
      fail(`${tag}: claims ${m[1]} shared referrers, actual ${d.totalShared}`)
  for (const m of text.matchAll(/>?(\d{2})%<?\/?strong?>?\s*(?:of the (?:\d+ )?shared set|of the [\d,]+ shared domains)/g))
    if (+m[1] !== zeroPct) fail(`${tag}: claims ${m[1]}% score zero, actual ${zeroPct}%`)
  for (const m of text.matchAll(/(one|two|three|four|five|six|seven|eight|nine|ten|\d+)\s+(?:separate )?(?:groups|clusters)/gi))
    if (num(m[1]) !== d.communities) fail(`${tag}: claims ${num(m[1])} clusters, actual ${d.communities}`)
  for (const _ of text.matchAll(/\b[Tt]welve\s+(?:\w+\s+){0,3}(?:firms|companies|practices|agencies|spas)/g))
    if (d.competitors.length !== 12) fail(`${tag}: says twelve, actual ${d.competitors.length}`)
}

console.log(bad
  ? `\n${bad} figure${bad === 1 ? '' : 's'} in the analysis no longer match the data`
  : `all figures cited across ${Object.keys(ANALYSIS).length} analyses match the data`)
process.exit(bad ? 1 : 0)
