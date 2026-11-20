"use client"

import * as React from "react"
import { Check, Fingerprint } from "lucide-react"
import { cn } from "@/lib/utils"

const styles = `
.wlkr-hold-action{position:relative;display:inline-flex;max-width:100%;vertical-align:middle}
.wlkr-hold-action-button{display:inline-grid;max-width:100%;min-height:44px;padding:0;border:0;border-radius:0;background:none;color:var(--foreground,currentColor);font:inherit;font-size:14px;font-weight:500;line-height:1.3;text-align:left;cursor:pointer;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;touch-action:manipulation}
.wlkr-hold-action-button:focus-visible{outline:2px solid var(--ring,currentColor);outline-offset:4px}
.wlkr-hold-action-button:disabled{cursor:not-allowed;opacity:.5}
.wlkr-hold-action-button[data-tone=destructive]{color:var(--destructive,#b42318)}
.wlkr-hold-action-layer{grid-area:1/1;display:grid;align-items:center;min-height:44px;padding:0 12px}
.wlkr-hold-action-state{grid-area:1/1;display:inline-flex;align-items:center;gap:10px}
.wlkr-hold-action-state[aria-hidden=true]{visibility:hidden}
.wlkr-hold-action-armed{width:0;white-space:nowrap}
.wlkr-hold-action-state svg{width:16px;height:16px;flex-shrink:0}
.wlkr-hold-action-success{color:var(--success,#087d3d)}
.wlkr-hold-action-fill{--wlkr-hold-action-x:calc(var(--wlkr-hold-action-p,0)*(100% + 10px));background:var(--foreground,currentColor);color:var(--background,#fff);pointer-events:none;clip-path:polygon(0 0,var(--wlkr-hold-action-x) 0,var(--wlkr-hold-action-x) 20%,calc(var(--wlkr-hold-action-x) - 6px) 20%,calc(var(--wlkr-hold-action-x) - 6px) 40%,calc(var(--wlkr-hold-action-x) - 2px) 40%,calc(var(--wlkr-hold-action-x) - 2px) 60%,calc(var(--wlkr-hold-action-x) - 8px) 60%,calc(var(--wlkr-hold-action-x) - 8px) 80%,calc(var(--wlkr-hold-action-x) - 4px) 80%,calc(var(--wlkr-hold-action-x) - 4px) 100%,0 100%)}
.wlkr-hold-action-button[data-tone=destructive] .wlkr-hold-action-fill{background:var(--destructive,#b42318)}
.wlkr-hold-action-fill .wlkr-hold-action-success{color:inherit}
.wlkr-hold-action-button[data-state=confirmed] .wlkr-hold-action-fill{opacity:0;transition:opacity 360ms cubic-bezier(.2,.7,.2,1) 120ms}
.wlkr-hold-action-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@keyframes wlkr-hold-action-settle{0%{transform:translateY(0)}35%{transform:translateY(2px)}100%{transform:translateY(0)}}
@media(hover:hover){.wlkr-hold-action-button:not(:disabled):hover .wlkr-hold-action-base{background:var(--muted,#f3f3f3)}}
@media(prefers-reduced-motion:no-preference){.wlkr-hold-action-button[data-state=confirmed] .wlkr-hold-action-layer{animation:wlkr-hold-action-settle 280ms cubic-bezier(.2,.7,.2,1)}}
@media(prefers-reduced-motion:reduce){.wlkr-hold-action-fill{clip-path:inset(0 calc((1 - var(--wlkr-hold-action-p,0))*100%) 0 0)}.wlkr-hold-action-button[data-state=confirmed] .wlkr-hold-action-fill{transition:none}}
`

const clamp = (value: number, min: number, max: number, fallback: number) => Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback
const ARM_WINDOW = 4000
const SLOP = 12

