"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type PixelProgressProps = Omit<React.ComponentPropsWithoutRef<"div">, "role" | "children" | "aria-label" | "aria-valuenow" | "aria-valuemin" | "aria-valuemax" | "aria-valuetext"> & {
  /** 0–100. `null` or `undefined` shows the indeterminate packet. */
  value?: number | null
  /** Grid width in cells, 8–160. */
  columns?: number
  /** Grid height in cells, 1–8. */
  rows?: number
  /** Accessible name for the progress bar. */
  label: string
  /** Shows a right-aligned percentage with a fixed width. */
  showValue?: boolean
}

type Frame = { progress: number; wave: number | null; done: boolean; phase: number }

const styles = `
.wlkr-pixel-progress{display:flex;align-items:center;gap:12px;width:100%;min-width:0;color:var(--foreground,currentColor)}
.wlkr-pixel-progress-grid{display:block;flex:1 1 auto;width:100%;min-width:0;height:auto;overflow:visible}
.wlkr-pixel-progress-off{fill:var(--muted,#f3f3f3)}
.dark .wlkr-pixel-progress-off{fill:var(--border,#343434)}
.wlkr-pixel-progress-ink{fill:currentColor}
.wlkr-pixel-progress-brand{fill:var(--brand,#33f282)}
.wlkr-pixel-progress-value{flex:none;display:inline-grid;font-size:12px;line-height:1;font-variant-numeric:tabular-nums;font-feature-settings:"tnum";color:var(--muted-foreground,#696969)}
.wlkr-pixel-progress-value>span{grid-area:1/1;justify-self:end}
.wlkr-pixel-progress-reserve{visibility:hidden}
`

/** 4×4 ordered-dither thresholds, normalised to 0–1. */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(step => (step + 0.5) / 16)
const FRONT = 4
const PACKET = 10
const PACKET_EDGE = 3
const BAND = 6
const INSET = 0.09
const CELL = 0.82

const clamp = (input: unknown, min: number, max: number, fallback: number) => {
  const number = Number(input)
  return input === "" || input === null || !Number.isFinite(number) ? fallback : Math.min(max, Math.max(min, number))
}
const cell = (column: number, row: number) => `M${column + INSET} ${row + INSET}h${CELL}v${CELL}h-${CELL}z`
const threshold = (column: number, row: number) => BAYER[(row % 4) * 4 + (column % 4)]

const subscribeMotion = (notify: () => void) => {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)")
  media.addEventListener("change", notify)
  return () => media.removeEventListener("change", notify)
}
const subscribeVisibility = (notify: () => void) => {
  document.addEventListener("visibilitychange", notify)
  return () => document.removeEventListener("visibilitychange", notify)
}

/** A progress bar drawn in pixels: a solid body, an ordered-dither front, and one green wave on completion. */
export function PixelProgress({ value, columns = 48, rows = 4, label, showValue = false, className, ...props }: PixelProgressProps) {
  const columnCount = Math.round(clamp(columns, 8, 160, 48))
  const rowCount = Math.round(clamp(rows, 1, 8, 4))
  const indeterminate = typeof value !== "number" || !Number.isFinite(value)
  const target = indeterminate ? 0 : Math.min(100, Math.max(0, value))
  const reduced = React.useSyncExternalStore(subscribeMotion, () => window.matchMedia("(prefers-reduced-motion: reduce)").matches, () => false)
  const visible = React.useSyncExternalStore(subscribeVisibility, () => document.visibilityState === "visible", () => true)
  const root = React.useRef<HTMLDivElement>(null)
  const [inView, setInView] = React.useState(false)
  const initial: Frame = { progress: target, wave: null, done: target === 100, phase: 0.25 }
  const [frame, setFrame] = React.useState(initial)
  const current = React.useRef(initial)

  React.useEffect(() => {
    const element = root.current
    if (!element) return
    const observer = new IntersectionObserver(entries => setInView(entries.some(entry => entry.isIntersecting)))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    if (reduced || (indeterminate && !(inView && visible))) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const elapsed = now - last
      last = now
      const previous = current.current
      let next: Frame
      if (indeterminate) {
        next = { progress: previous.progress, wave: null, done: false, phase: (previous.phase + Math.min(elapsed, 64) / 1600) % 1 }
      } else {
        let progress = previous.progress + (target - previous.progress) * (1 - Math.exp(-elapsed / 110))
        if (Math.abs(target - progress) < 0.05) progress = target
        let { wave, done } = previous
        if (progress < 100) { wave = null; done = false }
        else if (!done) {
          wave = (wave ?? 0) + elapsed / 600
          if (wave >= 1) { wave = null; done = true }
        }
        next = { progress, wave, done, phase: previous.phase }
      }
      current.current = next
      setFrame(next)
      if (indeterminate || next.progress !== target || next.wave !== null) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reduced, indeterminate, inView, visible, target])

  const shown: Frame = reduced ? { progress: target, wave: null, done: target === 100, phase: 0 } : frame
  const front = (shown.progress / 100) * (columnCount + FRONT)
  const packetLeft = -PACKET + shown.phase * (columnCount + PACKET)
  const bandLeft = shown.wave === null ? Infinity : -BAND + shown.wave * (columnCount + BAND)
  const mark = shown.done && target === 100 ? Math.max(1, Math.round(columnCount / 24)) : 0
  const off = React.useMemo(() => {
    let path = ""
    for (let column = 0; column < columnCount; column++) for (let row = 0; row < rowCount; row++) path += cell(column, row)
    return path
  }, [columnCount, rowCount])
  let ink = ""
  let brand = ""
  for (let column = 0; column < columnCount; column++) {
    for (let row = 0; row < rowCount; row++) {
      let coverage: number
      if (indeterminate) {
        const centre = column + 0.5
        coverage = reduced ? 0.5 : Math.min(centre - packetLeft, packetLeft + PACKET - centre) / PACKET_EDGE
      } else coverage = (front - column) / FRONT
      if (threshold(column, row) >= coverage) continue
      const path = cell(column, row)
      const green = !indeterminate && ((column >= bandLeft && column < bandLeft + BAND) || column >= columnCount - mark)
      if (green) brand += path
      else ink += path
    }
  }

  return (
    <div
      {...props}
      ref={root}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={indeterminate ? undefined : Math.round(target)}
      aria-valuetext={indeterminate ? undefined : `${Math.round(target)}%`}
      className={cn("wlkr-pixel-progress", className)}
    >
      <style>{styles}</style>
      <svg className="wlkr-pixel-progress-grid" viewBox={`0 0 ${columnCount} ${rowCount}`} style={{ aspectRatio: `${columnCount} / ${rowCount}` }} shapeRendering="crispEdges" aria-hidden="true" focusable="false">
        <path className="wlkr-pixel-progress-off" d={off} />
        <path className="wlkr-pixel-progress-ink" d={ink} />
        <path className="wlkr-pixel-progress-brand" d={brand} />
      </svg>
      {showValue && <span className="wlkr-pixel-progress-value" aria-hidden="true"><span className="wlkr-pixel-progress-reserve">100%</span><span>{indeterminate ? "" : `${Math.round(shown.progress)}%`}</span></span>}
    </div>
  )
}
