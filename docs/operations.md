# Refreshing the data

The data is a snapshot. A stale link graph is worse than no link graph, and this
site's whole claim is that we know what we are doing. Treat a refresh as a
publishing obligation.

**The API bill is not the cost of a refresh. Rewriting prose is.**
`src/lib/analysis.js` names exact figures across 16 hand-written analyses:
"reaches ten of twelve", "886 shared referring domains", "69% score zero". Every
one of those moves when a competitor set changes. Budget the writing, not the
dollars.

## Three tiers

| Command | When | Cost | Changes the site? |
|---|---|---|---|
| `npm run refresh` | monthly | ~$0.35 | **No.** Writes a dated diff only. |
| `npm run refresh:full -- --yes` | quarterly | ~$3 | Yes. Competitor sets, intersections, graphs, and the prose that cites them. |
| `npm run refresh:deep -- --yes` | twice a year | ~$12 | Yes, plus referring domains. |

### movement (monthly)

Re-pulls SERPs and the map pack, compares what Google shows now against the
committed competitor sets, and writes `data/movement/YYYY-MM.json`. **It never
touches anything the site reads**, so it is safe to run at any time and cannot
break a build.

Its real value is the time series. We deliberately dropped the historical link
dimension early on; this is the one history worth accumulating, and it cannot be
reconstructed after the fact.

### full (quarterly)

Invalidates terms, SERPs, maps, competitor sets and intersections, re-sweeps,
rebuilds graphs, then prints exactly what changed and runs the figure checker.
Refuses to run without `--yes`.

### deep (twice a year)

Adds referring domains. They are ~80% of a full sweep's cost and the slowest
data to move, which is why they are on their own cadence.

## The noise floor: most "movement" is not movement

Measured on a **same-day baseline run**, with zero elapsed time between capture
and check:

| Companies dropped | Markets (of 40) |
|---|---|
| 0 | 18 |
| 1 | 15 |
| 2 | 2 |
| 3 | 4 |
| 4 | 1 |

Twenty-two of forty markets differed by at least one company **on the same day**.
That is Google's ordinary result variability, not the market changing.

**So: one or two dropped companies is noise. Three or more is churn.** The
report flags churn with `!!` and counts only those in its summary. Do not
schedule a full refresh because a monthly report shows scattered single drops;
that is what a monthly report looks like when nothing has happened.

## Running a full refresh

    npm run refresh:full -- --yes

Then work the list below **in order**. Steps 3 and 4 are the ones that catch
real damage.

### 1. Read the "what changed" report

Printed automatically. Look for:

- **Companies replaced.** Expected in ones and twos. A market replacing 5+ means
  the head term may have shifted or the market genuinely moved; check
  `data/raw/term-<market>.json` to see whether a different keyword won.
- **Shared referrer counts moving a lot.** A market going from 200 to 800 shared
  domains usually means the competitor set changed character, not that everyone
  built links.
- **Shape changes.** `pockets` to `mesh` is a real structural finding, and it may
  invalidate an analysis whose whole argument was about fragmentation.

### 2. Review `data/excluded-domains.json`

New national chains and vertical directories appear in SERPs over time, and the
footprint classifier provably cannot catch them (docs/methodology.md 3a). Scan
each competitor set for names that are not local businesses:

    node -e "const fs=require('fs');for(const f of fs.readdirSync('data/raw').filter(f=>f.startsWith('competitors-')).sort()){const d=JSON.parse(fs.readFileSync('data/raw/'+f,'utf8'));console.log(d.city+'-'+d.industry+': '+d.competitors.map(c=>c.domain).join(', '))}"

Add anything that is a directory, chain, manufacturer or out-of-area business,
**with a reason**. This is the one irreducibly manual step; budget ~20 minutes.

If you change the exclusion list, competitor sets change, so intersections must
be rebuilt too:

    rm -f data/raw/competitors-*.json data/raw/intersection-*.json
    node scripts/sweep.mjs && node scripts/graphs

### 3. Fix the prose the checker flags

