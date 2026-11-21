"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type PixelBurstHandle = {
  /** Fire a burst at x, y (px from the wrapper's top left). Centre by default. */
  burst: (x?: number, y?: number) => void
}

export type PixelBurstProps = Omit<React.ComponentPropsWithoutRef<"span">, "children"> & {
  children?: React.ReactNode
  /** Pixels per burst. */
  count?: number
  /** Furthest travel in px. */
  spread?: number
  /** Length of one burst in ms. */
  duration?: number
  /** "click" bursts on every click inside; "manual" only through the ref. */
  trigger?: "click" | "manual"
  disabled?: boolean
  ref?: React.Ref<PixelBurstHandle>
}

type Particle = { dx: number; dy: number; size: number; brand: boolean; delay: number }
type Burst = { id: number; x: number; y: number; particles: Particle[] }

const SIZES = [3, 4, 6]

/** mulberry32: small, fast, deterministic. */
function makeRandom(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function makeParticles(seed: number, count: number, spread: number, duration: number): Particle[] {
  const rand = makeRandom(seed)
  const n = Math.max(1, Math.round(count))
  return Array.from({ length: n }, (_, i) => {
    const angle = (i / n) * Math.PI * 2 + (rand() - 0.5) * (Math.PI / n) * 1.6
    const distance = spread * (0.5 + rand() * 0.5)
    return {
      dx: Math.round(Math.cos(angle) * distance),
      dy: Math.round(Math.sin(angle) * distance),
      size: SIZES[Math.floor(rand() * SIZES.length)],
      brand: rand() < 0.45,
      delay: Math.round(rand() * duration * 0.12),
    }
  })
}

const styles = `
.wlkr-pixel-burst{display:inline-block;position:relative}
.wlkr-pixel-burst-layer{position:absolute;inset:0;overflow:visible;pointer-events:none;z-index:1}
.wlkr-pixel-burst-px{position:absolute;display:block;border-radius:0;background:var(--foreground,currentColor);translate:0 0;scale:1;
animation:wlkr-pixel-burst-fly calc(var(--t) * .7) steps(6,end) var(--d) both,wlkr-pixel-burst-shrink calc(var(--t) * .4) steps(3,end) calc(var(--d) + var(--t) * .6) both}
.wlkr-pixel-burst-px[data-tone=brand]{background:var(--brand,#33f282)}
@keyframes wlkr-pixel-burst-fly{from{translate:0 0}to{translate:var(--dx) var(--dy)}}
@keyframes wlkr-pixel-burst-shrink{from{scale:1}to{scale:0}}
@media(prefers-reduced-motion:reduce){.wlkr-pixel-burst-layer{display:none}}
`

/** Wrap anything. Click it and square pixels fly out from the point you hit. */
export function PixelBurst({
  children,
  count = 18,
  spread = 56,
  duration = 520,
  trigger = "click",
  disabled = false,
  className,
  onClick,
  ref,
  ...props
}: PixelBurstProps) {
  const [bursts, setBursts] = React.useState<Burst[]>([])
  const rootRef = React.useRef<HTMLSpanElement>(null)
  const seedRef = React.useRef(0x5eed)
  const idRef = React.useRef(0)
  const timersRef = React.useRef(new Set<ReturnType<typeof setTimeout>>())

  React.useEffect(() => {
    const timers = timersRef.current
    return () => {
      timers.forEach(clearTimeout)
      timers.clear()
    }
  }, [])

  const burst = React.useCallback(
    (x?: number, y?: number) => {
      const root = rootRef.current
      if (disabled || !root) return
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
      const rect = root.getBoundingClientRect()
      seedRef.current = (seedRef.current * 1664525 + 1013904223) >>> 0
      const id = ++idRef.current
      const particles = makeParticles(seedRef.current, count, spread, duration)
      const next: Burst = { id, x: x ?? rect.width / 2, y: y ?? rect.height / 2, particles }
      setBursts(list => [...list, next])
      const longest = Math.max(...particles.map(p => p.delay)) + duration + 60
      const timer = setTimeout(() => {
        timersRef.current.delete(timer)
        setBursts(list => list.filter(b => b.id !== id))
      }, longest)
      timersRef.current.add(timer)
    },
    [disabled, count, spread, duration],
  )

  React.useImperativeHandle(ref, () => ({ burst }), [burst])

  const handleClick = (event: React.MouseEvent<HTMLSpanElement>) => {
    onClick?.(event)
    if (trigger !== "click" || event.defaultPrevented) return
    if (event.detail === 0) return burst()
    const rect = event.currentTarget.getBoundingClientRect()
    burst(event.clientX - rect.left, event.clientY - rect.top)
  }

  return (
    <span {...props} ref={rootRef} className={cn("wlkr-pixel-burst", className)} onClick={handleClick}>
      <style>{styles}</style>
      {children}
      <span className="wlkr-pixel-burst-layer" aria-hidden="true">
        {bursts.map(b =>
          b.particles.map((p, i) => (
            <span
              key={`${b.id}-${i}`}
              className="wlkr-pixel-burst-px"
              data-tone={p.brand ? "brand" : "ink"}
              style={{
                left: b.x - p.size / 2,
                top: b.y - p.size / 2,
                width: p.size,
                height: p.size,
                ["--dx" as string]: `${p.dx}px`,
                ["--dy" as string]: `${p.dy}px`,
                ["--d" as string]: `${p.delay}ms`,
                ["--t" as string]: `${duration}ms`,
              } as React.CSSProperties}
            />
          )),
        )}
      </span>
    </span>
  )
}
