"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type RollingNumberProps = Omit<React.ComponentProps<"span">, "children"> & {
  value: number
  /** Passed to Intl.NumberFormat, e.g. `{ style: "currency", currency: "USD" }`. */
  format?: Intl.NumberFormatOptions
  /** Fixed by default so server and client format the same way. */
  locale?: string
  /** Roll duration in milliseconds, clamped to 150–3000. */
  duration?: number
}

type Token = { key: string; char: string; digit: boolean; present: boolean; entering: boolean }

const styles = `
.wlkr-rolling-number{display:inline-flex;align-items:flex-start;line-height:1;white-space:nowrap;font-variant-numeric:tabular-nums;font-feature-settings:"tnum"}
.wlkr-rolling-number-strut{align-self:baseline;width:0}
.wlkr-rolling-number-col{display:inline-grid;user-select:none;-webkit-user-select:none;grid-template-columns:1fr;opacity:1;transition:grid-template-columns var(--wlkr-rolling-number-duration) cubic-bezier(.2,.7,.2,1) var(--wlkr-rolling-number-delay,0ms),opacity var(--wlkr-rolling-number-duration) ease var(--wlkr-rolling-number-delay,0ms)}
.wlkr-rolling-number-col[data-leaving]{grid-template-columns:0fr;opacity:0}
.wlkr-rolling-number-cell{display:block;min-width:0;height:1em;overflow-x:clip;white-space:pre}
.wlkr-rolling-number-wheel{overflow:hidden}
.wlkr-rolling-number-strip{display:block}
.wlkr-rolling-number-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
@starting-style{.wlkr-rolling-number-col[data-entering]{grid-template-columns:0fr;opacity:0}}
@media(prefers-reduced-motion:reduce){.wlkr-rolling-number-col{transition:none}}
`
const STRIP = "0\n1\n2\n3\n4\n5\n6\n7\n8\n9\n0"
const STAGGER = 35
const wrap = (position: number) => ((position % 10) + 10) % 10

function formatParts(value: number, locale: string, format?: Intl.NumberFormatOptions) {
  try { return new Intl.NumberFormat(locale, format).formatToParts(value) }
  catch { return new Intl.NumberFormat("en-US").formatToParts(value) }
}

/** Integer digits are keyed from the right, fraction digits from the decimal point, so existing wheels stay put. */
function tokenize(parts: Intl.NumberFormatPart[] | null): Token[] {
  if (!parts) return [{ key: "dash", char: "–", digit: false, present: true, entering: false }]
  const integers = parts.reduce((total, part) => total + (part.type === "integer" ? part.value.length : 0), 0)
  const counts: Record<string, number> = {}
  const tokens: Token[] = []
  let seen = 0, fraction = 0
  for (const part of parts) {
    if (part.type === "integer" || part.type === "fraction") {
      for (const char of part.value) tokens.push({ key: part.type === "integer" ? `i${integers - 1 - seen++}` : `f${fraction++}`, char, digit: /\d/.test(char), present: true, entering: false })
    } else {
      const key = part.type === "group" ? `g${integers - seen}` : `${part.type}${counts[part.type] = (counts[part.type] ?? -1) + 1}`
      tokens.push({ key, char: part.value, digit: false, present: true, entering: false })
    }
  }
  return tokens
}

/** Keeps departing tokens in place, collapsed, until their exit transition ends. */
function merge(previous: Token[], next: Token[]): Token[] {
  const result = next.map(token => ({ ...token, entering: !previous.some(old => old.key === token.key) }))
  let at = 0
  for (const token of previous) {
    const index = result.findIndex(item => item.present && item.key === token.key)
    if (index >= 0) at = index + 1
    else result.splice(at++, 0, { ...token, present: false, entering: false })
  }
  return result
}

