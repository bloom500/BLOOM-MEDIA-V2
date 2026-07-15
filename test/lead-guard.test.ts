// Rulează cu: npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { H3Event } from 'h3'
import { rateLimit, clean, escapeHtml, requireContact } from '../server/utils/lead-guard.ts'

// Event minimal — getRequestIP citește headerele, context.clientAddress și socket-ul.
const eventFrom = (ip: string) =>
  ({
    context: {},
    node: { req: { headers: { 'x-forwarded-for': ip }, socket: { remoteAddress: ip } } },
  }) as unknown as H3Event

test('rateLimit lasă 5 cereri și o blochează pe a 6-a', () => {
  const event = eventFrom('10.0.0.1')
  for (let i = 0; i < 5; i++) rateLimit(event)
  assert.throws(() => rateLimit(event), (e: any) => e.statusCode === 429)
})

test('rateLimit numără per IP, nu global', () => {
  const a = eventFrom('10.0.0.2')
  for (let i = 0; i < 5; i++) rateLimit(a)
  rateLimit(eventFrom('10.0.0.3')) // IP nou: nu trebuie să arunce
})

test('escapeHtml neutralizează markup-ul injectat în email', () => {
  const payload = '<a href="http://evil.ro">Click</a>'
  const out = escapeHtml(payload)
  assert.ok(!out.includes('<a'))
  assert.equal(out, '&lt;a href=&quot;http://evil.ro&quot;&gt;Click&lt;/a&gt;')
})

test('clean taie spațiile și plafonează lungimea, dar NU scapă HTML', () => {
  assert.equal(clean('  Ștefan & Co  ', 120), 'Ștefan & Co') // pleacă crud spre Supabase/HubSpot
  assert.equal(clean('x'.repeat(500), 10), 'x'.repeat(10))
  assert.equal(clean(undefined, 10), '')
  assert.equal(clean(42, 10), '')
})

test('requireContact respinge emailul și telefonul invalide', () => {
  assert.throws(() => requireContact('nu-e-email', '0763281168'), (e: any) => e.statusCode === 400)
  assert.throws(() => requireContact('a@b.ro', 'sună-mă'), (e: any) => e.statusCode === 400)
  requireContact('ana@bloommedia.ro', '+40 763 281 168') // valid: nu trebuie să arunce
})
