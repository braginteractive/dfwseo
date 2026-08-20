/**
 * Social cards, rendered at build time from the same artifacts the pages read.
 *
 * ## Why we draw these rather than generate them
 *
 * The obvious move for a site like this is one stock hero image reused on
 * every page, or a prompt to an image model. Both are wrong here. The site's
 * whole argument is that most of the DFW link economy is decoration, so an
 * unearned illustration undercuts the copy sitting next to it. And we already
 * own the strongest possible card art: the graph itself. A shared link to the
 * Dallas roofing page unfurls as the actual Dallas roofing graph — real nodes,
 * real clusters, in the site's own palette. No model output competes with
 * that, and this costs nothing per render.
 *
 * ## Why build time, not per request
 *
 * dfwpros renders its cards in a request handler. This site is static Astro
 * with no server, and the underlying data is a monthly snapshot, so a card can
 * only change when the graphs change. Generating them in `prebuild`, beside
 * build-graphs.mjs, means the cards regenerate exactly when their inputs do.
 *
 * ## Why hand-authored SVG rather than satori
 *
 * satori lays out JSX through yoga and is the right tool when the card is a
 * text block. Here the card is mostly a scatter plot, which satori cannot draw
 * at all — it would have to be embedded as an image anyway. Writing the SVG
 * directly makes the graph a first-class element, and fontkit gives exact
 * advance widths so the headline still wraps properly.
 */
import fs from 'node:fs'
import path from 'node:path'
import { Resvg } from '@resvg/resvg-js'
import * as fontkit from 'fontkit'
import sharp from 'sharp'
import {
  CITIES, SHAPE_NOTE, allMarkets, labelFor, labelLower, readMarket, readSite, slugOf,
} from '../src/lib/markets.js'
import { valueRows } from '../src/lib/market-value.js'
import { CARD_HEIGHT, CARD_WIDTH } from '../src/lib/og.js'
import { COMPETITOR, TIERS, TIER_COLOR } from '../src/lib/tiers.js'

const OUT_DIR = 'public/og'
const FONT_DIR = 'assets/fonts'

const INK = '#0c0e13'
const EMBER = '#e0763a'
const PAPER = '#eceadf'
const DIM = '#8e93a0'

const SERIF = 'Instrument Serif'
const MONO = 'IBM Plex Mono'

const fontFiles = ['InstrumentSerif-Regular.ttf', 'IBMPlexMono-Regular.ttf', 'IBMPlexMono-Medium.ttf']
  .map((f) => path.join(FONT_DIR, f))

/**
 * Fonts are read once for the whole run, not once per card.
 *
 * There are 42 cards and resvg parses a font file every time it is handed one;
 * at three faces that is 126 redundant parses of the same bytes. These are
 * build-time assets deliberately kept out of `public/` — the site loads its
 * webfonts from Google Fonts, and shipping a second copy would mean two
 * sources of the same typeface drifting apart.
 */
const metrics = (() => {
  const load = (file) => fontkit.openSync(path.join(FONT_DIR, file))
  return { serif: load('InstrumentSerif-Regular.ttf'), mono: load('IBMPlexMono-Regular.ttf') }
})()

/** Advance width of a string at a given size, in user units. */
function measure(font, text, size) {
  return (font.layout(text).advanceWidth / font.unitsPerEm) * size
}

/**
 * Greedy wrap, capped at `maxLines`.
 *
 * Every string on these cards is one we author — an industry label, a city, a
 * shape note — so there is no runaway input to defend against and no need for
 * hyphenation or a break-anywhere fallback. The cap exists so that a label
 * longer than expected pushes the layout out of shape visibly during a build
 * rather than silently overrunning the frame.
 */
