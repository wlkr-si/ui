import type { ContrastPair } from "./contrast-link"

/** Serialize only the selected opaque pair. No contrast adjustment or CSS interpolation. */
export function contrastCss(pair: ContrastPair): string {
  if (!pair || typeof pair !== "object" || Array.isArray(pair) || Object.keys(pair).length !== 2 || !Object.hasOwn(pair, "text") || !Object.hasOwn(pair, "background") || typeof pair.text !== "string" || typeof pair.background !== "string" || !/^#[0-9a-f]{6}$/i.test(pair.text) || !/^#[0-9a-f]{6}$/i.test(pair.background)) throw new Error("Use an opaque six-digit colour pair.")
  return ":root {\n  --foreground: " + pair.text.toUpperCase() + ";\n  --background: " + pair.background.toUpperCase() + ";\n}"
}
