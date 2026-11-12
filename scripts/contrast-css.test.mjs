import test from "node:test"
import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import ts from "typescript"
import { contrastCss } from "../lib/contrast-css.ts"
import { readContrastPair } from "../lib/contrast-link.ts"
import { contrastRatio, parseOpaqueHex } from "../lib/contrast.ts"

test("CSS serializes only the selected pair with exact normalized variables and no adjustment", () => {
  const pair = { background: "#fFfFff", text: "#777777" }
  const original = { ...pair }
  assert.equal(contrastCss(pair), ":root {\n  --foreground: #777777;\n  --background: #FFFFFF;\n}")
  assert.deepEqual(pair, original)
  assert.ok(contrastRatio(parseOpaqueHex(pair.text), parseOpaqueHex(pair.background)) < 4.5)
  assert.equal(contrastCss({background:"#FFFFFF",text:"#FFFFFF"}), ":root {\n  --foreground: #FFFFFF;\n  --background: #FFFFFF;\n}")
})

test("strict CSS guards reject malformed, alpha, coercible and injected values", () => {
  for (const value of ["#fff", "#12345678", "red", "123456", " #123456", "#123456\n", "#123456; color:red", "#123456}body{display:none}", "url(https://invalid.test)", "</code><script>", null, 123456, Symbol("colour"), new String("#123456")]) {
    for (const key of ["text", "background"]) assert.throws(() => contrastCss({background:"#FFFFFF",text:"#010101",[key]:value}), /opaque six-digit/)
  }
  for (const value of [null, [], {}, {text:"#010101"}, {text:"#010101",background:"#FFFFFF",extra:"ignored"}]) assert.throws(() => contrastCss(value), /opaque six-digit/)
  let coerced = false
  assert.throws(() => contrastCss({ background:"#FFFFFF", text:{toString(){coerced=true;return "#010101"}} }), /opaque six-digit/)
  assert.equal(coerced, false)
})

test("pair changes create distinct copy identities while canonical-equivalent pairs remain stable", () => {
  const values = ["#000000", "#010101", "#777777", "#FFFFFF", "#ABCDEF", "#33F282", "#2563EB"]
  const identities = new Set()
  for (const background of values) for (const text of values) {
    const css = contrastCss({background,text})
    const match = /^:root \{\n  --foreground: (#[0-9A-F]{6});\n  --background: (#[0-9A-F]{6});\n\}$/.exec(css)
    assert.ok(match); assert.equal(match[1], text); assert.equal(match[2], background)
    assert.equal(contrastCss({background:background.toLowerCase(),text:text.toLowerCase()}), css)
    identities.add(css)
  }
  assert.equal(identities.size, values.length ** 2)
  const fallback = readContrastPair("?bg=red&fg=%23abc%3B%7D")
  assert.equal(contrastCss(fallback), contrastCss({background:"#FFFFFF",text:"#010101"}))
})

test("Contrast mounts the stock copy control keyed by its exact derived CSS inside the disclosure", async () => {
  const source = await readFile(new URL("../components/contrast-tool.tsx", import.meta.url), "utf8")
  const tree = ts.createSourceFile("contrast-tool.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const copies = [], declarations = []
  function visit(node) {
    if (ts.isJsxSelfClosingElement(node) && node.tagName.getText(tree) === "CopyCommand") copies.push(node)
    if (ts.isVariableDeclaration(node) && node.name.getText(tree) === "css") declarations.push(node)
    ts.forEachChild(node, visit)
  }
  visit(tree)
  assert.equal(tree.parseDiagnostics.length, 0)
  assert.equal(copies.length, 1); assert.equal(declarations.length, 1)
  assert.equal(declarations[0].initializer.getText(tree), "contrastCss(pair)")
  const attrs = Object.fromEntries(copies[0].attributes.properties.map(attr => [attr.name.getText(tree), attr.initializer.expression.getText(tree)]))
  assert.equal(attrs.command, "css")
  assert.equal(attrs.key, attrs.command, "pair updates must unmount pending copy state for the old output")
  assert.ok(ts.isJsxElement(copies[0].parent))
  assert.equal(copies[0].parent.openingElement.tagName.getText(tree), "Disclosure")
  assert.match(source, /import \{ CopyCommand \} from "@\/registry\/wlkr\/copy-command"/)
})
