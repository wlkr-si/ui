export const MAX_MASK_QUERY = 2048
export const MAX_ARTWORK_TOKEN = 269
const invalid = () => new Error("Invalid mask link. Draw a new mask or use a valid share link.")
/** v1 remains byte-for-byte compatible: 8×8, theme-relative ink. */
export function encodeMask(mask: string[]) {
  if (!Array.isArray(mask) || mask.length !== 8 || mask.some(row => typeof row !== "string" || !/^[.#]{8}$/.test(row))) throw invalid()
  return "v1." + mask.map(row => [...row].reduce((byte, cell) => (byte << 1) | Number(cell === "#"), 0).toString(16).padStart(2, "0")).join("")
}
export function decodeMask(token: unknown) {
  if (typeof token !== "string" || token.length !== 19 || !/^v1\.[0-9a-f]{16}$/.test(token)) throw invalid()
  return Array.from({ length: 8 }, (_, row) => {
    const byte = parseInt(token.slice(3 + row * 2, 5 + row * 2), 16)
    return Array.from({ length: 8 }, (_, column) => byte & (1 << (7 - column)) ? "#" : ".").join("")
  })
}
export function encodeArtwork(mask: string[], ink: string | null = null) {
  if (!Array.isArray(mask) || ![8, 16, 32].includes(mask.length) || mask.some(row => typeof row !== "string" || row.length !== mask.length || !/^[.#]+$/.test(row)) || ink !== null && (typeof ink !== "string" || !/^#[0-9a-f]{6}$/.test(ink))) throw invalid()
  if (mask.length === 8 && ink === null) return encodeMask(mask)
  const bits = mask.join("")
  let hex = ""
  for (let start = 0; start < bits.length; start += 4) hex += parseInt(bits.slice(start, start + 4).replaceAll(".", "0").replaceAll("#", "1"), 2).toString(16)
  return `v2.${mask.length}.${ink === null ? "t" : ink.slice(1)}.${hex}`
}
export function decodeArtwork(token: unknown) {
  if (typeof token !== "string" || token.length > MAX_ARTWORK_TOKEN) throw invalid()
  if (token.startsWith("v1.")) return { mask: decodeMask(token), ink: null }
  const match = /^v2\.(8|16|32)\.(t|[0-9a-f]{6})\.([0-9a-f]+)$/.exec(token)
  if (!match) throw invalid()
  const size = Number(match[1]), payload = match[3]
  if (size === 8 && match[2] === "t") throw invalid()
  if (payload.length !== size * size / 4) throw invalid()
  const bits = [...payload].map(hex => parseInt(hex, 16).toString(2).padStart(4, "0").replaceAll("0", ".").replaceAll("1", "#")).join("")
  return { mask: Array.from({ length: size }, (_, row) => bits.slice(row * size, (row + 1) * size)), ink: match[2] === "t" ? null : `#${match[2]}` }
}
export type MaskLink = { kind: "none" } | { kind: "invalid" } | { kind: "valid"; mask: string[]; ink: string | null }
export function readMaskSearch(search: string): MaskLink {
  if (typeof search !== "string" || search.length > MAX_MASK_QUERY) return { kind: "invalid" }
  const values = new URLSearchParams(search).getAll("mask")
  if (!values.length) return { kind: "none" }
  if (values.length !== 1) return { kind: "invalid" }
  try { return { kind: "valid", ...decodeArtwork(values[0]) } }
  catch { return { kind: "invalid" } }
}
export function maskShareUrl(mask: string[], ink: string | null = null) {
  return `https://ui.wlkr.si/?mask=${encodeArtwork(mask, ink)}#pixel-object`
}
