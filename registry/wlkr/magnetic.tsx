"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type MagneticProps = Omit<React.HTMLAttributes<HTMLElement>, "children"> & {
  children: React.ReactNode
  /** How far the element follows the pointer, 0–1: the share of the pointer's offset from its centre. */
  strength?: number
  /** Pixels beyond the element's edge at which the pull starts, 0–300. */
  radius?: number
  /** Extra travel for the content layer, as a fraction of the outer movement, 0–1. 0 turns the layer off. */
  inner?: number
  /** Largest displacement in pixels, 0–120. */
  max?: number
  disabled?: boolean
  as?: "span" | "div"
}

type Pointer = { x: number; y: number } | null
type Watcher = (pointer: Pointer) => void

const styles = `
.wlkr-magnetic{position:relative}
span.wlkr-magnetic{display:inline-block}
.wlkr-magnetic-move,.wlkr-magnetic-inner{display:block}
span.wlkr-magnetic-inner{display:flex}
.wlkr-magnetic[data-active=true]>.wlkr-magnetic-move,.wlkr-magnetic[data-active=true] .wlkr-magnetic-inner{will-change:transform}
@media(prefers-reduced-motion:reduce){.wlkr-magnetic-move,.wlkr-magnetic-inner{transform:none!important;will-change:auto!important}}
`
const STEP = 1 / 120
const MAX_DT = 0.05
const PULL = { stiffness: 520, damping: 38 }
const RETURN = { stiffness: 300, damping: 22 }
const INNER_PULL = { stiffness: 340, damping: 26 }
const INNER_RETURN = { stiffness: 220, damping: 15 }