function wrap(font, text, size, maxWidth, maxLines = 2) {
  const lines = []
  let line = ''
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word
    if (line && measure(font, next, size) > maxWidth) {
      lines.push(line)
      line = word
      if (lines.length === maxLines) return lines
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines.slice(0, maxLines)
}

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * The graph, projected into the card's right side.
 *
 * Layout coordinates come straight from the forceatlas2 pass in the pipeline,
 * so the shape on the card is the shape on the page — not a decorative
 * re-simulation that would drift from what a visitor sees after clicking.
 *
 * Edges are drawn at very low opacity and nodes at full: at this size the edge
 * count (818 in Dallas roofing) turns any visible stroke into a grey wash that
 * hides the cluster structure the card exists to show.
 */
/**
 * The metro graph carries no `tier` — its nodes are industries and the bridge
 * domains between them, classified after the per-market sweep — so tier colour
 * has to be recovered from the raw rank. Without this every metro node lands
 * on the unranked grey and the card renders as one flat cloud, which is the
 * opposite of the point: the whole finding is that a handful of these bridges
 * carry authority and the rest do not.
 */
const RANK_TIER = (rank) =>
  rank == null ? 'unranked' : rank >= 100 ? 't1' : rank >= 50 ? 't2' : rank >= 20 ? 't3' : 't4'

/** Competitors and industries are the subjects; everything else is a referrer. */
const colorOf = (n) =>
  n.kind === 'competitor' || n.kind === 'industry'
    ? COMPETITOR
    : (TIER_COLOR[n.tier ?? RANK_TIER(n.rank)] ?? TIER_COLOR.unranked)

function plot(graph, { cx, cy, size }) {
  const xs = graph.nodes.map((n) => n.x)
  const ys = graph.nodes.map((n) => n.y)
  const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) || 1
  const k = size / span
  const mx = (Math.min(...xs) + Math.max(...xs)) / 2
  const my = (Math.min(...ys) + Math.max(...ys)) / 2
  const px = (n) => cx + (n.x - mx) * k
  const py = (n) => cy + (n.y - my) * k

  const byId = new Map(graph.nodes.map((n) => [n.id, n]))
  const edges = graph.edges
    .map(([a, b]) => [byId.get(a), byId.get(b)])
    .filter(([a, b]) => a && b)
    .map(([a, b]) => `M${px(a).toFixed(1)} ${py(a).toFixed(1)}L${px(b).toFixed(1)} ${py(b).toFixed(1)}`)
    .join('')

  const nodes = graph.nodes
    .map((n) => {
      const r = Math.max(2, Math.sqrt(n.size ?? 6) * 1.5 * Math.min(1, k * 1.6))
      const fill = colorOf(n)
      return `<circle cx="${px(n).toFixed(1)}" cy="${py(n).toFixed(1)}" r="${r.toFixed(1)}" fill="${fill}"/>`
    })
    .join('')

  return `<path d="${edges}" stroke="#39404e" stroke-width="0.7" fill="none" opacity="0.5"/>${nodes}`
}

/**
 * The value ranking, as bars.
 *
 * /industries is the one page with no graph behind it, and reusing the metro
 * cloud there would make the card a lie about what the page contains. The
 * ranking is the content, so the ranking is the art.
 *
 * The scale is linear and starts at zero. A log or sqrt axis would even the
 * bars out and look better, and it would destroy the finding: insurance is
 * worth several times the next industry, and that cliff is the whole reason
 * the page exists.
 */
function bars(rows, { x, y, w, h, n = 14 }) {
  const top = rows.slice(0, n)
  const max = top[0].value
  const gap = 10
  const bw = (w - gap * (n - 1)) / n
  return top
    .map((r, i) => {
      const bh = Math.max(3, (r.value / max) * h)
      // Mapped markets are the subject of the site; the rest are context.
      const fill = r.mapped ? COMPETITOR : '#3d4350'
      return `<rect x="${(x + i * (bw + gap)).toFixed(1)}" y="${(y + h - bh).toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="2" fill="${fill}"/>`
    })
    .join('')
}

/**
 * One company's referring domains as a single stacked bar, by authority tier.
 *
 * Deliberately proportional and unlabelled. A count would be the obvious thing
 * to print, and it is exactly what a cached unfurl turns into a lie six weeks
 * later; the shape — how much of the bar is the unranked grey — survives a
 * snapshot and is the point anyway.
 */
function tierBar(site, { x, y, w, h }) {
  const totals = TIERS.map((t) => ({ ...t, n: site?.tiers?.[t.id]?.total ?? 0 }))
  const sum = totals.reduce((a, t) => a + t.n, 0)
  if (!sum) return ''
  let cursor = x
  return totals
    .filter((t) => t.n)
    .map((t) => {
      const seg = (t.n / sum) * w
      const rect = `<rect x="${cursor.toFixed(1)}" y="${y}" width="${Math.max(2, seg).toFixed(1)}" height="${h}" fill="${t.color}"/>`
      cursor += seg
      return rect
    })
    .join('')
}

