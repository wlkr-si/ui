"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { lensArcAngle, liquidDefaults, liquidLensFrame } from "@/lib/open-lens-motion"

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
  /** Liquid mode: the bowl parts around the arc, pinches off a drop and seals behind it. */
  cutThrough?: boolean
  openingDistance?: number
  splitRadius?: number
  /** Surface tension, 0–24 SVG units. */
  goo?: number
  /** Share of the opening that lifts the rim, 0–1. */
  squish?: number
  /** Ripple as the bowl seals, 0–1. */
  ripple?: number
  /** Deprecated rigid-motion inputs; ignored. */
  cutGap?: number
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
// Exact approved Open Lens paths.
const arcPath = "M-87,-5 C-87,-53 -47,-92 1,-92 C49,-92 89,-53 89,-5 C89,3 83,9 75,9 C67,9 61,3 61,-5 C61,-38 34,-64 1,-64 C-32,-64 -59,-38 -59,-5 C-59,3 -65,9 -73,9 C-81,9 -87,3 -87,-5 Z"
const bodyPath = "M-92,24 C-94,17 -89,12 -82,12 H68 C76,12 81,18 79,25 C70,65 35,91 -7,91 C-48,91 -82,64 -92,24 Z"
const styles = `
.wlkr-loader{display:inline-flex;position:relative;flex-shrink:0;vertical-align:middle;line-height:0}
.wlkr-loader>svg{display:block;width:100%;height:100%;overflow:hidden}
.wlkr-loader-arc{transform-box:view-box;transform-origin:center;animation-name:wlkr-lens-turn;animation-play-state:paused}
.wlkr-loader[data-cut-through=true]>svg{overflow:visible}
.wlkr-loader[data-motion=running] .wlkr-loader-arc{animation-play-state:running}
@keyframes wlkr-lens-turn{from{transform:rotate(var(--wlkr-start))}to{transform:rotate(var(--wlkr-end))}}
@media(prefers-reduced-motion:reduce){.wlkr-loader .wlkr-loader-arc{animation-play-state:paused!important}}
`

