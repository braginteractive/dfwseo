import fs from 'node:fs'
import sitemap from '@astrojs/sitemap'
import { defineConfig } from 'astro/config'

/**
 * `lastmod` from the artifact each page is rendered out of.
 *
 * The data is a monthly snapshot and most of it does not move between sweeps,
 * so a build timestamp would tell crawlers all 525 pages changed every deploy
 * — which is both false and the fastest way to have the signal ignored. The
 * mtime of the graph JSON is the date that page's content actually changed.
 *
 * Pages with no artifact behind them (methodology) get no lastmod rather than
 * a guess. Omitting the field is a valid sitemap; inventing it is not.
 */
const artifactFor = (pathname) => {
  const [city, industry, company] = pathname.replace(/^\/|\/$/g, '').split('/')
  if (company) return `data/graphs/sites/${city}-${industry}-${company}.json`
  if (industry) return `data/graphs/${city}-${industry}.json`
  if (city === 'industries') return 'data/market-value.json'
  // Home and the city indexes summarise every market, so they are as fresh as
  // the most recent sweep.
  if (city === '' || city === 'dallas' || city === 'fort-worth') return 'data/graphs/_metro.json'
  return null
}

const lastmod = (pathname) => {
  const file = artifactFor(pathname)
  try {
    return file ? fs.statSync(file).mtime.toISOString() : undefined
  } catch {
    return undefined
  }
}

export default defineConfig({
  site: 'https://dfwseo.com',
  // Static output. No SSR, no DB. Graph artifacts are read at build time.
  output: 'static',
  build: { inlineStylesheets: 'auto' },
  /*
   * The route list is derived from the graph artifacts, so a market that
   * appears in a sweep gets a page and a sitemap entry in the same build. A
   * hand-maintained sitemap would go stale the first time the pipeline adds
   * an industry.
   */
  integrations: [
    sitemap({
      serialize: (item) => ({ ...item, lastmod: lastmod(new URL(item.url).pathname) }),
    }),
  ],
})
