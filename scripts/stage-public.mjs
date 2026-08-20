/*
 * Copies data/graphs into public/ so Astro serves the artifacts the client-side
 * graphs fetch. They are generated, not authored, so public/graphs is
 * gitignored and rebuilt here rather than committed twice.
 */
import { cpSync, mkdirSync, rmSync } from 'node:fs'
rmSync('public/graphs', { recursive: true, force: true })
mkdirSync('public', { recursive: true })
cpSync('data/graphs', 'public/graphs', { recursive: true })
console.log('staged data/graphs -> public/graphs')
