"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { openLensPose, sampleLensMotion } from "@/lib/open-lens-motion"

export type WlkrLoaderProps = {
  variant?: "orbit" | "breathe" | "bars" | "dots"
  size?: number
  duration?: number
  /** Deprecated compatibility input. */
  stagger?: number
  label?: string
  decorative?: boolean
  paused?: boolean
  className?: string
  cutThrough?: boolean
  cutGap?: number
  openingDistance?: number
  splitRadius?: number
  openingAngle?: number
  openAt?: number
  closeAt?: number
  arcScale?: number
  tilt?: number
  reverse?: boolean
  easing?: "linear" | "smooth"
  /** Exact static turn, 0–1. Supplying a frame suspends the animation. */
  frame?: number
  startAngle?: number
  loop?: boolean
  restartKey?: number
  onCycleComplete?: () => void
}
const clamp = (value: number, min: number, max: number, fallback: number) => Math.max(min, Math.min(max, Number.isFinite(value) ? value : fallback))
// Exact approved Open Lens paths; a fixed circle divides the body into two rigid pieces.
const arcPath = "M-87,-5 C-87,-53 -47,-92 1,-92 C49,-92 89,-53 89,-5 C89,3 83,9 75,9 C67,9 61,3 61,-5 C61,-38 34,-64 1,-64 C-32,-64 -59,-38 -59,-5 C-59,3 -65,9 -73,9 C-81,9 -87,3 -87,-5 Z"
const bodyPath = "M-92,24 C-94,17 -89,12 -82,12 H68 C76,12 81,18 79,25 C70,65 35,91 -7,91 C-48,91 -82,64 -92,24 Z"
const styles = `
.wlkr-loader{display:inline-flex;position:relative;flex-shrink:0;vertical-align:middle;line-height:0}
.wlkr-loader>svg{display:block;width:100%;height:100%;overflow:hidden}
.wlkr-loader-arc{transform-box:view-box;transform-origin:center;animation-name:wlkr-lens-turn;animation-play-state:paused}
.wlkr-loader-piece{animation-play-state:paused}
.wlkr-loader[data-cut-through=true]>svg{overflow:visible}
.wlkr-loader[data-motion=running] :is(.wlkr-loader-arc,.wlkr-loader-piece){animation-play-state:running}
@keyframes wlkr-lens-turn{from{transform:rotate(var(--wlkr-start))}to{transform:rotate(var(--wlkr-end))}}
@media(prefers-reduced-motion:reduce){.wlkr-loader :is(.wlkr-loader-arc,.wlkr-loader-piece){animation-play-state:paused!important}}
`

