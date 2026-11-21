"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type ScrollProgressProps = Omit<React.ComponentPropsWithoutRef<"div">, "role" | "children" | "aria-label" | "aria-valuenow" | "aria-valuemin" | "aria-valuemax" | "aria-valuetext"> & {
  /** A scroll container to track. Defaults to the page. */
  target?: React.RefObject<HTMLElement | null>
  /** "top" and "bottom" pin the strip to that edge of the viewport; "inline" is a normal block you place. */
  position?: "top" | "bottom" | "inline"
  /** Cells across, 8–240. They stretch to fill the width. */
  columns?: number
  /** Cells down, 1–4. */
  rows?: number
  /** Cell height in pixels, 2–12. The strip is rows × cell tall. */
  cell?: number
  /** Accessible name for the progress bar. */
  label?: string
}

const styles = `
.wlkr-scroll-progress{display:block;width:100%;height:var(--wlkr-scroll-progress-height);color:var(--foreground,currentColor)}
.wlkr-scroll-progress[data-position=top],.wlkr-scroll-progress[data-position=bottom]{position:fixed;left:env(safe-area-inset-left,0px);right:env(safe-area-inset-right,0px);width:auto;z-index:40;pointer-events:none}
.wlkr-scroll-progress[data-position=top]{top:env(safe-area-inset-top,0px)}
.wlkr-scroll-progress[data-position=bottom]{bottom:env(safe-area-inset-bottom,0px)}
.wlkr-scroll-progress-grid{display:block;width:100%;height:100%;overflow:visible}
.wlkr-scroll-progress-off{fill:var(--muted,#f3f3f3)}
.dark .wlkr-scroll-progress-off{fill:var(--border,#343434)}
.wlkr-scroll-progress-ink{fill:currentColor}
.wlkr-scroll-progress-brand{fill:var(--brand,#33f282)}
`

/** 4×4 ordered-dither thresholds, normalised to 0–1. */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(step => (step + 0.5) / 16)
const FRONT = 3

const clamp = (input: unknown, min: number, max: number, fallback: number) => {
  const number = Number(input)
  return input === "" || input === null || !Number.isFinite(number) ? fallback : Math.min(max, Math.max(min, number))
}

/** How far down the page (or a scroll container) you are, drawn as a strip of pixels with a dithered front. */
export function ScrollProgress({ target, position = "top", columns = 64, rows = 1, cell = 4, label = "Reading progress", className, style, ...props }: ScrollProgressProps) {
  const columnCount = Math.round(clamp(columns, 8, 240, 64))
  const rowCount = Math.round(clamp(rows, 1, 4, 1))
  const cellSize = Math.round(clamp(cell, 2, 12, 4))
  const placement = position === "bottom" || position === "inline" ? position : "top"
  const root = React.useRef<HTMLDivElement>(null)
  const off = React.useRef<SVGPathElement>(null)
  const ink = React.useRef<SVGPathElement>(null)
  const brand = React.useRef<SVGPathElement>(null)
  const [percent, setPercent] = React.useState(0)

  React.useEffect(() => {
    const element = root.current
    if (!element) return
    const source = target?.current ?? null
    const scroller = () => source ?? document.scrollingElement ?? document.documentElement
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const gap = Math.max(1, Math.round(cellSize / 4))
    let width = element.clientWidth
    let drawnWidth = -1
    let goal = 0
    let shown = 0
    let frame = 0
    let last = 0

    const read = () => {
      const box = scroller()
      const max = box.scrollHeight - box.clientHeight
      if (max <= 0) return 0
      const top = Math.max(0, box.scrollTop)
      return max - top < 1 ? 1 : Math.min(1, top / max)
    }
    const draw = () => {
      const across = Math.min(0.5, gap / Math.max(1, width / columnCount))
      const down = Math.min(0.5, gap / cellSize)
      const cellPath = (column: number, row: number) => `M${column} ${row}h${(1 - across).toFixed(3)}v${(1 - down).toFixed(3)}h-${(1 - across).toFixed(3)}z`
      if (placement === "inline" && drawnWidth !== width) {
        let all = ""
        for (let column = 0; column < columnCount; column++) for (let row = 0; row < rowCount; row++) all += cellPath(column, row)
        off.current?.setAttribute("d", all)
        drawnWidth = width
      }
      const front = shown * (columnCount + FRONT)
      const complete = goal === 1 && shown > 0.999
      let lit = ""
      let green = ""
      for (let column = 0; column < columnCount; column++) {
        const coverage = (front - column) / FRONT
        if (coverage <= 0) break
        for (let row = 0; row < rowCount; row++) {
          if (BAYER[(row % 4) * 4 + (column % 4)] >= coverage) continue
          if (complete && column === columnCount - 1) green += cellPath(column, row)
          else lit += cellPath(column, row)
        }
      }
      ink.current?.setAttribute("d", lit)
      brand.current?.setAttribute("d", green)
    }
    const tick = (now: number) => {
      frame = 0
      goal = read()
      setPercent(Math.round(goal * 100))
      const elapsed = last ? Math.min(64, now - last) : 16
      last = now
      shown = motion.matches ? goal : shown + (goal - shown) * (1 - Math.exp(-elapsed / 90))
      if (Math.abs(goal - shown) < 0.0005) shown = goal
      draw()
      if (shown !== goal) frame = requestAnimationFrame(tick)
      else last = 0
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(tick) }
    const measure = () => { width = element.clientWidth; schedule() }

    shown = goal = read()
    draw()
    schedule()
    const events: EventTarget = source ?? window
    events.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", measure, { passive: true })
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    const watched = source ? [source, ...Array.from(source.children)] : [document.documentElement, document.body]
    watched.forEach(node => observer.observe(node))
    return () => {
      cancelAnimationFrame(frame)
      events.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", measure)
      observer.disconnect()
    }
  }, [target, placement, columnCount, rowCount, cellSize])

  return (
    <div
      {...props}
      ref={root}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      data-position={placement}
      className={cn("wlkr-scroll-progress", className)}
      style={{ ...style, "--wlkr-scroll-progress-height": `${rowCount * cellSize}px` } as React.CSSProperties}
    >
      <style>{styles}</style>
      <svg className="wlkr-scroll-progress-grid" viewBox={`0 0 ${columnCount} ${rowCount}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
        {placement === "inline" && <path ref={off} className="wlkr-scroll-progress-off" />}
        <path ref={ink} className="wlkr-scroll-progress-ink" />
        <path ref={brand} className="wlkr-scroll-progress-brand" />
      </svg>
    </div>
  )
}
