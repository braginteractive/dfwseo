// Emits render-ready artifacts: per-industry graphs with precomputed layout,
// per-site profiles, and the contracted metro graph.
// Node SIZE encodes DEGREE (how many ranking competitors it links to) -- the
// variable the reader actually cares about. Color encodes rank tier.
import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs'

import Graph from 'graphology'
import forceAtlas2 from 'graphology-layout-forceatlas2'
import louvain from 'graphology-communities-louvain'
import { TIERS, tierOf, tagsFor, SPAM_DEFAULT_MAX } from './buckets.mjs'

const RAW = 'data/raw'
const OUT = 'data/graphs'
const PUB = 'public/graphs'

/*
 * data/raw is gitignored: it is 281MB of regenerable API cache. CI clones
 * without it but WITH data/graphs, which is the artifact the site reads. So a
 * missing cache is a normal state, not an error -- skip the rebuild and let the
 * committed graphs stand. Only `npm run sweep` can repopulate it.
 */
if (!existsSync(RAW)) {
  const built = existsSync(OUT) ? readdirSync(OUT).filter((f) => f.endsWith('.json')).length : 0
  if (!built) { console.error('No data/raw and no data/graphs. Run `npm run sweep` first.'); process.exit(1) }
  console.log(`data/raw absent (gitignored cache); using ${built} committed graph artifacts.`)
  process.exit(0)
}
mkdirSync(`${OUT}/sites`, { recursive: true })
mkdirSync(PUB, { recursive: true })
const read = (f) => JSON.parse(readFileSync(`${RAW}/${f}`, 'utf8'))
/**
 * Write only when the bytes actually change.
 *
 * The sitemap takes each page's `lastmod` from the mtime of the artifact it
 * renders from, which is only meaningful if an unchanged market keeps its old
 * timestamp. Rewriting all 900 files every prebuild would stamp the whole site
 * as modified on every deploy — telling crawlers 525 pages changed when the
 * monthly sweep moved three of them, which is the fastest way to have the
 * signal discounted entirely.
 */
function writeIfChanged(file, contents) {
  if (existsSync(file) && readFileSync(file, 'utf8') === contents) return false
  writeFileSync(file, contents)
  return true
}

let rewritten = 0

/**
 * A seeded LCG, so every source of randomness in this script is reproducible.
 *
 * The layout seeding below was already deterministic, but louvain was not: it
 * defaults to Math.random for its random walk, so community ids — and with
 * them every node's `community` field — came out different on every run. Two
 * builds of unchanged input produced different artifacts, which silently broke
 * the stability this comment has always claimed and left sitemap `lastmod`
 * reporting all 40 markets as modified on every deploy.
 */
const rngFrom = (s = 1) => () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296)

// forceAtlas2 needs seed coordinates; nodes without them come out NaN.
// Seeded so rebuilds are deterministic and the spatial map stays stable.
function seed(g, s = 1) {
  const rnd = rngFrom(s)
  g.forEachNode((n) => g.mergeNodeAttributes(n, { x: (rnd() - 0.5) * 1000, y: (rnd() - 0.5) * 1000 }))
}

// Markets are city+industry, e.g. "dallas-roofing". The industry key can itself
// contain hyphens ("legal-personal-injury"), so split on the known city prefix.
const CITY_KEYS = ['dallas', 'fort-worth']
const markets = readdirSync(RAW)
  .filter((f) => f.startsWith('intersection-'))
  .map((f) => f.slice('intersection-'.length, -'.json'.length))
  .map((tag) => {
    const city = CITY_KEYS.find((c) => tag === c || tag.startsWith(c + '-'))
    return { tag, city, industry: tag.slice(city.length + 1) }
  })
  .filter((m) => m.city)
  .sort((a, b) => a.tag.localeCompare(b.tag))
const metroDomains = new Map()
const industryTop = {}
const summaries = []

