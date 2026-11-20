"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type TickerProps = Omit<React.ComponentProps<"div">, "children" | "role" | "draggable"> & {
  /** The items, laid out in one row. Avoid `id`s inside: the row is repeated to fill the loop. */
  children: React.ReactNode
  /** Cruising speed in px per second, 5–400. */
  speed?: number
  direction?: "left" | "right"
  /** Space in px between items and between repeats, 0–200. */
  gap?: number
  /** Ease to a stop while a mouse or pen hovers. */
  pauseOnHover?: boolean
  /** Grab the row and fling it with momentum. */
  draggable?: boolean
  /** Dissolve both edges in stepped bands. */
  fade?: boolean
  /** Accessible name; when given the root is a labelled group. */
  label?: string
}

const edges = "linear-gradient(to right,transparent 10px,rgb(0 0 0/.3) 10px 20px,rgb(0 0 0/.6) 20px 30px,rgb(0 0 0/.85) 30px 40px,#000 40px calc(100% - 40px),rgb(0 0 0/.85) calc(100% - 40px) calc(100% - 30px),rgb(0 0 0/.6) calc(100% - 30px) calc(100% - 20px),rgb(0 0 0/.3) calc(100% - 20px) calc(100% - 10px),transparent calc(100% - 10px))"
const styles = `
.wlkr-ticker{position:relative;overflow:hidden;padding-block:8px;touch-action:pan-y;color:var(--foreground,currentColor)}
.wlkr-ticker-grab{cursor:grab;-webkit-user-select:none;user-select:none}
.wlkr-ticker[data-dragging]{cursor:grabbing}
.wlkr-ticker-fade{-webkit-mask-image:${edges};mask-image:${edges}}
.wlkr-ticker-track{display:flex;width:max-content;will-change:transform}
.wlkr-ticker-set{display:flex;flex:none;align-items:center;gap:var(--wlkr-ticker-gap);padding-inline-end:var(--wlkr-ticker-gap)}
.wlkr-ticker-static{overflow-x:auto;-webkit-mask-image:none;mask-image:none}
.wlkr-ticker-static .wlkr-ticker-track{will-change:auto;transform:none!important}
`
const reducedQuery = "(prefers-reduced-motion: reduce)"
const subscribeReduced = (onChange: () => void) => {
  const media = window.matchMedia(reducedQuery)
  media.addEventListener("change", onChange)
  return () => media.removeEventListener("change", onChange)
}
const clamp = (value: unknown, min: number, max: number, fallback: number) => {
  const number = Number(value)
  return value === "" || value == null || !Number.isFinite(number) ? fallback : Math.min(max, Math.max(min, number))
}
/** Keeps the offset inside one set width, [-width, 0). */
const wrap = (x: number, width: number) => width > 0 ? x - width * (Math.floor(x / width) + 1) : x

