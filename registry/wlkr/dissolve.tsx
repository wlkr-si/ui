"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type Direction = "none" | "up" | "down" | "left" | "right"

export type DissolveProps = Omit<React.ComponentPropsWithoutRef<"div">, "children"> & {
  children: React.ReactNode
  /** Controlled visibility: `true` dissolves in, `false` dissolves out. When omitted, `trigger` decides. */
  show?: boolean
  /** "view" plays when about a quarter is visible; "mount" plays as soon as it mounts. */
  trigger?: "view" | "mount"
  /** With `trigger="view"`: `false` dissolves out on leaving the viewport and back in on return. */
  once?: boolean
  /** Milliseconds for a full dissolve, 150–4000. */
  duration?: number
  /** Milliseconds before it starts. Use it to stagger several. */
  delay?: number
  /** Size of one dither pixel in CSS pixels, 1–24. */
  cell?: number
  /** "none" dissolves everywhere at once; a side sweeps a dithered front across in that direction. */
  direction?: Direction
  as?: "div" | "span" | "section" | "li"
}

const styles = `
.wlkr-dissolve[data-state=hidden]{opacity:0;pointer-events:none}
.wlkr-dissolve[data-state=hidden]:focus-within{opacity:1}
.wlkr-dissolve[data-state=dissolving]{mask-repeat:repeat;-webkit-mask-repeat:repeat;mask-position:0 0;-webkit-mask-position:0 0;mask-size:calc(var(--wlkr-dissolve-cell,4px)*4);-webkit-mask-size:calc(var(--wlkr-dissolve-cell,4px)*4)}
.wlkr-dissolve[data-state=dissolving]:not([data-direction=none]){mask-repeat:no-repeat;-webkit-mask-repeat:no-repeat;mask-size:100% 100%;-webkit-mask-size:100% 100%}
`

/** 4×4 ordered-dither thresholds: level k keeps the k cells with the lowest values. */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]
const cells = (level: number, size: number) => BAYER.map((step, index) => step < level ? `M${(index % 4) * size} ${Math.floor(index / 4) * size}h${size}v${size}h-${size}z` : "").join("")
const svgUrl = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' shape-rendering='crispEdges' ${svg}</svg>`)}")`
const TILES = Array.from({ length: 17 }, (_, level) => svgUrl(`width='4' height='4' viewBox='0 0 4 4'><path d='${cells(level, 1)}'/>`))
const reduceQuery = "(prefers-reduced-motion: reduce)"

const clamp = (input: unknown, min: number, max: number, fallback: number) => {
  const number = Number(input)
  return input === "" || input === null || !Number.isFinite(number) ? fallback : Math.min(max, Math.max(min, number))
}
const subscribeMotion = (notify: () => void) => {
  const media = window.matchMedia(reduceQuery)
  media.addEventListener("change", notify)
  return () => media.removeEventListener("change", notify)
}
const noop = () => () => {}

/** One SVG the size of the element: bands of dither, solid behind the front and empty ahead of it. */
function sweepMask(width: number, height: number, progress: number, direction: Exclude<Direction, "none">, cell: number) {
  const horizontal = direction === "left" || direction === "right"
  const length = horizontal ? width : height
  const band = cell * Math.max(1, Math.ceil(length / cell / 96))
  const bands = Math.max(1, Math.ceil(length / band))
  const ramp = Math.max(4, Math.round(bands * 0.4))
  const front = progress * (bands + ramp)
  const used = new Set<number>()
  let rects = ""
  let start = 0
  for (let index = 1; index <= bands; index++) {
    const level = (at: number) => Math.round(Math.min(1, Math.max(0, (front - at) / ramp)) * 16)
    const current = level(start)
    if (index < bands && level(index) === current) continue
    if (current > 0) {
      const from = direction === "right" || direction === "down" ? start * band : length - index * band
      const size = (index - start) * band
      const fill = current === 16 ? "#000" : `url(#l${current})`
      if (current < 16) used.add(current)
      rects += horizontal ? `<rect x='${from}' y='0' width='${size}' height='${height}' fill='${fill}'/>` : `<rect x='0' y='${from}' width='${width}' height='${size}' fill='${fill}'/>`
    }
    start = index
  }
  const patterns = [...used].map(level => `<pattern id='l${level}' width='${cell * 4}' height='${cell * 4}' patternUnits='userSpaceOnUse'><path d='${cells(level, cell)}'/></pattern>`).join("")
  return svgUrl(`width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'><defs>${patterns}</defs>${rects}`)
}

