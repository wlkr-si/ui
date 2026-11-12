export const MAX_MASK_QUERY = 2048
const invalid = () => new Error("Invalid mask link. Draw a new mask or use a valid share link.")
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
export type MaskLink = { kind: "none" } | { kind: "invalid" } | { kind: "valid"; mask: string[] }
export function readMaskSearch(search: string): MaskLink {
  if (typeof search !== "string" || search.length > MAX_MASK_QUERY) return { kind: "invalid" }
  const values = new URLSearchParams(search).getAll("mask")
  if (!values.length) return { kind: "none" }
  if (values.length !== 1) return { kind: "invalid" }
  try { return { kind: "valid", mask: decodeMask(values[0]) } }
  catch { return { kind: "invalid" } }
}
export function maskShareUrl(mask: string[]) {
  // Build from the canonical origin, never from the recipient's URL/query data.
  return `https://ui.wlkr.si/?mask=${encodeMask(mask)}#pixel-object`
}
