import test from "node:test"
import assert from "node:assert/strict"
import { contrastRatio, meets, parseOpaqueHex, relativeLuminance } from "../lib/contrast.ts"
import { canonicalContrastShareUrl, contrastSharePath, readContrastPair } from "../lib/contrast-link.ts"

test("opaque six-digit sRGB hex parsing accepts case and rejects alpha or malformed values", () => {
  assert.deepEqual(parseOpaqueHex("#000000"), [0, 0, 0])
  assert.deepEqual(parseOpaqueHex("#aBcD09"), [171, 205, 9])
  for (const value of ["#fff", "#00000000", "000000", "#12xz00", " #000000"]) assert.equal(parseOpaqueHex(value), null)
})

test("WCAG 2.2 sRGB breakpoint and relative luminance use the specified transfer function", () => {
  assert.equal(relativeLuminance([0, 0, 0]), 0)
  assert.equal(relativeLuminance([255, 255, 255]), 1)
  const below = 10 / 255
  const above = 11 / 255
  const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-12)
  close(relativeLuminance([10, 0, 0]), 0.2126 * (below / 12.92))
  close(relativeLuminance([11, 0, 0]), 0.2126 * (((above + 0.055) / 1.055) ** 2.4))
})

test("contrast ratios and exact unrounded thresholds are correct", () => {
  assert.equal(contrastRatio(parseOpaqueHex("#000000"), parseOpaqueHex("#FFFFFF")), 21)
  assert.equal(contrastRatio(parseOpaqueHex("#777777"), parseOpaqueHex("#FFFFFF") ) < 4.5, true)
  assert.equal(meets(4.499999999, 4.5), false)
  assert.equal(meets(4.5, 4.5), true)
  assert.equal(meets(6.999999999, 7), false)
  assert.equal(meets(7, 7), true)
})

test("share URLs retain only valid colour parameters and malformed or duplicate values fall back", () => {
  assert.deepEqual(readContrastPair("?bg=%23abc123&fg=%23010203&theme=dark"), { background: "#ABC123", text: "#010203" })
  assert.deepEqual(readContrastPair("?bg=%23bad&fg=%23000000"), { background: "#FFFFFF", text: "#000000" })
  assert.deepEqual(readContrastPair("?bg=%23000000&bg=%23ffffff&fg=%23000000"), { background: "#FFFFFF", text: "#000000" })
  assert.deepEqual(readContrastPair(`?bg=${"x".repeat(129)}`), { background: "#FFFFFF", text: "#010101" })
  assert.equal(contrastSharePath({ background: "#FFFFFF", text: "#010101" }), "/contrast")
  assert.equal(contrastSharePath({ background: "#ABCDEF", text: "#102030" }), "/contrast?bg=%23abcdef&fg=%23102030")
  assert.equal(canonicalContrastShareUrl({ background: "#ABCDEF", text: "#102030" }), "https://ui.wlkr.si/contrast?bg=%23abcdef&fg=%23102030")
})
