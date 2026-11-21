"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type PixelSliderProps = Omit<React.ComponentPropsWithoutRef<"div">, "defaultValue" | "onChange" | "children"> & {
  /** Controlled value. Pair with `onValueChange`. */
  value?: number
  onValueChange?: (value: number) => void
  /** Uncontrolled starting value. */
  defaultValue?: number
  /** Fires when a drag or a key press ends, with the settled value. */
  onValueCommit?: (value: number) => void
  min?: number
  max?: number
  step?: number
  /** Grid width in cells, 8–120. */
  columns?: number
  /** Track height in cells, 1–6. The thumb stands one cell taller above and below. */
  rows?: number
  /** Accessible name for the slider. */
  label: string
  /** Shows a right-aligned value with a fixed width. */
  showValue?: boolean
  /** Formats the shown value and the value read to screen readers. */
  formatValue?: (value: number) => string
  disabled?: boolean
}

const styles = `
.wlkr-pixel-slider{display:flex;align-items:center;gap:12px;width:100%;min-width:0;color:var(--foreground,currentColor)}
.wlkr-pixel-slider[data-disabled=true]{opacity:.5}
.wlkr-pixel-slider-track{position:relative;flex:1 1 auto;display:flex;align-items:center;min-width:0;min-height:44px;container-type:inline-size}
.wlkr-pixel-slider-track:has(:focus-visible){outline:2px solid var(--ring,currentColor);outline-offset:4px}
@supports not selector(:has(*)){.wlkr-pixel-slider-track:focus-within{outline:2px solid var(--ring,currentColor);outline-offset:4px}}
.wlkr-pixel-slider-grid{display:block;width:100%;height:auto;overflow:visible}
.wlkr-pixel-slider-off{fill:var(--border,#dedede)}
.wlkr-pixel-slider-preview{fill:var(--muted-foreground,#696969);opacity:.45}
.wlkr-pixel-slider-ink{fill:currentColor}
.wlkr-pixel-slider-brand{fill:var(--brand,#33f282)}
.wlkr-pixel-slider-input{position:absolute;left:0;top:50%;width:100%;height:max(100%,44px);margin:0;padding:0;transform:translateY(-50%);opacity:0;cursor:pointer;-webkit-appearance:none;appearance:none;background:none;touch-action:pan-y}
.wlkr-pixel-slider-input:disabled{cursor:default}
.wlkr-pixel-slider-input::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:calc(100cqi / var(--wlkr-pixel-slider-columns));height:44px;border:0}
.wlkr-pixel-slider-input::-moz-range-thumb{width:calc(100cqi / var(--wlkr-pixel-slider-columns));height:44px;border:0;border-radius:0}
.wlkr-pixel-slider-value{flex:none;display:inline-grid;font-size:12px;line-height:1;font-variant-numeric:tabular-nums;font-feature-settings:"tnum";color:var(--muted-foreground,#696969)}
.wlkr-pixel-slider-value>span{grid-area:1/1;justify-self:end;white-space:nowrap}
.wlkr-pixel-slider-reserve{visibility:hidden}
`

/** 4×4 ordered-dither thresholds, normalised to 0–1. */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(step => (step + 0.5) / 16)
const FRONT = 4
const INSET = 0.09
const CELL = 0.82
const EASE_MS = 40
const COMMIT_KEYS = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"])

const finite = (input: unknown, fallback: number) => {
  const number = Number(input)
  return input === "" || input === null || !Number.isFinite(number) ? fallback : number
}
const cell = (column: number, row: number) => `M${column + INSET} ${row + INSET}h${CELL}v${CELL}h-${CELL}z`
const threshold = (column: number, row: number) => BAYER[(((row % 4) + 4) % 4) * 4 + (column % 4)]
const plain = (value: number) => String(value)

const subscribeMotion = (notify: () => void) => {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)")
  media.addEventListener("change", notify)
  return () => media.removeEventListener("change", notify)
}

