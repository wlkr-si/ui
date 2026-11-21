"use client"

import * as React from "react"

type Tone = "ink" | "brand"

export type SegmentDisplayProps = Omit<React.ComponentPropsWithoutRef<"svg">, "children"> & {
  value: string | number
  /** Glyph height in px. Width follows. */
  height?: number
  tone?: Tone
  /** Show unlit segments as a faint ghost. */
  ghost?: boolean
  /** Left-pad with blank glyphs to this many characters. */
  pad?: number
  /** Accessible text. Defaults to the value. */
  label?: string
  /** Blink ":" cells once a second. */
  blink?: boolean
}

export type SegmentClockProps = Omit<SegmentDisplayProps, "value" | "blink" | "pad"> & {
  seconds?: boolean
  hour12?: boolean
}

// Glyph grid in viewBox units: 24 wide, 40 tall, 4 thick segments.
const GH = 40
const GW = 24
const GAP = 6
const NARROW = 4
const SEGMENTS: [number, number, number, number][] = [
  [5, 0, 14, 4], // a
  [20, 5, 4, 13], // b
  [20, 22, 4, 13], // c
  [5, 36, 14, 4], // d
  [0, 22, 4, 13], // e
  [0, 5, 4, 13], // f
  [5, 18, 14, 4], // g
]

const GLYPHS: Record<string, string> = {
  "0": "abcdef", "1": "bc", "2": "abdeg", "3": "abcdg", "4": "bcfg", "5": "acdfg", "6": "acdefg", "7": "abc", "8": "abcdefg", "9": "abcdfg",
  "-": "g", " ": "", A: "abcefg", b: "cdefg", C: "adef", d: "bcdeg", E: "adefg", F: "aefg", H: "bcefg", L: "def", P: "abefg", U: "bcdef", o: "cdeg", r: "eg", n: "ceg",
}

function segmentsFor(char: string): string {
  if (char in GLYPHS) return GLYPHS[char]
  const upper = char.toUpperCase()
  if (upper in GLYPHS) return GLYPHS[upper]
  const lower = char.toLowerCase()
  return GLYPHS[lower] ?? ""
}

const styles = `
.wlkr-segment-display{display:inline-block;max-width:100%;height:auto;vertical-align:middle;color:var(--foreground,currentColor);overflow:visible}
.wlkr-segment-display[data-tone=brand]{color:var(--brand,#33f282)}
.wlkr-segment-display-seg{fill:currentColor;opacity:0;transition:opacity 80ms steps(2,end)}
.wlkr-segment-display[data-ghost] .wlkr-segment-display-seg{fill:var(--foreground,currentColor);opacity:.1}
.wlkr-segment-display .wlkr-segment-display-seg[data-on]{fill:currentColor;opacity:1}
@keyframes wlkr-segment-display-blink{0%,49.9%{opacity:1}50%,100%{opacity:.1}}
.wlkr-segment-display[data-blink] .wlkr-segment-display-colon{animation:wlkr-segment-display-blink 1s steps(1,end) infinite}
@media(prefers-reduced-motion:reduce){
.wlkr-segment-display-seg{transition:none}
.wlkr-segment-display[data-blink] .wlkr-segment-display-colon{animation:none}
}
`

/** A seven-segment readout. One square-ended glyph per character. */
export function SegmentDisplay({ value, height = 48, tone = "ink", ghost = true, pad, label, blink = false, className, ...props }: SegmentDisplayProps) {
  const raw = String(value)
  const text = pad && pad > raw.length ? raw.padStart(pad, " ") : raw
  const chars = Array.from(text)
  const cells: React.ReactNode[] = []
  let x = 0
  chars.forEach((char, i) => {
    if (char === ":" || char === ".") {
      const dots = char === ":" ? [12, 24] : [36]
      cells.push(
        <g key={i} className={char === ":" ? "wlkr-segment-display-colon" : undefined}>
          {dots.map(y => <rect key={y} className="wlkr-segment-display-seg" data-on="" x={x} y={y} width={NARROW} height={NARROW} />)}
        </g>,
      )
      x += NARROW + GAP
      return
    }
    const lit = segmentsFor(char)
    cells.push(
      <g key={i}>
        {SEGMENTS.map(([sx, sy, w, h], s) => (
          <rect key={s} className="wlkr-segment-display-seg" data-on={lit.includes("abcdefg"[s]) ? "" : undefined} x={x + sx} y={sy} width={w} height={h} />
        ))}
      </g>,
    )
    x += GW + GAP
  })
  const units = Math.max(x - GAP, 1)
  const h = Math.max(1, Math.round(height))
  const width = Math.round((units * h) / GH)
  return (
    <svg
      {...props}
      role="img"
      aria-label={label ?? raw}
      className={className ? `wlkr-segment-display ${className}` : "wlkr-segment-display"}
      data-tone={tone === "brand" ? "brand" : "ink"}
      data-ghost={ghost ? "" : undefined}
      data-blink={blink ? "" : undefined}
      viewBox={`0 0 ${units} ${GH}`}
      width={width}
      height={h}
      shapeRendering="crispEdges"
    >
      <style>{styles}</style>
      {cells}
    </svg>
  )
}

const two = (n: number) => String(n).padStart(2, "0")

function formatTime(date: Date, seconds: boolean, hour12: boolean): string {
  const hours = date.getHours()
  const hh = hour12 ? String(hours % 12 || 12).padStart(2, " ") : two(hours)
  const base = `${hh}:${two(date.getMinutes())}`
  return seconds ? `${base}:${two(date.getSeconds())}` : base
}

const cache = new Map<string, { second: number; value: string }>()

function subscribe(onTick: () => void) {
  const id = window.setInterval(onTick, 1000)
  return () => window.clearInterval(id)
}

/** The current time on a segment display. The colon blinks in steps. */
export function SegmentClock({ seconds = true, hour12 = false, label, ...props }: SegmentClockProps) {
  const getSnapshot = React.useCallback(() => {
    const now = Date.now()
    const second = Math.floor(now / 1000)
    const key = `${seconds ? 1 : 0}${hour12 ? 1 : 0}`
    const hit = cache.get(key)
    if (hit && hit.second === second) return hit.value
    const value = formatTime(new Date(now), seconds, hour12)
    cache.set(key, { second, value })
    return value
  }, [seconds, hour12])
  const getServerSnapshot = React.useCallback(() => (seconds ? "--:--:--" : "--:--"), [seconds])
  const time = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return <SegmentDisplay {...props} value={time} blink label={label ?? (time.includes("-") ? "Clock" : time.trim())} />
}
