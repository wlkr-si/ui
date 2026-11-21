"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type PagerProps = Omit<React.ComponentPropsWithoutRef<"nav">, "children" | "aria-label" | "onChange"> & {
  /** The current page, 1-based. Clamped into 1…count. */
  page: number
  onPageChange?: (page: number) => void
  /** Total pages. Below 1 renders nothing. */
  count: number
  /** When given, every control is a real link to this address, for crawlable pagination. */
  getHref?: (page: number) => string
  /** Pages shown either side of the current one in the number strip, 0–3. */
  siblings?: number
  /** False shows only the arrows and the counter. */
  showPages?: boolean
  /** Accessible name for the navigation landmark. */
  label?: string
}

type Slot = number | "start" | "end"

const styles = `
.wlkr-pager{display:block;width:100%;container-type:inline-size;color:var(--foreground,currentColor);line-height:1}
.wlkr-pager-row{display:flex;flex-wrap:wrap;align-items:center;column-gap:20px}
.wlkr-pager-steps{display:flex;align-items:center}
.wlkr-pager-arrow{display:grid;place-items:center;flex:none;width:44px;height:44px;padding:0;border:0;border-radius:2px;background:none;color:inherit;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.wlkr-pager-arrow:is(:disabled,[aria-disabled=true]){color:var(--muted-foreground,#696969);opacity:.4;cursor:default}
.wlkr-pager-arrow svg{display:block;width:12px;height:12px}
.wlkr-pager-counter{display:inline-flex;align-items:center;gap:.35em;padding:0 4px;font-size:15px;font-weight:500;white-space:nowrap;font-variant-numeric:tabular-nums;font-feature-settings:"tnum"}
.wlkr-pager-digits{display:inline-flex}
.wlkr-pager-wheel{display:block;width:1ch;height:1em;overflow:hidden}
.wlkr-pager-strip{display:block;white-space:pre;line-height:1em;will-change:transform}
.wlkr-pager-total{color:var(--muted-foreground,#696969)}
.wlkr-pager-pages{--wlkr-pager-cell:min(44px,calc(100cqi / var(--wlkr-pager-slots)));position:relative;display:flex;margin:0;padding:0;list-style:none}
.wlkr-pager-pages>li{display:grid;place-items:center;flex:none;width:var(--wlkr-pager-cell);height:44px;font-size:13px;font-variant-numeric:tabular-nums;font-feature-settings:"tnum";color:var(--muted-foreground,#696969)}
.wlkr-pager-page{display:grid;place-items:center;width:100%;height:100%;padding:0;border:0;border-radius:2px;background:none;font:inherit;color:inherit;text-decoration:none;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.wlkr-pager-page[aria-current=page]{color:var(--foreground,currentColor);cursor:default}
@media(hover:hover){.wlkr-pager-page:hover{color:var(--foreground,currentColor)}}
.wlkr-pager-pages>.wlkr-pager-mark{position:absolute;left:0;bottom:7px;width:5px;height:5px;background:var(--brand,#33f282);transform:translateX(calc(var(--wlkr-pager-slot) * var(--wlkr-pager-cell) + var(--wlkr-pager-cell) / 2 - 2.5px));pointer-events:none}
.wlkr-pager :is(.wlkr-pager-arrow,.wlkr-pager-page):focus-visible{outline:2px solid var(--ring,currentColor);outline-offset:3px}
.wlkr-pager-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
@media(prefers-reduced-motion:no-preference){.wlkr-pager-pages>.wlkr-pager-mark{transition:transform 380ms cubic-bezier(.2,.7,.2,1)}.wlkr-pager-page{transition:color 120ms ease}}
`

const DIGITS = "0\n1\n2\n3\n4\n5\n6\n7\n8\n9\n0"
const DURATION = 380
const STAGGER = 40

const clamp = (input: unknown, min: number, max: number, fallback: number) => {
  const number = Number(input)
  return input === "" || input === null || !Number.isFinite(number) ? fallback : Math.min(max, Math.max(min, number))
}
const wrap = (position: number) => ((position % 10) + 10) % 10
const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, index) => from + index)

/** cubic-bezier(.2,.7,.2,1), solved for y at time x. */
const ease = (x: number) => {
  let t = x
  for (let index = 0; index < 6; index++) {
    const error = 0.6 * t * (1 - t) ** 2 + 0.6 * t * t * (1 - t) + t ** 3 - x
    const slope = 0.6 * (1 - t) ** 2 + 2.4 * t * t
    if (Math.abs(slope) < 1e-6) break
    t = Math.min(1, Math.max(0, t - error / slope))
  }
  return 2.1 * t * (1 - t) ** 2 + 3 * t * t * (1 - t) + t ** 3
}

/** Always the same number of slots for a given count and siblings, so the strip never changes width. */
function slotsFor(page: number, count: number, siblings: number): Slot[] {
  const total = siblings * 2 + 5
  if (count <= total) return range(1, count)
  if (page <= siblings + 3) return [...range(1, siblings * 2 + 3), "end", count]
  if (page >= count - siblings - 2) return [1, "start", ...range(count - siblings * 2 - 2, count)]
  return [1, "start", ...range(page - siblings, page + siblings), "end", count]
}

const subscribeMotion = (notify: () => void) => {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)")
  media.addEventListener("change", notify)
  return () => media.removeEventListener("change", notify)
}

