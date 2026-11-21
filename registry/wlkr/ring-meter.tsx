"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type RingMeterProps = Omit<React.ComponentPropsWithoutRef<"div">, "children"> & {
  value: number
  min?: number
  max?: number
  /** Number of ticks round the ring. */
  segments?: number
  /** Outer diameter in px. */
  size?: number
  /** Tick length in px. */
  thickness?: number
  /** Small caps line under the number. */
  label?: string
  /** Formats the centre number. */
  format?: (value: number) => string
  /** Replaces the centre content. */
  children?: React.ReactNode
}

const STEP_MS = 16

const styles = `
.wlkr-ring-meter{position:relative;display:inline-grid;place-items:center;flex:none;max-width:100%;color:var(--foreground,currentColor)}
.wlkr-ring-meter-svg{display:block;width:100%;height:100%;overflow:visible}
.wlkr-ring-meter-tick{fill:var(--foreground,currentColor);opacity:.14;transition:fill 0s steps(1,end),opacity 0s steps(1,end);transition-delay:var(--wlkr-ring-meter-delay,0ms)}
.wlkr-ring-meter-tick[data-state=on]{opacity:1}
.wlkr-ring-meter-tick[data-state=lead]{opacity:1;fill:var(--brand,#33f282)}
.wlkr-ring-meter-centre{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.25em;text-align:center;pointer-events:none}
.wlkr-ring-meter-value{font-family:var(--font-mono,ui-monospace,monospace);font-variant-numeric:tabular-nums;font-weight:500;line-height:1;letter-spacing:-.02em}
.wlkr-ring-meter-label{font-family:var(--font-mono,ui-monospace,monospace);font-size:10px;line-height:1;letter-spacing:.08em;text-transform:uppercase;color:var(--muted-foreground,#6b6b6b)}
@media(prefers-reduced-motion:reduce){.wlkr-ring-meter-tick{transition:none}}
`

const round2 = (n: number) => Math.round(n * 100) / 100

function countOn(value: number, min: number, max: number, segments: number) {
  const span = max - min
  if (!(span > 0)) return 0
  const t = Math.min(1, Math.max(0, (value - min) / span))
  return Math.round(t * segments)
}

/** A ring of square ticks. Each change ticks round one segment at a time. */
export function RingMeter({
  value,
  min = 0,
  max = 100,
  segments = 40,
  size = 140,
  thickness = 12,
  label,
  format,
  children,
  className,
  style,
  ...props
}: RingMeterProps) {
  const count = Math.max(1, Math.floor(segments))
  const safeValue = Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min
  const on = countOn(safeValue, min, max, count)

  // Remember where the fill was so the change starts ticking from there.
  const [prev, setPrev] = React.useState({ on, from: on })
  if (prev.on !== on) setPrev({ on, from: prev.on })
  const from = prev.on !== on ? prev.on : prev.from

  const c = size / 2
  const tick = Math.min(thickness, c)
  const inner = c - tick
  const width = round2(Math.max(1, Math.min(tick, ((2 * Math.PI * Math.max(inner, 1)) / count) * 0.55)))
  const x = round2(c - width / 2)

  const text = format
    ? format(safeValue)
    : min === 0 && max === 100
      ? `${Math.round(safeValue)}%`
      : String(Math.round(safeValue))

  const ticks = []
  for (let i = 0; i < count; i++) {
    const state = i < on - 1 ? "on" : i === on - 1 ? "lead" : "off"
    const order = on >= from ? i - from : from - 1 - i
    const delay = Math.max(0, order) * STEP_MS
    ticks.push(
      <rect
        key={i}
        className="wlkr-ring-meter-tick"
        data-state={state}
        x={x}
        y={0}
        width={width}
        height={round2(tick)}
        transform={`rotate(${round2((i / count) * 360)} ${round2(c)} ${round2(c)})`}
        style={{ "--wlkr-ring-meter-delay": `${delay}ms` } as React.CSSProperties}
      />,
    )
  }

  return (
    <div
      {...props}
      role="meter"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={safeValue}
      aria-valuetext={text}
      aria-label={props["aria-label"] ?? label ?? "Meter"}
      className={cn("wlkr-ring-meter", className)}
      style={{ width: size, height: size, ...style }}
    >
      <style>{styles}</style>
      <svg className="wlkr-ring-meter-svg" viewBox={`0 0 ${round2(size)} ${round2(size)}`} aria-hidden="true">
        {ticks}
      </svg>
      <div className="wlkr-ring-meter-centre" aria-hidden="true">
        {children ?? (
          <>
            <span className="wlkr-ring-meter-value" style={{ fontSize: round2(Math.max(12, inner * 0.5)) }}>{text}</span>
            {label && <span className="wlkr-ring-meter-label">{label}</span>}
          </>
        )}
      </div>
    </div>
  )
}
