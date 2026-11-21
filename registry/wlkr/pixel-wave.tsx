"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type PixelWaveProps = Omit<React.ComponentPropsWithoutRef<"span">, "children" | "role" | "aria-label" | "aria-hidden"> & {
  /** `false` is the idle state: a low, slow breathing line. */
  active?: boolean
  /** Live audio to meter while active. The component never asks for the microphone itself. */
  stream?: MediaStream | null
  /** 0–1. An overall level you compute yourself; it scales the simulated motion. */
  level?: number
  /** Number of bars, 4–96. */
  bars?: number
  /** Cells per bar, 3–24. */
  rows?: number
  /** Cell size in CSS pixels, 2–16. */
  cell?: number
  /** Space between cells in CSS pixels, 0–8. */
  gap?: number
  /** Bars grow up and down from a centre line. `false` grows up from the bottom. */
  mirror?: boolean
  /** "ink" marks the tallest bar's top cell in brand green; "brand" lights every cell green. */
  tone?: "ink" | "brand"
  /** Accessible name, e.g. "Listening". Without it the wave is decorative. */
  label?: string
}

const styles = `
.wlkr-pixel-wave{display:inline-block;max-width:100%;vertical-align:middle;line-height:0;color:var(--foreground,currentColor)}
.wlkr-pixel-wave-grid{display:block;max-width:100%;height:auto;overflow:visible}
.wlkr-pixel-wave-off{fill:var(--border,#dedede);opacity:.7}
.dark .wlkr-pixel-wave-off{opacity:1}
.wlkr-pixel-wave-ink{fill:currentColor}
.wlkr-pixel-wave-brand{fill:var(--brand,#33f282)}
`

const reduceQuery = "(prefers-reduced-motion: reduce)"
const FRAME = 33
const clamp = (input: unknown, min: number, max: number, fallback: number) => {
  const number = Number(input)
  return input === "" || input === null || !Number.isFinite(number) ? fallback : Math.min(max, Math.max(min, number))
}
const subscribeMotion = (notify: () => void) => {
  const media = window.matchMedia(reduceQuery)
  media.addEventListener("change", notify)
  return () => media.removeEventListener("change", notify)
}

/** Speech-like height for bar `index` at `time` seconds: a few sines per bar under a centre-weighted envelope. */
function speech(index: number, bars: number, time: number, energy: number) {
  const x = bars > 1 ? index / (bars - 1) : 0.5
  const centre = 0.3 + 0.7 * Math.sin(Math.PI * x)
  const voice = 0.5 + 0.28 * Math.sin(time * 7.3 + index * 1.7) + 0.14 * Math.sin(time * 12.9 + index * 2.9) + 0.08 * Math.sin(time * 3.1 + index * 0.6)
  const syllable = 0.55 + 0.45 * Math.abs(Math.sin(time * 4.6 - x * 2.2))
  return Math.min(1, Math.max(0, centre * voice * syllable * energy * 1.6))
}
/** Slow swells and rests, so the simulation reads as phrases. */
const phrase = (time: number) => Math.min(1, Math.max(0.08, (Math.sin(time * 0.9) * 0.6 + Math.sin(time * 2.3 + 1.3) * 0.4 + 0.7) / 1.2))
const idle = (index: number, time: number) => (Math.sin(time * 1.3 - index * 0.45) > 0.55 ? 1 : 0)
const REST_TIME = 1.7

