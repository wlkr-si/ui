"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type Pixel = 0 | 1 | 2

export type PixelCanvasProps = Omit<React.ComponentPropsWithoutRef<"div">, "defaultValue" | "onChange"> & {
  /** Controlled pixels, row by row: 0 empty, 1 ink, 2 brand. Length cols * rows. */
  value?: number[]
  defaultValue?: number[]
  onValueChange?: (value: number[]) => void
  cols?: number
  rows?: number
  readOnly?: boolean
  "aria-label"?: string
}

/** Turns rows of text into pixels: "." empty, "#" ink, "+" brand. */
export function pixelsFromRows(rows: string[]): number[] {
  const out: number[] = []
  for (const row of rows) for (const ch of row) out.push(ch === "#" ? 1 : ch === "+" ? 2 : 0)
  return out
}

const INKS: { value: Pixel; name: string }[] = [
  { value: 1, name: "Ink" },
  { value: 2, name: "Green" },
  { value: 0, name: "Erase" },
]
const NAMES = ["empty", "ink", "green"]

const styles = `
.wlkr-pixel-canvas{display:inline-flex;flex-direction:column;gap:12px;width:min(100%,320px);color:var(--foreground,currentColor)}
.wlkr-pixel-canvas-grid{display:grid;gap:1px;width:100%;background:var(--border,currentColor);border:1px solid var(--border,currentColor);touch-action:none;user-select:none;-webkit-user-select:none}
.wlkr-pixel-canvas-cell{all:unset;box-sizing:border-box;display:block;width:100%;height:100%;aspect-ratio:1;background:var(--background,#fff);cursor:crosshair;transition:background-color 120ms steps(2,end)}
.wlkr-pixel-canvas-cell[data-v="1"]{background:var(--foreground,currentColor)}
.wlkr-pixel-canvas-cell[data-v="2"]{background:var(--brand,#33f282)}
.wlkr-pixel-canvas[data-readonly] .wlkr-pixel-canvas-cell{cursor:default}
.wlkr-pixel-canvas-cell:focus-visible{outline:2px solid var(--brand,#33f282);outline-offset:2px;position:relative;z-index:1}
.wlkr-pixel-canvas-bar{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
.wlkr-pixel-canvas-inks,.wlkr-pixel-canvas-actions{display:flex;gap:6px}
.wlkr-pixel-canvas-ink{all:unset;box-sizing:border-box;width:24px;height:24px;border:1px solid var(--border,currentColor);border-radius:0;cursor:pointer;display:grid;place-items:center}
.wlkr-pixel-canvas-ink::after{content:"";width:12px;height:12px;background:var(--wlkr-pixel-canvas-swatch)}
.wlkr-pixel-canvas-ink[data-v="1"]{--wlkr-pixel-canvas-swatch:var(--foreground,currentColor)}
.wlkr-pixel-canvas-ink[data-v="2"]{--wlkr-pixel-canvas-swatch:var(--brand,#33f282)}
.wlkr-pixel-canvas-ink[data-v="0"]{--wlkr-pixel-canvas-swatch:repeating-conic-gradient(var(--muted-foreground,#6b6b6b) 0 25%,transparent 0 50%) 0 0/4px 4px}
.wlkr-pixel-canvas-ink[aria-pressed=true]{border:2px solid var(--brand,#33f282)}
.wlkr-pixel-canvas-btn{all:unset;box-sizing:border-box;height:28px;padding:0 10px;border:1px solid var(--border,currentColor);border-radius:0;font-family:var(--font-mono,ui-monospace,monospace);font-size:12px;line-height:26px;cursor:pointer}
.wlkr-pixel-canvas-btn:hover{background:var(--foreground,currentColor);color:var(--background,#fff)}
.wlkr-pixel-canvas-ink:focus-visible,.wlkr-pixel-canvas-btn:focus-visible{outline:2px solid var(--brand,#33f282);outline-offset:2px}
@media(prefers-reduced-motion:reduce){.wlkr-pixel-canvas-cell{transition:none}}
`

