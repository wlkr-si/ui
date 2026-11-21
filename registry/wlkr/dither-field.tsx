"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type DitherFieldProps = Omit<React.ComponentProps<"div">, "children" | "ref"> & {
  children?: React.ReactNode
  /** The soft field behind the dither: drifting waves, orbiting glows, scrolling noise or a breathing gradient. */
  pattern?: "waves" | "orbit" | "noise" | "linear"
  /** CSS pixels per dither pixel, 2–16. Grows on very large areas to stay under ~120,000 pixels. */
  cell?: number
  /** Animation rate, 0–4. 0 holds a still frame. */
  speed?: number
  /** Overall amount of ink, 0–1. */
  density?: number
  /** How hard the field separates into ink and paper, 0–1. */
  contrast?: number
  /** Ordered-dither (Bayer) matrix size. */
  matrix?: 2 | 4 | 8
  /** The brightest region tints a small share of its pixels with the brand green. */
  accent?: boolean
  /** The pointer adds a soft bright spot the pattern dithers around. */
  interactive?: boolean
  /** Thins pixels out toward an edge, through the dither itself. */
  fade?: "none" | "bottom" | "edges"
  /** Strength of the ink, 0.05–1, so content on top stays readable. */
  opacity?: number
}

type Rgb = [number, number, number]

const styles = `
.wlkr-dither-field{position:relative;display:grid;overflow:hidden;touch-action:pan-y}
.wlkr-dither-field-canvas{position:absolute;left:0;top:0;display:block;pointer-events:none;image-rendering:crisp-edges;image-rendering:pixelated}
.wlkr-dither-field-content{position:relative;min-width:0}
`
const MAX_PIXELS = 120000
const FRAME_MS = 50
const MAX_DT = 0.1
const SPOT_RADIUS = 80
const ACCENT_FROM = 0.82

const clamp = (value: number | undefined, min: number, max: number, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback
const hash = (x: number, y: number) => {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}
const smoothNoise = (x: number, y: number) => {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy)
  const a = hash(ix, iy), b = hash(ix + 1, iy), c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1)
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy
}

/** Bayer thresholds in 0–1 for an n×n ordered-dither matrix. */
function bayer(n: number) {
  let m = [0]
  for (let size = 1; size < n; size *= 2) {
    const next: number[] = []
    for (let y = 0; y < size * 2; y++) for (let x = 0; x < size * 2; x++) {
      const v = m[(y % size) * size + (x % size)] * 4
      next.push(v + [[0, 2], [3, 1]][y < size ? 0 : 1][x < size ? 0 : 1])
    }
    m = next
  }
  return Float32Array.from(m, v => (v + 0.5) / (n * n))
}

function toRgb(probe: CanvasRenderingContext2D, value: string): Rgb {
  probe.clearRect(0, 0, 1, 1)
  probe.fillStyle = "#000"
  probe.fillStyle = value
  probe.fillRect(0, 0, 1, 1)
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data
  return [r, g, b]
}

