import test from "node:test"
import assert from "node:assert/strict"
import { viewedSection } from "../lib/gallery-section.ts"

const section = (id, top, bottom) => ({ id, top, bottom })
test("native anchor position selects the actual viewed section rather than the first entry", () => {
  assert.equal(viewedSection([section('first', -900, -10), section('pixel', 86, 1025)], 900, 87), 'pixel')
  assert.equal(viewedSection([section('first', 500, 1100), section('pixel', 1100, 2000)], 900, 87), 'first')
  assert.equal(viewedSection([section('first', 800, 1400)], 740, 87), null)
})
test("reading-line boundary belongs to the next section, including very tall content", () => {
  assert.equal(viewedSection([section('tall', -5000, 88), section('next', 88, 1000)], 900, 87), 'tall')
  assert.equal(viewedSection([section('tall', -5000, 87), section('next', 87, 1000)], 900, 87), 'next')
  assert.equal(viewedSection([section('tall', -5000, 86), section('next', 86, 1000)], 900, 87), 'next')
  assert.equal(viewedSection([section('tall', -5000, 1000), section('next', 1000, 2000)], 900, 87), 'tall')
})
test("manual scrolling updates the current section independently of any prior anchor", () => {
  const before = [section('copy', 86, 700), section('pixel', 700, 1700)]
  const after = before.map(s => ({ ...s, top: s.top - 650, bottom: s.bottom - 650 }))
  assert.equal(viewedSection(before, 900, 87), 'copy')
  assert.equal(viewedSection(after, 900, 87), 'pixel')
  assert.equal(viewedSection(after.map(s => ({ ...s, top: s.top + 650, bottom: s.bottom + 650 })), 900, 87), 'copy')
})
test("filtered/empty inventories cannot retain a missing current section and do not mutate geometry", () => {
  const all = Object.freeze([Object.freeze(section('copy', -600, 86)), Object.freeze(section('pixel', 86, 1300))])
  assert.equal(viewedSection(all, 900, 87), 'pixel')
  assert.equal(viewedSection([section('copy', 200, 700)], 900, 87), 'copy')
  assert.equal(viewedSection([], 900, 87), null)
  assert.equal(viewedSection(all, 900, 87), 'pixel')
  assert.deepEqual(all[1], section('pixel', 86, 1300))
})
test("offscreen, zero-sized and invalid viewport geometry produce no false location", () => {
  assert.equal(viewedSection([section('past', -1000, 86), section('future', 900, 1500)], 900, 87), null)
  assert.equal(viewedSection([section('zero', 100, 100), section('bad', NaN, 900)], 900, 87), null)
  for (const height of [0, -1, NaN, Infinity]) assert.equal(viewedSection([section('one', 0, 100)], height, 87), null)
  assert.equal(viewedSection([section('short', 0, 50)], 50, 200), 'short')
})
