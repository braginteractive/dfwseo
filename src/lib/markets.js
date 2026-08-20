import fs from 'node:fs'

export const CITIES = [
  { key: 'dallas', name: 'Dallas' },
  { key: 'fort-worth', name: 'Fort Worth' },
]

// Publish tier gets hand-written analysis; data tier is swept and shown but not
// written up. See docs/industry-selection.md.
export const PUBLISH_TIER = [
  'legal-personal-injury', 'legal-criminal', 'legal-family', 'dental', 'dental-ortho',
  'med-spa', 'garage-doors', 'pest-control', 'moving', 'insurance-agency',
  'hvac', 'plumbing', 'foundation-repair', 'roofing', 'electrical', 'remodeling',
]

/** Capitalise a phrase that starts a sentence, a heading, or a crumb. */
export const headline = (s) => s.charAt(0).toUpperCase() + s.slice(1)

export const LABEL = {
  'legal-personal-injury': 'Personal injury law',
  'legal-criminal': 'Criminal defense',
  'legal-family': 'Family law',
  'dental': 'Dentistry',
  'dental-ortho': 'Orthodontics',
  'med-spa': 'Med spa',
  'garage-doors': 'Garage doors',
  'pest-control': 'Pest control',
  'insurance-agency': 'Insurance agencies',
  'hvac': 'HVAC',
  'foundation-repair': 'Foundation repair',
}
/*
 * LABEL holds only the names a slug cannot produce: 'hvac' is not 'Hvac',
 * 'dental-ortho' reads as 'Orthodontics', 'legal-family' as 'Family law'. For
 * everything else the slug already is the name and only needs casing, which
 * is the fallback's job.
 *
 * It used to hand those back raw, so the nav ran "Personal injury law,
 * Criminal defense, Dentistry" straight into "moving, plumbing, roofing" —
 * the half of the industries nobody had written an entry for. Capitalising in
 * the fallback fixes the whole set at once and means the next industry the
 * sweep adds cannot arrive lowercase.
 */
export const labelFor = (k) => LABEL[k] ?? headline(k.replace(/-/g, ' '))

/*
 * The label as it should read mid-sentence: "Dallas personal injury law".
 *
 * Call sites were doing `labelFor(i).toLowerCase()`, which is right for every
 * label except the one that is an acronym — it published "Dallas hvac" in the
 * title, the meta description, the card eyebrow and the JSON-LD of both HVAC
 * markets and all their company pages. A label with no lowercase in it is a
 * name, not a phrase, and stays as it is.
 */
export const labelLower = (k) => {
  const l = labelFor(k)
  return /[a-z]/.test(l) ? l.toLowerCase() : l
}



export const SHAPE_NOTE = {
  'hub-dominated': 'one domain reaches most of the market',
  pockets: 'separate groups, no shared center',
  mesh: 'densely cross-linked, no hierarchy',
  scattered: 'little overlap between competitors',
  sparse: 'almost nothing shared',
}

export function allMarkets() {
  return fs
    .readdirSync('data/graphs')
    .filter((f) => f.endsWith('.json') && !f.startsWith('_'))
    .map((f) => f.replace('.json', ''))
    .map((tag) => {
      const city = CITIES.find((c) => tag.startsWith(c.key + '-'))
      return { tag, city: city.key, industry: tag.slice(city.key.length + 1) }
    })
}

export const readMarket = (tag) =>
  JSON.parse(fs.readFileSync(`data/graphs/${tag}.json`, 'utf8'))

export const sourceOf = (c) => (c.sources?.length === 2 ? 'both' : (c.sources?.[0] ?? 'organic'))

export const slugOf = (d) => d.replace(/[^a-z0-9]/g, '_')

export function readSite(city, industry, domain) {
  const f = `data/graphs/sites/${city}-${industry}-${slugOf(domain)}.json`
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null
}

// Which of a market's connectors link to this company, and which do not.
// The gap is the useful half: shared domains everyone else has and they do not.
export function connectorCoverage(market, domain) {
  const linked = new Set()
  for (const [s, t] of market.edges) {
    if (t === domain) linked.add(s)
    else if (s === domain) linked.add(t)
  }
  const has = [], missing = []
  for (const r of market.leaderboard) (linked.has(r.domain) ? has : missing).push(r)
  return { has, missing, linked }
}
