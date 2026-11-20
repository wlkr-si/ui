"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type DotMatrixProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  text: string
  /** Visible dot columns. Defaults to the exact width of the text. */
  columns?: number
  /** Dot size and gap in px at full size; the display scales down to fit its container. */
  dotSize?: number
  gap?: number
  shape?: "square" | "round"
  /** "auto" scrolls only when the text is wider than `columns`. */
  scroll?: boolean | "auto"
  /** Columns per second. */
  speed?: number
  /** Accessible name. Defaults to `text`. */
  label?: string
}

const styles = `
.wlkr-dot-matrix{display:block;max-width:100%;line-height:0}
.wlkr-dot-matrix svg{display:block;max-width:100%;height:auto;overflow:hidden}
.wlkr-dot-matrix-unlit{fill:var(--muted-foreground,#696969);opacity:.22}
`

/** 5×7 glyphs, one base-32 digit per row (bit 4 is the left column). */
const CHARS = [..."0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ .,:;!?-+/'\"%&()#@=*<>_·"]
const ROWS = "ehjlphe4c4444eeh1248vv2421he26aiv22vgu11he68guhhev124888ehhehheehhf12cehhhvhhuhhuhhuehggghesihhhisvgguggvvggugggehgnhhfhhhvhhhe44444e72222ichikokihggggggvhrllhhhhhpljhhehhhhheuhhugggehhhliduhhukihfgge11uv444444hhhhhhehhhhha4hhhlllahha4ahhhhha444v1248gv000000000000cc0000c480cc0cc00cc0c484444404eh12404000v000044v44001248g0c480000aaa0000op248j3cik8lid24888428422248aavavaaeh1dlle00v0v0004lel40248g8428421248000000v000cc00"
const UNKNOWN = "00eae00"
const LOOP_GAP = 6
const MAX_LENGTH = 240

const clamp = (value: number, min: number, max: number, fallback: number) => Math.max(min, Math.min(max, Number.isFinite(value) ? value : fallback))

/** Column bitmasks (bit 0 is the top row) for the whole message, one blank column between glyphs. */
function rasterize(text: string) {
  const columns: number[] = []
  for (const character of [...text.toUpperCase()].slice(0, MAX_LENGTH)) {
    const index = CHARS.indexOf(character)
    const rows = index < 0 ? UNKNOWN : ROWS.slice(index * 7, index * 7 + 7)
    if (columns.length) columns.push(0)
    for (let x = 0; x < 5; x++) {
      let mask = 0
      for (let y = 0; y < 7; y++) if (parseInt(rows[y], 32) & (16 >> x)) mask |= 1 << y
      columns.push(mask)
    }
  }
  return columns
}

function subscribeMotion(onChange: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)")
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}
const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches

/** A train-platform dot-matrix display with a built-in 5×7 font. Scrolls a whole column at a time when the text does not fit. */
export function DotMatrix({ text, columns, dotSize = 4, gap = 2, shape = "square", scroll = "auto", speed = 14, label, className, ...props }: DotMatrixProps) {
  const root = React.useRef<HTMLDivElement>(null)
  const id = `wlkr-dot-matrix-${React.useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
  const message = typeof text === "string" ? text : ""
  const bitmap = React.useMemo(() => rasterize(message), [message])
  const width = Math.round(clamp(columns ?? bitmap.length, 5, 240, bitmap.length))
  const dot = clamp(dotSize, 1, 24, 4)
  const spacing = clamp(gap, 0, 24, 2)
  const rate = clamp(speed, 1, 60, 14)
  const pitch = dot + spacing
  const reduced = React.useSyncExternalStore(subscribeMotion, prefersReducedMotion, () => false)
  const scrolling = bitmap.length > 0 && (scroll === "auto" ? bitmap.length > width : scroll === true)
  const moving = scrolling && !reduced
  const period = width + bitmap.length + LOOP_GAP
  const key = `${message}|${width}`
  const [frame, setFrame] = React.useState({ key, step: width })
  const last = React.useRef({ key, step: width })
  const rateRef = React.useRef(rate)
  React.useEffect(() => { rateRef.current = rate }, [rate])

  React.useEffect(() => {
    if (!moving) return
    let step = last.current.key === key ? last.current.step : width
    let request = 0
    let previous = 0
    let carry = 0
    let intersecting = false
    function tick(time: number) {
      carry += (previous ? Math.min(time - previous, 100) : 0) / 1000 * rateRef.current
      previous = time
      const steps = Math.floor(carry)
      if (steps > 0) {
        carry -= steps
        step = (step + steps) % period
        last.current = { key, step }
        setFrame({ key, step })
      }
      request = requestAnimationFrame(tick)
    }
    function sync() {
      const active = intersecting && !document.hidden
      if (active && !request) request = requestAnimationFrame(tick)
      if (!active && request) { cancelAnimationFrame(request); request = 0; previous = 0 }
    }
    const observer = new IntersectionObserver(entries => { intersecting = entries[0]?.isIntersecting ?? false; sync() })
    if (root.current) observer.observe(root.current)
    document.addEventListener("visibilitychange", sync)
    return () => { cancelAnimationFrame(request); observer.disconnect(); document.removeEventListener("visibilitychange", sync) }
  }, [moving, key, period, width])

  const step = moving && frame.key === key ? frame.step : width
  const shift = moving ? width - step : 0
  let lit = ""
  for (let column = 0; column < width; column++) {
    const index = column - shift
    const mask = index >= 0 && index < bitmap.length ? bitmap[index] : 0
    if (!mask) continue
    const x = column * pitch
    for (let row = 0; row < 7; row++) {
      if (!(mask & (1 << row))) continue
      const y = row * pitch
      lit += shape === "round"
        ? `M${x} ${y + dot / 2}a${dot / 2} ${dot / 2} 0 1 0 ${dot} 0a${dot / 2} ${dot / 2} 0 1 0 ${-dot} 0`
        : `M${x} ${y}h${dot}v${dot}h${-dot}z`
    }
  }

  const svgWidth = width * pitch - spacing
  const svgHeight = 7 * pitch - spacing
  return (
    <div ref={root} className={cn("wlkr-dot-matrix", className)} data-motion={moving ? "scroll" : "static"} {...props}>
      <style>{styles}</style>
      <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} role="img" aria-label={label ?? (message.trim() || "Dot matrix display")}>
        <defs>
          <pattern id={id} width={pitch} height={pitch} patternUnits="userSpaceOnUse">
            {shape === "round" ? <circle className="wlkr-dot-matrix-unlit" cx={dot / 2} cy={dot / 2} r={dot / 2} /> : <rect className="wlkr-dot-matrix-unlit" width={dot} height={dot} />}
          </pattern>
        </defs>
        <rect width={svgWidth} height={svgHeight} fill={`url(#${id})`} />
        <path d={lit} fill="currentColor" />
      </svg>
    </div>
  )
}
