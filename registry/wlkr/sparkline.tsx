"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type SparklinePoint = { index: number; value: number }

export type SparklineProps = Omit<React.ComponentPropsWithoutRef<"span">, "children"> & {
  data: number[]
  width?: number
  height?: number
  /** Ordered-dither area under the line. */
  fill?: boolean
  /** Lower bound of the y scale. Defaults to the smallest value. */
  min?: number
  /** Upper bound of the y scale. Defaults to the largest value. */
  max?: number
  /** Name read before the summary, e.g. "Requests". */
  label?: string
  /** Called with the nearest point while scrubbing, and null when it ends. */
  onScrub?: (point: SparklinePoint | null) => void
  /** Draw the line in on mount. */
  animate?: boolean
}

const PAD = 3

const styles = `
.wlkr-sparkline{display:inline-block;max-width:100%;line-height:0;vertical-align:middle;color:var(--foreground,currentColor)}
.wlkr-sparkline-svg{display:block;max-width:100%;height:auto;overflow:visible;border-radius:0;touch-action:pan-y;cursor:crosshair}
.wlkr-sparkline-svg:focus{outline:none}
.wlkr-sparkline-svg:focus-visible{outline:2px solid var(--brand,#33f282);outline-offset:2px}
.wlkr-sparkline-line{fill:none;stroke:var(--foreground,currentColor);stroke-width:1.5px;stroke-linecap:square;stroke-linejoin:miter}
.wlkr-sparkline-dot{fill:var(--foreground,currentColor);opacity:.32}
.wlkr-sparkline-hair{stroke:var(--muted-foreground,#6b6b6b);stroke-width:1px}
.wlkr-sparkline-mark{fill:var(--brand,#33f282)}
@keyframes wlkr-sparkline-draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
@keyframes wlkr-sparkline-show{from{opacity:0}to{opacity:1}}
@media(prefers-reduced-motion:no-preference){
.wlkr-sparkline[data-animate] .wlkr-sparkline-line{stroke-dasharray:1;stroke-dashoffset:0;animation:wlkr-sparkline-draw 640ms steps(16,end) both}
.wlkr-sparkline[data-animate] .wlkr-sparkline-area,.wlkr-sparkline[data-animate] .wlkr-sparkline-end{animation:wlkr-sparkline-show 1ms steps(1,end) 640ms both}
}
`

const r2 = (n: number) => Math.round(n * 100) / 100
const fmt = (n: number) => String(r2(n))

/** A stepped pixel trend line. The latest point is a green square; scrub to read any point. */
export function Sparkline({
  data,
  width = 160,
  height = 40,
  fill = false,
  min,
  max,
  label,
  onScrub,
  animate = true,
  className,
  ...props
}: SparklineProps) {
  const id = useIdSafe()
  const [active, setActive] = React.useState<number | null>(null)

  const values = React.useMemo(() => data.filter(v => Number.isFinite(v)), [data])
  const n = values.length
  const lo = min ?? (n ? Math.min(...values) : 0)
  const hi = max ?? (n ? Math.max(...values) : 1)
  const span = hi - lo
  const innerW = Math.max(0, width - PAD * 2)
  const innerH = Math.max(0, height - PAD * 2)
  const stepX = n > 1 ? innerW / (n - 1) : 0
  const xAt = (i: number) => r2(n > 1 ? PAD + i * stepX : PAD + innerW / 2)
  const yAt = (v: number) => {
    if (span <= 0) return r2(PAD + innerH / 2)
    const t = Math.min(1, Math.max(0, (v - lo) / span))
    return r2(PAD + (1 - t) * innerH)
  }

  let line = ""
  let area = ""
  if (n === 1) {
    const y = yAt(values[0])
    line = `M${r2(PAD)} ${y}H${r2(PAD + innerW)}`
    area = `${line}V${r2(height - PAD)}H${r2(PAD)}Z`
  } else if (n > 1) {
    line = `M${xAt(0)} ${yAt(values[0])}`
    for (let i = 1; i < n; i++) line += `H${xAt(i)}V${yAt(values[i])}`
    area = `${line}V${r2(height - PAD)}H${xAt(0)}Z`
  }

  const shown = active !== null && active < n ? active : null
  const markIndex = shown ?? (n ? n - 1 : null)

  const scrub = (i: number | null) => {
    const next = i === null || n === 0 ? null : Math.min(n - 1, Math.max(0, i))
    setActive(next)
    onScrub?.(next === null ? null : { index: next, value: values[next] })
  }

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!n) return
    const rect = e.currentTarget.getBoundingClientRect()
    if (!rect.width) return
    const x = ((e.clientX - rect.left) * width) / rect.width
    scrub(n > 1 ? Math.round((x - PAD) / stepX) : 0)
  }

  const onKeyDown = (e: React.KeyboardEvent<SVGSVGElement>) => {
    if (!n) return
    const from = shown ?? n - 1
    let next: number | null | undefined
    if (e.key === "ArrowLeft") next = shown === null ? n - 1 : from - 1
    else if (e.key === "ArrowRight") next = shown === null ? n - 1 : from + 1
    else if (e.key === "Home") next = 0
    else if (e.key === "End") next = n - 1
    else if (e.key === "Escape") next = null
    if (next === undefined) return
    e.preventDefault()
    scrub(next)
  }

  const summary = n
    ? `min ${fmt(Math.min(...values))}, max ${fmt(Math.max(...values))}, latest ${fmt(values[n - 1])}`
    : "no data"
  const ariaLabel = label ? `${label}: ${summary}` : summary
  const patternId = `${id}-dither`

  return (
    <span {...props} className={cn("wlkr-sparkline", className)} data-animate={animate ? "" : undefined}>
      <style>{styles}</style>
      <svg
        className="wlkr-sparkline-svg"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={ariaLabel}
        tabIndex={0}
        shapeRendering="crispEdges"
        onPointerMove={onPointerMove}
        onPointerLeave={() => scrub(null)}
        onKeyDown={onKeyDown}
        onBlur={() => { if (shown !== null) scrub(null) }}
      >
        {fill && n > 0 && (
          <>
            <defs>
              <pattern id={patternId} width="4" height="4" patternUnits="userSpaceOnUse">
                <rect className="wlkr-sparkline-dot" x="0" y="0" width="2" height="2" />
                <rect className="wlkr-sparkline-dot" x="2" y="2" width="2" height="2" />
              </pattern>
            </defs>
            <path className="wlkr-sparkline-area" d={area} fill={`url(#${patternId})`} />
          </>
        )}
        {line && <path className="wlkr-sparkline-line" d={line} pathLength={1} vectorEffect="non-scaling-stroke" />}
        {shown !== null && (
          <line className="wlkr-sparkline-hair" x1={xAt(shown)} x2={xAt(shown)} y1={0} y2={height} vectorEffect="non-scaling-stroke" />
        )}
        {markIndex !== null && (
          <rect
            className={cn("wlkr-sparkline-mark", shown === null && "wlkr-sparkline-end")}
            x={r2(xAt(markIndex) - 2)}
            y={r2(yAt(values[markIndex]) - 2)}
            width={4}
            height={4}
          />
        )}
      </svg>
    </span>
  )
}

function useIdSafe() {
  return React.useId().replace(/:/g, "")
}
