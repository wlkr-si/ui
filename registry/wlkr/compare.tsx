"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type CompareProps = Omit<React.ComponentPropsWithoutRef<"div">, "children" | "onChange"> & {
  /** Shown left of the divider, laid over `after`. */
  before: React.ReactNode
  /** Shown right of the divider. Without `aspectRatio` it sets the size. */
  after: React.ReactNode
  beforeLabel?: string
  afterLabel?: string
  /** Controlled divider position, 0–100 from the left. Pair with `onPositionChange`. */
  position?: number
  onPositionChange?: (position: number) => void
  /** Uncontrolled starting position, 0–100. */
  defaultPosition?: number
  /** Reserves this ratio up front, e.g. `16 / 10` or `"4 / 3"`. */
  aspectRatio?: number | string
  /** Small corner labels that fade as the divider nears them. */
  showLabels?: boolean
  /** One small sweep the first time it scrolls into view. */
  hint?: boolean
  /** Accessible name of the slider. */
  label?: string
}

const styles = `
.wlkr-compare{--wlkr-compare-p:50;position:relative;display:block;overflow:hidden;user-select:none;-webkit-user-select:none;touch-action:pan-y;cursor:ew-resize;color:var(--foreground,currentColor);background:var(--muted,#f3f3f3)}
.wlkr-compare-layer{position:relative;width:100%}
.wlkr-compare[data-ratio=true] .wlkr-compare-layer,.wlkr-compare-before{position:absolute;inset:0;height:100%}
.wlkr-compare-before{z-index:1;clip-path:inset(0 calc(100% - var(--wlkr-compare-p) * 1%) 0 0)}
.wlkr-compare-layer>img,.wlkr-compare-layer>video,.wlkr-compare-layer>svg{display:block;width:100%;height:100%;object-fit:cover;-webkit-user-drag:none;pointer-events:none}
.wlkr-compare-tag{position:absolute;top:12px;z-index:1;padding:4px 7px;font-size:11px;font-weight:500;line-height:1;letter-spacing:0;white-space:nowrap;border-radius:0;background:var(--foreground,#010101);color:var(--background,#fff);transition:opacity 160ms ease}
.wlkr-compare-before .wlkr-compare-tag{left:12px;opacity:clamp(0,(var(--wlkr-compare-p) - 12) / 14,1)}
.wlkr-compare-after .wlkr-compare-tag{right:12px;opacity:clamp(0,(88 - var(--wlkr-compare-p)) / 14,1)}
.wlkr-compare-line{position:absolute;top:0;bottom:0;left:calc(var(--wlkr-compare-p) * 1%);z-index:2;width:4px;transform:translateX(-50%);box-sizing:border-box;border:solid var(--foreground,currentColor);border-width:0 1px;background:var(--background,#fff);pointer-events:none}
.wlkr-compare-handle{position:absolute;top:50%;left:calc(var(--wlkr-compare-p) * 1%);z-index:3;display:grid;place-items:center;width:44px;height:44px;transform:translate(-50%,-50%);outline:none;cursor:ew-resize}
.wlkr-compare-handle>span{display:grid;place-items:center;box-sizing:border-box;width:32px;height:32px;border:1px solid var(--background,#fff);border-radius:2px;background:var(--foreground,currentColor);color:var(--background,#fff)}
.wlkr-compare-handle:focus-visible>span{outline:2px solid var(--ring,currentColor);outline-offset:4px}
.wlkr-compare[data-pointer] .wlkr-compare-handle:focus-visible>span{outline:none}
.wlkr-compare-handle svg{display:block}
`

const clamp = (input: unknown, fallback: number) => {
  const number = Number(input)
  return input === "" || input === null || !Number.isFinite(number) ? fallback : Math.min(100, Math.max(0, number))
}
const ratioOf = (input: unknown) => typeof input === "number" ? (Number.isFinite(input) && input > 0 ? String(input) : undefined) : typeof input === "string" && input.trim() ? input : undefined
const STEPS: Record<string, number> = { ArrowLeft: -2, ArrowRight: 2, ArrowDown: -2, ArrowUp: 2, PageDown: -10, PageUp: 10 }
const HINT_MS = 1100
const HINT_REACH = 12

type Press = { id: number; x: number; y: number; offset: number; dragging: boolean }

const paint = (element: HTMLElement | null, value: number) => element?.style.setProperty("--wlkr-compare-p", String(value))

