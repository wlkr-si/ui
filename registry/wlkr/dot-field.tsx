"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type DotFieldProps = Omit<React.ComponentProps<"div">, "children" | "ref"> & {
  children?: React.ReactNode
  /** Pixels between dot centres, 8–64. Widens on very large areas to keep the field under ~6,000 dots. */
  gap?: number
  /** Dot size in pixels, 1–8. */
  dotSize?: number
  /** Pointer influence radius in pixels, 20–400. */
  radius?: number
  /** How far dots are pushed away from the pointer, 0–1. */
  strength?: number
  shape?: "square" | "round"
  /** A slow, barely-there wave drifts through the resting field. */
  ambient?: boolean
}

type Rgb = [number, number, number]

const styles = `
.wlkr-dot-field{position:relative;display:grid;overflow:hidden;touch-action:pan-y}
.wlkr-dot-field-canvas{position:absolute;inset:0;display:block;width:100%;height:100%;pointer-events:none}
.wlkr-dot-field-content{position:relative;min-width:0}
`
const MAX_DOTS = 6000
const REST_ALPHA = 0.4
const LEVELS = 7
const MID = 3
const STIFFNESS = 170
const DAMPING = 20
const STEP = 1 / 120
const MAX_DT = 0.05
const SWELL = 2.1
const BRAND_FROM = 0.36 // swell share at 40% of the radius: (1 - .4)²

