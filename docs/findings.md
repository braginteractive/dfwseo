# Validation runs: 2026-08-19

Source: DataForSEO. location_code 1026339 (Dallas-Ft. Worth DMA).

## Keyword premise: dead

| Keyword | Vol/mo | Top-of-page CPC |
|---|---|---|
| dfw seo | 10 | - |
| dfw seo company | 10 | - |
| fort worth seo | 20 | - |
| local seo dallas | 70 | - |
| dallas seo agency | 260 | $10-47 |
| dallas seo company | 320 | $9.67 avg |
| dallas seo | ~500 trailing* | $17-38 |

*1,300 reported, inflated by a 6,600 spike in Feb 2026.

Exact-match domain traffic play is not viable. Domain value is credibility,
not search volume.

## Roofing: no shared local-authority core

SERP "dallas roofing company", 10 local competitors (aggregators stripped).
398 shared referring domains via backlinks/domain_intersection. **57% rank 0.**

Domains linking to all 10: betulcrime.com, betwinnermirror.com, read.org.in,
sergechel.info, booksreadr.org, alljobs.info, getwebsiteworth.com,
homesforsaleoldgreenwichct.com: gambling mirrors and scraped-stat junk.

Only real tier is roofer-niche directories: rooferrate.com (92),
prosgrade.com (88), roofingcontractors.org (79), toplocalroofers.com (74),
therooferlist.com (51).

**Zero DFW-local editorial sources anywhere in the intersection**: despite
web.dallasbuilders.com ranking on page 2 of the same SERP.

## Remodeling: association-gated

SERP "dallas home remodeling contractor", 10 competitors.
257 shared domains, 81% rank 0. Survivors are structurally different:

| Domain | Rank | Links to | What |
|---|---|---|---|
| narintx.org | 86 | 3/10 | NARI North Texas |
| naridallas.org | 23 | **7/10** | NARI Dallas chapter |
| candysdirt.com | 31 | 5/10 | DFW real-estate news |
| daltxrealestate.com | 11 | 3/10 | DFW property media |
| howtohome.co | 100 | 6/10 | Niche vertical |

Trade association membership is the local link currency in this industry.

Also live: housesbathroom / shopbathroom / bathroommodel .web.app
(spam 25-26) link to 6 of 10 top remodelers. Active PBN.

## Metro-wide: no connective tissue

Roofing and remodeling shared-referrer sets overlap on 27 domains.
**26 of 27 are rank-0 spam directories** (fastrankdirectory, allistingdirectory,
powerlinkdirectory, ahrefs-links.com...). The 27th, z1biz.com, is junk-tier.

DFW authority is siloed into vertical trade associations. The only thing
currently linking DFW industries together is spam. That hole is the thesis.

## Implication for the build

Two industries produced opposite topologies (spam mesh vs. hub star), which
is the evidence the visualization has something to render. The defensible IP
is the classifier that separates naridallas.org from betwinnermirror.com --
anyone can call domain_intersection.

Next: run the sweep across ~10 industries (roofing, remodeling, HVAC,
plumbing, legal, dental, real estate, landscaping, med spa, auto repair)
before building UI.

---

# 10-industry sweep: 2026-08-19

Dallas only, location_code 1026339. Home services. **Total API spend: $4.14.**
Raw responses in `data/raw/` (126 files). Run: `node scripts/sweep.mjs`.

## Topology

| industry | shared | dead% | quality | DFW-local | shape |
|---|---|---|---|---|---|
| plumbing | 1423 | 50% | 290 | 7 | mesh |
| hvac | 1083 | 50% | 285 | 4 | hub-dominated |
| electrical | 585 | 61% | 137 | 6 | scattered |
| foundation-repair | 377 | 76% | 38 | 4 | scattered |
| pools | 325 | 77% | 36 | 0 | hub-dominated |
| roofing | 328 | 70% | 34 | 3 | scattered |
| painting | 146 | 66% | 18 | 2 | hub-dominated |
| landscaping | 200 | 69% | 15 | 2 | scattered |
| fencing | 146 | 69% | 10 | 1 | hub-dominated |
| remodeling | 181 | 82% | 8 | 2 | scattered |

