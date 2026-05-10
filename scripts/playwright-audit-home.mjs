/**
 * One-off audit: open localhost:3000, collect console + page errors, screenshot.
 * Run: node scripts/playwright-audit-home.mjs
 * Requires: dev server on http://localhost:3000
 */
import { chromium } from 'playwright'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '..', '.playwright-audit')
const url = process.env.AUDIT_URL || 'http://localhost:3000/'

const lines = []
const log = (s) => {
  lines.push(s)
  console.log(s)
}

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()

page.on('console', (msg) => {
  const loc = msg.location()
  const where = loc?.url ? ` (${loc.url}:${loc.lineNumber})` : ''
  log(`[console.${msg.type()}] ${msg.text()}${where}`)
})

page.on('pageerror', (err) => {
  log(`[pageerror] ${err.message}\n${err.stack || ''}`)
})

page.on('requestfailed', (req) => {
  log(`[requestfailed] ${req.url()} — ${req.failure()?.errorText}`)
})

await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(4000)

const shot = join(outDir, 'home-fullpage.png')
await page.screenshot({ path: shot, fullPage: true })

const report = join(outDir, 'console-report.txt')
writeFileSync(report, lines.join('\n'), 'utf8')

log(`\nScreenshot: ${shot}`)
log(`Report: ${report}`)

await browser.close()
