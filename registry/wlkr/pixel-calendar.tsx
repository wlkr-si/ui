"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type PixelCalendarProps = Omit<React.ComponentPropsWithoutRef<"div">, "defaultValue" | "onChange"> & {
  value?: Date | null
  defaultValue?: Date | null
  onValueChange?: (value: Date | null) => void
  /** Any date inside the month to show. */
  month?: Date
  defaultMonth?: Date
  onMonthChange?: (month: Date) => void
  min?: Date
  max?: Date
  /** 0 is Sunday, 1 is Monday. */
  weekStartsOn?: 0 | 1
  locale?: string
  /** Marks this day as today. Without it, today is read on the client after mount. */
  today?: Date
}

type Day = { y: number; m: number; d: number }

const toDay = (date: Date): Day => ({ y: date.getFullYear(), m: date.getMonth(), d: date.getDate() })
const make = (y: number, m: number, d: number) => { const out = new Date(y, m, d); out.setHours(12, 0, 0, 0); return out }
const key = (day: Day) => day.y * 10000 + day.m * 100 + day.d
const keyOf = (date: Date | null | undefined) => (date ? key(toDay(date)) : null)
const addDays = (date: Date, n: number) => make(date.getFullYear(), date.getMonth(), date.getDate() + n)
const addMonths = (date: Date, n: number) => {
  const y = date.getFullYear(), m = date.getMonth() + n
  const last = new Date(y, m + 1, 0).getDate()
  return make(y, m, Math.min(date.getDate(), last))
}
const sameMonth = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()

const noop = () => () => {}
const todayKey = () => key(toDay(new Date()))
const serverToday = () => null

const styles = `
.wlkr-pixel-calendar{display:inline-flex;flex-direction:column;gap:12px;width:100%;max-width:320px;min-width:0;color:var(--foreground,currentColor)}
.wlkr-pixel-calendar-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
.wlkr-pixel-calendar-title{font-family:var(--font-mono,ui-monospace,monospace);font-size:12px;letter-spacing:.12em;text-transform:uppercase;font-variant-numeric:tabular-nums}
.wlkr-pixel-calendar-nav{display:flex;gap:4px}
.wlkr-pixel-calendar-step{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;padding:0;border:1px solid var(--border,currentColor);border-radius:0;background:transparent;color:inherit;cursor:pointer}
.wlkr-pixel-calendar-step:hover:not(:disabled){background:var(--foreground,currentColor);color:var(--background,#fff)}
.wlkr-pixel-calendar-step:disabled{opacity:.35;cursor:default}
.wlkr-pixel-calendar-step svg{width:10px;height:10px;shape-rendering:crispEdges}
.wlkr-pixel-calendar-grid{display:flex;flex-direction:column;gap:2px}
.wlkr-pixel-calendar-row{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:2px}
.wlkr-pixel-calendar-wd{font-family:var(--font-mono,ui-monospace,monospace);font-size:11px;text-align:center;color:var(--muted-foreground,#6b6b6b);padding:4px 0}
.wlkr-pixel-calendar-cell{display:flex}
.wlkr-pixel-calendar-day{position:relative;width:100%;aspect-ratio:1;padding:0;border:0;border-radius:0;background:transparent;color:inherit;font:inherit;font-size:13px;font-variant-numeric:tabular-nums;cursor:pointer;transition:background-color 120ms steps(2,end),color 120ms steps(2,end)}
.wlkr-pixel-calendar-day:hover:not([aria-disabled=true]){background:color-mix(in srgb,var(--foreground,currentColor) 10%,transparent)}
.wlkr-pixel-calendar-day[data-outside]{color:var(--muted-foreground,#6b6b6b);opacity:.6}
.wlkr-pixel-calendar-day[aria-disabled=true]{opacity:.3;cursor:default;text-decoration:line-through}
.wlkr-pixel-calendar-day[data-selected],.wlkr-pixel-calendar-day[data-selected]:hover{background:var(--foreground,currentColor);color:var(--background,#fff);opacity:1}
.wlkr-pixel-calendar-day[data-today]::after{content:"";position:absolute;top:3px;right:3px;width:4px;height:4px;background:var(--brand,#33f282)}
.wlkr-pixel-calendar-day:focus-visible,.wlkr-pixel-calendar-step:focus-visible{outline:2px solid var(--brand,#33f282);outline-offset:2px;z-index:1}
@media(prefers-reduced-motion:reduce){.wlkr-pixel-calendar-day{transition:none}}
`