const clamp = (value: number | undefined, min: number, max: number, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback
const mix = (a: Rgb, b: Rgb, t: number): Rgb => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
const rgba = ([r, g, b]: Rgb, alpha: number) => `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${alpha.toFixed(3)})`

function toRgb(probe: CanvasRenderingContext2D, value: string): Rgb {
  probe.clearRect(0, 0, 1, 1)
  probe.fillStyle = "#000"
  probe.fillStyle = value
  probe.fillRect(0, 0, 1, 1)
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data
  return [r, g, b]
}

/** A quiet grid of dots behind its children that swells, brightens and parts around the pointer. */
export function DotField({ children, gap, dotSize, radius, strength, shape = "square", ambient = true, className, ...props }: DotFieldProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const spacing = clamp(gap, 8, 64, 18)
  const size = clamp(dotSize, 1, 8, 2)
  const reach = clamp(radius, 20, 400, 110)
  const push = clamp(strength, 0, 1, 0.5)
  const round = shape === "round"

  React.useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    const probeCanvas = document.createElement("canvas")
    probeCanvas.width = probeCanvas.height = 1
    const probe = probeCanvas.getContext("2d", { willReadFrequently: true })
    if (!root || !canvas || !context || !probe) return
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const scheme = window.matchMedia("(prefers-color-scheme: dark)")
    let reduced = motion.matches
    let onScreen = true
    let visible = document.visibilityState === "visible"
    let width = 0, height = 0, dpr = 1, count = 0, frame = 0, last = 0, lastDraw = 0
    let pointer: { x: number; y: number } | null = null
    let restX = new Float32Array(0), restY = restX, offX = restX, offY = restX, velX = restX, velY = restX, swell = restX, velS = restX
    let muted: Rgb = [105, 105, 105], ink: Rgb = [1, 1, 1], brand: Rgb = [51, 242, 130]

    const readColors = () => {
      const style = getComputedStyle(root)
      const read = (name: string, fallback: string) => toRgb(probe, style.getPropertyValue(name).trim() || fallback)
      muted = read("--muted-foreground", "#696969")
      ink = read("--foreground", style.color)
      brand = read("--brand", "#33f282")
    }
    const addDot = (path: Path2D, x: number, y: number, side: number) => {
      if (round) { path.moveTo(x + side / 2, y); path.arc(x, y, side / 2, 0, Math.PI * 2) } else path.rect(x - side / 2, y - side / 2, side, side)
    }
    const draw = (time: number) => {
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      context.clearRect(0, 0, width, height)
      const wave = ambient && !reduced
      const paths = Array.from({ length: LEVELS }, () => new Path2D())
      const active: number[] = []
      for (let i = 0; i < count; i++) {
        if (swell[i] > 0.004) { active.push(i); continue }
        const level = wave ? Math.round((Math.sin(restX[i] * 0.011 + restY[i] * 0.007 - time * 0.0009) + 1) * MID) : MID
        addDot(paths[level], restX[i] + offX[i], restY[i] + offY[i], size * (1 + (level - MID) * 0.06))
      }
      paths.forEach((path, level) => { context.fillStyle = rgba(muted, REST_ALPHA * (1 + (level - MID) * 0.12)); context.fill(path) })
      for (const i of active) {
        const t = Math.min(1, swell[i] / SWELL)
        const b = Math.min(1, Math.max(0, (t - BRAND_FROM) / (1 - BRAND_FROM)))
        const path = new Path2D()
        addDot(path, restX[i] + offX[i], restY[i] + offY[i], size * (1 + swell[i]))
        context.fillStyle = rgba(mix(mix(muted, ink, t), brand, b * b * (3 - 2 * b)), REST_ALPHA + (1 - REST_ALPHA) * t)
        context.fill(path)
      }
    }
    /** Moves every dot toward its target; returns whether any spring is still settling. */
    const step = (dt: number) => {
      let moving = false
      const maxPush = push * reach * 0.22
      for (let i = 0; i < count; i++) {
        let tx = 0, ty = 0, ts = 0
        if (pointer) {
          const dx = restX[i] - pointer.x, dy = restY[i] - pointer.y, d2 = dx * dx + dy * dy
          if (d2 < reach * reach) {
            const d = Math.sqrt(d2), q = d / reach, fall = (1 - q) * (1 - q)
            ts = fall * SWELL
            if (d > 0.001) { const m = (maxPush * 6.75 * q * fall) / d; tx = dx * m; ty = dy * m }
          }
        }
        if (reduced) { offX[i] = 0; offY[i] = 0; swell[i] = ts; continue }
        if (!ts && !offX[i] && !offY[i] && !swell[i] && !velX[i] && !velY[i] && !velS[i]) continue
        for (let left = dt; left > 0; left -= STEP) {
          const h = Math.min(STEP, left)
          velX[i] += (STIFFNESS * (tx - offX[i]) - DAMPING * velX[i]) * h; offX[i] += velX[i] * h
          velY[i] += (STIFFNESS * (ty - offY[i]) - DAMPING * velY[i]) * h; offY[i] += velY[i] * h
          velS[i] += (STIFFNESS * (ts - swell[i]) - DAMPING * velS[i]) * h; swell[i] += velS[i] * h
        }
        const settled = Math.abs(velX[i]) + Math.abs(velY[i]) + Math.abs(velS[i]) < 0.02 && Math.abs(tx - offX[i]) + Math.abs(ty - offY[i]) + Math.abs(ts - swell[i]) < 0.01
        if (settled) { offX[i] = tx; offY[i] = ty; swell[i] = ts; velX[i] = velY[i] = velS[i] = 0 } else moving = true
      }
      return moving
    }
    const tick = (now: number) => {
      frame = 0
      const moving = step(Math.min(MAX_DT, (now - last) / 1000))
      last = now
      const ambientOn = ambient && !reduced && onScreen && visible
      if (moving || !ambientOn || now - lastDraw >= 32) { draw(now); lastDraw = now }
      if (moving || ambientOn) frame = requestAnimationFrame(tick)
    }
    const wake = () => {
      if (frame || reduced || !count) return
      last = performance.now()
      frame = requestAnimationFrame(tick)
    }
    const update = () => { if (reduced) { step(0); draw(performance.now()) } else wake() }
    const layout = () => {
      width = root.clientWidth
      height = root.clientHeight
      dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      const cell = Math.max(spacing, Math.sqrt((width * height) / MAX_DOTS))
      const cols = width > 0 ? Math.max(1, Math.floor(width / cell)) : 0
      const rows = height > 0 ? Math.max(1, Math.floor(height / cell)) : 0
      count = cols * rows
      const make = () => new Float32Array(count)
      restX = make(); restY = make(); offX = make(); offY = make(); velX = make(); velY = make(); swell = make(); velS = make()
      const left = (width - (cols - 1) * cell) / 2, top = (height - (rows - 1) * cell) / 2
      for (let i = 0; i < count; i++) { restX[i] = left + (i % cols) * cell; restY[i] = top + Math.floor(i / cols) * cell }
      if (reduced) step(0)
      draw(performance.now())
      wake()
    }
    const repaint = () => { readColors(); if (!frame) draw(performance.now()) }
    const move = (event: PointerEvent) => {
      const box = root.getBoundingClientRect()
      pointer = { x: event.clientX - box.left, y: event.clientY - box.top }
      update()
    }
    const release = () => { pointer = null; update() }
    const lift = (event: PointerEvent) => { if (event.pointerType !== "mouse") release() }
    const changeMotion = () => {
      reduced = motion.matches
      cancelAnimationFrame(frame)
      frame = 0
      for (const array of [offX, offY, velX, velY, swell, velS]) array.fill(0)
      update()
    }
    const changeVisibility = () => { visible = document.visibilityState === "visible"; wake() }

    readColors()
    const resizer = new ResizeObserver(layout)
    const viewport = new IntersectionObserver(entries => { onScreen = entries.some(entry => entry.isIntersecting); wake() })
    const theme = new MutationObserver(repaint)
    resizer.observe(root)
    viewport.observe(root)
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    scheme.addEventListener("change", repaint)
    motion.addEventListener("change", changeMotion)
    document.addEventListener("visibilitychange", changeVisibility)
    root.addEventListener("pointermove", move)
    root.addEventListener("pointerdown", move)
    root.addEventListener("pointerup", lift)
    root.addEventListener("pointerleave", release)
    root.addEventListener("pointercancel", release)
    return () => {
      cancelAnimationFrame(frame)
      resizer.disconnect()
      viewport.disconnect()
      theme.disconnect()
      scheme.removeEventListener("change", repaint)
      motion.removeEventListener("change", changeMotion)
      document.removeEventListener("visibilitychange", changeVisibility)
      root.removeEventListener("pointermove", move)
      root.removeEventListener("pointerdown", move)
      root.removeEventListener("pointerup", lift)
      root.removeEventListener("pointerleave", release)
      root.removeEventListener("pointercancel", release)
    }
  }, [spacing, size, reach, push, round, ambient])

  return <div ref={rootRef} {...props} className={cn("wlkr-dot-field", className)}>
    <style>{styles}</style>
    <canvas ref={canvasRef} className="wlkr-dot-field-canvas" aria-hidden="true" />
    <div className="wlkr-dot-field-content">{children}</div>
  </div>
}