`npm run check:figures` runs automatically at the end of a full refresh and
again in `postbuild`. When it fails it names the market, the claim, and the
actual value:

    dallas-roofing: therooferlist.com claimed 12, actual 9
    fort-worth-legal-criminal: claims 6 clusters, actual 5

Fix each against `data/graphs/<market>.json`. If a domain an analysis was built
around has left the market entirely, the analysis needs rewriting, not patching:
its argument was about that domain.

**This has already caught real drift.** Two analyses claimed six clusters after
a rebuild produced five.

### 4. Check nothing else broke

    npm run build

`postbuild` runs both checkers. A clean build ends with:

    all figures cited across 16 analyses match the data
    no copy issues across 525 pages

Then confirm the page count is still what you expect. A sudden drop means a
market failed to produce graph artifacts and its pages silently vanished.

Also worth a look before committing:

- `/` renders every market in the matrix, with no blank cells
- One market page's graph still renders and the scroll story still highlights
- A company page still shows its link gap

### 5. Commit

Commit `data/graphs`, `data/movement`, any prose changes, and any exclusion-list
changes together, so the artifacts and the writing that describes them stay in
step. Record the spend below.

## Cache invalidation

`data/raw` is a 281MB gitignored cache. `refresh:full` handles invalidation, but
if you are doing it by hand:

| Delete | Forces | Cost |
|---|---|---|
| `term-*.json` | head-term reselection | low |
| `serp-*.json`, `maps-*.json` | fresh rankings | low |
| `competitors-*.json` | competitor re-split | free if SERPs and footprints cached |
| `intersection-*.json` | shared referrer recompute | ~$1.75 for 40 markets |
| `refdomains-*.json` | per-company link profiles | ~$8 for 40 markets |
| `_footprints.json` | aggregator reclassification | moderate |

**Deleting `competitors-*.json` almost always means deleting `intersection-*.json`
too.** An intersection computed for a different competitor set is simply wrong.
This is why a "free" re-split cost $1.89 on 2026-08-19.

`_footprints.json` and `refdomains-*` are keyed by domain and shared across
markets, so a company that stays in its set keeps its cached data for free.

## Why this runs locally, not in CI

Three reasons, in order:

1. **The cache is local.** `data/raw` is gitignored, so a CI run has no cache and
   re-pulls everything from scratch every time, losing the incremental saving
   entirely.
2. **Step 3 needs a person.** Fixing prose is writing. Automation can detect the
   drift, which it does, but not repair it.
3. **Credentials stay off GitHub.**

A CI refresh using `actions/cache` for `data/raw` and opening a PR would work,
and is the right eventual destination. Earn it first: the failure mode of this
pipeline is publishing confidently wrong numbers, and that is a bad thing to
automate before the manual rhythm is proven.

## Spend log

| Date | Scope | Spend |
|---|---|---|
| 2026-08-19 | 10 industries, Dallas only (v1, archived) | $4.14 |
| 2026-08-19 | 10 industries x 2 cities, first pass | $10.71 |
| 2026-08-19 | rerun after classifier fixes | $4.26 |
| 2026-08-19 | 48-industry market value scan | $0.18 |
| 2026-08-19 | capturability + zero recheck | $0.20 |
| 2026-08-19 | expand to 20 industries x 2 cities (40 markets) | $10.04 |
| 2026-08-19 | competitor re-split + intersection rebuild | $1.89 |
| 2026-08-19 | exclusion list expansion, re-split | $1.63 |
| 2026-08-19 | dual-source (maps + organic) rebuild | $13.91 |
| 2026-08-19 | quota-based merge rebuild | $1.41 |
| 2026-08-19 | movement baseline | $0.34 |

## What is deliberately not here

- **No database.** Artifacts are JSON, committed, read at build time.
- **No suburbs.** Dallas and Fort Worth only; see docs/methodology.md.
- **No historical link data.** We cut it deliberately: nobody researching a
  competitor cares what they linked to in 2021. `data/movement` is the one
  history we keep, because it is about the present changing.