for (const { tag, city, industry: ind } of markets) {
  const inter = read(`intersection-${tag}.json`)
  const meta = read(`competitors-${tag}.json`)
  const competitors = meta.competitors
  const g = new Graph({ type: 'undirected' })

  for (const c of competitors)
    g.addNode(c.domain, {
      kind: 'competitor', label: c.domain,
      sources: c.sources ?? ['organic'],
      organicRank: c.organicRank ?? null, mapsRank: c.mapsRank ?? null,
      rating: c.rating ?? null, reviews: c.reviews ?? 0,
      name: c.name ?? null, url: c.url ?? null,
    })

  const tierCounts = Object.fromEntries(TIERS.map((t) => [t.id, 0]))
  for (const item of inter.items ?? []) {
    const di = item.domain_intersection ?? {}
    const vals = Object.values(di)
    if (!vals.length) continue
    const domain = vals[0].target
    const rank = Math.max(...vals.map((v) => v.rank || 0))
    const spam = Math.max(...vals.map((v) => v.backlinks_spam_score || 0))
    const tier = tierOf(rank)
    tierCounts[tier]++
    if (g.hasNode(domain)) continue
    g.addNode(domain, {
      kind: 'referrer', label: domain, tier, rank, spam,
      tags: tagsFor(domain, spam),
      backlinks: vals.reduce((s, v) => s + (v.backlinks || 0), 0),
    })
    for (const k of Object.keys(di)) {
      const t = inter.targets[k]
      if (g.hasNode(t)) g.addEdge(domain, t)
    }
  }

  // degree = how many ranking competitors this domain links to. THE headline number.
  g.forEachNode((n, a) => {
    const deg = a.kind === 'referrer' ? g.degree(n) : 0
    g.setNodeAttribute(n, 'degree', deg)
    g.setNodeAttribute(n, 'size', a.kind === 'competitor' ? 14 : 2 + deg * 2.2)
  })

  seed(g)
  forceAtlas2.assign(g, {
    iterations: 300,
    settings: { ...forceAtlas2.inferSettings(g), gravity: 1.1, scalingRatio: 14, barnesHutOptimize: g.order > 800 },
  })

  // Clusters, not degree thresholds -- what the eye reads as structure is groups.
  louvain.assign(g, { resolution: 1.05, rng: rngFrom(1) })
  const communities = new Set(g.mapNodes((n, a) => a.community))

  const referrers = g
    .filterNodes((n, a) => a.kind === 'referrer')
    .map((n) => ({ domain: n, ...g.getNodeAttributes(n) }))
  const clean = referrers.filter((r) => r.spam < SPAM_DEFAULT_MAX && r.rank > 0)
  const leaderboard = clean
    .sort((a, b) => b.degree - a.degree || b.rank - a.rank)
    .slice(0, 40)
    .map(({ domain, degree, rank, spam, tags }) => ({ domain, degree, rank, spam, tags }))

  const nComp = competitors.length
  const reach = leaderboard[0]?.degree ?? 0
  const shape =
    clean.length < 8 ? 'sparse'
    : reach >= nComp * 0.7 && clean.filter((r) => r.degree >= nComp * 0.5).length <= 4 ? 'hub-dominated'
    : communities.size >= 6 ? 'pockets'
    : clean.filter((r) => r.degree >= nComp * 0.4).length >= 12 ? 'mesh'
    : 'scattered'

  for (const r of clean)
    if (r.degree >= 2) {
      if (!metroDomains.has(r.domain))
        metroDomains.set(r.domain, { industries: new Set(), cities: new Set(), rank: r.rank, tags: r.tags })
      metroDomains.get(r.domain).industries.add(ind)
      metroDomains.get(r.domain).cities.add(city)
    }
  industryTop[tag] = new Set(clean.map((r) => r.domain))

  // Matrix: top connectors x competitors. Far more legible than a hairball for
  // the "who links to whom" question.
  const matrix = {
    rows: leaderboard.slice(0, 20).map((r) => r.domain),
    cols: competitors.map((c) => c.domain),
    cells: leaderboard.slice(0, 20).map((r) => competitors.map((c) => (g.hasEdge(r.domain, c.domain) ? 1 : 0))),
  }

  const artifact = JSON.stringify({
      market: tag, city, industry: ind, shape,
      keyword: meta.keyword, volume: meta.volume, cpc: meta.cpc,
      sourceCounts: { maps: meta.mapsCount, organic: meta.organicCount, both: meta.bothCount },
      platformsHeldBack: (meta.platforms ?? []).map((p) => p.domain),
      totalShared: inter.total_count, tierCounts,
      competitors, leaderboard, matrix, communities: communities.size,
      nodes: g.mapNodes((n, a) => ({
        id: n, kind: a.kind, label: a.label, tier: a.tier, rank: a.rank ?? null,
        sources: a.sources ?? null, reviews: a.reviews ?? null, rating: a.rating ?? null,
        organicRank: a.organicRank ?? null, mapsRank: a.mapsRank ?? null,
        spam: a.spam ?? 0, degree: a.degree, size: a.size, tags: a.tags ?? [],
        community: a.community, x: +a.x.toFixed(1), y: +a.y.toFixed(1),
      })),
      edges: g.mapEdges((e, a, s, t) => [s, t]),
  })
  rewritten += writeIfChanged(`${OUT}/${tag}.json`, artifact)
  /*
   * The client fetches this file, so it has to be under public/. It used to
   * get there by way of a `public/graphs -> ../data/graphs` symlink, which
   * published the whole data directory: 863 per-site profiles totalling 12MB
   * that nothing on the site ever requests, alongside the 40 the graph island
   * actually fetches. Copying the 40 by name keeps the served directory equal
   * to what is reachable.
   *
   * Not trimmed to nodes+edges even though that is all the island reads —
   * dropping the build-only keys saves 0.3MB of 5.6MB, which does not buy back
   * the risk of a field quietly going missing from a tooltip.
   */
  rewritten += writeIfChanged(`${PUB}/${tag}.json`, artifact)
  summaries.push({ market: tag, city, industry: ind, keyword: meta.keyword, volume: meta.volume,
    sourceCounts: { maps: meta.mapsCount, organic: meta.organicCount, both: meta.bothCount },
    shape, communities: communities.size, totalShared: inter.total_count,
    topConnector: leaderboard[0] ?? null, nodes: g.order, competitors: nComp })
  console.log(`${tag.padEnd(32)} ${shape.padEnd(14)} ${String(g.order).padStart(5)} nodes  top: ${leaderboard[0]?.domain ?? '-'} (${leaderboard[0]?.degree ?? 0}/${nComp})`)
}