/** A tiny pixel-art pad. Drag to paint; the first cell touched decides paint or erase. */
export function PixelCanvas({
  value,
  defaultValue,
  onValueChange,
  cols = 16,
  rows = 16,
  readOnly = false,
  "aria-label": ariaLabel = "Pixel canvas",
  className,
  ...props
}: PixelCanvasProps) {
  const id = React.useId()
  const size = Math.max(1, cols) * Math.max(1, rows)
  const [inner, setInner] = React.useState<number[]>(() => defaultValue ?? [])
  const raw = value ?? inner
  const pixels = React.useMemo(() => Array.from({ length: size }, (_, i) => (raw[i] === 1 || raw[i] === 2 ? raw[i] : 0)), [raw, size])
  const [ink, setInk] = React.useState<Pixel>(1)
  const [focus, setFocus] = React.useState(0)
  const gridRef = React.useRef<HTMLDivElement>(null)
  const strokeRef = React.useRef<{ paint: number; last: number; pixels: number[] } | null>(null)
  const focusIndex = Math.min(focus, size - 1)

  const commit = React.useCallback((next: number[]) => {
    if (value === undefined) setInner(next)
    onValueChange?.(next)
  }, [value, onValueChange])

  const paintFor = (current: number) => (ink === 0 || current === ink ? 0 : ink)

  const indexAt = (x: number, y: number) => {
    const el = document.elementFromPoint(x, y)
    const cell = el instanceof HTMLElement && gridRef.current?.contains(el) ? el.closest<HTMLElement>("[data-index]") : null
    return cell ? Number(cell.dataset.index) : -1
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (readOnly || e.button !== 0) return
    const i = indexAt(e.clientX, e.clientY)
    if (i < 0) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    const paint = paintFor(pixels[i])
    const next = pixels.slice()
    next[i] = paint
    strokeRef.current = { paint, last: i, pixels: next }
    setFocus(i)
    commit(next)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const stroke = strokeRef.current
    if (!stroke) return
    const i = indexAt(e.clientX, e.clientY)
    if (i < 0 || i === stroke.last) return
    stroke.last = i
    if (stroke.pixels[i] === stroke.paint) return
    const next = stroke.pixels.slice()
    next[i] = stroke.paint
    stroke.pixels = next
    commit(next)
  }

  const endStroke = () => { strokeRef.current = null }

  const moveFocus = (i: number) => {
    setFocus(i)
    gridRef.current?.querySelector<HTMLElement>(`[data-index="${i}"]`)?.focus()
  }

  const onCellKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
    const r = Math.floor(i / cols)
    const c = i % cols
    let n = -1
    if (e.key === "ArrowRight") n = c < cols - 1 ? i + 1 : i
    else if (e.key === "ArrowLeft") n = c > 0 ? i - 1 : i
    else if (e.key === "ArrowDown") n = r < rows - 1 ? i + cols : i
    else if (e.key === "ArrowUp") n = r > 0 ? i - cols : i
    else if (e.key === "Home") n = r * cols
    else if (e.key === "End") n = r * cols + cols - 1
    if (n < 0) return
    e.preventDefault()
    moveFocus(n)
  }

  const onCellClick = (e: React.MouseEvent<HTMLButtonElement>, i: number) => {
    if (readOnly || e.detail !== 0) return // pointer strokes are handled on the grid
    const next = pixels.slice()
    next[i] = paintFor(pixels[i])
    commit(next)
  }

  return (
    <div {...props} className={cn("wlkr-pixel-canvas", className)} data-readonly={readOnly ? "" : undefined}>
      <style>{styles}</style>
      <div
        ref={gridRef}
        role="group"
        aria-label={ariaLabel}
        aria-describedby={readOnly ? undefined : `${id}-ink`}
        className="wlkr-pixel-canvas-grid"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endStroke}
        onPointerCancel={endStroke}
        onLostPointerCapture={endStroke}
      >
        {pixels.map((v, i) => (
          <button
            key={i}
            type="button"
            className="wlkr-pixel-canvas-cell"
            data-index={i}
            data-v={v}
            tabIndex={i === focusIndex ? 0 : -1}
            aria-label={`Row ${Math.floor(i / cols) + 1}, column ${(i % cols) + 1}, ${NAMES[v]}`}
            aria-disabled={readOnly || undefined}
            onFocus={() => setFocus(i)}
            onKeyDown={e => onCellKeyDown(e, i)}
            onClick={e => onCellClick(e, i)}
          />
        ))}
      </div>
      {!readOnly && (
        <div className="wlkr-pixel-canvas-bar">
          <div className="wlkr-pixel-canvas-inks" role="group" aria-label="Ink">
            {INKS.map(option => (
              <button
                key={option.value}
                type="button"
                className="wlkr-pixel-canvas-ink"
                data-v={option.value}
                aria-pressed={ink === option.value}
                aria-label={option.name}
                title={option.name}
                onClick={() => setInk(option.value)}
              />
            ))}
            <span id={`${id}-ink`} hidden>{`${INKS.find(o => o.value === ink)?.name} selected`}</span>
          </div>
          <div className="wlkr-pixel-canvas-actions">
            <button type="button" className="wlkr-pixel-canvas-btn" onClick={() => commit(new Array(size).fill(0))}>Clear</button>
            <button type="button" className="wlkr-pixel-canvas-btn" onClick={() => commit(pixels.map(v => (v ? 0 : 1)))}>Invert</button>
          </div>
        </div>
      )}
    </div>
  )
}