export type HoldActionProps = Omit<React.ComponentPropsWithoutRef<"button">, "children" | "onClick" | "type"> & {
  /** Runs once when the hold completes. A rejected promise returns the control to rest. */
  onConfirm: () => void | Promise<unknown>
  /** The resting label, e.g. "Hold to delete". */
  children: React.ReactNode
  confirmedLabel?: string
  /** Milliseconds to hold, clamped to 400–5000. */
  duration?: number
  /** Milliseconds before returning to rest after confirming; `null` stays confirmed. */
  resetAfter?: number | null
  /** `destructive` fills with `--destructive`. */
  tone?: "ink" | "destructive"
}

/** Press and hold to confirm. Assistive technology gets a two-step confirm instead of the hold. */
export function HoldAction({ onConfirm, children, confirmedLabel = "Done", duration = 1100, resetAfter = 2200, tone = "ink", disabled = false, className, onBlur, onContextMenu, onKeyDown, onKeyUp, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onLostPointerCapture, ...props }: HoldActionProps) {
  const [phase, setPhase] = React.useState<"rest" | "armed" | "confirmed">("rest")
  const [message, setMessage] = React.useState("")
  const hintId = React.useId()
  const button = React.useRef<HTMLButtonElement>(null)
  const progress = React.useRef(0)
  const frame = React.useRef(0)
  const lastFrame = React.useRef(0)
  const holding = React.useRef<"pointer" | "key" | null>(null)
  const pointer = React.useRef<{ id: number; x: number; y: number; touch: boolean; rect: DOMRect } | null>(null)
  const lastInteraction = React.useRef(-Infinity)
  const detachVisibility = React.useRef<(() => void) | null>(null)
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const mounted = React.useRef(true)
  const latest = React.useRef({ onConfirm, confirmedLabel, duration: clamp(duration, 400, 5000, 1100), resetAfter: resetAfter === null ? null : clamp(resetAfter, 0, 60000, 2200) })
  React.useEffect(() => { latest.current = { onConfirm, confirmedLabel, duration: clamp(duration, 400, 5000, 1100), resetAfter: resetAfter === null ? null : clamp(resetAfter, 0, 60000, 2200) } })
  React.useEffect(() => { mounted.current = true; return () => { mounted.current = false; cancelAnimationFrame(frame.current); detachVisibility.current?.(); if (timer.current) clearTimeout(timer.current) } }, [])

  function paint(value: number) { progress.current = value; button.current?.style.setProperty("--wlkr-hold-action-p", String(value)) }
  function clearTimer() { if (timer.current) clearTimeout(timer.current); timer.current = null }
  function rest(text = "") { clearTimer(); paint(0); setPhase("rest"); setMessage(text) }

  function confirm() {
    release()
    cancelAnimationFrame(frame.current); frame.current = 0
    clearTimer(); paint(1)
    const { onConfirm: run, confirmedLabel: label, resetAfter: after } = latest.current
    setPhase("confirmed"); setMessage(label)
    if (after !== null) timer.current = setTimeout(() => rest(), after)
    const fail = () => { if (mounted.current) rest("Action failed. Try again.") }
    try { const result = run(); if (result && typeof result.then === "function") result.then(undefined, fail) } catch { fail() }
  }

  function tick(now: number) {
    const elapsed = now - lastFrame.current
    lastFrame.current = now
    if (button.current?.disabled) release()
    const step = elapsed / latest.current.duration
    const next = holding.current ? Math.min(1, progress.current + step) : Math.max(0, progress.current - step * 3)
    paint(next)
    if (holding.current && next >= 1) return confirm()
    frame.current = next > 0 || holding.current ? requestAnimationFrame(tick) : 0
  }

  function start(source: "pointer" | "key") {
    if (phase === "confirmed" || disabled) return
    if (phase === "armed") { clearTimer(); setPhase("rest") }
    setMessage("")
    holding.current = source
    lastInteraction.current = performance.now()
    if (!detachVisibility.current) {
      const onVisibility = () => { if (document.hidden) release() }
      document.addEventListener("visibilitychange", onVisibility)
      detachVisibility.current = () => document.removeEventListener("visibilitychange", onVisibility)
    }
    if (!frame.current) { lastFrame.current = performance.now(); frame.current = requestAnimationFrame(tick) }
  }

  function release() {
    if (!holding.current) return
    holding.current = null
    pointer.current = null
    lastInteraction.current = performance.now()
    detachVisibility.current?.(); detachVisibility.current = null
  }

  function activateWithoutHold(event: React.MouseEvent<HTMLButtonElement>) {
    if (event.detail !== 0 || holding.current || performance.now() - lastInteraction.current < 600 || phase === "confirmed") return
    if (phase === "armed") return confirm()
    setPhase("armed"); setMessage("Press again to confirm")
    clearTimer(); timer.current = setTimeout(() => rest(), ARM_WINDOW)
  }

  const states = (fill: boolean) => <>
    <span className="wlkr-hold-action-state" aria-hidden={phase !== "rest"}><Fingerprint aria-hidden="true" />{children}</span>
    <span className="wlkr-hold-action-state wlkr-hold-action-armed" aria-hidden={phase !== "armed"}><Fingerprint aria-hidden="true" />Press again to confirm</span>
    <span className="wlkr-hold-action-state" aria-hidden={phase !== "confirmed"}><Check className={fill ? undefined : "wlkr-hold-action-success"} aria-hidden="true" />{confirmedLabel}</span>
  </>

  return (
    <span className={cn("wlkr-hold-action", className)}>
      <style>{styles}</style>
      <button
        {...props}
        ref={button}
        type="button"
        className="wlkr-hold-action-button"
        data-tone={tone}
        data-state={phase}
        disabled={disabled}
        aria-describedby={[hintId, props["aria-describedby"]].filter(Boolean).join(" ")}
        onClick={activateWithoutHold}
        onPointerDown={event => {
          onPointerDown?.(event)
          if (event.button !== 0 || !event.isPrimary) return
          try { event.currentTarget.setPointerCapture(event.pointerId) } catch {}
          pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY, touch: event.pointerType !== "mouse", rect: event.currentTarget.getBoundingClientRect() }
          start("pointer")
        }}
        onPointerMove={event => {
          onPointerMove?.(event)
          const origin = pointer.current
          if (holding.current !== "pointer" || !origin || origin.id !== event.pointerId) return
          const { x, y, touch, rect } = origin
          const outside = event.clientX < rect.left - SLOP || event.clientX > rect.right + SLOP || event.clientY < rect.top - SLOP || event.clientY > rect.bottom + SLOP
          if (outside || (touch && Math.hypot(event.clientX - x, event.clientY - y) > 10)) release()
        }}
        onPointerUp={event => { onPointerUp?.(event); if (pointer.current?.id === event.pointerId) release() }}
        onPointerCancel={event => { onPointerCancel?.(event); if (pointer.current?.id === event.pointerId) release() }}
        onLostPointerCapture={event => { onLostPointerCapture?.(event); if (pointer.current?.id === event.pointerId) release() }}
        onKeyDown={event => {
          onKeyDown?.(event)
          if (event.key !== " " && event.key !== "Enter") return
          event.preventDefault()
          if (!event.repeat && !holding.current) start("key")
        }}
        onKeyUp={event => {
          onKeyUp?.(event)
          if (event.key !== " " && event.key !== "Enter") return
          event.preventDefault()
          if (holding.current === "key") release()
        }}
        onBlur={event => { onBlur?.(event); release() }}
        onContextMenu={event => { onContextMenu?.(event); if (holding.current) event.preventDefault() }}
      >
        <span className="wlkr-hold-action-layer wlkr-hold-action-base">{states(false)}</span>
        <span className="wlkr-hold-action-layer wlkr-hold-action-fill" aria-hidden="true">{states(true)}</span>
      </button>
      <span id={hintId} className="wlkr-hold-action-sr">Press and hold to confirm</span>
      <span role="status" className="wlkr-hold-action-sr">{message}</span>
    </span>
  )
}