export function WlkrLoader({ variant = "orbit", size = 48, duration = 1800, stagger = 120, label = "Loading", decorative = false, paused = false, className, cutThrough = false, openingDistance = liquidDefaults.openingDistance, splitRadius = liquidDefaults.splitRadius, goo = liquidDefaults.goo, squish = liquidDefaults.squish, ripple = liquidDefaults.ripple, arcScale = 1, tilt = -24, reverse = false, easing = "linear", frame, startAngle = 0, loop = true, restartKey = 0, onCycleComplete }: WlkrLoaderProps) {
  const root = React.useRef<HTMLSpanElement>(null)
  const innerRef = React.useRef<SVGPathElement>(null)
  const outerRef = React.useRef<SVGPathElement>(null)
  const arcRef = React.useRef<SVGGElement>(null)
  const blurRef = React.useRef<SVGFEGaussianBlurElement>(null)
  const progress = React.useRef(0)
  const completed = React.useRef(onCycleComplete)
  const [motion, setMotion] = React.useState(false)
  const dimension = clamp(size, 16, 240, 48)
  const beat = clamp(duration, 800, 10000, 1800)
  const scale = clamp(arcScale, .6, 1.2, 1)
  const angle = clamp(tilt, -60, 60, -24)
  const start = clamp(startAngle, -36000, 36000, 0)
  const fixed = typeof frame === "number" && Number.isFinite(frame) ? clamp(frame, 0, 1, 0) * 360 : undefined
  const id = `wlkr-lens-${React.useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
  const rays = dimension < 96 ? 72 : 160
  const options = React.useMemo(() => ({ openingDistance, splitRadius, goo, squish, ripple, arcScale: scale, reverse }), [openingDistance, splitRadius, goo, squish, ripple, scale, reverse])
  const still = cutThrough ? liquidLensFrame(fixed ?? start, options, rays) : undefined
  const fluid = clamp(goo, 0, 24, liquidDefaults.goo) > 0

  const transform = `translate(128 128) rotate(${angle})`
  const motionStyle = {
    "--wlkr-start": `${start}deg`, "--wlkr-end": `${start + (reverse ? -360 : 360)}deg`,
    animationDuration: `${beat}ms`, animationTimingFunction: easing === "smooth" ? "cubic-bezier(.77,0,.175,1)" : "linear",
    animationIterationCount: loop ? "infinite" : 1, animationFillMode: "both",
    transform: `rotate(${fixed ?? start}deg)`, ...(fixed === undefined && !cutThrough ? {} : { animationName: "none" }),
  } as React.CSSProperties
  void variant; void stagger
  React.useEffect(() => { completed.current = onCycleComplete })
  React.useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)")
    let intersecting = false
    const sync = () => setMotion(!paused && !preference.matches && intersecting && !document.hidden && fixed === undefined)
    const observer = new IntersectionObserver(entries => { intersecting = entries[0]?.isIntersecting ?? false; sync() }, { threshold: .05 })
    if (root.current) observer.observe(root.current)
    preference.addEventListener("change", sync); document.addEventListener("visibilitychange", sync); sync()
    return () => { observer.disconnect(); preference.removeEventListener("change", sync); document.removeEventListener("visibilitychange", sync) }
  }, [paused, fixed])
  React.useEffect(() => { progress.current = 0 }, [restartKey, start, cutThrough])
  React.useEffect(() => {
    if (!cutThrough || fixed !== undefined || !motion) return
    const draw = (turn: number) => {
      const next = liquidLensFrame(turn, options, rays)
      innerRef.current?.setAttribute("d", next.inner)
      outerRef.current?.setAttribute("d", next.outer)
      blurRef.current?.setAttribute("stdDeviation", next.goo.toFixed(2))
      if (arcRef.current) arcRef.current.style.transform = `rotate(${turn}deg)`
    }
    let request = 0, origin: number | undefined
    const step = (now: number) => {
      origin ??= now - progress.current * beat
      const elapsed = (now - origin) / beat
      if (!loop && elapsed >= 1) { progress.current = 1; draw(lensArcAngle(1, start, reverse, easing)); completed.current?.(); return }
      progress.current = loop ? elapsed % 1 : elapsed
      draw(lensArcAngle(progress.current, start, reverse, easing))
      request = requestAnimationFrame(step)
    }
    request = requestAnimationFrame(step)
    return () => cancelAnimationFrame(request)
  }, [cutThrough, fixed, motion, beat, loop, start, reverse, easing, options, rays, restartKey])
  const arc = () => <g ref={arcRef} className="wlkr-loader-arc" style={motionStyle} data-visible-arc="true" onAnimationEnd={event => { if (event.target === event.currentTarget && !loop && !cutThrough) onCycleComplete?.() }}>
    <g transform={`${transform} scale(${scale})`}><path transform="translate(0 -7)" d={arcPath} fill="currentColor" /></g>
  </g>
  const body = () => <g className="wlkr-loader-body" transform={transform}><path transform="translate(0 8)" d={bodyPath} fill="currentColor" /></g>
  return <span ref={root} className={cn("wlkr-loader", className)} style={{ width: dimension, height: dimension }} role={decorative ? undefined : "status"} aria-hidden={decorative ? true : undefined} data-motion={motion ? "running" : "paused"} data-variant="orbit" data-cut-through={cutThrough}>
    <style>{styles}</style>
    <svg key={`${restartKey}-${cutThrough}`} viewBox="0 0 256 256" aria-hidden="true" focusable="false" fill="currentColor">
      <defs>
        <clipPath id={`${id}-cover`}><path d="M-128 -128 H128 V20 H-128Z" transform={transform} /></clipPath>
        {still && fluid && <filter id={`${id}-goo`} x="-64" y="-64" width="384" height="384" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feGaussianBlur ref={blurRef} in="SourceGraphic" stdDeviation={still.goo.toFixed(2)} />
          <feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 56 -26" result="liquid" />
          <feComposite in="SourceGraphic" in2="liquid" operator="atop" />
        </filter>}
      </defs>
      {still ? <g filter={fluid ? `url(#${id}-goo)` : undefined}>
        <g className="wlkr-loader-body" transform={transform}><path ref={innerRef} data-piece="inner" d={still.inner} fill="currentColor" /><path ref={outerRef} data-piece="outer" d={still.outer} fill="currentColor" /></g>
        {arc()}
      </g> : <><g clipPath={`url(#${id}-cover)`}>{arc()}</g>{body()}</>}
    </svg>
    {!decorative && <span style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clipPath: "inset(50%)", whiteSpace: "nowrap", border: 0 }}>{label}</span>}
  </span>
}
