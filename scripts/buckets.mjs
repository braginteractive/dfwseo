// Grouping is by MEASURED STRENGTH only -- rank bands plus spam. No semantic
// classification, no judgment calls, no "unclassified" bucket quietly admitting
// we don't know. Descriptive labels (local / platform / trade) survive as TAGS
// on the node: metadata you can see and facet by, never the grouping itself.

export const TIERS = [
  { id: 't1',       label: 'Rank 100+',   min: 100, defaultOn: true,  color: '#4c9f70' },
  { id: 't2',       label: 'Rank 50-99',  min: 50,  defaultOn: true,  color: '#6f9fc4' },
  { id: 't3',       label: 'Rank 20-49',  min: 20,  defaultOn: true,  color: '#a98fc4' },
  { id: 't4',       label: 'Rank 1-19',   min: 1,   defaultOn: false, color: '#8a8f98' },
  { id: 'unranked', label: 'Unranked',    min: 0,   defaultOn: false, color: '#4a4e54' },
]

export const tierOf = (rank) => TIERS.find((t) => (rank || 0) >= t.min).id
export const TIER_COLOR = Object.fromEntries(TIERS.map((t) => [t.id, t.color]))

// Spam is a second, independent axis -- a slider, not a bucket. Grouping by it
// would hide that a high-rank domain can also be toxic.
export const SPAM_DEFAULT_MAX = 30

// ---- Tags: descriptive metadata, shown on hover and facetable. Never grouping.
const GEO =
  /(dfw|dallas|fortworth|ftworth|northtexas|ntx|daltx|texas|tx24|plano|frisco|arlington|irving|mckinney|denton|garland|richardson|carrollton|grapevine|rockwall|mansfield)/i
const FREE_HOST =
  /(blogspot|web\.app|wordpress\.com|weebly|wixsite|tumblr|medium\.com|substack|github\.io|firebaseapp|netlify\.app|vercel\.app|pages\.dev)/i
const PLATFORM =
  /^(storeboard|united-local|bunity|provenexpert|growthzoneapp|mapquest|manta|hotfrog|brownbook|cylex|showmelocal|elocal|opendi|tupalo|yellowbot|citysquares|ezlocal|chamberofcommerce|merchantcircle|birdeye|homeadvisor|thumbtack|porch|angi|yelp|bbb|houzz|salesjobs|growjo|flokii|acompio)\./
const TRADE =
  /(roofer|roofing|plumb|hvac|electric|paint|fence|pool|landscap|foundation|contractor|remodel|handyman|concrete|slab)(rate|list|pros|directory|companies|junction|local|helpers|magazine|mag|finder|jobs|ofamerica)/i
const DIR = /(directory|listing|weblink|linkpoint|rankdir|seodir|backlink|submiturl|addurl)/i

export function tagsFor(domain, spam) {
  const t = []
  if (GEO.test(domain)) t.push('dfw')
  if (PLATFORM.test(domain)) t.push('platform')
  if (TRADE.test(domain)) t.push('trade')
  if (DIR.test(domain)) t.push('directory')
  if (FREE_HOST.test(domain)) t.push('free-host')
  if (spam >= 30) t.push('toxic')
  return t
}
