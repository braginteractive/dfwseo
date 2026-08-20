// DFW link sweep: Dallas and Fort Worth, unqualified head terms.
//
// Two methodology decisions are baked in here, both measured rather than assumed
// (see docs/methodology.md):
//
// 1. UNQUALIFIED QUERIES. We search "roofing company" localised to a city, not
//    "dallas roofing company". Nobody in Dallas types their own city name. The
//    two return only 3/10 the same companies, so this materially changes who we
//    analyze -- and the unqualified set is the real local market.
//
// 2. AGGREGATORS ARE IDENTIFIED BY DATA, NOT A HAND-MAINTAINED LIST. A national
//    aggregator ranks for a vast national keyword footprint; a local contractor
//    ranks for a few hundred terms. The gap is ~3 orders of magnitude. They are
//    excluded from the COMPETITOR SET only -- they remain in the graph as
//    referring domains, where they are a genuine part of the link economy.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { loadEnv } from './env.mjs'

const { auth: AUTH } = loadEnv()

const OUT = 'data/raw'
mkdirSync(OUT, { recursive: true })
let spend = 0

const hostOf = (u) => { try { return norm(new URL(u).hostname) } catch { return null } }

async function api(path, task, tries = 3) {
  for (let a = 0; a < tries; a++) {
    const res = await fetch('https://api.dataforseo.com' + path, {
      method: 'POST',
      headers: { Authorization: AUTH, 'Content-Type': 'application/json' },
      body: JSON.stringify([task]),
    })
    const json = await res.json()
    spend += json.cost ?? 0
    const t = json.tasks?.[0]
    // Return the whole result array. Most endpoints put their payload in
    // result[0], but search_volume returns one entry PER KEYWORD, so unwrapping
    // here silently discarded every keyword but the first.
    if (t?.status_code === 20000) return t.result ?? null
    if (a === tries - 1) { console.error(`  ! ${path} ${t?.status_code} ${t?.status_message}`); return null }
    await new Promise((r) => setTimeout(r, 2000 * (a + 1)))
  }
}
const save = (n, d) => writeFileSync(`${OUT}/${n}.json`, JSON.stringify(d, null, 2))
const load = (n) => JSON.parse(readFileSync(`${OUT}/${n}.json`, 'utf8'))
const norm = (d) => (d ?? '').replace(/^www\./, '').toLowerCase()

// A domain ranking for more than this many keywords nationally is a platform or
// a reference/career site, not a local business.
//
// Originally 50,000, chosen against yelp (31M) vs contractors (~500). That was
// too generous: career and reference sites sit in the middle and slipped
// through. Measured against the full competitor pool the real gap is:
//
//     largest genuine local business   berkeys.com          4,992
//     smallest reference/career site   apprenticeship.gov  16,410
//
// 10,000 sits in that gap.
const AGGREGATOR_KEYWORD_FLOOR = 10_000

// Reviewed exclusions for what the classifier provably cannot catch: national
// chains, vertical directories, manufacturers and trade associations whose
// footprints sit inside the genuine-local range. Small, explicit, versioned.
// See data/excluded-domains.json and docs/methodology.md.
const EXCLUDED = new Set(Object.keys(
  JSON.parse(readFileSync('data/excluded-domains.json', 'utf8')).excluded))

// Government and education domains are never a local contractor. Licensing
// boards (tdlr.texas.gov) and trade schools (neit.edu) rank for occupation
// terms with tiny footprints, so no footprint threshold will catch them.
const NEVER_A_BUSINESS = /\.(gov|edu)$/

// Occupation nouns ("electrician", "landscaper") are informational queries and
// return career sites and dictionaries. Commercial phrasings ("roofing company",
// "ac repair") return businesses. Rather than ban bare nouns outright -- "plumber"
// is both high-volume and clean -- try terms in volume order and keep the first
// that yields a mostly-local competitor pool.
const MIN_CLEAN_COMPETITORS = 8

// Competitors come from TWO sources, and which ones a business appears in is
// itself a finding:
//
//   maps     a verified Google Business Profile near the city centroid.
//            Definitively a local business -- this is what kills the
//            exclusion-list treadmill. Proximity-weighted, so it reflects
//            businesses near the centroid, NOT the whole city. See methodology.
//   organic  ranks in the unqualified organic SERP. Authority-weighted.
//            Includes directories and chains, hence the classifier.
//
// A business in BOTH is the strongest signal in the dataset: locally real AND
// organically competitive.
const MAX_COMPETITORS = 12
const US = 2840

export const CITIES = [
  { key: 'dallas', name: 'Dallas', code: 1026339 },
  { key: 'fort-worth', name: 'Fort Worth', code: 1026411 },
]

