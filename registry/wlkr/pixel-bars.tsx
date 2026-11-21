"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type PixelBarsDatum = { label: string; value: number }

export type PixelBarsProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "role" | "aria-label" | "aria-roledescription"> & {
  data: PixelBarsDatum[]
  /** Vertical resolution in cells, 4–40. */
  rows?: number
  /** The value drawn at full height. Defaults to the largest value; values clamp to 0…max. */
  max?: number
  /** Px between bars at full size, 0–16. */
  gap?: number
  formatValue?: (value: number) => string
  /** Accessible name of the chart, e.g. "Deploys per day". */
  label: string
  /** The bar drawn in brand green at rest. */
  highlight?: "max" | "last" | "none"
}

type Scene = { pitch: number; height: number; rise: number; highlighted: number | null; active: number | null }

const styles = `
.wlkr-pixel-bars{display:block;width:100%;min-width:0;color:var(--foreground,currentColor)}
.wlkr-pixel-bars:focus-visible{outline:2px solid var(--ring,currentColor);outline-offset:4px}
.wlkr-pixel-bars-plot{display:block;width:100%;height:auto;overflow:hidden;touch-action:pan-y;cursor:crosshair}
.wlkr-pixel-bars-off{fill:var(--muted,#f3f3f3)}
.dark .wlkr-pixel-bars-off{fill:var(--border,#343434);fill-opacity:.6}
.wlkr-pixel-bars-ink,.wlkr-pixel-bars-hot{fill:currentColor}
.wlkr-pixel-bars-brand{fill:var(--brand,#33f282)}
.wlkr-pixel-bars-ink,.wlkr-pixel-bars-brand{transition:opacity 140ms cubic-bezier(.2,.7,.2,1)}
.wlkr-pixel-bars-plot[data-active] .wlkr-pixel-bars-ink,.wlkr-pixel-bars-plot[data-active] .wlkr-pixel-bars-brand{opacity:.45}
.wlkr-pixel-bars-readout{display:flex;gap:6px;height:20px;margin-top:10px;font-size:12px;line-height:20px;white-space:nowrap;overflow:hidden;font-variant-numeric:tabular-nums;font-feature-settings:"tnum";color:var(--muted-foreground,#696969)}
.wlkr-pixel-bars-readout>span:first-child{min-width:0;overflow:hidden;text-overflow:ellipsis}
.wlkr-pixel-bars-value{color:var(--foreground,currentColor)}
.wlkr-pixel-bars-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0}
@media (prefers-reduced-motion:reduce){.wlkr-pixel-bars-ink,.wlkr-pixel-bars-brand{transition:none}}
`

const CELL = 24
const STAGGER = 25
const GROW = 350
const EMPTY_BARS = 12
const numberFormat = new Intl.NumberFormat("en-US")

const clamp = (input: unknown, min: number, max: number, fallback: number) => {
  const number = Number(input)
  return input === "" || input === null || !Number.isFinite(number) ? fallback : Math.min(max, Math.max(min, number))
}
const ease = (t: number) => 1 - (1 - t) ** 3

const subscribeMotion = (notify: () => void) => {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)")
  media.addEventListener("change", notify)
  return () => media.removeEventListener("change", notify)
}

