"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type Unit = "days" | "hours" | "minutes" | "seconds"

export type CountdownProps = Omit<React.ComponentProps<"div">, "children" | "role"> & {
  /** Target time: a Date, epoch milliseconds, or any string `Date.parse` accepts. */
  to: Date | number | string
  /** Units to show, largest first. The largest shown unit absorbs overflow. */
  units?: Unit[]
  labels?: Partial<Record<Unit, string>>
  /** Called once when the countdown reaches zero. */
  onComplete?: () => void
  /** Shown in place of the wheels once finished. By default the zeros stay. */
  completed?: React.ReactNode
  /** A quiet two-square colon between units. */
  separator?: boolean
}

const styles = `
.wlkr-countdown{display:inline-flex;align-items:flex-start;gap:.2em;line-height:1;white-space:nowrap;font-variant-numeric:tabular-nums;font-feature-settings:"tnum"}
.wlkr-countdown[data-separator=false]{gap:.45em}
.wlkr-countdown-unit{display:inline-flex;flex-direction:column;align-items:flex-start}
.wlkr-countdown-digits{display:inline-flex;height:1em}
.wlkr-countdown-cell{display:grid;height:1em;overflow:hidden;user-select:none;-webkit-user-select:none}
.wlkr-countdown-cell>*{grid-area:1/1}
.wlkr-countdown-strip>span,.wlkr-countdown-ghost{display:block;height:1em;line-height:1em}
.wlkr-countdown-ghost{visibility:hidden}
.wlkr-countdown-dash{justify-self:center;line-height:1em;color:var(--muted-foreground,#696969)}
.wlkr-countdown-label{display:block;margin-top:8px;font-size:12px;line-height:1.3;font-weight:400;letter-spacing:0;color:var(--muted-foreground,#696969)}
.wlkr-countdown-colon{display:inline-flex;flex-direction:column;justify-content:center;gap:.2em;height:1em}
.wlkr-countdown-colon>span{display:block;width:max(2px,.09em);height:max(2px,.09em);background:var(--muted-foreground,#696969)}
.wlkr-countdown-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
`
const UNITS: Unit[] = ["days", "hours", "minutes", "seconds"]
const SECONDS: Record<Unit, number> = { days: 86400, hours: 3600, minutes: 60, seconds: 1 }
const LABELS: Record<Unit, string> = { days: "Days", hours: "Hours", minutes: "Minutes", seconds: "Seconds" }
const SPOKEN: Record<Unit, [string, string]> = { days: ["day", "days"], hours: ["hour", "hours"], minutes: ["minute", "minutes"], seconds: ["second", "seconds"] }
const ROLL = 450

/** One wall-clock ticker shared by every Countdown on the page. It runs only while one is mounted and the tab is visible. */
let now: number | null = null
let timer: ReturnType<typeof setTimeout> | undefined
const listeners = new Set<() => void>()
function schedule() {
  clearTimeout(timer)
  if (listeners.size && document.visibilityState === "visible") timer = setTimeout(tick, 1000 - (Date.now() % 1000))
}
function tick() {
  now = Date.now()
  listeners.forEach(listener => listener())
  schedule()
}
function onVisibility() {
  if (document.visibilityState === "visible") tick()
  else clearTimeout(timer)
}
function subscribeClock(listener: () => void) {
  listeners.add(listener)
  if (listeners.size === 1) {
    document.addEventListener("visibilitychange", onVisibility)
    now = Date.now()
    schedule()
  }
  return () => {
    listeners.delete(listener)
    if (listeners.size) return
    clearTimeout(timer)
    document.removeEventListener("visibilitychange", onVisibility)
    now = null
  }
}
const subscribeNothing = () => () => {}
const readClock = () => now
const readNothing = () => null

function toTime(input: unknown) {
  const time = input instanceof Date ? input.getTime() : typeof input === "number" ? input : typeof input === "string" && input.trim() ? Date.parse(input) : NaN
  return Number.isFinite(time) ? time : null
}

function split(total: number, units: Unit[]) {
  let rest = total
  return units.map(unit => {
    const value = Math.floor(rest / SECONDS[unit])
    rest -= value * SECONDS[unit]
    return value
  })
}

/** Minute resolution, so assistive tech never has a reason to speak every second. */
function speak(total: number, units: Unit[], labels?: Partial<Record<Unit, string>>) {
  const spoken = units.filter(unit => unit !== "seconds")
  const list: Unit[] = spoken.length ? spoken : ["minutes"]
  const values = split(Math.floor(total / 60) * 60, list)
  const found = values.findIndex(value => value > 0)
  const start = found < 0 ? list.length - 1 : found
  return list.slice(start).map((unit, index) => {
    const value = values[start + index]
    return `${value} ${labels?.[unit] ?? SPOKEN[unit][value === 1 ? 0 : 1]}`
  }).join(", ")
}

