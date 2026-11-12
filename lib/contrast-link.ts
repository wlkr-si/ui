
export const DEFAULT_BACKGROUND = "#FFFFFF"
export const DEFAULT_TEXT = "#010101"

export type ContrastPair = { background: string; text: string }

export function readContrastPair(search: string): ContrastPair {
  if (search.length > 128) return { background: DEFAULT_BACKGROUND, text: DEFAULT_TEXT }
  const params = new URLSearchParams(search)
  const background = params.getAll("bg")
  const text = params.getAll("fg")
  return {
    background: background.length === 1 && /^#[0-9a-f]{6}$/i.test(background[0]) ? background[0].toUpperCase() : DEFAULT_BACKGROUND,
    text: text.length === 1 && /^#[0-9a-f]{6}$/i.test(text[0]) ? text[0].toUpperCase() : DEFAULT_TEXT,
  }
}

export function contrastSharePath(pair: ContrastPair): string {
  const params = new URLSearchParams()
  if (pair.background !== DEFAULT_BACKGROUND) params.set("bg", pair.background.toLowerCase())
  if (pair.text !== DEFAULT_TEXT) params.set("fg", pair.text.toLowerCase())
  const query = params.toString()
  return `/contrast${query ? `?${query}` : ""}`
}

export function canonicalContrastShareUrl(pair: ContrastPair): string {
  return `https://ui.wlkr.si${contrastSharePath(pair)}`
}