/** Before and after, either side of a divider you can drag, click or move with the arrow keys. */
export function Compare({ before, after, beforeLabel = "Before", afterLabel = "After", position, onPositionChange, defaultPosition = 50, aspectRatio, showLabels = true, hint = true, label = "Comparison position", className, style, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, ...props }: CompareProps) {
  const controlled = position !== undefined
  const [committed, setCommitted] = React.useState(() => clamp(defaultPosition, 50))
  const shown = controlled ? clamp(position, 50) : committed
  const root = React.useRef<HTMLDivElement>(null)
  const handle = React.useRef<HTMLDivElement>(null)
  const current = React.useRef(shown)
  const press = React.useRef<Press | null>(null)
  const touched = React.useRef(false)
  const stopHint = React.useRef<() => void>(() => {})
  const changeRef = React.useRef(onPositionChange)
  const ratio = ratioOf(aspectRatio)

  React.useEffect(() => { changeRef.current = onPositionChange })
  React.useEffect(() => { current.current = shown }, [shown])

  function move(value: number, settle: boolean) {
    const next = clamp(value, current.current)
    const changed = next !== current.current
    touched.current = true
    stopHint.current()
    if (!controlled) {
      current.current = next
      paint(root.current, next)
      if (settle) setCommitted(next)
    }
    if (changed) changeRef.current?.(next)
  }

  const fromPointer = (clientX: number) => {
    const rect = root.current?.getBoundingClientRect()
    return rect && rect.width > 0 ? ((clientX - rect.left) / rect.width) * 100 : current.current
  }

  React.useEffect(() => {
    const element = root.current
    if (!element || !hint) return
    let raf = 0
    const stop = () => {
      cancelAnimationFrame(raf)
      raf = 0
      paint(element, current.current)
    }
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return
      observer.disconnect()
      if (touched.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
      const start = performance.now()
      const base = current.current
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / HINT_MS)
        const sweep = (Math.sin(t * Math.PI * 2) * Math.sin(t * Math.PI)) / 0.77
        paint(element, Math.min(100, Math.max(0, base - HINT_REACH * sweep)))
        if (t < 1) raf = requestAnimationFrame(tick)
        else stop()
      }
      raf = requestAnimationFrame(tick)
    }, { threshold: 0.5 })
    observer.observe(element)
    stopHint.current = () => { if (raf) stop() }
    return () => { observer.disconnect(); cancelAnimationFrame(raf); stopHint.current = () => {} }
  }, [hint])

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    onPointerDown?.(event)
    if (event.defaultPrevented || press.current || (event.pointerType === "mouse" && event.button !== 0)) return
    const dragging = event.pointerType !== "touch"
    const rect = event.currentTarget.getBoundingClientRect()
    const onHandle = handle.current?.contains(event.target as Node) ?? false
    const offset = onHandle ? rect.left + (current.current / 100) * rect.width - event.clientX : 0
    press.current = { id: event.pointerId, x: event.clientX, y: event.clientY, offset, dragging }
    touched.current = true
    stopHint.current()
    event.currentTarget.setPointerCapture(event.pointerId)
    if (dragging) {
      event.preventDefault()
      event.currentTarget.dataset.pointer = ""
      handle.current?.focus({ preventScroll: true })
      move(fromPointer(event.clientX + offset), false)
    }
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    onPointerMove?.(event)
    const active = press.current
    if (!active || active.id !== event.pointerId) return
    if (!active.dragging) {
      const dx = Math.abs(event.clientX - active.x), dy = Math.abs(event.clientY - active.y)
      if (dy > 8 && dy >= dx) {
        press.current = null
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
        return
      }
      if (dx <= 8 || dx <= dy) return
      active.dragging = true
    }
    move(fromPointer(event.clientX + active.offset), false)
  }

  function finish(event: React.PointerEvent<HTMLDivElement>, cancelled: boolean) {
    const active = press.current
    if (!active || active.id !== event.pointerId) return
    press.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    if (active.dragging || !cancelled) move(active.dragging || cancelled ? current.current : fromPointer(event.clientX + active.offset), true)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    delete root.current?.dataset.pointer
    const base = Math.round(current.current)
    let next: number | undefined
    if (event.key === "Home") next = 0
    else if (event.key === "End") next = 100
    else if (event.key in STEPS) next = base + STEPS[event.key] * (event.shiftKey && event.key.startsWith("Arrow") ? 5 : 1)
    if (next === undefined) return
    event.preventDefault()
    move(next, true)
  }

  const rounded = Math.round(shown)
  return (
    <div
      {...props}
      ref={root}
      className={cn("wlkr-compare", className)}
      data-ratio={ratio !== undefined}
      style={{ ...style, aspectRatio: ratio, "--wlkr-compare-p": shown } as React.CSSProperties}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={event => { onPointerUp?.(event); finish(event, false) }}
      onPointerCancel={event => { onPointerCancel?.(event); finish(event, true) }}
      onDragStart={event => event.preventDefault()}
    >
      <style>{styles}</style>
      <div className="wlkr-compare-layer wlkr-compare-before">
        {before}
        {showLabels && <span className="wlkr-compare-tag">{beforeLabel}</span>}
      </div>
      <div className="wlkr-compare-layer wlkr-compare-after">
        {after}
        {showLabels && <span className="wlkr-compare-tag">{afterLabel}</span>}
      </div>
      <span className="wlkr-compare-line" aria-hidden="true" />
      <div
        ref={handle}
        className="wlkr-compare-handle"
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={rounded}
        aria-valuetext={`${rounded}% ${beforeLabel}, ${100 - rounded}% ${afterLabel}`}
        aria-orientation="horizontal"
        onKeyDown={handleKeyDown}
        onFocus={() => { touched.current = true; stopHint.current() }}
        onBlur={() => { delete root.current?.dataset.pointer }}
      >
        <span aria-hidden="true">
          <svg width="16" height="10" viewBox="0 0 16 10" fill="currentColor" shapeRendering="crispEdges" focusable="false">
            <path d="M0 4h2v2H0zM2 2h2v2H2zM2 6h2v2H2zM4 0h2v2H4zM4 8h2v2H4zM14 4h2v2h-2zM12 2h2v2h-2zM12 6h2v2h-2zM10 0h2v2h-2zM10 8h2v2h-2z" />
          </svg>
        </span>
      </div>
    </div>
  )
}