/** A one-bit background: a slow, soft field of light rendered through an ordered dither, with children on top. */
export function DitherField({ children, pattern = "waves", cell, speed, density, contrast, matrix, accent = false, interactive = true, fade = "none", opacity, className, ...props }: DitherFieldProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const pixel = clamp(cell, 2, 16, 4)
  const rate = clamp(speed, 0, 4, 1)
  const ink = clamp(density, 0, 1, 0.35)
  const gain = 0.4 + clamp(contrast, 0, 1, 0.6) * 1.4
  const order = matrix === 2 || matrix === 8 ? matrix : 4
  const strength = clamp(opacity, 0.05, 1, 0.5)

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
    const thresholds = bayer(order)
    const little = new Uint8Array(new Uint32Array([1]).buffer)[0] === 1
    let reduced = motion.matches
    let onScreen = true
    let visible = document.visibilityState === "visible"
    let width = 0, height = 0, size = pixel, cols = 0, rows = 0, frame = 0, last = 0, lastDraw = 0, time = 0
    let image: ImageData | null = null
    let words = new Uint32Array(0)
    let pointer: { x: number; y: number } | null = null
    let inkWord = 0, brandWord = 0

    const pack = ([r, g, b]: Rgb) => (little ? ((255 << 24) | (b << 16) | (g << 8) | r) : ((r << 24) | (g << 16) | (b << 8) | 255)) >>> 0
    const readColors = () => {
      const style = getComputedStyle(root)
      inkWord = pack(toRgb(probe, style.getPropertyValue("--foreground").trim() || style.color))
      brandWord = pack(toRgb(probe, style.getPropertyValue("--brand").trim() || "#33f282"))
    }
    const draw = () => {
      if (!image) return
      const t = time
      const angle = 0.6 + t * 0.07, cos = Math.cos(angle), sin = Math.sin(angle)
      const reach = Math.max(1, Math.abs(width * cos) + Math.abs(height * sin)) / 2
      const breathe = 0.8 + 0.2 * Math.sin(t * 0.5)
      const blobR = Math.max(40, Math.min(width, height) * 0.5)
      const ax = width * (0.5 + 0.32 * Math.sin(t * 0.31)), ay = height * (0.5 + 0.3 * Math.sin(t * 0.47 + 1))
      const bx = width * (0.5 + 0.36 * Math.sin(t * 0.23 + 2.1)), by = height * (0.5 + 0.32 * Math.cos(t * 0.37))
      for (let y = 0; y < rows; y++) {
        const Y = (y + 0.5) * size, v = (y + 0.5) / rows
        const edgeY = fade === "bottom" ? Math.min(1, (1 - v) / 0.65) : fade === "edges" ? Math.min(1, Math.min(v, 1 - v) / 0.3) : 1
        for (let x = 0; x < cols; x++) {
          const X = (x + 0.5) * size, u = (x + 0.5) / cols
          let field: number
          if (pattern === "orbit") {
            const da = ((X - ax) ** 2 + (Y - ay) ** 2) / (blobR * blobR), db = ((X - bx) ** 2 + (Y - by) ** 2) / (blobR * blobR * 0.5)
            field = 0.12 + 0.8 * (Math.exp(-da) + 0.7 * Math.exp(-db))
          } else if (pattern === "noise") {
            field = 0.68 * smoothNoise(X / 120 + t * 0.22, Y / 120 + t * 0.08) + 0.32 * smoothNoise(X / 48 - t * 0.14, Y / 48 + 7.3)
          } else if (pattern === "linear") {
            field = 0.5 + 0.45 * breathe * (((X - width / 2) * cos + (Y - height / 2) * sin) / reach) + 0.05 * Math.sin(t * 0.7)
          } else {
            field = 0.5 + (Math.sin(X / 70 + Y / 210 + t * 0.5) + 0.8 * Math.sin(Y / 55 - X / 160 - t * 0.35) + 0.6 * Math.sin((X + Y) / 120 + t * 0.2)) / 4.8
          }
          let value = (field - 0.5) * gain + ink
          if (pointer) value += 0.4 * Math.exp(-((X - pointer.x) ** 2 + (Y - pointer.y) ** 2) / (SPOT_RADIUS * SPOT_RADIUS))
          if (fade === "edges") value *= Math.min(edgeY, Math.min(1, Math.min(u, 1 - u) / 0.22))
          else value *= edgeY
          const i = y * cols + x
          if (value <= thresholds[(y % order) * order + (x % order)]) { words[i] = 0; continue }
          words[i] = accent && value > ACCENT_FROM && hash(x, y) < Math.min(0.18, (value - ACCENT_FROM) * 0.9) ? brandWord : inkWord
        }
      }
      context.putImageData(image, 0, 0)
    }
    const animating = () => rate > 0 && !reduced && onScreen && visible
    const tick = (now: number) => {
      frame = 0
      const running = animating()
      if (running) time += Math.min(MAX_DT, (now - last) / 1000) * rate
      last = now
      if (!running || now - lastDraw >= FRAME_MS) { draw(); lastDraw = now }
      if (running) frame = requestAnimationFrame(tick)
    }
    const schedule = () => {
      if (frame || !cols) return
      last = performance.now()
      frame = requestAnimationFrame(tick)
    }
    const layout = () => {
      width = root.clientWidth
      height = root.clientHeight
      size = Math.max(pixel, Math.sqrt((width * height) / MAX_PIXELS))
      cols = width > 0 ? Math.ceil(width / size) : 0
      rows = height > 0 ? Math.ceil(height / size) : 0
      canvas.width = Math.max(1, cols)
      canvas.height = Math.max(1, rows)
      canvas.style.width = `${cols * size}px`
      canvas.style.height = `${rows * size}px`
      image = cols && rows ? context.createImageData(cols, rows) : null
      words = image ? new Uint32Array(image.data.buffer) : new Uint32Array(0)
      draw()
      schedule()
    }
    const repaint = () => { readColors(); if (!frame) draw() }
    const move = (event: PointerEvent) => {
      if (!interactive) return
      const box = root.getBoundingClientRect()
      pointer = { x: event.clientX - box.left, y: event.clientY - box.top }
      schedule()
    }
    const release = () => { if (!pointer) return; pointer = null; schedule() }
    const lift = (event: PointerEvent) => { if (event.pointerType !== "mouse") release() }
    const changeMotion = () => { reduced = motion.matches; if (reduced) time = 0; schedule() }
    const changeVisibility = () => { visible = document.visibilityState === "visible"; schedule() }

    readColors()
    const resizer = new ResizeObserver(layout)
    const viewport = new IntersectionObserver(entries => { onScreen = entries.some(entry => entry.isIntersecting); schedule() })
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
  }, [pattern, pixel, rate, ink, gain, order, accent, interactive, fade])

  return <div ref={rootRef} {...props} className={cn("wlkr-dither-field", className)}>
    <style>{styles}</style>
    <canvas ref={canvasRef} className="wlkr-dither-field-canvas" style={{ opacity: strength }} aria-hidden="true" />
    <div className="wlkr-dither-field-content">{children}</div>
  </div>
}
