export const MASK_SIZE = 8
export const HISTORY_LIMIT = 32
const starter = ["........", "...##...", "..####..", ".######.", ".######.", "..####..", "...##...", "........"]
export type MaskState = { mask: string[]; past: string[][]; future: string[][]; stroke: string[] | null }
export type MaskAction = { type: "begin" } | { type: "end" } | { type: "undo" } | { type: "redo" } | { type: "paint"; cells: number[]; filled: boolean } | { type: "replace"; mask: string[] }
export const blankMask = () => Array.from({ length: MASK_SIZE }, () => ".".repeat(MASK_SIZE))
export const starterMask = () => [...starter]
export const initialMaskState = (): MaskState => ({ mask: starterMask(), past: [], future: [], stroke: null })
const equal = (a: string[], b: string[]) => a.every((row, i) => row === b[i])
const validCell = (cell: number) => Number.isInteger(cell) && cell >= 0 && cell < MASK_SIZE * MASK_SIZE
function validMask(mask: string[]) {
  if (mask.length !== MASK_SIZE || mask.some(row => !/^[.#]{8}$/.test(row))) throw new Error("Mask must be an 8×8 grid of dots and hashes.")
  return mask
}
export function paintMask(mask: string[], cells: number[], filled: boolean) {
  validMask(mask)
  const next = [...mask]
  for (const cell of cells.filter(validCell)) {
    const row = Math.floor(cell / MASK_SIZE), column = cell % MASK_SIZE
    next[row] = next[row].slice(0, column) + (filled ? "#" : ".") + next[row].slice(column + 1)
  }
  return equal(mask, next) ? mask : next
}
function finish(state: MaskState): MaskState {
  if (!state.stroke) return state
  return { ...state, past: equal(state.stroke, state.mask) ? state.past : [...state.past, state.stroke].slice(-HISTORY_LIMIT), future: equal(state.stroke, state.mask) ? state.future : [], stroke: null }
}
export function maskReducer(state: MaskState, action: MaskAction): MaskState {
  if (action.type === "begin") { const next = finish(state); return { ...next, stroke: next.mask } }
  if (action.type === "end") return finish(state)
  if (action.type === "paint") {
    const mask = paintMask(state.mask, action.cells, action.filled)
    if (mask === state.mask) return state
    return { ...state, mask, past: state.stroke ? state.past : [...state.past, state.mask].slice(-HISTORY_LIMIT), future: state.stroke ? state.future : [] }
  }
  const next = finish(state)
  if (action.type === "undo") return next.past.length ? { mask: next.past[next.past.length - 1], past: next.past.slice(0, -1), future: [next.mask, ...next.future].slice(0, HISTORY_LIMIT), stroke: null } : next
  if (action.type === "redo") return next.future.length ? { mask: next.future[0], past: [...next.past, next.mask].slice(-HISTORY_LIMIT), future: next.future.slice(1), stroke: null } : next
  const mask = [...validMask(action.mask)]
  return equal(mask, next.mask) ? next : { mask, past: [...next.past, next.mask].slice(-HISTORY_LIMIT), future: [], stroke: null }
}
/** Fill skipped cells during fast pointer movement, bounded to the editor grid. */
export function maskLine(from: number, to: number) {
  if (!validCell(from) || !validCell(to)) return []
  let x = from % MASK_SIZE, y = Math.floor(from / MASK_SIZE)
  const targetX = to % MASK_SIZE, targetY = Math.floor(to / MASK_SIZE)
  const dx = Math.abs(targetX - x), sx = x < targetX ? 1 : -1
  const dy = -Math.abs(targetY - y), sy = y < targetY ? 1 : -1
  let error = dx + dy
  const cells = []
  for (;;) {
    cells.push(y * MASK_SIZE + x)
    if (x === targetX && y === targetY) return cells
    const doubled = 2 * error
    if (doubled >= dy) { error += dy; x += sx }
    if (doubled <= dx) { error += dx; y += sy }
  }
}
export function cellAtPoint(x: number, y: number, width: number, height: number) {
  return width > 0 && height > 0 && x >= 0 && y >= 0 && x < width && y < height ? Math.floor(y / height * MASK_SIZE) * MASK_SIZE + Math.floor(x / width * MASK_SIZE) : null
}
export function moveMaskCell(cell: number, key: string, wholeGrid = false) {
  if (!validCell(cell)) return 0
  const row = Math.floor(cell / MASK_SIZE), column = cell % MASK_SIZE
  if (key === "ArrowLeft") return row * MASK_SIZE + Math.max(0, column - 1)
  if (key === "ArrowRight") return row * MASK_SIZE + Math.min(MASK_SIZE - 1, column + 1)
  if (key === "ArrowUp") return Math.max(0, row - 1) * MASK_SIZE + column
  if (key === "ArrowDown") return Math.min(MASK_SIZE - 1, row + 1) * MASK_SIZE + column
  if (key === "Home") return wholeGrid ? 0 : row * MASK_SIZE
  if (key === "End") return wholeGrid ? MASK_SIZE * MASK_SIZE - 1 : row * MASK_SIZE + MASK_SIZE - 1
  return cell
}
export function maskExample(mask: string[]) {
  validMask(mask)
  return `import { PixelObject } from "@/components/wlkr/pixel-object"\n\n<PixelObject\n  label="Custom pixel mask"\n  mask={[\n${mask.map(row => `    ${JSON.stringify(row)}`).join(",\n")}\n  ]}\n  resolution={8}\n  dotShape="square"\n  rotating={false}\n/>`
}
