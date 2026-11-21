"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type PixelTrailProps = Omit<React.ComponentProps<"div">, "children" | "ref"> & {
  children?: React.ReactNode
  /** Grid cell size in pixels, 6–64. Grows on very large areas to keep the grid under ~20,000 cells. */
  cell?: number
  /** Milliseconds for a lit cell to switch off, 100–4000. */
  fade?: number
  /** Colour of lit cells. "mixed" makes the newest cell brand green and the tail ink. */
  tone?: "ink" | "brand" | "mixed"
  /** Pixels of space between cells, 0–8. */
  gap?: number
  shape?: "square" | "round"
  /** Until a pointer first enters, a quiet sparkle lights a cell now and then. */
  idle?: boolean
}

const styles = `
.wlkr-pixel-trail{position:relative;display:grid;overflow:hidden;touch-action:pan-y}
.wlkr-pixel-trail-canvas{position:absolute;inset:0;display:block;width:100%;height:100%;pointer-events:none}
.wlkr-pixel-trail-content{position:relative;min-width:0}
`
const MAX_CELLS = 20000
const STEPS = [1, 0.62, 0.3]
const IDLE_START = 1400

const clamp = (value: number | undefined, min: number, max: number, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback
const seedFrom = (text: string) => {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619)
  return h >>> 0
}
/** mulberry32: a small deterministic PRNG. */
const prng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

