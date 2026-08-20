# Renderer prototype: 2026-08-19

**Decision: sigma v3 for the explorer, 3d-force-graph for the hero.
Cosmos dropped.**

`npm run proto` → http://localhost:5180. Both renderers, same data, shared
bucket filters. Data from `data/graphs/` (built by `scripts/build-graphs.mjs`).

## Cosmos is out: licensing, first and foremost

`@cosmograph/cosmos` is **CC-BY-NC-4.0**. Non-commercial only. dfwseo.com is
a commercial project, so it is not licensable for this
regardless of technical merit. Removed from the project.

That alone settles it, but the engineering case pointed the same way: see
below. Do not revisit without a commercial license.

## The two we shipped

**sigma v3 + graphology** worked first try and looks right. 60fps on the
1,010-node plumbing graph, labels are legible and collision-aware, hover and
filtering are instant (26-38ms rebuild). Reading the graph actually works.

**@cosmograph/cosmos v3 could not be made to render** inside the timebox,
despite: shimming its broken `gl-bench` dep (ships UMD, imported as ESM
default: breaks the bundler outright), awaiting its async `ready` promise
before writing buffers, remapping coordinates into its `[0, spaceSize]`
space, and sizing the canvas backing store by hand (it stayed at the default
300x150 while the CSS box was 700x783).

After all four fixes the canvas is correctly sized, has a live webgl2 context
(ANGLE Metal, M4 Max), throws **no errors**: and draws nothing.

That silent-failure profile is the actual argument. For a project where the
visualization *is* the product, a renderer that fails without saying so is
disqualifying unless it buys something sigma can't do. It doesn't, at our
scale: our largest industry graph is ~1,000 nodes, and cosmos's advantage
only starts mattering in the 100k+ range.

**3d-force-graph (MIT, vasturiano)** replaces it for the hero. Renders at
60fps, orbit controls with auto-rotate, `zoomToFit` frames it cleanly.

Chose the vanilla `3d-force-graph` over `react-force-graph-3d`: same author,
same three.js engine, but the React wrapper would pull React into an Astro
site for a single decorative element. No reason to pay that.

The side-by-side also confirms the hero/tool split empirically: the 3D pane
looks alive and is completely unreadable as analysis (occlusion, no labels,
no reliable click targets). Exactly what we want it for, and exactly why the
explorer stays 2D.

## Bugs found and fixed

- **forceatlas2 needs seed coordinates.** Nodes without initial x/y come out
  `NaN`: hit every ranking competitor that shares no referrers
  (holdenroofing.com, bakerbrothersplumbing.com). Now seeded with a
  deterministic PRNG so layouts stay stable across monthly rebuilds, which
  preserves the user's spatial mental map.
- **`inset: 0` does not stretch a `<canvas>`.** Replaced elements keep their
  intrinsic 300x150 without explicit width/height.

## Confirmed design decisions

- **Precomputed layout is the right call.** Graphs appear instantly at final
  position; no simulation settling.
- **Filters hide rather than re-layout.** Nodes never move between filter
  changes.
- **Color as quality encoding works.** In the plumbing view the
  Baker Brothers / Berkeys PBN reads as a dense fan on the left and
  Roto-Rooter's as one on the right, with dmagazine.com visible between them
  as a genuine local hub: before touching a single filter.

## Open problem: the shape classifier disagrees with the eye

Plumbing is labeled `scattered`, but visually it is plainly two hub fans
around a shared local core. The degree-distribution heuristic is still wrong.
Community detection (louvain) is likely the right basis rather than degree
thresholds, since what the eye is picking up is clusters, not hubs.

## Bundle note

sigma + cosmos together: 816KB raw / 204KB gzipped. Dropping cosmos removes
luma.gl, which is the bulk of it. Relevant: this site cannot be slow.


---

## Final: force-graph (2D) for explorers, 3d-force-graph for the hero

Superseded sigma after all. Both are vasturiano, same API, same MIT license -
one library family, one set of interaction code, one mental model. The 2D
build is draggable and physical-feeling in a way sigma is not, which is what
made the 3D version appealing in the first place.

Label collision is handled by hand: force-graph has none, and colliding labels
are worse than missing ones, so a greedy placer tries right / left / above and
skips a label rather than overlapping one. Competitors draw first and so win
contested space.

Sigma and the side-by-side prototype have been removed. Shipping deps are
`force-graph`, `3d-force-graph`, `graphology` + `graphology-layout-forceatlas2`
+ `graphology-communities-louvain` (build-time only).

Page weight for a full industry page: 28KB HTML, 188KB JS.
