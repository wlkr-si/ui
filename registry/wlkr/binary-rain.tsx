"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type BinaryRainProps = {
  /** Size of one glyph cell in CSS pixels. */
  cellSize?: number
  /** Ticks per second. Each tick moves every head down one cell. */
  speed?: number
  /** Share of columns that are raining, 0–1. */
  density?: number
  /** Cells of fading ink behind each head. */
  trail?: number
  /** Seed for the pattern; the same seed gives the same rain. */
  seed?: number
  /** Holds the current frame. */
  paused?: boolean
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

type Column = { active: boolean; head: number; glyphs: Uint8Array }

const styles = `
.wlkr-binary-rain{position:relative;overflow:hidden;color:var(--foreground,currentColor);background:var(--background,#fff)}
.wlkr-binary-rain-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none}
.wlkr-binary-rain-content{position:relative;min-width:0;height:100%}
`
/** Ordered opacity steps for the trail, nearest the head first. */
const LEVELS = [0.78, 0.5, 0.3, 0.14]
const FLIP_CHANCE = 0.02

const clamp = (value: number, min: number, max: number, fallback: number) =>
  Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Falling columns of 0s and 1s, stepped one cell per tick, with a green head and an ordered fade. */
export function BinaryRain({ cellSize = 14, speed = 14, density = 0.6, trail = 10, seed = 1, paused = false, className, style, children }: BinaryRainProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!root || !canvas || !ctx) return

    const cell = Math.round(clamp(cellSize, 6, 64, 14))
    const tickMs = 1000 / clamp(speed, 1, 60, 14)
    const share = clamp(density, 0, 1, 0.6)
    const tail = Math.round(clamp(trail, 1, 64, 10))
    const rand = mulberry32(Math.floor(seed) || 1)
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    let columns: Column[] = []
    let rows = 0
    let width = 0
    let height = 0
    let raf = 0
    let last = 0
    let acc = 0
    let inView = true

    const spawn = (col: Column, initial: boolean) => {
      col.active = rand() < share
      col.head = initial ? Math.floor(rand() * (rows + tail)) - tail : -Math.floor(rand() * rows)
      for (let i = 0; i < col.glyphs.length; i++) col.glyphs[i] = rand() < 0.5 ? 0 : 1
    }

    const layout = () => {
      const rect = root.getBoundingClientRect()
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      width = rect.width
      height = rect.height
      canvas.width = Math.max(1, Math.round(width * dpr))
      canvas.height = Math.max(1, Math.round(height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      rows = Math.ceil(height / cell)
      const count = Math.ceil(width / cell)
      columns = Array.from({ length: count }, () => {
        const col: Column = { active: false, head: 0, glyphs: new Uint8Array(rows) }
        spawn(col, true)
        return col
      })
    }

    const step = () => {
      for (const col of columns) {
        col.head++
        if (col.head - tail > rows) spawn(col, false)
        if (rand() < FLIP_CHANCE * 4) {
          const i = Math.floor(rand() * rows)
          col.glyphs[i] ^= 1
        }
      }
    }

    const draw = () => {
      const computed = getComputedStyle(root)
      const ink = computed.getPropertyValue("--foreground").trim() || computed.color || "#000"
      const brand = computed.getPropertyValue("--brand").trim() || "#33f282"
      const mono = computed.getPropertyValue("--font-mono").trim() || "ui-monospace, monospace"
      ctx.clearRect(0, 0, width, height)
      ctx.font = `${Math.round(cell * 0.82)}px ${mono}`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      const half = cell / 2
      for (let level = -1; level < LEVELS.length; level++) {
        ctx.globalAlpha = level < 0 ? 1 : LEVELS[level]
        ctx.fillStyle = level < 0 ? brand : ink
        for (let c = 0; c < columns.length; c++) {
          const col = columns[c]
          if (!col.active) continue
          for (let k = 0; k <= tail; k++) {
            const bucket = k === 0 ? -1 : Math.min(LEVELS.length - 1, Math.floor(((k - 1) / tail) * LEVELS.length))
            if (bucket !== level) continue
            const row = col.head - k
            if (row < 0 || row >= rows) continue
            ctx.fillText(col.glyphs[row] ? "1" : "0", c * cell + half, row * cell + half)
          }
        }
      }
      ctx.globalAlpha = 1
    }

    const running = () => !paused && !reduced && inView && !document.hidden

    const frame = (now: number) => {
      raf = 0
      if (!running()) return
      acc += Math.min(now - last, 250)
      last = now
      if (acc >= tickMs) {
        while (acc >= tickMs) { step(); acc -= tickMs }
        draw()
      }
      raf = requestAnimationFrame(frame)
    }

    const sync = () => {
      if (running() && !raf) {
        last = performance.now()
        raf = requestAnimationFrame(frame)
      } else if (!running() && raf) {
        cancelAnimationFrame(raf)
        raf = 0
      }
    }

    layout()
    draw()

    const resize = new ResizeObserver(() => { layout(); draw() })
    resize.observe(root)
    const visible = new IntersectionObserver(entries => {
      inView = entries.some(entry => entry.isIntersecting)
      sync()
    })
    visible.observe(root)
    document.addEventListener("visibilitychange", sync)
    sync()

    return () => {
      if (raf) cancelAnimationFrame(raf)
      resize.disconnect()
      visible.disconnect()
      document.removeEventListener("visibilitychange", sync)
    }
  }, [cellSize, speed, density, trail, seed, paused])

  return (
    <div ref={rootRef} className={cn("wlkr-binary-rain", className)} style={style}>
      <style>{styles}</style>
      <canvas ref={canvasRef} className="wlkr-binary-rain-canvas" aria-hidden="true" />
      <div className="wlkr-binary-rain-content">{children}</div>
    </div>
  )
}