// Candidate head terms per industry. We pick the highest-volume one per city
// from live data rather than guessing which phrasing dominates.
const INDUSTRIES = [
  // --- Publish tier: chosen on measured market value AND local capturability.
  //     See docs/industry-selection.md. Value is Dallas+Fort Worth monthly
  //     ad-equivalent (volume x CPC); local share is of the top 12 organic.
  { key: 'legal-personal-injury', terms: ['personal injury lawyer', 'personal injury attorney', 'car accident lawyer'] },
  { key: 'legal-criminal',        terms: ['criminal defense lawyer', 'dwi lawyer', 'criminal defense attorney'] },
  { key: 'legal-family',          terms: ['divorce lawyer', 'divorce attorney', 'family law attorney'] },
  { key: 'dental',                terms: ['dentist', 'family dentist', 'dental office'] },
  { key: 'dental-ortho',          terms: ['orthodontist', 'invisalign', 'braces'] },
  { key: 'med-spa',               terms: ['med spa', 'medical spa', 'botox'] },
  { key: 'garage-doors',          terms: ['garage door repair', 'garage door company', 'garage door installation'] },
  { key: 'pest-control',          terms: ['pest control', 'pest control company', 'exterminator'] },
  { key: 'moving',                terms: ['moving company', 'local movers', 'movers'] },
  // Agency terms only. "car insurance quote" is Geico/Allstate/Nationwide --
  // 2 of 12 local. "insurance agency" is 6 of 12 and genuinely capturable.
  { key: 'insurance-agency',      terms: ['insurance agency', 'insurance broker', 'independent insurance agent'] },
  { key: 'hvac',                  terms: ['hvac company', 'ac repair', 'air conditioning repair', 'hvac contractor'] },
  { key: 'plumbing',              terms: ['plumber', 'plumbing company', 'plumbing repair'] },
  { key: 'foundation-repair',     terms: ['foundation repair', 'foundation repair company'] },
  { key: 'roofing',               terms: ['roofing company', 'roofer', 'roofing contractor', 'roof repair'] },
  { key: 'electrical',            terms: ['electrical contractor', 'electrician'] },
  { key: 'remodeling',            terms: ['home remodeling', 'remodeling contractor', 'home renovation'] },
  // --- Data tier: swept and held, not in the publish plan. Low market value
  //     (pools/painting/fencing together are under 3% of personal injury law)
  //     but useful as sales material and a later content pipeline.
  { key: 'landscaping',           terms: ['landscaping company', 'landscaper', 'landscape design'] },
  { key: 'pools',                 terms: ['pool builder', 'pool contractor', 'swimming pool builder'] },
  { key: 'painting',              terms: ['painting contractor', 'house painter', 'painting company'] },
  { key: 'fencing',               terms: ['fence company', 'fence installation', 'fencing contractor'] },
]

// Cache of domain -> national keyword count, so each domain is priced once.
const footprintFile = `${OUT}/_footprints.json`
const footprints = existsSync(footprintFile) ? load('_footprints') : {}

async function classify(domains) {
  const unknown = domains.filter((d) => !(d in footprints))
  for (let i = 0; i < unknown.length; i += 100) {
    const batch = unknown.slice(i, i + 100)
    const r = (await api('/v3/dataforseo_labs/google/bulk_traffic_estimation/live',
      { targets: batch, location_code: US, language_code: 'en' }))?.[0]
    for (const it of r?.items ?? []) footprints[norm(it.target)] = it.metrics?.organic?.count ?? 0
    for (const d of batch) if (!(d in footprints)) footprints[d] = 0
  }
  writeFileSync(footprintFile, JSON.stringify(footprints, null, 2))
  return Object.fromEntries(domains.map((d) => [d,
    EXCLUDED.has(d) || NEVER_A_BUSINESS.test(d) ||
    (footprints[d] ?? 0) >= AGGREGATOR_KEYWORD_FLOOR]))
}