// ---- Per-site profiles: capped display, honest totals ----
const CAP = 200
for (const f of readdirSync(RAW).filter((x) => x.startsWith('refdomains-'))) {
  const rd = JSON.parse(readFileSync(`${RAW}/${f}`, 'utf8'))
  const m = f.match(/^refdomains-(dallas|fort-worth)-(.+?)-([a-z0-9_]+)\.json$/)
  if (!m) continue
  const tiers = {}
  for (const it of rd.items ?? []) {
    const rank = it.rank || 0, spam = it.backlinks_spam_score || 0
    const t = tierOf(rank)
    ;(tiers[t] ??= { total: 0, items: [] }).total++
    if (tiers[t].items.length < CAP)
      tiers[t].items.push({ domain: it.domain, rank, spam, backlinks: it.backlinks || 0, tags: tagsFor(it.domain, spam) })
  }
  rewritten += writeIfChanged(`${OUT}/sites/${m[1]}-${m[2]}-${m[3]}.json`,
    JSON.stringify({ city: m[1], industry: m[2], site: rd.target ?? m[3],
      totalReferringDomains: rd.total_count, shownPerTierCap: CAP, tiers }))
}

// ---- Contracted metro graph ----
const metro = new Graph({ type: 'undirected' })
for (const { tag, city, industry: ind } of markets)
  metro.addNode(tag, { kind: 'industry', label: ind.replace(/-/g, ' '), city, industry: ind, size: 20 })
const bridges = [...metroDomains.entries()]
  .filter(([, v]) => v.industries.size >= 2)
  .map(([d, v]) => ({ domain: d, rank: v.rank, tags: v.tags,
    industries: [...v.industries], cities: [...v.cities] }))
  .sort((a, b) => b.industries.length - a.industries.length || b.rank - a.rank)
for (const b of bridges.slice(0, 50)) {
  metro.addNode(b.domain, { kind: 'bridge', label: b.domain, rank: b.rank, tags: b.tags,
    cities: b.cities, degree: b.industries.length, size: 4 + b.industries.length * 2 })
  for (const { tag, industry: ind } of markets)
    if (b.industries.has ? b.industries.has(ind) : b.industries.includes(ind))
      if (industryTop[tag]?.has(b.domain)) metro.addEdge(b.domain, tag)
}
seed(metro)
forceAtlas2.assign(metro, { iterations: 600, settings: { ...forceAtlas2.inferSettings(metro), gravity: 2.2, scalingRatio: 45 } })
rewritten += writeIfChanged(`${OUT}/_metro.json`, JSON.stringify({
  nodes: metro.mapNodes((n, a) => ({ id: n, ...a, x: +a.x.toFixed(1), y: +a.y.toFixed(1) })),
  edges: metro.mapEdges((e, a, s, t) => [s, t]),
  bridgeCount: bridges.length,
  dfwBridges: bridges.filter((b) => b.tags.includes('dfw')).length,
  topBridges: bridges.slice(0, 25),
}))
rewritten += writeIfChanged(`${OUT}/_summary.json`, JSON.stringify(summaries, null, 2))
console.log(`graphs: ${rewritten} artifact(s) rewritten; the rest keep their mtime for sitemap lastmod`)
console.log(`\nmetro: ${bridges.length} bridges, ${bridges.filter((b) => b.tags.includes('dfw')).length} DFW-tagged`)