Shapes DO differentiate: the earlier all-"hub-dominated" result was a
classifier bug (threshold on max degree alone). Now requires a real gap
between top hub and the pack.

**Dead-link share is 50-82% in every single industry.** The DFW link
economy is majority worthless everywhere we looked.

## The headline: only 9 DFW-local quality domains exist

Across all 10 industries and ~4,800 shared referring domains:

| rank | domain | industries | what |
|---|---|---|---|
| 124 | dfwprofessionals.com | 6 | aggregator |
| 86 | narintx.org | remodeling | NARI North Texas |
| 65 | astardfw.com | electrical, plumbing | |
| 64 | fortworthreport.org | plumbing | nonprofit newsroom |
| 51 | tx24h.com | 7 | aggregator |
| 51 | dfwhomefixpros.com | 5 | aggregator |
| 38 | dallasnews.com | electrical, hvac, plumbing | Dallas Morning News |
| 23 | texasonthemap.com | 5 | aggregator |
| 23 | naridallas.org | remodeling | NARI Dallas |

Real local *editorial* authority in DFW home services is essentially three
outlets (dallasnews.com, fortworthreport.org, livingmagazine.net) plus two
NARI chapters. That is the entire earnable local link surface.

## Cross-industry connective tissue: exists, but it's commodity

168 quality domains appear in 2+ industries. Almost all are national listing
platforms (storeboard, united-local, bunity, provenexpert, mapquest) or spam.
Only 5 are DFW-local, and 4 of those are aggregators, not publishers.

The zoom-out hypothesis holds in a qualified form: DFW *is* connected, but
by commodity citations rather than local editorial. The metro graph's honest
shape is islands joined by a thin national scaffold.

## PBN detected: Baker Brothers / Berkeys

13 unrelated content domains (bestroomba.net, donjuanskitchen.com,
cravethelifestyle.com, bug-home.com, anryhome.com, deelyhouse.com,
dallamaids.com, human-home.com, creativemindhome.com, ewhoknow.com,
asset-protection-trust.us, cementizillo.com, asphaltetgs.org): all rank ~51 -
point 39 links each at bakerbrothersplumbing.com and berkeys.com, and
essentially nothing else. wrenchgroup.com (the PE owner of Berkeys) bridges
the same three industries. One vendor, one network, two beneficiaries.

Renders as a dense isolated blob. Strong case study for the site.

## Known weaknesses in the current classifier

- `unclassified` dominates the type breakdown (283 of 290 for plumbing).
  Source typing is too thin to be trusted yet.
- Plumbing's 290 "quality" domains is almost certainly still too permissive;
  the rank>=20 floor is letting low-value domains through.
- Both need another pass before any of this is published.


---

# Scope correction: 2026-08-19

## The original ten were not evidence-based

They were set to "home services" at the outset, never tested against market
value. A 48-industry scan of Dallas + Fort Worth monthly
ad-equivalent value (volume x CPC) put them at: HVAC 3, plumbing 4, foundation
repair 11, electrical 15, remodeling 27, **roofing 30**, landscaping 33,
pools 41, painting 42, fencing 43.

The flagship page was built on the #30 market. Pools, painting and fencing
together are worth under 3% of personal injury law.

Full table in docs/industry-selection.md.

## Local capturability matters as much as value

High market value does not mean a winnable local market. Measured share of the
Dallas top 12 organic results that are local businesses:

| Query | Local |
|---|---|
| med spa | 10/12 |
| personal injury lawyer | 8/12 |
| dwi lawyer | 7/12 |
| insurance agency | 6/12 |
| dentist | 6/12 |
| **car insurance quote** | **2/12** |

Insurance ranked #1 overall at $1.36M/mo, but that is Geico, Allstate,
Nationwide and Liberty Mutual. Split by query type it is two different markets:
agency terms are locally capturable, quote terms are not. Insurance is included
on agency terms only, and its real local value is far below the headline.

