import { MAX_GRID_BYTES, parseGrid } from "./pixel-grid-text.mjs"

/** User-selected Blob only; reject its declared size before any read and cap the read too. */
export async function readGridFile(file: Pick<Blob, "size" | "slice">) {
  if (!Number.isSafeInteger(file.size) || file.size < 0 || file.size > MAX_GRID_BYTES) throw new Error("Invalid grid file")
  const bytes = await file.slice(0, MAX_GRID_BYTES + 1).arrayBuffer()
  if (bytes.byteLength > MAX_GRID_BYTES) throw new Error("Invalid grid file")
  return parseGrid(new TextDecoder("utf-8", { fatal: true }).decode(bytes))
}

/** New selections, editor intents and unmount invalidate any outstanding read. */
export function createGridImportSession() {
  let revision = 0
  return {
    invalidate() { revision++ },
    async open(file: Pick<Blob, "size" | "slice"> | undefined, apply: (mask: string[]) => void) {
      const request = ++revision
      if (!file) return "cancelled" as const
      try {
        const mask = await readGridFile(file)
        if (request !== revision) return "stale" as const
        apply(mask)
        return "opened" as const
      } catch {
        return request === revision ? "invalid" as const : "stale" as const
      }
    },
  }
}
