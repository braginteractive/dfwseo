import fs from 'node:fs'
import { PUBLISH_TIER, allMarkets } from './markets.js'

/*
 * The value scan names industries the way the keyword research did — "legal /
 * personal injury", "dental / ortho" — and the graphs key them as slugs. This
 * map is the join between the two, and it lives here rather than in the page
 * because the social card ranks the same rows and must rank them identically.
 * A card that disagrees with the table under it is worse than no card.
 */
const KEY = {
  'legal / personal injury': 'legal-personal-injury', 'legal / criminal': 'legal-criminal',
  'legal / family': 'legal-family', 'dental / general': 'dental', 'dental / ortho': 'dental-ortho',
  'med spa': 'med-spa', 'garage doors': 'garage-doors', 'pest control': 'pest-control',
  moving: 'moving', insurance: 'insurance-agency', hvac: 'hvac', plumbing: 'plumbing',
  'foundation repair': 'foundation-repair', roofing: 'roofing', electrical: 'electrical',
  remodeling: 'remodeling', landscaping: 'landscaping', pools: 'pools', painting: 'painting',
  fencing: 'fencing',
}

/** Rows in published order: value descending, zero-volume industries dropped. */
export function valueRows() {
  const mapped = new Set(allMarkets().map((m) => m.industry))
  return JSON.parse(fs.readFileSync('data/market-value.json', 'utf8'))
    .filter((r) => r.vol > 0)
    .map((r, i) => {
      const key = KEY[r.name]
      return { ...r, pos: i + 1, key, mapped: Boolean(key && mapped.has(key)), tier: Boolean(key && PUBLISH_TIER.includes(key)) }
    })
}