## Restricted verticals return null, not zero

Addiction treatment, chiropractic and fertility all returned null volume, which
is a Google Ads restriction on health categories rather than an absent market:
"rehab center" returns 260/mo at $43.57 CPC. Excluded anyway for LegitScript
certification requirements and reputational fit, not for lack of demand.

## D Magazine's directory is a real cross-industry DFW hub

`directory.dmagazine.com` appears in the insurance, DWI and dentist SERPs. It
classifies as a platform (56,634 keywords) so it is held out of competitor sets,
but it appears in the graphs as a referring domain -- and it is exactly the kind
of local authority node the Dallas roofing data said did not exist. Worth
watching as the publish tier expands beyond home services.


---

# 40-market rebuild: 2026-08-19

20 industries x Dallas and Fort Worth. All 40 markets clean of excluded,
`.gov` and `.edu` domains. Spend for this stage: $10.04 sweep + $1.89 re-split.

## texasbar.com is the strongest institutional node found so far

The State Bar of Texas links to:

| Market | Reach |
|---|---|
| fort-worth-legal-criminal | **10 of 10** |
| dallas-legal-family | **9 of 10** |
| fort-worth-legal-personal-injury | 9 of 10 |

This is the same shape as naridallas.org in remodeling (7 of 10), but stronger,
and it sits in the highest-value vertical we measured. Legal is worth ~$1.3M/mo
in ad-equivalent value across the three practice areas.

It is the clearest evidence yet for the central thesis: **in DFW the markets
with a real institutional gatekeeper look completely different from the ones
without.** Roofing has no such node and is a pile of directories. Law has the
State Bar.

## Vertical directories dominate where institutions are absent

`toplawdog.com` reaches 10 of 10 in personal injury in BOTH cities.
`911garagedoorrepairpros.com` reaches 9 of 10 Dallas and 8 of 10 Fort Worth
garage door companies. `hotwaterhelpers.com` reaches 9 of 10 Dallas plumbers.

The pattern holds across verticals: where no association organizes the market,
a niche directory becomes the de facto shared link.

## Insurance confirms the capturability warning

`fort-worth-insurance-agency` is hub-dominated by `beforeinsuranceusa.com`
(10 of 10), and `travelers.com` reaches 6 of 10. Local agencies are linked
mostly by carrier and lead-gen infrastructure rather than by local institutions.
Only `insurefortworth.com` carries DFW identity, at 3 of 10.

Worth publishing, but the story is "this market is owned by carriers and
lead-gen", not "here is a local link economy".

## Market sizes vary enormously

Personal injury produces the largest graphs (637 Dallas / 533 Fort Worth shared
referring domains); fort-worth-foundation-repair produces the smallest (46,
classified `sparse`). Graph size tracks marketing spend closely, which is itself
a finding worth putting on the site.


---

# Site build: 2026-08-19

45 pages, 1,681 internal links audited with 0 broken.

## The two anchor analyses

Written deliberately as opposite poles of the central finding:

- **dallas-roofing** -- no institution. 204 shared domains, the only
  locally-identified ones are three aggregators, six disconnected clusters.
- **fort-worth-legal-criminal** -- a strong institution. `texasbar.com` reaches
  **all twelve** firms, `fortworthinsider.org` reaches nine, 510 shared domains.

Nothing else in the dataset has a domain reaching 100% of a competitor set. The
nearest is naridallas.org at 7 of 10 in Dallas remodeling.

Rendered, the Fort Worth criminal graph shows texasbar.com as a single hub with
twelve spokes while the rest dims. That is the clearest visual argument the
project has produced.

## Copy corrections that were necessary

Two overclaims shipped and had to be pulled back:

1. **"Carries no measurable authority"** asserts a fact about Google from one
   vendor's estimate. Now "scores zero on the third-party authority metric we
   use", with a full section on what that does and does not establish.
2. **"Google returned 20 businesses"** describes our sampling depth, not
   Google's index. Now "we sampled the top 20".

Both are recorded as standing copy rules in the README.
