export const MASK_SIZE = 8
export const MASK_SIZES = [8, 16, 32] as const
export const HISTORY_LIMIT = 32
const starter = ["........", "...##...", "..####..", ".######.", ".######.", "..####..", "...##...", "........"]
export type MaskArtwork = { mask: string[]; ink: string | null }
export type MaskState = MaskArtwork & { past: MaskArtwork[]; future: MaskArtwork[]; stroke: MaskArtwork | null }
export type MaskAction = { type: "begin" } | { type: "end" } | { type: "undo" } | { type: "redo" } | { type: "reset" } | { type: "resize"; size: number } | { type: "ink"; ink: string | null } | { type: "paint"; cells: number[]; filled: boolean } | { type: "replace"; mask: string[] }
const validSize = (size: number) => MASK_SIZES.some(value => value === size)
function checkSize(size: number) { if (!validSize(size)) throw new Error("Choose an 8×8, 16×16 or 32×32 mask."); return size }
export const blankMask = (size = MASK_SIZE) => Array.from({ length: checkSize(size) }, () => ".".repeat(size))
export const starterMask = () => [...starter]
export function normalizeInk(ink: string | null) {
  if (ink === null) return null
  if (typeof ink !== "string" || !/^#[0-9a-f]{6}$/i.test(ink)) throw new Error("Use a six-digit hex colour, such as #33f282.")
  return ink.toLowerCase()
}
function validMask(mask: string[]) {
  if (!Array.isArray(mask) || !validSize(mask.length) || mask.some(row => typeof row !== "string" || row.length !== mask.length || !/^[.#]+$/.test(row))) throw new Error("Mask must be an 8×8, 16×16 or 32×32 grid of dots and hashes.")
  return mask
}
export const initialMaskState = (mask = starterMask(), ink: string | null = null): MaskState => ({ mask: [...validMask(mask)], ink: normalizeInk(ink), past: [], future: [], stroke: null })
const snapshot = (state: MaskArtwork): MaskArtwork => ({ mask: state.mask, ink: state.ink })
const equal = (a: MaskArtwork, b: MaskArtwork) => a.ink === b.ink && a.mask.length === b.mask.length && a.mask.every((row, i) => row === b.mask[i])
const validCell = (cell: number, size: number) => Number.isInteger(cell) && cell >= 0 && cell < size * size
export function paintMask(mask: string[], cells: number[], filled: boolean) {
  validMask(mask)
  const size = mask.length, next = [...mask]
  for (const cell of cells.slice(0, 1024).filter(cell => validCell(cell, size))) {
    const row = Math.floor(cell / size), column = cell % size
    next[row] = next[row].slice(0, column) + (filled ? "#" : ".") + next[row].slice(column + 1)
  }
  return mask.every((row, i) => row === next[i]) ? mask : next
}
export function resizeMask(mask: string[], size: number) {
  validMask(mask); checkSize(size)
  if (mask.length === size) return mask
  const offset = (size - mask.length) / 2
  return Array.from({ length: size }, (_, y) => Array.from({ length: size }, (_, x) => mask[y - offset]?.[x - offset] ?? ".").join(""))
}
function finish(state: MaskState): MaskState {
  if (!state.stroke) return state
  const changed = !equal(state.stroke, state)
  return { ...state, past: changed ? [...state.past, state.stroke].slice(-HISTORY_LIMIT) : state.past, future: changed ? [] : state.future, stroke: null }
}
export function maskReducer(state: MaskState, action: MaskAction): MaskState {
  if (action.type === "begin") { const next = finish(state); return { ...next, stroke: snapshot(next) } }
  if (action.type === "end") return finish(state)
  if (action.type === "paint") {
    const mask = paintMask(state.mask, action.cells, action.filled)
    if (mask === state.mask) return state
    return { ...state, mask, past: state.stroke ? state.past : [...state.past, snapshot(state)].slice(-HISTORY_LIMIT), future: state.stroke ? state.future : [] }
  }
  const next = finish(state)
  if (action.type === "undo") return next.past.length ? { ...next.past[next.past.length - 1], past: next.past.slice(0, -1), future: [snapshot(next), ...next.future].slice(0, HISTORY_LIMIT), stroke: null } : next
  if (action.type === "redo") return next.future.length ? { ...next.future[0], past: [...next.past, snapshot(next)].slice(-HISTORY_LIMIT), future: next.future.slice(1), stroke: null } : next
  const target = action.type === "reset" ? { mask: starterMask(), ink: null }
    : action.type === "resize" ? { mask: resizeMask(next.mask, action.size), ink: next.ink }
    : action.type === "ink" ? { mask: next.mask, ink: normalizeInk(action.ink) }
    : { mask: [...validMask(action.mask)], ink: next.ink }
  return equal(target, next) ? next : { ...target, past: [...next.past, snapshot(next)].slice(-HISTORY_LIMIT), future: [], stroke: null }
}
export function maskLine(from: number, to: number, size = MASK_SIZE) {
  checkSize(size)
  if (!validCell(from, size) || !validCell(to, size)) return []
  let x = from % size, y = Math.floor(from / size)
  const targetX = to % size, targetY = Math.floor(to / size)
  const dx = Math.abs(targetX - x), sx = x < targetX ? 1 : -1, dy = -Math.abs(targetY - y), sy = y < targetY ? 1 : -1
  let error = dx + dy
  const cells = []
  for (;;) {
    cells.push(y * size + x)
    if (x === targetX && y === targetY) return cells
    const doubled = 2 * error
    if (doubled >= dy) { error += dy; x += sx }
    if (doubled <= dx) { error += dx; y += sy }
  }
}
export function cellAtPoint(x: number, y: number, width: number, height: number, size = MASK_SIZE) {
  checkSize(size)
  return width > 0 && height > 0 && x >= 0 && y >= 0 && x < width && y < height ? Math.floor(y / height * size) * size + Math.floor(x / width * size) : null
}
export function moveMaskCell(cell: number, key: string, wholeGrid = false, size = MASK_SIZE) {
  checkSize(size)
  if (!validCell(cell, size)) return 0
  const row = Math.floor(cell / size), column = cell % size
  if (key === "ArrowLeft") return row * size + Math.max(0, column - 1)
  if (key === "ArrowRight") return row * size + Math.min(size - 1, column + 1)
  if (key === "ArrowUp") return Math.max(0, row - 1) * size + column
  if (key === "ArrowDown") return Math.min(size - 1, row + 1) * size + column
  if (key === "Home") return wholeGrid ? 0 : row * size
  if (key === "End") return wholeGrid ? size * size - 1 : row * size + size - 1
  return cell
}
/** Preserve legacy geometry; larger grids need enough projection cells to avoid merging pixels. */
export function maskResolution(size: number) { checkSize(size); return size === 8 ? 8 : Math.ceil((size - 1) / .86 + 1) }
export function inkBackdrop(ink: string | null) {
  if (ink === null) return undefined
  const hex = normalizeInk(ink)!.slice(1)
  const linear = [0, 2, 4].map(start => { const c = parseInt(hex.slice(start, start + 2), 16) / 255; return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4 })
  return linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722 > .179 ? "#010101" : "#ffffff"
}
export function maskExample(mask: string[], ink: string | null = null) {
  validMask(mask); ink = normalizeInk(ink)
  const object = `<PixelObject\n  label="Custom pixel mask"\n  mask={[\n${mask.map(row => `    ${JSON.stringify(row)}`).join(",\n")}\n  ]}\n  resolution={${maskResolution(mask.length)}}\n  dotShape="square"\n  rotating={false}\n/>`
  return `import { PixelObject } from "@/components/wlkr/pixel-object"\n\n` + (ink ? `<div style={{ color: ${JSON.stringify(ink)}, backgroundColor: ${JSON.stringify(inkBackdrop(ink))}, width: 260 }}>\n${object.split("\n").map(line => "  " + line).join("\n")}\n</div>` : object)
}
