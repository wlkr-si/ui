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