const Arrow = ({ flip }: { flip?: boolean }) => (
  <svg viewBox="0 0 5 5" aria-hidden="true" style={flip ? { transform: "scaleX(-1)" } : undefined}>
    <path fill="currentColor" d="M3 0h1v1H3zM2 1h1v1H2zM1 2h1v1H1zM2 3h1v1H2zM3 4h1v1H3z" />
  </svg>
)

/** A one-month date picker on a square grid. The chosen day is a solid block; today wears a green pixel. */
export function PixelCalendar({
  value, defaultValue = null, onValueChange, month, defaultMonth, onMonthChange, min, max,
  weekStartsOn = 1, locale = "en-GB", today, className, ...props
}: PixelCalendarProps) {
  const id = React.useId()
  const [innerValue, setInnerValue] = React.useState<Date | null>(defaultValue)
  const selected = value !== undefined ? value : innerValue
  const [innerMonth, setInnerMonth] = React.useState<Date>(() => {
    const base = defaultMonth ?? defaultValue ?? today ?? make(2026, 0, 1)
    return make(base.getFullYear(), base.getMonth(), 1)
  })
  const shownSource = month ?? innerMonth
  const shown = make(shownSource.getFullYear(), shownSource.getMonth(), 1)
  const [focused, setFocused] = React.useState<Date | null>(null)
  const clientToday = React.useSyncExternalStore(noop, todayKey, serverToday)
  const todayK = today ? keyOf(today) : clientToday
  const gridRef = React.useRef<HTMLDivElement>(null)
  const pendingFocus = React.useRef(false)

  const minK = keyOf(min), maxK = keyOf(max)
  const isDisabled = (date: Date) => { const k = keyOf(date)!; return (minK !== null && k < minK) || (maxK !== null && k > maxK) }
  const clamp = (date: Date) => (min && minK !== null && keyOf(date)! < minK ? make(min.getFullYear(), min.getMonth(), min.getDate()) : max && maxK !== null && keyOf(date)! > maxK ? make(max.getFullYear(), max.getMonth(), max.getDate()) : date)

  const todayDate = todayK !== null ? make(Math.floor(todayK / 10000), Math.floor(todayK / 100) % 100, todayK % 100) : null
  const active = [focused, selected, todayDate].find(d => d && sameMonth(d, shown)) ?? shown

  const setMonth = (next: Date) => {
    const first = make(next.getFullYear(), next.getMonth(), 1)
    if (month === undefined) setInnerMonth(first)
    onMonthChange?.(first)
  }
  const select = (date: Date) => {
    if (isDisabled(date)) return
    if (value === undefined) setInnerValue(date)
    onValueChange?.(date)
    setFocused(date)
    if (!sameMonth(date, shown)) setMonth(date)
  }
  const moveTo = (date: Date) => {
    const next = clamp(date)
    setFocused(next)
    if (!sameMonth(next, shown)) setMonth(next)
    pendingFocus.current = true
  }

  React.useEffect(() => {
    if (!pendingFocus.current) return
    pendingFocus.current = false
    gridRef.current?.querySelector<HTMLButtonElement>('[tabindex="0"]')?.focus()
  })

  const onKeyDown = (event: React.KeyboardEvent, date: Date) => {
    const offset = (date.getDay() - weekStartsOn + 7) % 7
    const moves: Record<string, () => Date> = {
      ArrowLeft: () => addDays(date, -1), ArrowRight: () => addDays(date, 1),
      ArrowUp: () => addDays(date, -7), ArrowDown: () => addDays(date, 7),
      PageUp: () => addMonths(date, event.shiftKey ? -12 : -1), PageDown: () => addMonths(date, event.shiftKey ? 12 : 1),
      Home: () => addDays(date, -offset), End: () => addDays(date, 6 - offset),
    }
    if (moves[event.key]) { event.preventDefault(); moveTo(moves[event.key]()) }
    else if (event.key === "Enter" || event.key === " ") { event.preventDefault(); select(date) }
  }

  const lead = (shown.getDay() - weekStartsOn + 7) % 7
  const start = addDays(shown, -lead)
  const daysInMonth = new Date(shown.getFullYear(), shown.getMonth() + 1, 0).getDate()
  const weeks = Math.ceil((lead + daysInMonth) / 7)
  const rows = Array.from({ length: weeks }, (_, w) => Array.from({ length: 7 }, (_, i) => addDays(start, w * 7 + i)))
  const weekdays = rows[0].map(d => ({
    short: d.toLocaleDateString(locale, { weekday: "narrow" }),
    long: d.toLocaleDateString(locale, { weekday: "long" }),
  }))
  const title = shown.toLocaleDateString(locale, { month: "long", year: "numeric" })
  const prevMonthEnd = make(shown.getFullYear(), shown.getMonth(), 0)
  const nextMonthStart = make(shown.getFullYear(), shown.getMonth() + 1, 1)
  const selectedK = keyOf(selected), activeK = keyOf(active)

  return (
    <div {...props} className={cn("wlkr-pixel-calendar", className)}>
      <style>{styles}</style>
      <div className="wlkr-pixel-calendar-head">
        <span id={`${id}-title`} className="wlkr-pixel-calendar-title" aria-live="polite">{title}</span>
        <div className="wlkr-pixel-calendar-nav">
          <button type="button" className="wlkr-pixel-calendar-step" aria-label="Previous month"
            disabled={minK !== null && keyOf(prevMonthEnd)! < minK} onClick={() => { setFocused(null); setMonth(addMonths(shown, -1)) }}>
            <Arrow />
          </button>
          <button type="button" className="wlkr-pixel-calendar-step" aria-label="Next month"
            disabled={maxK !== null && keyOf(nextMonthStart)! > maxK} onClick={() => { setFocused(null); setMonth(addMonths(shown, 1)) }}>
            <Arrow flip />
          </button>
        </div>
      </div>
      <div ref={gridRef} role="grid" aria-labelledby={`${id}-title`} className="wlkr-pixel-calendar-grid">
        <div role="row" className="wlkr-pixel-calendar-row">
          {weekdays.map(w => (
            <span key={w.long} role="columnheader" aria-label={w.long} className="wlkr-pixel-calendar-wd">{w.short}</span>
          ))}
        </div>
        {rows.map(row => (
          <div key={keyOf(row[0])} role="row" className="wlkr-pixel-calendar-row">
            {row.map(date => {
              const k = keyOf(date)!
              const disabled = isDisabled(date)
              const isSelected = k === selectedK
              return (
                <div key={k} role="gridcell" aria-selected={isSelected} className="wlkr-pixel-calendar-cell">
                  <button
                    type="button"
                    className="wlkr-pixel-calendar-day"
                    tabIndex={k === activeK ? 0 : -1}
                    aria-label={date.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    aria-disabled={disabled || undefined}
                    aria-current={k === todayK ? "date" : undefined}
                    data-selected={isSelected ? "" : undefined}
                    data-today={k === todayK ? "" : undefined}
                    data-outside={sameMonth(date, shown) ? undefined : ""}
                    onClick={() => select(date)}
                    onKeyDown={event => onKeyDown(event, date)}
                  >
                    {date.getDate()}
                  </button>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