/** A voice meter in pixels: bars of square cells that breathe when idle and move with speech when active. */
export function PixelWave({ active = true, stream = null, level, bars = 24, rows = 8, cell = 5, gap = 2, mirror = true, tone = "ink", label, className, ...props }: PixelWaveProps) {
  const barCount = Math.round(clamp(bars, 4, 96, 24))
  const rowCount = Math.round(clamp(rows, 3, 24, 8))
  const size = clamp(cell, 2, 16, 5)
  const space = clamp(gap, 0, 8, 2)
  const energy = level === undefined ? null : clamp(level, 0, 1, 0)
  const pitch = size + space
  const width = barCount * pitch - space
  const height = rowCount * pitch - space
  const reduced = React.useSyncExternalStore(subscribeMotion, () => window.matchMedia(reduceQuery).matches, () => false)
  const root = React.useRef<HTMLSpanElement>(null)
  const ink = React.useRef<SVGPathElement>(null)
  const brand = React.useRef<SVGPathElement>(null)
  const heights = React.useRef<number[]>([])
  const energyRef = React.useRef(energy)
  React.useEffect(() => { energyRef.current = energy })

  const step = mirror ? 2 : 1
  const floor = mirror ? 2 - (rowCount % 2) : 1
  /** Whole cells for a 0–1 height, keeping mirrored bars symmetric about the centre. */
  const toCells = React.useCallback((value: number) => Math.min(rowCount, floor + step * Math.round(Math.max(0, value * rowCount - floor) / step)), [rowCount, floor, step])
  const draw = React.useCallback((counts: number[]) => {
    let tallest = 0
    counts.forEach((count, index) => { if (count > counts[tallest]) tallest = index })
    let lit = ""
    let accent = ""
    counts.forEach((count, index) => {
      const top = mirror ? (rowCount - count) / 2 : rowCount - count
      for (let row = top; row < top + count; row++) {
        const path = `M${index * pitch} ${row * pitch}h${size}v${size}h-${size}z`
        if (tone === "brand" || (index === tallest && row === top && count > floor)) accent += path
        else lit += path
      }
    })
    return { lit, accent }
  }, [mirror, rowCount, pitch, size, tone, floor])

  const off = React.useMemo(() => {
    let path = ""
    for (let index = 0; index < barCount; index++) for (let row = 0; row < rowCount; row++) path += `M${index * pitch} ${row * pitch}h${size}v${size}h-${size}z`
    return path
  }, [barCount, rowCount, pitch, size])
  const restShape = (amount: number) => draw(Array.from({ length: barCount }, (_, index) => active ? toCells(speech(index, barCount, REST_TIME, amount)) : floor))
  const [initial] = React.useState(() => restShape(0.8))
  const shown = reduced ? restShape(energy ?? 0.8) : initial

  React.useEffect(() => {
    const element = root.current
    if (reduced || !element) return
    let raf = 0
    let last = -Infinity
    let inView = false
    let audio: AudioContext | null = null
    let source: MediaStreamAudioSourceNode | null = null
    let analyser: AnalyserNode | null = null
    let bins: Uint8Array<ArrayBuffer> | null = null
    let painted = ""
    if (heights.current.length !== barCount) heights.current = Array.from({ length: barCount }, () => floor / rowCount)
    if (active && stream && stream.getAudioTracks().length > 0) {
      try {
        audio = new AudioContext()
        source = audio.createMediaStreamSource(stream)
        analyser = audio.createAnalyser()
        analyser.fftSize = 256
        analyser.smoothingTimeConstant = 0.75
        source.connect(analyser)
        bins = new Uint8Array(analyser.frequencyBinCount)
        if (audio.state === "suspended") audio.resume().catch(() => {})
      } catch {
        audio = null
      }
    }
    const measured = (index: number) => {
      if (!analyser || !bins) return 0
      const distance = barCount > 1 ? Math.abs(index - (barCount - 1) / 2) / ((barCount - 1) / 2) : 0
      const low = Math.floor(Math.pow(48, distance))
      const high = Math.max(low + 1, Math.floor(Math.pow(48, distance + 2 / barCount)))
      let sum = 0
      for (let bin = low; bin < high; bin++) sum += bins[Math.min(bins.length - 1, bin)]
      return Math.min(1, Math.pow(sum / (high - low) / 255, 0.8) * (1.2 + distance))
    }
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const elapsed = now - last
      if (elapsed < FRAME) return
      last = now
      const time = now / 1000
      const live = audio?.state === "running" && analyser !== null && bins !== null
      if (live) analyser?.getByteFrequencyData(bins as Uint8Array<ArrayBuffer>)
      const attack = 1 - Math.exp(-Math.min(elapsed, 100) / 40)
      const decay = 1 - Math.exp(-Math.min(elapsed, 100) / 180)
      const counts = heights.current.map((current, index) => {
        const target = !active ? (floor + idle(index, time * 0.6) * step) / rowCount : live ? measured(index) : speech(index, barCount, time, energyRef.current ?? phrase(time))
        const next = current + (target - current) * (target > current ? attack : decay)
        heights.current[index] = next
        return toCells(next)
      })
      const key = counts.join(",")
      if (key === painted) return
      painted = key
      const { lit, accent } = draw(counts)
      ink.current?.setAttribute("d", lit)
      brand.current?.setAttribute("d", accent)
    }
    const sync = () => {
      cancelAnimationFrame(raf)
      if (inView && document.visibilityState === "visible") { last = -Infinity; raf = requestAnimationFrame(tick) }
    }
    const observer = new IntersectionObserver(entries => { inView = entries.some(entry => entry.isIntersecting); sync() })
    observer.observe(element)
    document.addEventListener("visibilitychange", sync)
    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      document.removeEventListener("visibilitychange", sync)
      source?.disconnect()
      analyser?.disconnect()
      audio?.close().catch(() => {})
    }
  }, [reduced, active, stream, barCount, rowCount, floor, step, toCells, draw])

  return (
    <span {...props} ref={root} className={cn("wlkr-pixel-wave", className)} {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}>
      <style>{styles}</style>
      <svg className="wlkr-pixel-wave-grid" width={width} height={height} viewBox={`0 0 ${width} ${height}`} shapeRendering="crispEdges" aria-hidden="true" focusable="false">
        <path className="wlkr-pixel-wave-off" d={off} />
        <path ref={ink} className="wlkr-pixel-wave-ink" d={shown.lit} />
        <path ref={brand} className="wlkr-pixel-wave-brand" d={shown.accent} />
      </svg>
    </span>
  )
}
