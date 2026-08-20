/*
 * Refresh orchestrator. Three tiers, because the cost and the risk are very
 * different at each.
 *
 *   movement  (monthly, ~$0.50)  SERPs and map pack only. Compares what Google
 *                                shows now against the committed competitor
 *                                sets, writes a dated diff, and CHANGES NOTHING
 *                                the site reads. Safe to run any time.
 *
 *   full      (quarterly, ~$3)   Rebuilds competitor sets, intersections and
 *                                graphs. Published numbers change. Prose will
 *                                need fixing where the checks fail.
 *
 *   deep      (twice a year, ~$12) Also re-pulls referring domains, which are
 *                                the expensive call and the slowest to move.
 *
 * Usage:  node scripts/refresh.mjs movement | full | deep [--yes]
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, rmSync } from 'node:fs'
import { loadEnv } from './env.mjs'
import { execSync } from 'node:child_process'

const MODE = process.argv[2] ?? 'movement'
const ASSUME_YES = process.argv.includes('--yes')
if (!['movement', 'full', 'deep'].includes(MODE)) {
  console.error('usage: node scripts/refresh.mjs movement|full|deep [--yes]')
  process.exit(1)
}

const RAW = 'data/raw'
const GRAPHS = 'data/graphs'
const MOVE = 'data/movement'
const run = (cmd) => execSync(cmd, { stdio: 'inherit' })
const norm = (d) => (d ?? '').replace(/^www\./, '').toLowerCase()

// ---------------------------------------------------------------- movement --
async function movement() {
  const { auth: AUTH } = loadEnv()
  let spend = 0
  const api = async (path, task) => {
    const r = await fetch('https://api.dataforseo.com' + path, {
      method: 'POST', headers: { Authorization: AUTH, 'Content-Type': 'application/json' },
      body: JSON.stringify([task]),
    })
    const j = await r.json(); spend += j.cost ?? 0
    return j.tasks?.[0]?.status_code === 20000 ? j.tasks[0].result : null
  }

  const CITY_CODE = { dallas: 1026339, 'fort-worth': 1026411 }
  const markets = readdirSync(GRAPHS).filter((f) => f.endsWith('.json') && !f.startsWith('_'))
  const report = { generated: new Date().toISOString().slice(0, 10), mode: 'movement', markets: {} }
  let churn = 0

  for (const file of markets.sort()) {
    const d = JSON.parse(readFileSync(`${GRAPHS}/${file}`, 'utf8'))
    const code = CITY_CODE[d.city]
    if (!code) continue

    const serp = (await api('/v3/serp/google/organic/live/regular',
      { keyword: d.keyword, location_code: code, language_code: 'en', device: 'desktop', depth: 40 }))?.[0]
    const maps = (await api('/v3/serp/google/maps/live/advanced',
      { keyword: d.keyword, location_code: code, language_code: 'en', depth: 20 }))?.[0]

    const now = new Set()
    for (const it of serp?.items ?? []) if (it.type === 'organic' && it.domain) now.add(norm(it.domain))
    for (const b of maps?.items ?? []) {
      const dom = norm(b.domain) || (b.url ? norm(new URL(b.url).hostname) : null)
      if (dom) now.add(dom)
    }
    const before = new Set(d.competitors.map((c) => c.domain))
    const gone = [...before].filter((x) => !now.has(x))
    // Only report entrants that would plausibly make a competitor set, i.e. that
    // rank well. A domain at organic #38 is noise, not movement.
    const topNow = new Set()
    for (const it of (serp?.items ?? []).slice(0, 20)) if (it.type === 'organic' && it.domain) topNow.add(norm(it.domain))
    for (const b of (maps?.items ?? []).slice(0, 12)) {
      const dom = norm(b.domain) || (b.url ? norm(new URL(b.url).hostname) : null)
      if (dom) topNow.add(dom)
    }
    const entered = [...topNow].filter((x) => !before.has(x))

    report.markets[file.replace('.json', '')] = {
      keyword: d.keyword, held: before.size - gone.length, dropped: gone, entered,
      churned: gone.length >= 3,
    }
    // A market losing one or two companies is noise. Measured on a same-day
    // baseline run, 22 of 40 markets differed by at least one company with zero
    // elapsed time -- that is Google's result variability, not movement. Only
    // count a market as genuinely churned at three or more.
    if (gone.length >= 3) churn++
    const flag = gone.length >= 3 ? '!!' : gone.length ? ' *' : '  '
    console.log(`${flag} ${file.replace('.json', '').padEnd(32)} held ${String(before.size - gone.length).padStart(2)}/${before.size}` +
      (gone.length ? `  dropped: ${gone.slice(0, 4).join(', ')}${gone.length > 4 ? ` +${gone.length - 4}` : ''}` : ''))
  }

  mkdirSync(MOVE, { recursive: true })
  const stamp = report.generated.slice(0, 7)
  report.spend = +spend.toFixed(2)
  writeFileSync(`${MOVE}/${stamp}.json`, JSON.stringify(report, null, 2))

  const noisy = Object.values(report.markets).filter((m) => m.dropped.length).length
  console.log(`\nspend $${spend.toFixed(2)} · ${churn} of ${markets.length} markets churned (3+ companies)`)
  console.log(`${noisy} showed some difference, most of which is SERP noise; see docs/operations.md`)
  console.log(`written: ${MOVE}/${stamp}.json  (nothing the site reads was changed)`)
  if (churn >= markets.length / 4)
    console.log('\nA quarter or more of markets genuinely churned. Consider running `full` early.')
}

// ------------------------------------------------------------- full / deep --
function invalidate(deep) {
  const kill = (pre) => {
    for (const f of readdirSync(RAW)) if (f.startsWith(pre)) rmSync(`${RAW}/${f}`)
  }
  // Order matters: an intersection computed for a different competitor set is
  // simply wrong, so these are always invalidated together.
  for (const p of ['term-', 'serp-', 'maps-', 'competitors-', 'intersection-']) kill(p)
  if (deep) kill('refdomains-')
}

async function fullRefresh(deep) {
  if (!existsSync(RAW)) {
    console.error(`No ${RAW}. The API cache is gitignored, so a full refresh must run on a`)
    console.error('machine that has it, or it will re-pull everything from scratch.')
    process.exit(1)
  }
  if (!ASSUME_YES) {
    console.log(`About to invalidate cached SERPs, maps, competitor sets and intersections${deep ? ', AND referring domains' : ''}.`)
    console.log(`Estimated cost: ${deep ? '~$12' : '~$3'}. Re-run with --yes to proceed.`)
    process.exit(0)
  }

  const before = Object.fromEntries(readdirSync(GRAPHS).filter((f) => f.endsWith('.json') && !f.startsWith('_'))
    .map((f) => {
      const d = JSON.parse(readFileSync(`${GRAPHS}/${f}`, 'utf8'))
      return [f.replace('.json', ''), { competitors: d.competitors.map((c) => c.domain), shared: d.totalShared, shape: d.shape }]
    }))

  invalidate(deep)
  run('node scripts/sweep.mjs')
  run('node scripts/build-graphs.mjs')

  console.log('\n=== what changed ===')
  for (const [tag, prev] of Object.entries(before)) {
    const f = `${GRAPHS}/${tag}.json`
    if (!existsSync(f)) { console.log(`  ${tag}: MARKET DISAPPEARED`); continue }
    const d = JSON.parse(readFileSync(f, 'utf8'))
    const now = d.competitors.map((c) => c.domain)
    const gone = prev.competitors.filter((x) => !now.includes(x))
    const bits = []
    if (gone.length) bits.push(`${gone.length} companies replaced`)
    if (d.totalShared !== prev.shared) bits.push(`shared ${prev.shared} -> ${d.totalShared}`)
    if (d.shape !== prev.shape) bits.push(`shape ${prev.shape} -> ${d.shape}`)
    if (bits.length) console.log(`  ${tag.padEnd(32)} ${bits.join(' · ')}`)
  }

  console.log('\n=== verifying the prose still matches ===')
  try { run('node scripts/check-figures.mjs') }
  catch {
    console.log('\nThe analysis in src/lib/analysis.js cites figures that have moved.')
    console.log('Fix each one against data/graphs/<market>.json before committing.')
    console.log('This is expected after a full refresh and is the main work of one.')
    process.exit(1)
  }
  console.log('\nRefresh complete. Review, then commit data/graphs and any prose changes.')
}

if (MODE === 'movement') await movement()
else await fullRefresh(MODE === 'deep')
