import test from "node:test"
import assert from "node:assert/strict"
import { contrastRatio, generateAAOptions, meets, mixRgb, parseOpaqueHex } from "../lib/contrast.ts"

test("RGB mixing stays bounded and reaches exact black or white endpoints", () => {
  const color = parseOpaqueHex("#123456")
  assert.deepEqual(mixRgb(color, 0, 0), color)
  assert.deepEqual(mixRgb(color, 0, 20), [0, 0, 0])
  assert.deepEqual(mixRgb(color, 255, 20), [255, 255, 255])
  assert.deepEqual(mixRgb(color, 255, 100), [255, 255, 255])
})

test("already-passing current text appears once as the selected current option", () => {
  const options = generateAAOptions("#FFFFFF", "#010101")
  const current = options.filter(option => option.color === "#010101")
  assert.equal(current.length, 1)
  assert.equal(current[0].direction, "Current")
  assert.ok(options.length <= 5)
  assert.ok(options.every(option => meets(contrastRatio(parseOpaqueHex("#FFFFFF"), parseOpaqueHex(option.color)), 4.5)))
})

test("bounded mixing can find passing options in both opposite directions", () => {
  const options = generateAAOptions("#767676", "#777777")
  assert.ok(options.some(option => option.direction === "Toward black"))
  assert.ok(options.some(option => option.direction === "Toward white"))
  assert.ok(options.every(option => /^#[0-9A-F]{6}$/.test(option.color)))
  assert.ok(new Set(options.map(option => option.color)).size === options.length)
  assert.ok(options.every(option => option.ratio >= 4.5))
  assert.ok(options.length <= 4)
})

test("options use unrounded ratios and never include a rounded display-only pass", () => {
  const background = parseOpaqueHex("#FFFFFF")
  const almostBoundary = parseOpaqueHex("#81737A")
  const ratio = contrastRatio(background, almostBoundary)
  assert.equal(ratio.toFixed(2), "4.50")
  assert.equal(meets(ratio, 4.5), false)
  assert.ok(!generateAAOptions("#FFFFFF", "#81737A").some(option => option.color === "#81737A"))
  assert.ok(generateAAOptions("#FFFFFF", "#81737A").every(option => option.ratio >= 4.5))
})

test("invalid input yields no choices", () => {
  assert.deepEqual(generateAAOptions("invalid", "#FFFFFF"), [])
  assert.deepEqual(generateAAOptions("#FFFFFF", "#fff"), [])
})