function card({ eyebrow, title, subtitle, graph, art, titleFont = SERIF, titleSize = 76 }) {
  const titleLines = wrap(titleFont === MONO ? metrics.mono : metrics.serif, title, titleSize, 640)
  const titleTop = 300 - (titleLines.length - 1) * (titleSize * 0.56)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
  <defs>
    <radialGradient id="lift" cx="50%" cy="-10%" r="80%">
      <stop offset="0%" stop-color="#151a24"/><stop offset="62%" stop-color="${INK}"/>
    </radialGradient>
    <linearGradient id="scrim" x1="0" x2="1">
      <stop offset="0%" stop-color="${INK}" stop-opacity="1"/>
      <stop offset="46%" stop-color="${INK}" stop-opacity="0.97"/>
      <stop offset="72%" stop-color="${INK}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="url(#lift)"/>
  ${graph ? plot(graph, { cx: 830, cy: 300, size: 560 }) : ''}
  <!-- The scrim is what makes the headline readable over an arbitrary graph.
       Without it the copy lands on whatever nodes the layout happened to put
       on the left, and that varies per market. -->
  ${graph ? `<rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="url(#scrim)"/>` : ''}
  <!--
    The scrim exists to knock a graph back so the headline is not sitting on
    nodes, so it is drawn only when there is a graph. Art is positioned by its
    caller and stays clear of the text column: scrimming it would mute colours
    that carry meaning (the first two bars on the value card encode "mapped"
    and came out reading as "not mapped"), and a full-frame alpha ramp is the
    single most expensive thing on the card to compress — about 50KB a file
    across 480 company cards.
  -->
  ${art ?? ''}
  <text x="72" y="150" font-family="${MONO}" font-size="20" font-weight="500" letter-spacing="3.4" fill="${EMBER}">${esc(eyebrow.toUpperCase())}</text>
  ${titleLines
    .map((l, i) => `<text x="72" y="${titleTop + i * titleSize * 1.06}" font-family="${titleFont}" font-size="${titleSize}" fill="${PAPER}">${esc(l)}</text>`)
    .join('\n  ')}
  <text x="72" y="${titleTop + titleLines.length * titleSize * 1.06 + 14}" font-family="${MONO}" font-size="25" fill="${DIM}">${esc(subtitle)}</text>
  <rect x="72" y="536" width="34" height="2" fill="${EMBER}"/>
  <text x="72" y="570" font-family="${MONO}" font-size="19" font-weight="500" letter-spacing="2.6" fill="${DIM}">DFWSEO.COM</text>
</svg>`
}

/**
 * Encoding is chosen per card, because no single format serves both kinds.
 *
 * resvg emits full-colour PNG, which for a 1200x630 frame is 40-390KB a file
 * and 38MB across the set. What replaces it depends entirely on what is in the
 * frame:
 *
 * - Graph cards are hundreds of antialiased dots over a gradient, i.e. nearly
 *   continuous tone. Quantising them to a 128-colour palette collapses the
 *   tier greens and purples into grey — a real loss, because those colours are
 *   the data. A 256-colour palette keeps them at 155KB; mozjpeg keeps them at
 *   68KB with no visible difference at all.
 *
 * - Every other card is flat ink, a few solid rects and text. JPEG is the
 *   wrong tool for that (25KB, and ringing around crisp mono glyphs) where a
 *   128-colour palette is exact and costs 8KB. Light dithering smooths the one
 *   thing quantisation does show here, the background gradient.
 *
 * Together: 38MB to under 7MB, with the lossy format used only where nothing
 * about it is visible.
 */
const encode = (png, lossy) =>
  lossy
    ? sharp(png).jpeg({ quality: 88, mozjpeg: true, chromaSubsampling: '4:4:4' }).toBuffer()
    : sharp(png).png({ palette: true, colours: 128, dither: 0.5, compressionLevel: 9, effort: 10 }).toBuffer()

/*
 * Which file each card key resolves to, written out for Head.astro.
 *
 * The format is decided here, per card, so the pages cannot hardcode an
 * extension without going stale the moment that choice changes. They pass a
 * key; this map turns it into a filename and a MIME type.
 */
const manifest = {}

async function emit(key, opts) {
  const lossy = Boolean(opts.graph)
  const png = new Resvg(card(opts), {
    font: { fontFiles, loadSystemFonts: false, defaultFontFamily: MONO },
    fitTo: { mode: 'width', value: CARD_WIDTH },
  })
    .render()
    .asPng()
  const file = `${key}.${lossy ? 'jpg' : 'png'}`
  fs.writeFileSync(path.join(OUT_DIR, file), await encode(png, lossy))
  manifest[key] = file
}

fs.mkdirSync(OUT_DIR, { recursive: true })

const metro = JSON.parse(fs.readFileSync('data/graphs/_metro.json', 'utf8'))
const cityName = (key) => CITIES.find((c) => c.key === key).name

/**
 * One city's slice of the metro graph.
 *
 * Industry nodes carry a `city`; bridge domains carry a `cities` array because
 * a bridge can span both. Keeping a bridge that reaches this city, then
 * dropping any edge with a missing endpoint, leaves a graph that is a subset
 * of the metro layout rather than a re-simulation — so the Dallas card and the
 * metro card place the same domain in the same spot.
 */
function citySubgraph(key) {
  const nodes = metro.nodes.filter((n) =>
    n.kind === 'industry' ? n.city === key : (n.cities ?? []).includes(key),
  )
  const ids = new Set(nodes.map((n) => n.id))
  return { nodes, edges: metro.edges.filter(([a, b]) => ids.has(a) && ids.has(b)) }
}


await emit('default', {
    eyebrow: 'Dallas–Fort Worth',
    title: 'The DFW link graph',
    /*
     * No counts anywhere on a card. Platforms cache an unfurl indefinitely and
     * a card carries no dateline, so a number that moves with the monthly
     * sweep would keep asserting a stale figure long after the page corrected
     * it. Everything here is a claim that stays true between snapshots.
     */
    subtitle: 'Which domains actually confer local authority',
    graph: metro,
})

await emit('methodology', {
    eyebrow: 'Method',
    title: 'How the graph is built',
    subtitle: 'Sources, thresholds, and what this cannot tell you',
    graph: metro,
})

for (const { key, name } of CITIES) {
  await emit(key, {
    eyebrow: `${name} · link graph`,
    title: `The ${name} link graph`,
    subtitle: 'Every mapped market, and the domains that bridge them',
    graph: citySubgraph(key),
  })
}

await emit('industries', {
  eyebrow: 'Market value · DFW',
  title: 'The value of DFW search',
  subtitle: 'Volume times cost per click, by industry',
  art: bars(valueRows(), { x: 740, y: 150, w: 400, h: 330, n: 13 }),
})

for (const { tag, city, industry } of allMarkets()) {
  const graph = readMarket(tag)
  await emit(tag, {
    eyebrow: `${cityName(city)} · link graph`,
    title: `${labelFor(industry)} in ${cityName(city)}`,
    subtitle: SHAPE_NOTE[graph.shape] ?? 'shared referring domains, mapped',
    graph,
  })
}

/*
 * One card per competitor, ~480 of them. A stacked bar is a handful of rects
 * where a market card plots hundreds of nodes and edges, so these are the
 * cheap ones to draw — but at this frame size the background dominates the
 * file, not the art, which is why the scrim is skipped above.
 *
 * The alternative was to let every company page fall back to its market card.
 * That is cheaper still, but it makes 480 pages unfurl as the same image, and
 * the one thing a company page has to say is that this company's profile is
 * not the market's.
 */
for (const { tag, city, industry } of allMarkets()) {
  const market = readMarket(tag)
  for (const comp of market.competitors) {
    const site = readSite(city, industry, comp.domain)
    await emit(`${tag}-${slugOf(comp.domain)}`, {
        eyebrow: `${cityName(city)} ${labelLower(industry)} · link profile`,
        title: comp.domain,
        // Domains are not prose. The serif sets them with proportional spacing
        // and turns rn into m at a glance; mono keeps them readable as strings.
        titleFont: MONO,
        titleSize: 46,
        subtitle: 'Where its referring domains sit on the authority scale',
        art: tierBar(site, { x: 72, y: 430, w: 1056, h: 26 }),
    })
  }
}

const MANIFEST = 'src/lib/og-cards.js'
fs.writeFileSync(
  MANIFEST,
  `// GENERATED by scripts/build-og.mjs. Do not edit.
//
// Card key -> filename. The format is chosen per card by the encoder there,
// so pages ask for a key and never spell an extension they cannot keep true.
export const OG_CARDS = ${JSON.stringify(manifest, null, 2)}
`,
)

const bytes = fs.readdirSync(OUT_DIR).reduce((a, f) => a + fs.statSync(path.join(OUT_DIR, f)).size, 0)
console.log(`og: ${Object.keys(manifest).length} cards, ${(bytes / 1e6).toFixed(1)}MB -> ${OUT_DIR}`)