function Wheel({ digit, direction, delay, reduced }: { digit: number; direction: number; delay: number; reduced: boolean }) {
  const strip = React.useRef<HTMLSpanElement>(null)
  const [resting] = React.useState(digit)
  const motion = React.useRef({ position: digit, target: digit, frame: 0, moving: false })
  React.useEffect(() => {
    const element = strip.current, state = motion.current
    if (!element || digit === state.target) return
    cancelAnimationFrame(state.frame)
    const place = (position: number) => { element.style.transform = `translateY(${-wrap(position)}em)` }
    const sign = direction < 0 ? -1 : 1
    const from = state.position
    const distance = sign * wrap(sign * (digit - from))
    state.target = digit
    if (reduced || Math.abs(distance) < 0.001) { state.position = digit; state.moving = false; place(digit); return }
    const start = performance.now() + (state.moving ? 0 : delay)
    state.moving = true
    const step = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / DURATION))
      state.position = t < 1 ? from + distance * ease(t) : digit
      state.moving = t < 1
      place(state.position)
      if (t < 1) state.frame = requestAnimationFrame(step)
    }
    state.frame = requestAnimationFrame(step)
  }, [digit, direction, delay, reduced])
  React.useEffect(() => {
    const state = motion.current
    return () => cancelAnimationFrame(state.frame)
  }, [])
  return <span className="wlkr-pager-wheel"><span ref={strip} className="wlkr-pager-strip" style={{ transform: `translateY(${-resting}em)` }}>{DIGITS}</span></span>
}

function Chevron({ flip }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 12 12" shapeRendering="crispEdges" aria-hidden="true" focusable="false" style={flip ? { transform: "scaleX(-1)" } : undefined}>
      <path fill="currentColor" d="M7 1h2v2H7zM5 3h2v2H5zM3 5h2v2H3zM5 7h2v2H5zM7 9h2v2H7z" />
    </svg>
  )
}

/** Pagination with a counter that rolls in the direction you moved, plus an optional strip of page numbers. */
export function Pager({ page, onPageChange, count, getHref, siblings = 1, showPages = true, label = "Pagination", className, onKeyDown, ...props }: PagerProps) {
  const total = Math.floor(clamp(count, 0, 99999, 0))
  const current = Math.round(clamp(page, 1, Math.max(1, total), 1))
  const around = Math.round(clamp(siblings, 0, 3, 1))
  const reduced = React.useSyncExternalStore(subscribeMotion, () => window.matchMedia("(prefers-reduced-motion: reduce)").matches, () => false)
  const nav = React.useRef<HTMLElement>(null)
  const [view, setView] = React.useState({ page: current, direction: 0 })
  if (view.page !== current) setView({ page: current, direction: Math.sign(current - view.page) })
  if (total < 1) return null

  const go = (next: number) => {
    if (next < 1 || next > total || next === current) return
    const active = document.activeElement
    const edge = next === 1 ? "prev" : next === total ? "next" : null
    if (edge && active instanceof HTMLElement && active.dataset.step === edge) {
      nav.current?.querySelector<HTMLElement>(`[data-step="${edge === "prev" ? "next" : "prev"}"]`)?.focus()
    }
    onPageChange?.(next)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
    const step = event.key === "ArrowLeft" ? "prev" : event.key === "ArrowRight" ? "next" : null
    const control = step && event.currentTarget.querySelector<HTMLElement>(`[data-step="${step}"]`)
    if (!control || control.matches(":disabled,[aria-disabled=true]")) return
    event.preventDefault()
    control.click()
  }

  const arrow = (step: "prev" | "next") => {
    const target = current + (step === "prev" ? -1 : 1)
    const disabled = target < 1 || target > total
    const shared = { className: "wlkr-pager-arrow", "data-step": step, "aria-label": step === "prev" ? "Previous page" : "Next page" }
    const icon = <Chevron flip={step === "next"} />
    return getHref
      ? <a {...shared} href={disabled ? undefined : getHref(target)} aria-disabled={disabled || undefined} onClick={disabled ? undefined : () => go(target)}>{icon}</a>
      : <button {...shared} type="button" disabled={disabled} onClick={() => go(target)}>{icon}</button>
  }

  const width = String(total).length
  const digits = String(current).padStart(width, "0")
  const slots = slotsFor(current, total, around)

  return (
    <nav {...props} ref={nav} aria-label={label} className={cn("wlkr-pager", className)} onKeyDown={handleKeyDown}>
      <style>{styles}</style>
      <div className="wlkr-pager-row">
        <div className="wlkr-pager-steps">
          {arrow("prev")}
          <span className="wlkr-pager-counter" aria-hidden="true">
            <span className="wlkr-pager-digits">
              {[...digits].map((digit, index) => {
                const fromRight = width - 1 - index
                return <Wheel key={fromRight} digit={Number(digit)} direction={view.direction} delay={fromRight * STAGGER} reduced={reduced} />
              })}
            </span>
            <span className="wlkr-pager-total">/ {total}</span>
          </span>
          {arrow("next")}
        </div>
        {showPages && (
          <ul className="wlkr-pager-pages" style={{ "--wlkr-pager-slots": slots.length } as React.CSSProperties}>
            {slots.map(slot => typeof slot === "number"
              ? <li key={slot}>{getHref
                ? <a className="wlkr-pager-page" href={getHref(slot)} aria-label={`Page ${slot}`} aria-current={slot === current ? "page" : undefined} onClick={() => go(slot)}>{slot}</a>
                : <button type="button" className="wlkr-pager-page" aria-label={`Page ${slot}`} aria-current={slot === current ? "page" : undefined} onClick={() => go(slot)}>{slot}</button>}</li>
              : <li key={slot} aria-hidden="true">…</li>)}
            <li className="wlkr-pager-mark" aria-hidden="true" style={{ "--wlkr-pager-slot": slots.indexOf(current) } as React.CSSProperties} />
          </ul>
        )}
      </div>
      <span role="status" className="wlkr-pager-sr">Page {current} of {total}</span>
    </nav>
  )
}
