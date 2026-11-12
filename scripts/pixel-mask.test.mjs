import test from "node:test"
import assert from "node:assert/strict"
import ts from "typescript"
import { blankMask, starterMask, initialMaskState, maskReducer, paintMask, maskLine, cellAtPoint, moveMaskCell, maskExample, HISTORY_LIMIT } from "../lib/pixel-mask.ts"

test("one drag, including skipped cells, is one reversible transaction", () => {
  const initial = initialMaskState()
  let state = maskReducer(initial, { type: "begin" })
  for (const [from, to] of [[0, 7], [7, 63]]) state = maskReducer(state, { type: "paint", cells: maskLine(from, to), filled: true })
  assert.equal(state.mask[0], "########")
  assert.ok(state.mask.every(row => row.endsWith("#")))
  assert.equal(state.past.length, 0)
  state = maskReducer(state, { type: "end" })
  assert.equal(state.past.length, 1)
  const drawn = state.mask
  state = maskReducer(state, { type: "undo" })
  assert.deepEqual(state.mask, starterMask())
  assert.deepEqual(maskReducer(state, { type: "redo" }).mask, drawn)
  assert.deepEqual(initial.mask, starterMask())
})
test("erase, clear and reset remain undoable; a new edit replaces redo", () => {
  let state = maskReducer(initialMaskState(), { type: "paint", cells: [11], filled: false })
  assert.equal(state.mask[1][3], ".")
  const edited = state.mask
  state = maskReducer(state, { type: "replace", mask: blankMask() })
  assert.deepEqual(state.mask, blankMask())
  state = maskReducer(state, { type: "undo" })
  assert.deepEqual(state.mask, edited)
  state = maskReducer(state, { type: "replace", mask: starterMask() })
  assert.equal(state.future.length, 0)
  assert.deepEqual(maskReducer(state, { type: "undo" }).mask, edited)
  const before = state.past.length
  state = maskReducer(maskReducer(state, { type: "begin" }), { type: "end" })
  assert.equal(state.past.length, before)
})
test("editing history and cell bounds stay capped", () => {
  let state = { ...initialMaskState(), mask: blankMask() }
  for (let i = 0; i < 80; i++) state = maskReducer(state, { type: "paint", cells: [0, -1, 64, NaN], filled: i % 2 === 0 })
  assert.equal(state.past.length, HISTORY_LIMIT)
  for (let i = 0; i < 80; i++) state = maskReducer(state, { type: "undo" })
  assert.equal(state.past.length, 0)
  assert.equal(state.future.length, HISTORY_LIMIT)
  assert.ok(state.mask.length === 8 && state.mask.every(row => /^[.#]{8}$/.test(row)))
  assert.throws(() => paintMask(["bad"], [0], true), /8×8/)
})
test("fast strokes connect endpoints without leaving the bounded grid", () => {
  assert.deepEqual(maskLine(0, 63), [0, 9, 18, 27, 36, 45, 54, 63])
  assert.deepEqual(maskLine(63, 0), [63, 54, 45, 36, 27, 18, 9, 0])
  assert.deepEqual(maskLine(-1, 63), [])
  for (let from = 0; from < 64; from++) for (let to = 0; to < 64; to++) {
    const line = maskLine(from, to)
    assert.equal(line[0], from); assert.equal(line.at(-1), to)
    assert.ok(line.length <= 8 && line.every(cell => cell >= 0 && cell < 64))
  }
})
test("outside pointer coordinates never clamp into edge cells", () => {
  assert.equal(cellAtPoint(1, 1, 280, 280), 0)
  assert.equal(cellAtPoint(279, 279, 280, 280), 63)
  for (const args of [[-1, 0, 280, 280], [280, 10, 280, 280], [10, 280, 280, 280], [0, 0, 0, 0]]) assert.equal(cellAtPoint(...args), null)
})
test("keyboard navigation respects row/grid edges and Home/End", () => {
  assert.equal(moveMaskCell(8, "ArrowLeft"), 8)
  assert.equal(moveMaskCell(7, "ArrowRight"), 7)
  assert.equal(moveMaskCell(3, "ArrowUp"), 3)
  assert.equal(moveMaskCell(60, "ArrowDown"), 60)
  assert.equal(moveMaskCell(29, "Home"), 24)
  assert.equal(moveMaskCell(29, "End"), 31)
  assert.equal(moveMaskCell(29, "Home", true), 0)
  assert.equal(moveMaskCell(29, "End", true), 63)
  for (let cell = 0; cell < 64; cell++) for (const key of ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]) assert.ok(moveMaskCell(cell, key) >= 0 && moveMaskCell(cell, key) < 64)
})
test("React example parses with the exact edited mask", () => {
  const mask = paintMask(blankMask(), [0, 8, 63], true)
  const file = ts.createSourceFile("mask.tsx", maskExample(mask), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  assert.deepEqual(file.parseDiagnostics, [])
  let rows
  function visit(node) {
    if (ts.isJsxAttribute(node) && node.name.getText(file) === "mask") rows = node.initializer.expression.elements.map(element => element.text)
    ts.forEachChild(node, visit)
  }
  visit(file)
  assert.deepEqual(rows, mask)
  assert.throws(() => maskExample(["#"]), /8×8/)
})

test("shared empty and full masks have fixed canonical 64-bit encodings", async () => {
  const { encodeMask, decodeMask } = await import("../lib/pixel-mask-link.ts")
  const empty = blankMask(), full = Array(8).fill("########")
  assert.equal(encodeMask(empty), "v1.0000000000000000")
  assert.equal(encodeMask(full), "v1.ffffffffffffffff")
  assert.deepEqual(decodeMask(encodeMask(empty)), empty)
  assert.deepEqual(decodeMask(encodeMask(full)), full)
  const corners = paintMask(empty, [0, 7, 56, 63], true)
  assert.equal(encodeMask(corners), "v1.8100000000000081")
})
test("mask links round-trip all individual bits and varied edited masks", async () => {
  const { encodeMask, decodeMask } = await import("../lib/pixel-mask-link.ts")
  for (let bit = 0; bit < 64; bit++) {
    const mask = paintMask(blankMask(), [bit], true)
    assert.deepEqual(decodeMask(encodeMask(mask)), mask)
  }
  for (let seed = 0; seed < 128; seed++) {
    const mask = Array.from({ length: 8 }, (_, y) => Array.from({ length: 8 }, (_, x) => (x * 17 + y * 31 + seed) % 7 < 3 ? "#" : ".").join(""))
    assert.deepEqual(decodeMask(encodeMask(mask)), mask)
  }
})
test("codec rejects unsupported, ambiguous, oversized or noncanonical payloads", async () => {
  const { encodeMask, decodeMask } = await import("../lib/pixel-mask-link.ts")
  for (const value of [null, undefined, 0, {}, "", "v2.0000000000000000", "v1.FFFFFFFFFFFFFFFF", "v1.000000000000000", "v1.00000000000000000", "v1.000000000000000g", " v1.0000000000000000", "v1.0000000000000000\n", "0".repeat(100000)]) assert.throws(() => decodeMask(value), /Invalid mask link/)
  for (const value of [[], ["#"], Array(8).fill("xxxxxxxx"), Array(9).fill("........"), Array(8).fill(null)]) assert.throws(() => encodeMask(value), /Invalid mask link/)
})
test("query parsing is bounded and rejects duplicate/empty mask parameters", async () => {
  const { readMaskSearch, MAX_MASK_QUERY, encodeMask } = await import("../lib/pixel-mask-link.ts")
  const token = encodeMask(starterMask())
  assert.deepEqual(readMaskSearch("?campaign=unrelated"), { kind: "none" })
  assert.deepEqual(readMaskSearch(`?campaign=private&mask=${token}&other=private`), { kind: "valid", mask: starterMask(), ink: null })
  for (const query of ["?mask=", "?mask", `?mask=${token}&mask=${token}`, "?mask=%FF", "?mask=v2.0000000000000000", "?mask=" + "0".repeat(MAX_MASK_QUERY)]) assert.deepEqual(readMaskSearch(query), { kind: "invalid" })
})
test("canonical sharing exposes only the mask and never a caller URL", async () => {
  const { maskShareUrl, readMaskSearch } = await import("../lib/pixel-mask-link.ts")
  const link = maskShareUrl(starterMask())
  const url = new URL(link)
  assert.equal(url.origin, "https://ui.wlkr.si")
  assert.equal(url.pathname, "/pixels")
  assert.deepEqual([...url.searchParams.keys()], ["mask"])
  assert.equal(url.hash, "#pixels")
  assert.ok(link.length < 80)
  assert.deepEqual(readMaskSearch(url.search), { kind: "valid", mask: starterMask(), ink: null })
})
test("recipient initialization contains only the shared mask with clean undo", () => {
  const mask = paintMask(blankMask(), [0, 9, 63], true)
  const initial = initialMaskState(mask)
  assert.deepEqual(initial.mask, mask)
  assert.deepEqual(initial.past, [])
  assert.deepEqual(initial.future, [])
  assert.equal(maskReducer(initial, { type: "undo" }), initial)
  const edited = maskReducer(initial, { type: "paint", cells: [1], filled: true })
  assert.deepEqual(maskReducer(edited, { type: "undo" }).mask, mask)
})

test("centred resize preserves pixels and crop undo restores off-canvas artwork and ink", async () => {
  const { resizeMask } = await import("../lib/pixel-mask.ts")
  const corners = paintMask(blankMask(), [0, 7, 56, 63], true)
  const enlarged = resizeMask(corners, 16)
  assert.equal(enlarged[4][4], "#"); assert.equal(enlarged[11][11], "#")
  assert.deepEqual(resizeMask(enlarged, 8), corners)
  let state = initialMaskState(paintMask(blankMask(32), [0, 1023, 16 * 32 + 16], true), "#ff3366")
  const original = state.mask
  state = maskReducer(state, { type: "resize", size: 8 })
  assert.equal(state.mask.join("").split("#").length - 1, 1)
  assert.equal(state.mask[4][4], "#")
  state = maskReducer(state, { type: "ink", ink: "#FFFFFF" })
  assert.equal(state.ink, "#ffffff")
  state = maskReducer(state, { type: "undo" })
  assert.equal(state.ink, "#ff3366")
  state = maskReducer(state, { type: "undo" })
  assert.deepEqual(state.mask, original); assert.equal(state.ink, "#ff3366")
  state = maskReducer(state, { type: "redo" }); assert.equal(state.mask.length, 8)
  state = maskReducer(state, { type: "reset" }); assert.equal(state.mask.length, 8); assert.equal(state.ink, null)
  state = maskReducer(state, { type: "undo" }); assert.equal(state.ink, "#ff3366")
  assert.throws(() => resizeMask(corners, 1024), /Choose/)
})
test("large-grid navigation, connected strokes and pointer bounds cover 1024 cells", () => {
  assert.equal(moveMaskCell(0, "End", true, 32), 1023)
  assert.equal(moveMaskCell(1023, "ArrowDown", false, 32), 1023)
  assert.equal(moveMaskCell(1023, "Home", false, 32), 992)
  assert.equal(maskLine(0, 1023, 32).length, 32)
  assert.equal(cellAtPoint(829, 829, 830, 830, 32), 1023)
  assert.equal(cellAtPoint(830, 829, 830, 830, 32), null)
})
test("new artwork codec round-trips every size and explicit ink, retaining legacy v1", async () => {
  const { encodeArtwork, decodeArtwork, encodeMask, maskShareUrl } = await import("../lib/pixel-mask-link.ts")
  assert.equal(encodeArtwork(starterMask(), null), encodeMask(starterMask()))
  assert.deepEqual(decodeArtwork(encodeMask(starterMask())), { mask: starterMask(), ink: null })
  for (const size of [8, 16, 32]) for (const ink of [null, "#ff3366", "#ffffff"]) for (const full of [false, true]) {
    const mask = Array(size).fill((full ? "#" : ".").repeat(size))
    const token = encodeArtwork(mask, ink)
    assert.ok(token.length <= 269)
    assert.deepEqual(decodeArtwork(token), { mask, ink })
    assert.deepEqual([...new URL(maskShareUrl(mask, ink)).searchParams.keys()], ["mask"])
  }
})
test("new codec rejects malformed sizes, colours, payload lengths and oversized input", async () => {
  const { decodeArtwork, encodeArtwork } = await import("../lib/pixel-mask-link.ts")
  for (const value of ["v2.64.ff3366." + "0".repeat(16), "v2.08.ff3366." + "0".repeat(16), "v2.8.t." + "0".repeat(16), "v2.16.FF3366." + "0".repeat(64), "v2.16.red." + "0".repeat(64), "v2.32.ff3366." + "0".repeat(255), "v2.32.ff3366." + "0".repeat(257), "v2.32.ff3366." + "g".repeat(256), "v2.32.ff3366." + "0".repeat(100000), null]) assert.throws(() => decodeArtwork(value), /Invalid mask link/)
  for (const ink of ["red", "#fff", "#FF3366", "#000000;display:none", "0".repeat(100000)]) assert.throws(() => encodeArtwork(blankMask(32), ink), /Invalid mask link/)
})
test("actual generated React examples type-check against unchanged PixelObject props", async () => {
  const { mkdir, mkdtemp, writeFile, rm } = await import("node:fs/promises")
  const { resolve } = await import("node:path")
  await mkdir(".task", { recursive: true })
  const directory = await mkdtemp(".task/typed-mask-")
  try {
    const files = []
    for (const size of [8, 16, 32]) {
      const path = resolve(directory, `mask-${size}.tsx`)
      await writeFile(path, maskExample(paintMask(blankMask(size), [0, size * size - 1], true), size === 8 ? null : "#ff3366"))
      files.push(path)
    }
    const program = ts.createProgram(files, { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, jsx: ts.JsxEmit.ReactJSX, strict: true, skipLibCheck: true, noEmit: true, baseUrl: process.cwd(), paths: { "@/components/wlkr/pixel-object": ["registry/wlkr/pixel-object.tsx"], "@/*": ["./*"] }, esModuleInterop: true })
    const errors = ts.getPreEmitDiagnostics(program).filter(diagnostic => diagnostic.category === ts.DiagnosticCategory.Error)
    assert.deepEqual(errors.map(diagnostic => ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")), [])
  } finally { await rm(directory, { recursive: true, force: true }) }
})