/** A single row of items that drifts endlessly, eases to rest on hover or focus, and can be flung. */
export function Ticker({ children, speed = 40, direction = "left", gap = 40, pauseOnHover = true, draggable = true, fade = true, label, className, style, ...props }: TickerProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const trackRef = React.useRef<HTMLDivElement>(null)
  const setRef = React.useRef<HTMLDivElement>(null)
  const reduced = React.useSyncExternalStore(subscribeReduced, () => window.matchMedia(reducedQuery).matches, () => false)
  const [copies, setCopies] = React.useState(1)
  const cruise = clamp(speed, 5, 400, 40) * (direction === "right" ? 1 : -1)
  const space = clamp(gap, 0, 200, 40)
  const motion = React.useRef({
    x: 0, velocity: 0, width: 0, cruise, pauseOnHover,
    hover: false, focus: false, pressed: false, dragging: false, suppressClick: false,
    focusTarget: null as number | null,
    pointer: null as { id: number; startX: number; startY: number; lastX: number } | null,
    samples: [] as { t: number; x: number }[],
  })

  React.useEffect(() => {
    motion.current.cruise = cruise
    motion.current.pauseOnHover = pauseOnHover
  }, [cruise, pauseOnHover])

  React.useEffect(() => {
    const root = rootRef.current, set = setRef.current
    if (!root || !set) return
    const observer = new ResizeObserver(() => {
      const width = set.getBoundingClientRect().width
      motion.current.width = width
      setCopies(width > 0 ? Math.min(50, Math.max(1, Math.ceil(root.clientWidth / width))) : 1)
    })
    observer.observe(root)
    observer.observe(set)
    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    const root = rootRef.current, track = trackRef.current
    if (reduced || !root || !track) return
    const state = motion.current
    let frame = 0, last = 0, onScreen = false
    const tick = (now: number) => {
      const dt = last ? Math.min(.05, (now - last) / 1000) : 0
      last = now
      if (state.focusTarget !== null) {
        state.x += (state.focusTarget - state.x) * (1 - Math.exp(-dt / .1))
        state.velocity = 0
      } else if (!state.dragging) {
        const paused = state.pressed || state.focus || (state.hover && state.pauseOnHover)
        const ease = Math.abs(state.velocity) > 400 ? .4 : .1
        state.velocity += ((paused ? 0 : state.cruise) - state.velocity) * (1 - Math.exp(-dt / ease))
        state.x = wrap(state.x + state.velocity * dt, state.width)
      }
      track.style.transform = `translate3d(${state.x}px,0,0)`
      frame = requestAnimationFrame(tick)
    }
    const start = () => {
      if (frame || !onScreen || document.hidden) return
      last = 0
      if (!state.dragging) state.velocity = 0
      frame = requestAnimationFrame(tick)
    }
    const stop = () => { cancelAnimationFrame(frame); frame = 0 }
    const observer = new IntersectionObserver(entries => {
      onScreen = entries[entries.length - 1].isIntersecting
      if (onScreen) start()
      else stop()
    })
    const onVisibility = () => document.hidden ? stop() : start()
    observer.observe(root)
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      stop()
      observer.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
      track.style.transform = ""
    }
  }, [reduced])

  const release = (event: React.PointerEvent<HTMLDivElement>, fling: boolean) => {
    const state = motion.current
    if (state.pointer?.id !== event.pointerId) return
    const recent = state.samples.filter(sample => event.timeStamp - sample.t <= 80)
    const first = recent[0], end = recent[recent.length - 1]
    if (state.dragging) state.velocity = fling && first && end.t > first.t ? clamp((end.x - first.x) / (end.t - first.t) * 1000, -4000, 4000, 0) : 0
    state.pointer = null
    state.pressed = false
    state.dragging = false
    event.currentTarget.removeAttribute("data-dragging")
  }

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggable || reduced || event.button !== 0) return
    const state = motion.current
    state.pointer = { id: event.pointerId, startX: event.clientX, startY: event.clientY, lastX: event.clientX }
    state.pressed = true
    state.suppressClick = false
    state.samples = []
  }

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = motion.current, pointer = state.pointer
    if (pointer?.id !== event.pointerId) return
    if (!state.dragging) {
      const dx = Math.abs(event.clientX - pointer.startX)
      if (dx < 6 || dx < Math.abs(event.clientY - pointer.startY)) return
      state.dragging = true
      state.suppressClick = true
      state.focusTarget = null
      event.currentTarget.setPointerCapture(event.pointerId)
      event.currentTarget.setAttribute("data-dragging", "")
    }
    state.x = wrap(state.x + event.clientX - pointer.lastX, state.width)
    pointer.lastX = event.clientX
    state.samples = [...state.samples.filter(sample => event.timeStamp - sample.t <= 80), { t: event.timeStamp, x: event.clientX }]
  }

  const onFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    const root = event.currentTarget, target = event.target, state = motion.current
    root.scrollLeft = 0
    const keyboard = !reduced && !state.pointer && target instanceof HTMLElement && target.matches(":focus-visible") && !!setRef.current?.contains(target)
    state.focus = keyboard
    state.focusTarget = null
    if (!keyboard) return
    const inset = fade ? 48 : 8, width = root.clientWidth
    const rootLeft = root.getBoundingClientRect().left, box = target.getBoundingClientRect()
    const left = box.left - rootLeft, right = box.right - rootLeft
    const shift = left < inset || box.width > width - inset * 2 ? inset - left : right > width - inset ? width - inset - right : 0
    state.focusTarget = state.x + shift
  }

  const onBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
    motion.current.focus = false
    motion.current.focusTarget = null
  }

  const setHover = (event: React.PointerEvent<HTMLDivElement>, hover: boolean) => {
    const state = motion.current
    if (event.pointerType !== "touch") state.hover = hover
    if (!hover && !state.dragging && state.pointer?.id === event.pointerId) { state.pointer = null; state.pressed = false }
  }

  return <div {...props} ref={rootRef} role={label ? "group" : undefined} aria-label={label}
    className={cn("wlkr-ticker", reduced ? "wlkr-ticker-static" : draggable && "wlkr-ticker-grab", fade && !reduced && "wlkr-ticker-fade", className)}
    style={{ ...style, "--wlkr-ticker-gap": `${space}px` } as React.CSSProperties}
    onPointerEnter={event => setHover(event, true)} onPointerLeave={event => setHover(event, false)}
    onPointerDown={onPointerDown} onPointerMove={onPointerMove}
    onPointerUp={event => release(event, true)} onPointerCancel={event => release(event, false)} onLostPointerCapture={event => release(event, false)}
    onDragStart={event => { if (draggable && !reduced) event.preventDefault() }}
    onClickCapture={event => { if (motion.current.suppressClick) { event.preventDefault(); event.stopPropagation(); motion.current.suppressClick = false } }}
    onKeyDownCapture={() => { motion.current.suppressClick = false }}
    onFocus={onFocus} onBlur={onBlur} onScroll={event => { if (!reduced) event.currentTarget.scrollLeft = 0 }}>
    <style>{styles}</style>
    <div ref={trackRef} className="wlkr-ticker-track">
      <div ref={setRef} className="wlkr-ticker-set">{children}</div>
      {Array.from({ length: reduced ? 0 : copies }, (_, index) => <div key={index} className="wlkr-ticker-set" aria-hidden="true" inert>{children}</div>)}
    </div>
  </div>
}