const clamp = (value: number | undefined, min: number, max: number, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback

/** One pointer listener for every on-screen Magnetic on the page. */
const watchers = new Set<Watcher>()
let lastPointer: Pointer = null
const broadcast = () => watchers.forEach(watch => watch(lastPointer))
const onMove = (event: PointerEvent) => {
  if (event.pointerType === "touch") return
  lastPointer = { x: event.clientX, y: event.clientY }
  broadcast()
}
const onOut = (event: PointerEvent) => { if (!event.relatedTarget) { lastPointer = null; broadcast() } }
function watchPointer(watch: Watcher) {
  if (!watchers.size) {
    window.addEventListener("pointermove", onMove, { passive: true })
    window.addEventListener("pointerout", onOut, { passive: true })
  }
  watchers.add(watch)
  return () => {
    watchers.delete(watch)
    if (watchers.size) return
    window.removeEventListener("pointermove", onMove)
    window.removeEventListener("pointerout", onOut)
  }
}

/** Leans its children toward a nearby pointer, then springs home. Decorative only: no semantics, no focus changes. */
export function Magnetic({ children, strength, radius, inner, max, disabled = false, as: Tag = "span", className, ...props }: MagneticProps) {
  const rootRef = React.useRef<HTMLElement | null>(null)
  const moveRef = React.useRef<HTMLElement | null>(null)
  const innerRef = React.useRef<HTMLElement | null>(null)
  const follow = clamp(strength, 0, 1, 0.35)
  const reach = clamp(radius, 0, 300, 60)
  const depth = clamp(inner, 0, 1, 0.4)
  const limit = clamp(max, 0, 120, 24)

  React.useEffect(() => {
    const root = rootRef.current
    const move = moveRef.current
    const layer = innerRef.current
    if (disabled || !root || !move || !layer) return
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const coarse = window.matchMedia("(pointer: coarse)")
    let box: DOMRect | null = null
    let frame = 0, last = 0, attracted = false
    let unwatch: (() => void) | null = null
    let onScreen = false
    const outer = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 }
    const deep = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 }

    /** Advances one spring pair; returns whether it is still moving. */
    const advance = (s: typeof outer, { stiffness, damping }: typeof PULL, dt: number) => {
      for (let left = dt; left > 0; left -= STEP) {
        const h = Math.min(STEP, left)
        s.vx += (stiffness * (s.tx - s.x) - damping * s.vx) * h; s.x += s.vx * h
        s.vy += (stiffness * (s.ty - s.y) - damping * s.vy) * h; s.y += s.vy * h
      }
      if (Math.abs(s.vx) + Math.abs(s.vy) < 0.5 && Math.abs(s.tx - s.x) + Math.abs(s.ty - s.y) < 0.05) {
        s.x = s.tx; s.y = s.ty; s.vx = s.vy = 0
        return false
      }
      return true
    }
    const paint = () => {
      const resting = !outer.x && !outer.y && !deep.x && !deep.y
      move.style.transform = resting ? "" : `translate3d(${outer.x.toFixed(2)}px,${outer.y.toFixed(2)}px,0)`
      layer.style.transform = resting ? "" : `translate3d(${deep.x.toFixed(2)}px,${deep.y.toFixed(2)}px,0)`
      root.dataset.active = String(!resting || attracted)
    }
    const tick = (now: number) => {
      const dt = Math.min(MAX_DT, (now - last) / 1000)
      last = now
      const a = advance(outer, attracted ? PULL : RETURN, dt)
      const b = advance(deep, attracted ? INNER_PULL : INNER_RETURN, dt)
      paint()
      frame = a || b ? requestAnimationFrame(tick) : 0
    }
    const wake = () => {
      if (frame) return
      last = performance.now()
      frame = requestAnimationFrame(tick)
    }
    const aim = (pointer: Pointer) => {
      box ??= root.getBoundingClientRect()
      let tx = 0, ty = 0
      if (pointer && box.width + box.height > 0) {
        const outX = Math.max(box.left - pointer.x, 0, pointer.x - box.right)
        const outY = Math.max(box.top - pointer.y, 0, pointer.y - box.bottom)
        const gap = Math.hypot(outX, outY)
        const pull = gap === 0 ? 1 : reach > 0 ? Math.max(0, 1 - gap / reach) : 0
        if (pull > 0) {
          tx = (pointer.x - (box.left + box.width / 2)) * follow * pull
          ty = (pointer.y - (box.top + box.height / 2)) * follow * pull
          const length = Math.hypot(tx, ty)
          if (length > limit) { tx *= limit / length; ty *= limit / length }
        }
      }
      attracted = tx !== 0 || ty !== 0
      outer.tx = tx; outer.ty = ty
      deep.tx = tx * depth; deep.ty = ty * depth
      if (outer.tx !== outer.x || outer.ty !== outer.y || deep.tx !== deep.x || deep.ty !== deep.y) wake()
    }
    const refresh = () => { box = null; if (unwatch) aim(lastPointer) }
    const sync = () => {
      const live = onScreen && !motion.matches && !coarse.matches
      if (live && !unwatch) {
        unwatch = watchPointer(aim)
        window.addEventListener("scroll", refresh, { passive: true, capture: true })
        window.addEventListener("resize", refresh, { passive: true })
        refresh()
      } else if (!live && unwatch) {
        unwatch()
        unwatch = null
        window.removeEventListener("scroll", refresh, { capture: true })
        window.removeEventListener("resize", refresh)
        aim(null)
      }
    }
    const viewport = new IntersectionObserver(entries => { onScreen = entries.some(entry => entry.isIntersecting); sync() }, { rootMargin: `${reach}px` })
    const resizer = new ResizeObserver(refresh)
    viewport.observe(root)
    resizer.observe(root)
    motion.addEventListener("change", sync)
    coarse.addEventListener("change", sync)
    return () => {
      onScreen = false
      sync()
      cancelAnimationFrame(frame)
      viewport.disconnect()
      resizer.disconnect()
      motion.removeEventListener("change", sync)
      coarse.removeEventListener("change", sync)
      move.style.transform = ""
      layer.style.transform = ""
      delete root.dataset.active
    }
  }, [disabled, follow, reach, depth, limit])

  const setRoot = React.useCallback((node: HTMLElement | null) => { rootRef.current = node }, [])
  const setMove = React.useCallback((node: HTMLElement | null) => { moveRef.current = node }, [])
  const setInner = React.useCallback((node: HTMLElement | null) => { innerRef.current = node }, [])
  return <Tag ref={setRoot} {...props} className={cn("wlkr-magnetic", className)}>
    <style>{styles}</style>
    <Tag ref={setMove} className="wlkr-magnetic-move">
      <Tag ref={setInner} className="wlkr-magnetic-inner">{children}</Tag>
    </Tag>
  </Tag>
}