for (const city of CITIES) {
  for (const ind of INDUSTRIES) {
    const tag = `${city.key}-${ind.key}`
    console.log(`\n=== ${tag}`)

    // Competitors are assembled from Google Maps (definitively local) and the
    // organic SERP (authority-weighted), keeping which source each came from.
    let chosen, serp, organic = [], platforms = []
    if (existsSync(`${OUT}/term-${tag}.json`) && existsSync(`${OUT}/serp-${tag}.json`)) {
      chosen = load(`term-${tag}`); serp = load(`serp-${tag}`)
    } else {
      const vol = await api('/v3/keywords_data/google_ads/search_volume/live',
        { location_code: city.code, language_code: 'en', keywords: ind.terms })
      const ranked = (vol ?? []).map((v) => ({ keyword: v.keyword, volume: v.search_volume ?? 0, cpc: v.cpc ?? null }))
        .sort((a, b) => b.volume - a.volume)
      chosen = { ...(ranked[0] ?? { keyword: ind.terms[0], volume: 0 }), candidates: ranked }
      serp = (await api('/v3/serp/google/organic/live/regular',
        { keyword: chosen.keyword, location_code: city.code, language_code: 'en', device: 'desktop', depth: 40 }))?.[0]
      if (!serp) { console.log('  no serp'); continue }
      save(`term-${tag}`, chosen); save(`serp-${tag}`, serp)
    }
    console.log(`  term "${chosen.keyword}" ${chosen.volume}/mo`)

    // --- organic candidates, classifier-filtered ---
    const organicRanked = []
    const seenO = new Set()
    for (const it of serp.items ?? []) {
      if (it.type !== 'organic' || !it.domain) continue
      const d = norm(it.domain)
      if (seenO.has(d)) continue
      seenO.add(d)
      organicRanked.push({ domain: d, organicRank: it.rank_absolute, url: it.url, title: it.title })
    }
    const isAgg = await classify(organicRanked.map((r) => r.domain))
    organic = organicRanked.filter((r) => !isAgg[r.domain])
    platforms = organicRanked.filter((r) => isAgg[r.domain])
      .map((r) => ({ ...r, nationalKeywords: footprints[r.domain] ?? null }))

    // --- maps: verified local businesses near the city centroid ---
    let mapsItems
    if (existsSync(`${OUT}/maps-${tag}.json`)) mapsItems = load(`maps-${tag}`).items ?? []
    else {
      const mp = (await api('/v3/serp/google/maps/live/advanced',
        { keyword: chosen.keyword, location_code: city.code, language_code: 'en', depth: 20 }))?.[0]
      mapsItems = mp?.items ?? []
      save(`maps-${tag}`, { keyword: chosen.keyword, items: mapsItems })
    }
    const maps = []
    const seenM = new Set()
    for (const b of mapsItems) {
      const d = norm(b.domain) || hostOf(b.url)
      if (!d || seenM.has(d)) continue
      seenM.add(d)
      maps.push({ domain: d, mapsRank: b.rank_absolute ?? maps.length + 1,
        name: b.title ?? null, rating: b.rating?.value ?? null,
        reviews: b.rating?.votes_count ?? 0, cityOf: b.address_info?.city ?? null })
    }

    // --- merge, keeping provenance ---
    const merged = new Map()
    for (const m of maps) merged.set(m.domain, { ...m, sources: ['maps'] })
    for (const o of organic) {
      const e = merged.get(o.domain)
      if (e) { Object.assign(e, o); e.sources = ['maps', 'organic'] }
      else merged.set(o.domain, { ...o, sources: ['organic'] })
    }
    // Reserved quotas, not a single ranking. Overlap between the two sources is
    // only ~7%, so a naive "both first, then maps by reviews" sort fills every
    // slot with Maps entries and drops the organic population entirely -- which
    // would make this Maps-only with extra steps. Take all the both-source
    // businesses, then fill the rest by alternating between the two pools so
    // each is represented.
    const all = [...merged.values()]
    const both = all.filter((c) => c.sources.length === 2)
    const mapsOnly = all.filter((c) => c.sources.length === 1 && c.sources[0] === 'maps')
      .sort((a, b) => (b.reviews ?? 0) - (a.reviews ?? 0))
    const orgOnly = all.filter((c) => c.sources.length === 1 && c.sources[0] === 'organic')
      .sort((a, b) => (a.organicRank ?? 99) - (b.organicRank ?? 99))

    const competitors = both.slice(0, MAX_COMPETITORS)
    let mi = 0, oi = 0
    while (competitors.length < MAX_COMPETITORS && (mi < mapsOnly.length || oi < orgOnly.length)) {
      if (mi < mapsOnly.length) competitors.push(mapsOnly[mi++])
      if (competitors.length < MAX_COMPETITORS && oi < orgOnly.length) competitors.push(orgOnly[oi++])
    }

    const nBoth = competitors.filter((c) => c.sources.length === 2).length
    console.log(`  maps ${maps.length} · organic ${organic.length} · both ${nBoth} → ${competitors.length} competitors`)
    save(`competitors-${tag}`, { city: city.key, industry: ind.key, keyword: chosen.keyword,
      volume: chosen.volume, cpc: chosen.cpc, mapsCount: maps.length, organicCount: organic.length,
      bothCount: nBoth, competitors, platforms })

    if (competitors.length < 3) { console.log('  too few competitors, skipping'); continue }

    // 4. Shared referring domains across the competitor set
    if (!existsSync(`${OUT}/intersection-${tag}.json`)) {
      const inter = (await api('/v3/backlinks/domain_intersection/live', {
        targets: Object.fromEntries(competitors.map((c, i) => [String(i + 1), c.domain])),
        include_subdomains: true, exclude_internal_backlinks: true, intersection_mode: 'partial',
        backlinks_filters: [['dofollow', '=', true]], limit: 1000, order_by: ['1.rank,desc'],
      }))?.[0]
      if (inter) { save(`intersection-${tag}`, inter); console.log(`  intersection: ${inter.total_count} shared domains`) }
    } else console.log('  (intersection cached)')

    // 5. Per-competitor referring domains
    for (const c of competitors) {
      const f = `refdomains-${tag}-${c.domain.replace(/[^a-z0-9]/g, '_')}`
      if (existsSync(`${OUT}/${f}.json`)) continue
      const rd = (await api('/v3/backlinks/referring_domains/live', {
        target: c.domain, limit: 1000, order_by: ['rank,desc'],
        backlinks_status_type: 'live', exclude_internal_backlinks: true,
      }))?.[0]
      if (rd) save(f, rd)
    }
    console.log(`  running spend: $${spend.toFixed(2)}`)
  }
}
console.log(`\n\nTOTAL SPEND: $${spend.toFixed(2)}`)