/** A bar chart drawn in square cells. Bars build up cell by cell on view; point at one, or arrow to it, to read it. */
export function PixelBars({ data, rows = 12, max, gap = 3, formatValue, label, highlight = "max", className, style, onKeyDown, onBlur, ...props }: PixelBarsProps) {
  const items = Array.isArray(data) ? data : []
  const labels = items.map(item => String(item?.label ?? ""))
  const values = items.map(item => {
    const value = Number(item?.value)
    return Number.isFinite(value) ? Math.max(0, value) : 0
  })
  const format = typeof formatValue === "function" ? formatValue : numberFormat.format
  const count = values.length
  const rowCount = Math.round(clamp(rows, 4, 40, 12))
  const spacing = clamp(gap, 0, 16, 3)
  const rise = Math.max(1, spacing)
  const peak = Math.max(0, ...values)
  const ceiling = typeof max === "number" && Number.isFinite(max) && max > 0 ? max : peak
  const targets = values.map(value => (ceiling > 0 ? Math.round((Math.min(value, ceiling) / ceiling) * rowCount) : 0))
  const pitch = CELL + spacing
  const width = (count || EMPTY_BARS) * pitch - spacing
  const height = rowCount * (CELL + rise) - rise
  const highlighted = count === 0 || highlight === "none" ? null : highlight === "last" ? count - 1 : values.indexOf(peak)

  const reduced = React.useSyncExternalStore(subscribeMotion, () => window.matchMedia("(prefers-reduced-motion: reduce)").matches, () => false)
  const [selection, setSelection] = React.useState<{ index: number; keyboard: boolean } | null>(null)
  const [inView, setInView] = React.useState(false)
  const active = selection && selection.index < count ? selection.index : null
  const root = React.useRef<HTMLDivElement>(null)
  const ink = React.useRef<SVGPathElement>(null)
  const brand = React.useRef<SVGPathElement>(null)
  const hot = React.useRef<SVGPathElement>(null)
  const shown = React.useRef<number[]>([])
  const scene = React.useRef<Scene>({ pitch, height, rise, highlighted, active })

  const draw = React.useCallback(() => {
    const { pitch, height, rise, highlighted, active } = scene.current
    const paths = { ink: "", brand: "", hot: "" }
    shown.current.forEach((level, bar) => {
      let path = ""
      for (let row = 0; row < Math.round(level); row++) path += `M${bar * pitch} ${height - CELL - row * (CELL + rise)}h${CELL}v${CELL}h-${CELL}z`
      paths[bar === active ? "hot" : bar === highlighted ? "brand" : "ink"] += path
    })
    ink.current?.setAttribute("d", paths.ink)
    brand.current?.setAttribute("d", paths.brand)
    hot.current?.setAttribute("d", paths.hot)
  }, [])

  React.useLayoutEffect(() => {
    scene.current = { pitch, height, rise, highlighted, active }
    draw()
  })

  React.useEffect(() => {
    const element = root.current
    if (!element) return
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return
      setInView(true)
      observer.disconnect()
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const key = targets.join(",")
  React.useEffect(() => {
    const goal = key ? key.split(",").map(Number) : []
    if (reduced || !inView) {
      shown.current = reduced ? goal : goal.map(() => 0)
      draw()
      return
    }
    const from = goal.map((_, bar) => shown.current[bar] ?? 0)
    let raf = 0
    let start = 0
    const tick = (now: number) => {
      start ||= now
      let moving = false
      shown.current = goal.map((to, bar) => {
        const t = Math.min(1, Math.max(0, (now - start - bar * STAGGER) / GROW))
        if (t < 1) moving = true
        return from[bar] + (to - from[bar]) * ease(t)
      })
      draw()
      if (moving) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [key, inView, reduced, draw])

  const off = React.useMemo(() => {
    let path = ""
    for (let bar = 0; bar < count; bar++) for (let row = 0; row < rowCount; row++) path += `M${bar * pitch} ${height - CELL - row * (CELL + rise)}h${CELL}v${CELL}h-${CELL}z`
    return path
  }, [count, rowCount, pitch, height, rise])

  const pick = (event: React.PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    if (!count || !rect.width) return
    const x = ((event.clientX - rect.left) * width) / rect.width
    const index = Math.min(count - 1, Math.max(0, Math.floor((x + spacing / 2) / pitch)))
    setSelection(current => (current?.index === index && !current.keyboard ? current : { index, keyboard: false }))
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented || !count) return
    const arrow = event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0
    let next: number | null
    if (arrow) next = active === null ? (highlighted ?? (arrow > 0 ? 0 : count - 1)) : Math.min(count - 1, Math.max(0, active + arrow))
    else if (event.key === "Home") next = 0
    else if (event.key === "End") next = count - 1
    else if (event.key === "Escape" && active !== null) next = null
    else return
    event.preventDefault()
    setSelection(next === null ? null : { index: next, keyboard: true })
  }

  const reading = active ?? highlighted
  return (
    <div
      {...props}
      ref={root}
      tabIndex={0}
      role="group"
      aria-roledescription="chart"
      aria-label={label}
      className={cn("wlkr-pixel-bars", className)}
      style={{ maxWidth: `max(${width}px, 240px)`, ...style }}
      onKeyDown={handleKeyDown}
      onBlur={event => { onBlur?.(event); setSelection(null) }}
    >
      <style>{styles}</style>
      <svg
        className="wlkr-pixel-bars-plot"
        viewBox={`0 0 ${width} ${height}`}
        style={{ maxWidth: width, aspectRatio: `${width} / ${height}` }}
        shapeRendering="crispEdges"
        aria-hidden="true"
        focusable="false"
        data-active={active === null ? undefined : ""}
        onPointerDown={pick}
        onPointerMove={pick}
        onPointerLeave={event => { if (event.pointerType !== "touch") setSelection(null) }}
      >
        <path className="wlkr-pixel-bars-off" d={off} />
        <path ref={ink} className="wlkr-pixel-bars-ink" />
        <path ref={brand} className="wlkr-pixel-bars-brand" />
        <path ref={hot} className="wlkr-pixel-bars-hot" />
      </svg>
      <div className="wlkr-pixel-bars-readout" aria-hidden="true">
        {reading !== null && <><span>{labels[reading]}</span><span>—</span><span className="wlkr-pixel-bars-value">{format(values[reading])}</span></>}
      </div>
      <span className="wlkr-pixel-bars-sr" aria-live="polite">{selection?.keyboard && active !== null ? `${labels[active]}, ${format(values[active])}` : ""}</span>
      <table className="wlkr-pixel-bars-sr">
        <caption>{label}</caption>
        <thead><tr><th scope="col">Label</th><th scope="col">Value</th></tr></thead>
        <tbody>{values.map((value, index) => <tr key={index}><th scope="row">{labels[index]}</th><td>{format(value)}</td></tr>)}</tbody>
      </table>
    </div>
  )
}
