# Which industries, and why

Measured 2026-08-19. Raw output in `data/market-value.json`.

## How the original ten were chosen

They were not chosen on evidence. Early in the project the scope was simply set
to "home services". Reasonable as a starting point, but it was never tested
against where the money actually is.

## Measuring it

Monthly ad-equivalent value = search volume x CPC, Dallas + Fort Worth
combined, across 48 candidate industries. CPC is the best available proxy for
marketing budget: advertisers bid what a lead is worth to them.

| # | Industry | Monthly $ | Vol | CPC |
|---|---|---|---|---|
| 1 | Insurance | $1,360,739 | 8,830 | $154 |
| 2 | Legal / personal injury | $834,552 | 2,590 | $322 |
| 3 | HVAC | $244,025 | 5,210 | $47 |
| 4 | Plumbing | $239,595 | 7,030 | $34 |
| 5 | Legal / criminal + DWI | $239,463 | 2,930 | $82 |
| 6 | Legal / family | $225,968 | 4,700 | $48 |
| 7 | Dental / general | $167,664 | 11,200 | $15 |
| 8 | Dental / ortho | $146,488 | 8,360 | $18 |
| 9 | Garage doors | $137,545 | 2,320 | $59 |
| 10 | Med spa | $137,047 | 5,620 | $24 |
| 11 | Foundation repair | $109,319 | 1,310 | $83 |
| 12 | Moving | $107,878 | 4,080 | $26 |
| 13 | Pest control | $106,536 | 2,700 | $39 |

Where the original ten actually placed: HVAC 3, plumbing 4, foundation repair
11, electrical 15, remodeling 27, **roofing 30**, landscaping 33, pools 41,
painting 42, fencing 43.

Pools, painting and fencing combined are worth under 3% of personal injury law.

## Caveats that matter

- **Insurance is not a winnable local market.** The $1.36M belongs to State
  Farm, Geico and Progressive. Local independent agencies capture very little.
  High market value does not imply a local opportunity.
- **Real estate is volume without money.** 26,580 searches at $0.58.
- **Roofing is understated.** DFW roofing is hail-driven storm restoration,
  sold door to door and through insurance adjusters, not search. The number
  measures search demand, not industry size.
- Addiction treatment, chiropractic and fertility returned zero, which is
  almost certainly a no-data response rather than no market. Recheck before
  excluding.

## Strategy: sweep wide, publish narrow

Running the data costs about $1 per market. Publishing is the expensive part,
and thirty thin pages on a site whose whole claim is SEO expertise would be
self-defeating.

1. Run data across ~30 viable industries (~$30).
2. Publish deeply on the markets that combine value with local capturability:
   personal injury, criminal/DWI, family law, dental (general + ortho +
   implants combined is ~$388k, second only to insurance), HVAC, plumbing,
   med spa, garage doors, foundation repair, pest control.
3. Sweep the rest and hold the data. Publishing thirty thin pages on a site
   whose claim is analytical rigor would undo the point of the exercise, so
   coverage is bounded by how much can be written well.

Foundation repair stays regardless of rank: DFW clay soil makes it a genuinely
regional industry, which is the kind of local-expertise story this site exists
to tell.

The value table above is itself publishable, and is the honest public answer to
"why these industries".