function Wheel({ digit, faces, roll }: { digit: number; faces: number; roll: boolean }) {
  const strip = React.useRef<HTMLSpanElement>(null)
  const shown = React.useRef(digit)
  React.useLayoutEffect(() => {
    const from = shown.current
    shown.current = digit
    const element = strip.current
    if (!element || from === digit || !roll || typeof element.animate !== "function" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const distance = (from - digit + faces) % faces
    const animation = element.animate([{ transform: `translateY(${-(digit + distance)}em)` }, { transform: `translateY(${-digit}em)` }], { duration: ROLL, easing: "cubic-bezier(.2,.7,.2,1)" })
    return () => animation.cancel()
  }, [digit, faces, roll])
  return <span className="wlkr-countdown-cell"><span ref={strip} className="wlkr-countdown-strip" style={{ transform: `translateY(${-digit}em)` }}>{Array.from({ length: faces * 2 }, (_, index) => <span key={index}>{index % faces}</span>)}</span></span>
}

/** Time left, on rolling digit wheels. Renders en dashes until mounted, then ticks once a second on the wall clock. */
export function Countdown({ to, units, labels, onComplete, completed, separator = true, className, "aria-label": ariaLabel = "Time remaining", ...props }: CountdownProps) {
  const time = toTime(to)
  const clock = React.useSyncExternalStore(time === null ? subscribeNothing : subscribeClock, time === null ? readNothing : readClock, readNothing)
  const total = time === null || clock === null ? null : Math.max(0, Math.ceil((time - clock) / 1000))
  const picked = UNITS.filter(unit => Array.isArray(units) && units.includes(unit))
  const shown = picked.length ? picked : UNITS
  const values = total === null ? null : split(total, shown)
  const done = total === 0

  // A normal one-second tick rolls; a jump (new target, tab resumed) switches straight to the right time.
  const [seen, setSeen] = React.useState<{ total: number | null; roll: boolean }>({ total, roll: false })
  if (seen.total !== total) setSeen({ total, roll: seen.total !== null && total !== null && seen.total - total === 1 })
  // The largest unit keeps the widest width it has needed for this target, so it never shrinks mid-count.
  const key = `${time}|${shown.join()}`
  const needed = values ? Math.max(2, String(values[0]).length) : 2
  const [reserve, setReserve] = React.useState({ key, digits: needed })
  if (reserve.key !== key || needed > reserve.digits) setReserve({ key, digits: needed })
  const widest = reserve.key === key ? Math.max(reserve.digits, needed) : needed

  const latest = React.useRef(onComplete)
  const fired = React.useRef<number | null>(null)
  React.useEffect(() => { latest.current = onComplete })
  React.useEffect(() => {
    if (!done || time === null || fired.current === time) return
    fired.current = time
    latest.current?.()
  }, [done, time])

  const finished = done && completed != null
  return (
    <div {...props} role="timer" aria-label={ariaLabel} aria-live="off" className={cn("wlkr-countdown", className)} data-separator={separator}>
      <style>{styles}</style>
      {finished ? completed : <>
        <span className="wlkr-countdown-sr">{total === null ? "" : speak(total, shown, labels)}</span>
        {shown.map((unit, index) => {
          const max = index === 0 ? Infinity : SECONDS[shown[index - 1]] / SECONDS[unit] - 1
          const digits = index === 0 ? widest : Math.max(2, String(max).length)
          const text = values ? String(values[index]).padStart(digits, "0") : null
          return <React.Fragment key={unit}>
            {separator && index > 0 && <span className="wlkr-countdown-colon" aria-hidden="true"><span /><span /></span>}
            <span className="wlkr-countdown-unit" aria-hidden="true">
              <span className="wlkr-countdown-digits">
                {Array.from({ length: digits }, (_, place) => {
                  const fromRight = digits - 1 - place
                  if (!text) return <span key={fromRight} className="wlkr-countdown-cell"><span className="wlkr-countdown-ghost">0</span><span className="wlkr-countdown-dash">–</span></span>
                  const faces = fromRight === digits - 1 && max !== Infinity ? Math.floor(max / 10 ** fromRight) + 1 : 10
                  return <Wheel key={fromRight} digit={Number(text[place])} faces={faces} roll={seen.roll} />
                })}
              </span>
              <span className="wlkr-countdown-label">{labels?.[unit] ?? LABELS[unit]}</span>
            </span>
          </React.Fragment>
        })}
      </>}
    </div>
  )
}