export function WlkrLoader({ variant = "orbit", size = 48, duration = 1800, stagger = 120, label = "Loading", decorative = false, paused = false, className, cutThrough = false, cutGap = 0, openingDistance = 64, splitRadius = 74, openingAngle = 0, openAt = 10, closeAt = 350, arcScale = 1, tilt = -24, reverse = false, easing = "linear", frame, startAngle = 0, loop = true, restartKey = 0, onCycleComplete }: WlkrLoaderProps) {
  const root = React.useRef<HTMLSpanElement>(null)
  const [motion, setMotion] = React.useState(false)
  const dimension = clamp(size, 16, 240, 48)
  const beat = clamp(duration, 800, 10000, 1800)
  const gap = clamp(cutGap, 0, 24, 0)
  const radius = clamp(splitRadius, 40, 100, 74)
  const scale = clamp(arcScale, .6, 1.2, 1)
  const angle = clamp(tilt, -60, 60, -24)
  const start = clamp(startAngle, -36000, 36000, 0)
  const fixed = typeof frame === "number" && Number.isFinite(frame) ? clamp(frame, 0, 1, 0) * 360 : undefined
  const id = `wlkr-lens-${React.useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
  const options = React.useMemo(() => ({ openingDistance, splitGap: gap, openingAngle, openAt, closeAt }), [openingDistance, gap, openingAngle, openAt, closeAt])
  const pose = openLensPose(fixed ?? start, options)
  const samples = React.useMemo(() => cutThrough && fixed === undefined ? sampleLensMotion(options, start, reverse, easing) : [], [cutThrough, fixed, options, start, reverse, easing])
  const keyframes = ["inner", "outer"].map(piece => `@keyframes ${id}-${piece}{${samples.map(sample => {
    const shift = sample.pose[piece as "inner" | "outer"]
    return `${(sample.offset * 100).toFixed(6)}%{transform:translate(${shift.x.toFixed(6)}px,${shift.y.toFixed(6)}px)}`
  }).join("")}}`).join("\n")
  const pieceStyle = (piece: "inner" | "outer") => ({
    animationName: fixed === undefined ? `${id}-${piece}` : "none", animationDuration: `${beat}ms`,
    animationTimingFunction: "linear", animationIterationCount: loop ? "infinite" : 1, animationFillMode: "both",
    transform: `translate(${pose[piece].x}px,${pose[piece].y}px)`,
  } as React.CSSProperties)

  const transform = `translate(128 128) rotate(${angle})`
  const motionStyle = {
    "--wlkr-start": `${start}deg`, "--wlkr-end": `${start + (reverse ? -360 : 360)}deg`,
    animationDuration: `${beat}ms`, animationTimingFunction: easing === "smooth" ? "cubic-bezier(.77,0,.175,1)" : "linear",
    animationIterationCount: loop ? "infinite" : 1, animationFillMode: "both",
    transform: `rotate(${fixed ?? start}deg)`, ...(fixed === undefined ? {} : { animationName: "none" }),
  } as React.CSSProperties
  void variant; void stagger
  React.useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)")
    let intersecting = false
    const sync = () => setMotion(!paused && !preference.matches && intersecting && !document.hidden && fixed === undefined)
    const observer = new IntersectionObserver(entries => { intersecting = entries[0]?.isIntersecting ?? false; sync() }, { threshold: .05 })
    if (root.current) observer.observe(root.current)
    preference.addEventListener("change", sync); document.addEventListener("visibilitychange", sync); sync()
    return () => { observer.disconnect(); preference.removeEventListener("change", sync); document.removeEventListener("visibilitychange", sync) }
  }, [paused, fixed])
  const arc = () => <g className="wlkr-loader-arc" style={motionStyle} data-visible-arc="true" onAnimationEnd={event => { if (event.target === event.currentTarget && !loop) onCycleComplete?.() }}>
    <g transform={`${transform} scale(${scale})`}><path transform="translate(0 -7)" d={arcPath} fill="currentColor" /></g>
  </g>
  const body = () => <g className="wlkr-loader-body" transform={transform}><path transform="translate(0 8)" d={bodyPath} fill="currentColor" /></g>
  const piece = (part: "inner" | "outer") => <g className="wlkr-loader-body" transform={transform}>
    <g data-piece={part} className="wlkr-loader-piece" style={pieceStyle(part)}>
      <g clipPath={part === "inner" ? `url(#${id}-inner)` : undefined} mask={part === "outer" ? `url(#${id}-outer)` : undefined}><path transform="translate(0 8)" d={bodyPath} fill="currentColor" /></g>
    </g>
  </g>
  return <span ref={root} className={cn("wlkr-loader", className)} style={{ width: dimension, height: dimension }} role={decorative ? undefined : "status"} aria-hidden={decorative ? true : undefined} data-motion={motion ? "running" : "paused"} data-variant="orbit" data-cut-through={cutThrough}>
    <style>{styles + (cutThrough ? keyframes : "")}</style>
    <svg key={`${restartKey}-${cutThrough}`} viewBox="0 0 256 256" aria-hidden="true" focusable="false" fill="currentColor">
      <defs>
        <clipPath id={`${id}-cover`}><path d="M-128 -128 H128 V20 H-128Z" transform={transform} /></clipPath>
        {cutThrough && <>
          <clipPath id={`${id}-inner`}><circle cx="0" cy="0" r={radius + .2} /></clipPath>
          <mask id={`${id}-outer`} x="-128" y="-128" width="256" height="256" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" style={{ maskType: "luminance" }}><rect x="-128" y="-128" width="256" height="256" fill="white" /><circle cx="0" cy="0" r={radius - .2} fill="black" /></mask>
        </>}

      </defs>
      {cutThrough ? <>{piece("inner")}{arc()}{piece("outer")}</> : <><g clipPath={`url(#${id}-cover)`}>{arc()}</g>{body()}</>}
    </svg>
    {!decorative && <span style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clipPath: "inset(50%)", whiteSpace: "nowrap", border: 0 }}>{label}</span>}
  </span>
}
