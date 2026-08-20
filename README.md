# dfwseo.com

Public research property mapping the DFW link economy: which domains actually
confer local authority, per industry and metro-wide.

**Not a product.** A published research project. No accounts, no billing, no
user data, and nothing collected from readers.

## Architecture

Self-contained. This repo owns the pipeline and the site.

    scripts/sweep.mjs         SERP + map pack + backlink intersections
      -> data/raw/            gitignored API cache, ~280MB
    scripts/build-graphs.mjs  classify, forceatlas2 layout, louvain clusters
      -> data/graphs/         committed artifacts, what the site reads
    astro build               525 static pages
      -> dist/

Only `sweep` costs money. `data/graphs` is committed, so building the site
needs no credentials and no cache: a fresh clone builds.

Data is a periodic snapshot, so static is the correct model rather than a
compromise. Nothing runs at request time, so nothing can break at request time.

Perf is non-negotiable. A site claiming SEO expertise cannot have bad
Core Web Vitals.

## Stack

**Astro** + TS + Tailwind. No Prisma, no Stripe, no auth.

Chosen over React Router v7 because the shape is mostly written analysis with
a few heavy interactive islands. Content pages ship zero JS; the graph
hydrates as a single island. Content collections handle the written teardowns.
Perf is a hard requirement here, and Astro's defaults give it to us instead of
us fighting the framework for it.

### Rendering

| Layer | Library | Why |
|---|---|---|
| Landing hero | 3d-force-graph (three.js, MIT) | Marketing only. 3D reads badly as a tool. Vanilla, not the React wrapper: no reason to pull React into Astro for one element. |
| Explorer | force-graph (2D canvas, MIT) | Same author/API as the hero. Draggable and physical; 2D so it stays readable. Replaced sigma. |
| Analytics | graphology-metrics, -communities-louvain | Names the shapes. |
| Detail pages | Observable Plot / SVG | Flat is more legible at this level. |

**@cosmograph/cosmos was evaluated and rejected**: CC-BY-NC-4.0, so not
licensable for commercial use. See docs/renderer-prototype.md.

### Rules that matter

- Layout precomputed server-side; ship x/y. Never simulate on load.
- Filters hide nodes, don't re-layout: preserves the spatial mental map.
- Color = spam score, size = rank, edge opacity = link count. Junk should be
  visible before anyone touches a filter.
- Metro view is a CONTRACTED graph (industries as supernodes, ~60 nodes),
  not 500k raw edges. Expanding an industry loads its subgraph.
- All graph libs are client-only. Lazy-import behind a client boundary or
  RR7 SSR will break on `window`.

## Scope

- **Geography: Dallas and Fort Worth, nothing else.** Measured: the two cities
  share only 2 of 10 ranking companies, so they are genuinely separate link
  markets. Suburbs are deliberately excluded; DFW companies serve the whole
  metro, so suburb pages would be near-duplicates.
- **Industries: 20, chosen on measured market value and local capturability**,
  not on assumption. 16 are in the publish tier, 4 are swept and held as sales
  material. The original "home services" scope was never evidence-based; the
  value scan corrected it. Roofing turned out to be #30 of 48 by search value.
- **Naming**: businesses appear by name. It is publicly observable data. Tone
  stays factual and analytical. We describe patterns and let readers draw
  conclusions; we never assert intent.

## Docs: read these before changing anything

| Doc | What it settles |
|---|---|
| `docs/methodology.md` | Why two cities, why unqualified queries, how aggregators are identified, known limitations |
| `docs/industry-selection.md` | The 48-industry market value scan and why these 20 |
| `docs/operations.md` | **Refresh cadence, cache invalidation, cost, and the pre-publish checklist** |
| `docs/findings.md` | Research findings from each sweep |
| `docs/renderer-prototype.md` | Why force-graph, why cosmos was rejected |

Every decision in these was measured, not assumed, and each records the number
that drove it. When a decision changes, update the doc with the new measurement
rather than deleting the old reasoning.

## Status

Pre-scaffold. `scripts/sweep.mjs` collects raw data into `data/raw/`.
See docs/findings.md for validation runs.

## Setup

    cp .env.example .env     # DataForSEO credentials, only needed to refresh data
    npm install
    npm run build            # builds from committed data/graphs; no credentials needed

Building the site needs **no credentials**. `data/graphs` is committed and is
what the site reads. Credentials are only required to pull new data with
`npm run sweep` or `npm run refresh`.

## Analytics

Off unless `PUBLIC_GA_ID` or `PUBLIC_CF_BEACON_TOKEN` is set at build time. With
neither set, no script tag, preconnect or cookie is emitted at all.

Set them in the Cloudflare Pages dashboard, not in the repo. A GA4 measurement
ID is not really a secret (it ships in the page source of every site using GA),
but a committed one means any fork reports into this property and pollutes the
data.

## Working on it

```bash
npm run dev          # dev server + HMR at localhost:4321
npm run dev:force    # replace an already-running dev server
npm run dev:stop     # stop a stray background dev server

npm run sweep        # re-pull from DataForSEO into data/raw/ (costs money, caches per file)
npm run graphs       # rebuild data/graphs/ from data/raw/ (free, ~1s)
npm run build        # runs `graphs` first, then builds to dist/
npm run preview      # serve dist/ exactly as production will
```

`astro dev` holds a lock, so a stray background server blocks the next start -
`dev:stop` or `dev:force` clears it.

**The three stages are independent.** `sweep` hits the paid API and caches per
file, so re-running it is cheap and skips what it already has. `graphs` is pure
local computation. Only `sweep` costs anything.