/** A slider drawn in pixels: a dithered fill and one green thumb column, over a real range input. */
export function PixelSlider({ value, onValueChange, defaultValue = 50, onValueCommit, min = 0, max = 100, step = 1, columns = 40, rows = 3, label, showValue = false, formatValue = plain, disabled = false, className, style, ...props }: PixelSliderProps) {
  const low = finite(min, 0)
  const top = finite(max, 100)
  const high = top > low ? top : low + 1
  const rawStep = finite(step, 1)
  const increment = Math.min(high - low, rawStep > 0 ? rawStep : 1)
  const columnCount = Math.round(Math.min(120, Math.max(8, finite(columns, 40))))
  const rowCount = Math.round(Math.min(6, Math.max(1, finite(rows, 3))))
  const snap = (input: unknown) => {
    const clamped = Math.min(high, Math.max(low, finite(input, low)))
    return Math.min(high, Number((low + Math.round((clamped - low) / increment) * increment).toFixed(10)))
  }

  const [internal, setInternal] = React.useState(() => snap(defaultValue))
  const current = snap(value !== undefined ? value : internal)
  const fraction = (current - low) / (high - low)
  const reduced = React.useSyncExternalStore(subscribeMotion, () => window.matchMedia("(prefers-reduced-motion: reduce)").matches, () => false)
  const [dragging, setDragging] = React.useState(false)
  const [hover, setHover] = React.useState<number | null>(null)
  const [eased, setEased] = React.useState(fraction)
  const easedRef = React.useRef(fraction)
  const input = React.useRef<HTMLInputElement>(null)
  const press = React.useRef<{ changes: number } | null>(null)
  const commitRef = React.useRef(onValueCommit)

  React.useEffect(() => { commitRef.current = onValueCommit })

  React.useEffect(() => {
    const end = () => {
      const ended = press.current
      if (!ended) return
      press.current = null
      setDragging(false)
      const element = input.current
      if (element && ended.changes > 0) commitRef.current?.(element.valueAsNumber)
    }
    window.addEventListener("pointerup", end)
    window.addEventListener("pointercancel", end)
    return () => { window.removeEventListener("pointerup", end); window.removeEventListener("pointercancel", end) }
  }, [])

  React.useEffect(() => {
    if (reduced) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const elapsed = Math.max(0, now - last)
      last = now
      let next = dragging ? fraction : easedRef.current + (fraction - easedRef.current) * (1 - Math.exp(-elapsed / EASE_MS))
      if (Math.abs(fraction - next) < 0.0005) next = fraction
      easedRef.current = next
      setEased(next)
      if (next !== fraction) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [fraction, dragging, reduced])

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const next = snap(event.currentTarget.valueAsNumber)
    if (press.current && ++press.current.changes > 1 && !dragging) setDragging(true)
    if (value === undefined) setInternal(next)
    if (next !== current) onValueChange?.(next)
  }

  function handleHover(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || disabled) return
    const rect = event.currentTarget.getBoundingClientRect()
    const column = Math.floor(((event.clientX - rect.left) / rect.width) * columnCount)
    setHover(column >= 0 && column < columnCount ? column : null)
  }

  const position = (reduced || dragging ? fraction : eased) * (columnCount - 1)
  const thumb = Math.round(position)
  const off = React.useMemo(() => {
    let path = ""
    for (let column = 0; column < columnCount; column++) for (let row = 0; row < rowCount; row++) path += cell(column, row)
    return path
  }, [columnCount, rowCount])
  let ink = ""
  let brand = ""
  for (let column = 0; column < thumb; column++) {
    const coverage = (position - column) / FRONT
    for (let row = 0; row < rowCount; row++) if (threshold(column, row) < coverage) ink += cell(column, row)
  }
  for (let row = -1; row <= rowCount; row++) brand += cell(thumb, row)
  let preview = ""
  if (hover !== null && hover !== thumb && !dragging) for (let row = 0; row < rowCount; row++) preview += cell(hover, row)

  const formatted = formatValue(current)
  const longest = [formatValue(low), formatValue(high)].reduce((a, b) => (b.length > a.length ? b : a), formatted)

  return (
    <div {...props} className={cn("wlkr-pixel-slider", className)} style={{ ...style, "--wlkr-pixel-slider-columns": columnCount } as React.CSSProperties} data-disabled={disabled}>
      <style>{styles}</style>
      <div className="wlkr-pixel-slider-track" onPointerMove={handleHover} onPointerLeave={() => setHover(null)}>
        <svg className="wlkr-pixel-slider-grid" viewBox={`0 -1 ${columnCount} ${rowCount + 2}`} style={{ aspectRatio: `${columnCount} / ${rowCount + 2}` }} shapeRendering="crispEdges" aria-hidden="true" focusable="false">
          <path className="wlkr-pixel-slider-off" d={off} />
          <path className="wlkr-pixel-slider-preview" d={preview} />
          <path className="wlkr-pixel-slider-ink" d={ink} />
          <path className="wlkr-pixel-slider-brand" d={brand} />
        </svg>
        <input
          ref={input}
          type="range"
          className="wlkr-pixel-slider-input"
          aria-label={label}
          aria-valuetext={formatValue === plain ? undefined : formatted}
          min={low}
          max={high}
          step={increment}
          value={current}
          disabled={disabled}
          onChange={handleChange}
          onPointerDown={() => { press.current = { changes: 0 } }}
          onKeyUp={event => { if (COMMIT_KEYS.has(event.key)) onValueCommit?.(current) }}
        />
      </div>
      {showValue && <span className="wlkr-pixel-slider-value" aria-hidden="true"><span className="wlkr-pixel-slider-reserve">{longest}</span><span>{formatted}</span></span>}
    </div>
  )
}
