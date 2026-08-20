/*
 * Credentials come from this project's own .env. Nothing here is baked into the
 * repo, and nothing reaches outside the project directory: the scripts used to
 * read a sibling project's .env by absolute path, which leaked a local layout
 * and made the repo unusable by anyone else.
 */
import { existsSync, readFileSync } from 'node:fs'

export function loadEnv(file = '.env') {
  if (existsSync(file)) {
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      if (!/^[A-Z0-9_]+=/.test(line)) continue
      const i = line.indexOf('=')
      const k = line.slice(0, i)
      if (process.env[k] === undefined)
        process.env[k] = line.slice(i + 1).replace(/^["']|["']$/g, '').trim()
    }
  }
  const { DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD } = process.env
  if (!DATAFORSEO_LOGIN || !DATAFORSEO_PASSWORD) {
    console.error('Missing DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD.')
    console.error('Copy .env.example to .env and fill them in. See README.')
    process.exit(1)
  }
  return {
    auth: 'Basic ' + Buffer.from(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`).toString('base64'),
  }
}
