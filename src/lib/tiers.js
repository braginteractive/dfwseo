// Data colors, deliberately separate from the brand accent so a chart never
// reads as branding. Tuned for contrast against the deep-ink surface.
//
// Tier labels name the METRIC, not a claim about reality. "No rank score" means
// our third-party provider assigns the domain no authority value. It does not
// mean the link passes nothing: vendors disagree, nofollow links and unlinked
// brand mentions can still carry weight, and none of us can see Google.
export const TIERS = [
  { id: 't1', label: 'Rank 100+', color: '#5ea67d' },
  { id: 't2', label: 'Rank 50-99', color: '#6d9dc9' },
  { id: 't3', label: 'Rank 20-49', color: '#a98cc9' },
  { id: 't4', label: 'Rank 1-19', color: '#7d8290' },
  { id: 'unranked', label: 'No rank score', color: '#3d4350' },
]
export const TIER_COLOR = Object.fromEntries(TIERS.map((t) => [t.id, t.color]))
export const COMPETITOR = '#f4f1e6'
