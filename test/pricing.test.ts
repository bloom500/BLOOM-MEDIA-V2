// Rulează cu: npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { categories, presets } from '../app/lib/pricing.ts'

const allIds = new Set(categories.flatMap(c => c.items).map(i => i.id))

test('fiecare preset referențiază doar itemi existenți în catalog', () => {
  for (const p of presets) {
    for (const id of p.itemIds) {
      assert.ok(allIds.has(id), `preset "${p.id}" conține item inexistent: "${id}"`)
    }
  }
})

test('preseturile nu au itemi duplicați și au prețuri > 0', () => {
  const items = categories.flatMap(c => c.items)
  for (const p of presets) {
    assert.equal(new Set(p.itemIds).size, p.itemIds.length, `duplicate în "${p.id}"`)
    const monthly = items.filter(i => p.itemIds.includes(i.id) && !i.oneTime)
      .reduce((s, i) => s + i.price, 0)
    assert.ok(monthly > 0, `preset "${p.id}" fără componentă lunară`)
  }
})
