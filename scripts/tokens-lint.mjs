// Fails the build when a component marked `system: true` styles itself with anything but WLKR tokens.
// Rules and the reasoning behind them: docs/design-system.md.
import { readFile, readdir } from "node:fs/promises"
import { pathToFileURL } from "node:url"

const THEME = "https://ui.wlkr.si/r/theme.json"
const slugs = (await readdir("registry/meta")).filter(file => file.endsWith(".ts")).map(file => file.slice(0, -3))
const problems = []
let checked = 0

for (const slug of slugs) {
  const { meta } = await import(pathToFileURL(`registry/meta/${slug}.ts`).href)
  if (!meta.system) continue
  checked++
  const file = `registry/wlkr/${slug}.tsx`
  const source = await readFile(file, "utf8")
  const report = (line, message) => problems.push(`${file}:${line}  ${message}`)
  if (!meta.registryDependencies?.includes(THEME)) report(1, `meta must list ${THEME} in registryDependencies, so the tokens install with it.`)
  if (!meta.examples?.length) report(1, "meta needs examples: one section per variant, size or state.")

  const start = source.indexOf("const styles = `")
  if (start < 0) { report(1, "expected the component's CSS in `const styles = \\`...\\``."); continue }
  const end = source.indexOf("`", start + 16)
  const firstLine = source.slice(0, start).split("\n").length
  const css = source.slice(start + 16, end).replace(/\/\*[\s\S]*?\*\//g, match => match.replace(/[^\n]/g, " "))
  const own = new RegExp(`^--wlkr-${slug}-[a-z0-9-]+$`)

  css.split("\n").forEach((text, index) => {
    const line = firstLine + index
    // Split declarations; a component's own knobs (--wlkr-<slug>-*) may hold literal values for effects unique to it.
    for (const declaration of text.split(/[;{}]/)) {
      const colon = declaration.indexOf(":")
      const property = colon > 0 ? declaration.slice(0, colon).trim() : ""
      const value = colon > 0 ? declaration.slice(colon + 1) : ""
      // Selector fragments like ".x:hover" also contain a colon; only real property names pass.
      if (!value.trim() || !/^(--)?[a-z-][a-z0-9-]*$/i.test(property)) continue
      const ownKnob = own.test(property)
      const say = message => report(line, `${property}: ${message}`)
      if (/#[0-9a-f]{3,8}\b/i.test(value)) say("raw hex colour; use a semantic colour token.")
      if (/\b(rgba?|hsla?|oklch|oklab)\(/i.test(value)) say("raw colour function; use a semantic colour token.")
      if (/var\(--(?!wlkr-)/.test(value)) say("non-WLKR variable; use --wlkr-* tokens (shadcn names are aliases for other code, not for components).")
      if (/var\(--wlkr-(gray|green|red|amber)-\d/.test(value)) say("primitive colour; use the semantic role instead.")
      if (/var\(--wlkr-[a-z0-9-]+\s*,/.test(value)) say("token fallback; tokens always install with the component.")
      if (ownKnob) continue
      if (/cubic-bezier\(/.test(value)) say("raw easing; use --wlkr-ease-*.")
      if (/(^|[\s(,])-?\d*\.?\d+m?s\b/.test(value)) say("raw duration; use --wlkr-duration-* or a component knob.")
      for (const match of value.matchAll(/(^|[\s(,])(-?\d*\.?\d+)px\b/g)) {
        if (Math.abs(Number(match[2])) > 2) say(`raw ${match[2]}px; use a space, control, radius or type token.`)
      }
      if (/^font-size$/.test(property) && !/var\(--wlkr-/.test(value) && !/inherit/.test(value)) say("font size must come from --wlkr-text-* or --wlkr-control-text-*.")
    }
  })
}

if (problems.length) {
  console.error(`Token lint: ${problems.length} problem${problems.length === 1 ? "" : "s"} in system components.\n\n${problems.join("\n")}\n\nSee docs/design-system.md.`)
  process.exit(1)
}
console.log(`Token lint: ${checked} system component${checked === 1 ? "" : "s"} use only WLKR tokens.`)