function Wheel({ digit, direction, delay, duration }: { digit: number; direction: number; delay: number; duration: number }) {
  const strip = React.useRef<HTMLSpanElement>(null)
  const [resting] = React.useState(digit)
  const motion = React.useRef({ position: digit, target: digit, sign: 1, frame: 0, moving: false })
  React.useEffect(() => {
    const element = strip.current, state = motion.current
    if (!element) return
    const sign = digit !== state.target ? (direction < 0 ? -1 : 1) : state.sign
    const from = state.position
    const ahead = wrap(sign * (digit - from))
    const distance = sign * (ahead > 9.5 ? ahead - 10 : ahead)
    const place = (position: number) => { element.style.transform = `translateY(${-wrap(position)}em)` }
    state.target = digit
    state.sign = sign
    if (Math.abs(distance) < .001 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      state.position = digit; state.moving = false; place(digit); return
    }
    const start = performance.now() + (state.moving ? 0 : delay)
    const step = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / duration))
      const overshoot = .08 * Math.sign(distance) * (1 - Math.cos(2 * Math.PI * t * t)) / 2
      state.position = t < 1 ? from + distance * (1 - (1 - t) ** 5) + overshoot : digit
      state.moving = t < 1
      place(state.position)
      if (t < 1) state.frame = requestAnimationFrame(step)
    }
    state.moving = true
    state.frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(state.frame)
  }, [digit, direction, delay, duration])
  return <span className="wlkr-rolling-number-cell wlkr-rolling-number-wheel"><span ref={strip} className="wlkr-rolling-number-strip" style={{ transform: `translateY(${-resting}em)` }}>{STRIP}</span></span>
}

/** A formatted number whose digits roll like an odometer whenever `value` changes. */
export function RollingNumber({ value, format, locale = "en-US", duration = 700, className, style, ...props }: RollingNumberProps) {
  const finite = typeof value === "number" && Number.isFinite(value)
  const parts = finite ? formatParts(Object.is(value, -0) ? 0 : value, locale, format) : null
  const text = parts ? parts.map(part => part.value).join("") : "–"
  const milliseconds = Number.isFinite(duration) ? Math.max(150, Math.min(3000, duration)) : 700
  const [view, setView] = React.useState(() => ({ text, value, direction: 0, tokens: tokenize(parts) }))
  if (view.text !== text) {
    setView({ text, value, direction: finite && Number.isFinite(view.value) ? Math.sign(value - view.value) : 0, tokens: merge(view.tokens, tokenize(parts)) })
  }
  const delays = new Map<string, number>()
  let order = 0
  for (let index = view.tokens.length - 1; index >= 0; index--) {
    const token = view.tokens[index]
    if (!token.present) continue
    delays.set(token.key, Math.min(order, 10) * STAGGER)
    if (token.digit) order++
  }
  const settle = (key: string) => (event: React.TransitionEvent<HTMLSpanElement>) => {
    if (event.target === event.currentTarget && event.propertyName === "grid-template-columns") setView(current => ({ ...current, tokens: current.tokens.filter(token => token.present || token.key !== key) }))
  }
  return <span {...props} className={cn("wlkr-rolling-number", className)} style={{ ...style, "--wlkr-rolling-number-duration": `${milliseconds}ms` } as React.CSSProperties}>
    <style>{styles}</style>
    <span className="wlkr-rolling-number-sr">{text}</span>
    <span className="wlkr-rolling-number-strut" aria-hidden="true">{"​"}</span>
    {view.tokens.map(token => <span key={token.key} aria-hidden="true" className="wlkr-rolling-number-col" data-leaving={token.present ? undefined : ""} data-entering={token.entering ? "" : undefined} onTransitionEnd={token.present ? undefined : settle(token.key)} style={{ "--wlkr-rolling-number-delay": `${delays.get(token.key) ?? 0}ms` } as React.CSSProperties}>
      {token.digit ? <Wheel digit={Number(token.char)} direction={view.direction} delay={delays.get(token.key) ?? 0} duration={milliseconds} /> : <span className="wlkr-rolling-number-cell">{token.char}</span>}
    </span>)}
  </span>
}