/** Content that materialises through an ordered-dither mask, and can leave the same way. Visual only: the content stays in the accessibility tree throughout. */
export function Dissolve({ children, show, trigger = "view", once = true, duration = 700, delay = 0, cell = 4, direction = "none", as = "div", className, style, ...props }: DissolveProps) {
  const Tag = (["div", "span", "section", "li"].includes(as) ? as : "div") as "div"
  const root = React.useRef<HTMLDivElement>(null)
  const progress = React.useRef(1)
  const started = React.useRef(false)
  const fromServer = React.useRef<boolean | null>(null)
  const hydrated = React.useSyncExternalStore(noop, () => true, () => false)
  const reduced = React.useSyncExternalStore(subscribeMotion, () => window.matchMedia(reduceQuery).matches, () => false)
  const time = clamp(duration, 150, 4000, 700)
  const wait = clamp(delay, 0, 60000, 0)
  const size = clamp(cell, 1, 24, 4)
  const sweep: Direction = ["up", "down", "left", "right"].includes(direction) ? direction : "none"
  const controlled = typeof show === "boolean"

  React.useLayoutEffect(() => {
    if (fromServer.current === null) fromServer.current = !hydrated
  }, [hydrated])

  React.useLayoutEffect(() => {
    const element = root.current
    if (!element) return
    let timer = 0
    let raf = 0
    let painted = ""
    const paint = (value: number) => {
      progress.current = value
      const state = value >= 1 ? "shown" : value <= 0 ? "hidden" : "dissolving"
      const mask = state !== "dissolving" ? "" : sweep === "none" ? TILES[Math.min(15, Math.max(1, Math.round(value * 16)))] : sweepMask(element.offsetWidth, element.offsetHeight, value, sweep, size)
      if (mask === painted && element.dataset.state === state) return
      painted = mask
      element.dataset.state = state
      if (mask) { element.style.setProperty("mask-image", mask); element.style.setProperty("-webkit-mask-image", mask) }
      else { element.style.removeProperty("mask-image"); element.style.removeProperty("-webkit-mask-image") }
    }
    const play = (to: 0 | 1, after: number) => {
      window.clearTimeout(timer)
      cancelAnimationFrame(raf)
      if (reduced) { paint(to); return }
      timer = window.setTimeout(() => {
        const from = progress.current
        const span = Math.abs(to - from) * time
        if (span === 0) { paint(to); return }
        const begin = performance.now()
        let last = -Infinity
        const tick = (now: number) => {
          const t = Math.min(1, (now - begin) / span)
          if (t === 1 || now - last >= 32) { last = now; paint(from + (to - from) * t) }
          if (t < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      }, after)
    }
    const first = !started.current
    started.current = true
    let observer: IntersectionObserver | null = null

    if (controlled) {
      if (first) paint(show ? 1 : 0)
      else play(show ? 1 : 0, wait)
    } else if (reduced) {
      paint(1)
    } else {
      if (first) {
        // Already painted from server HTML and on screen: hiding it now would flash, so it stays.
        // Mounted on the client, or below the fold: hide before paint, then play.
        const box = element.getBoundingClientRect()
        const onScreen = box.bottom > 0 && box.top < window.innerHeight && box.width > 0
        if (!(fromServer.current && onScreen)) paint(0)
      }
      if (trigger === "mount") {
        if (progress.current < 1) play(1, wait)
      } else if (!once || progress.current < 1) {
        observer = new IntersectionObserver(entries => {
          const entry = entries[entries.length - 1]
          if (entry.isIntersecting) {
            play(1, wait)
            if (once) observer?.disconnect()
          } else if (!once && progress.current > 0) play(0, 0)
        }, { threshold: 0.25 })
        observer.observe(element)
      }
    }
    return () => {
      window.clearTimeout(timer)
      cancelAnimationFrame(raf)
      observer?.disconnect()
    }
  }, [controlled, show, trigger, once, time, wait, size, sweep, reduced])

  return (
    <Tag
      {...props}
      ref={root}
      className={cn("wlkr-dissolve", className)}
      data-direction={sweep}
      style={{ "--wlkr-dissolve-cell": `${size}px`, ...style } as React.CSSProperties}
    >
      <style>{styles}</style>
      {children}
    </Tag>
  )
}