/** A wrapper with an invisible grid: cells the pointer crosses switch on, then off, in a short blocky tail. */
export function PixelTrail({ children, cell, fade, tone = "mixed", gap, shape = "square", idle = true, className, ...props }: PixelTrailProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const seed = seedFrom(React.useId())
  const spacing = clamp(cell, 6, 64, 16)
  const life = clamp(fade, 100, 4000, 550)
  const inset = clamp(gap, 0, 8, 1)
  const round = shape === "round"

  React.useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    if (!root || !canvas || !context) return
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const scheme = window.matchMedia("(prefers-color-scheme: dark)")
    const random = prng(seed)
    const origin = performance.now()
    let reduced = motion.matches
    let onScreen = false
    let visible = document.visibilityState === "visible"
    let entered = false
    let width = 0, height = 0, dpr = 1, size = spacing, cols = 0, rows = 0, frame = 0, sparkle = 0, head = -1
    let litAt = new Float32Array(0)
    let previous: { col: number; row: number } | null = null
    let ink = "#010101", brand = "#33f282"

    const clock = () => performance.now() - origin
    const readColor = (name: string, fallback: string) => {
      context.fillStyle = fallback
      context.fillStyle = getComputedStyle(root).getPropertyValue(name).trim() || fallback
      return String(context.fillStyle)
    }
    const readColors = () => { ink = readColor("--foreground", getComputedStyle(root).color); brand = readColor("--brand", "#33f282") }
    /** Draws every live cell; returns whether any is still alive. */
    const draw = () => {
      const now = clock()
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      context.clearRect(0, 0, width, height)
      const snap = (value: number) => Math.round(value * dpr) / dpr
      let alive = false
      for (let i = 0; i < litAt.length; i++) {
        if (!litAt[i]) continue
        const remaining = 1 - (now - litAt[i]) / life
        if (remaining <= 0) { litAt[i] = 0; continue }
        alive = true
        const step = reduced ? 1 : STEPS[remaining > 0.66 ? 0 : remaining > 0.33 ? 1 : 2]
        const side = Math.max(1 / dpr, snap((size - inset) * step))
        const cx = (i % cols + 0.5) * size, cy = (Math.floor(i / cols) + 0.5) * size
        const left = snap(cx - side / 2), top = snap(cy - side / 2)
        context.globalAlpha = reduced ? 1 : remaining * (2 - remaining)
        context.fillStyle = tone === "brand" || (tone === "mixed" && i === head) ? brand : ink
        context.beginPath()
        if (round) context.arc(left + side / 2, top + side / 2, side / 2, 0, Math.PI * 2)
        else context.rect(left, top, side, side)
        context.fill()
      }
      context.globalAlpha = 1
      return alive
    }
    const tick = () => { frame = draw() ? requestAnimationFrame(tick) : 0 }
    const wake = () => { if (!frame) frame = requestAnimationFrame(tick) }
    const light = (col: number, row: number, now: number) => {
      if (col < 0 || row < 0 || col >= cols || row >= rows) return
      head = row * cols + col
      litAt[head] = now
    }
    /** Lights every cell on the line between two samples (Bresenham), so fast flicks leave no gaps. */
    const lightLine = (from: { col: number; row: number }, to: { col: number; row: number }) => {
      const now = Math.max(1, clock())
      let { col, row } = from
      const dx = Math.abs(to.col - col), dy = -Math.abs(to.row - row), sx = col < to.col ? 1 : -1, sy = row < to.row ? 1 : -1
      let error = dx + dy
      for (;;) {
        light(col, row, now)
        if (col === to.col && row === to.row) break
        const twice = 2 * error
        if (twice >= dy) { error += dy; col += sx }
        if (twice <= dx) { error += dx; row += sy }
      }
      wake()
    }
    const stopSparkle = () => { window.clearTimeout(sparkle); sparkle = 0 }
    const planSparkle = (delay: number) => {
      stopSparkle()
      if (idle && !entered && !reduced && onScreen && visible && cols) sparkle = window.setTimeout(spark, delay)
    }
    const spark = () => {
      sparkle = 0
      const at = { col: Math.floor(random() * cols), row: Math.floor(random() * rows) }
      lightLine(at, at)
      planSparkle(700 + random() * 1300)
    }
    const layout = () => {
      width = root.clientWidth
      height = root.clientHeight
      dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      size = Math.max(spacing, Math.sqrt((width * height) / MAX_CELLS))
      cols = width > 0 ? Math.ceil(width / size) : 0
      rows = height > 0 ? Math.ceil(height / size) : 0
      litAt = new Float32Array(cols * rows)
      previous = null
      head = -1
      draw()
      if (!sparkle) planSparkle(IDLE_START)
    }
    const move = (event: PointerEvent) => {
      if (!entered) { entered = true; stopSparkle() }
      const box = root.getBoundingClientRect()
      const at = { col: Math.floor((event.clientX - box.left) / size), row: Math.floor((event.clientY - box.top) / size) }
      lightLine(event.type === "pointerdown" || !previous ? at : previous, at)
      previous = at
    }
    const release = () => { previous = null }
    const repaint = () => { readColors(); if (!frame) draw() }
    const changeMotion = () => { reduced = motion.matches; planSparkle(IDLE_START); wake() }
    const changeVisibility = () => { visible = document.visibilityState === "visible"; planSparkle(IDLE_START) }

    readColors()
    const resizer = new ResizeObserver(layout)
    const viewport = new IntersectionObserver(entries => { onScreen = entries.some(entry => entry.isIntersecting); planSparkle(IDLE_START) })
    const theme = new MutationObserver(repaint)
    resizer.observe(root)
    viewport.observe(root)
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    scheme.addEventListener("change", repaint)
    motion.addEventListener("change", changeMotion)
    document.addEventListener("visibilitychange", changeVisibility)
    root.addEventListener("pointermove", move)
    root.addEventListener("pointerdown", move)
    root.addEventListener("pointerleave", release)
    root.addEventListener("pointercancel", release)
    return () => {
      cancelAnimationFrame(frame)
      stopSparkle()
      resizer.disconnect()
      viewport.disconnect()
      theme.disconnect()
      scheme.removeEventListener("change", repaint)
      motion.removeEventListener("change", changeMotion)
      document.removeEventListener("visibilitychange", changeVisibility)
      root.removeEventListener("pointermove", move)
      root.removeEventListener("pointerdown", move)
      root.removeEventListener("pointerleave", release)
      root.removeEventListener("pointercancel", release)
    }
  }, [seed, spacing, life, inset, round, tone, idle])

  return <div ref={rootRef} {...props} className={cn("wlkr-pixel-trail", className)}>
    <style>{styles}</style>
    <canvas ref={canvasRef} className="wlkr-pixel-trail-canvas" aria-hidden="true" />
    <div className="wlkr-pixel-trail-content">{children}</div>
  </div>
}
