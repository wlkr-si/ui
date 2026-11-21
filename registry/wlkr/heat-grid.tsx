"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type HeatGridProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  /** One entry per day, ISO `YYYY-MM-DD`. Missing days count as 0; repeated days add up. */
  data: { date: string; count: number }[]
  /** ISO date of the last day shown. Required so server and client agree. */
  end: string
  /** Columns, 4–53. */
  weeks?: number
  /** 0 starts each column on Sunday, 1 on Monday. */
  weekStart?: 0 | 1
  /** Ascending thresholds for intensity 1…4. Defaults to quantiles of the visible busy days. */
  levels?: number[]
  /** Cell size and gap in px. */
  cell?: number
  gap?: number
  formatDate?: (date: Date) => string
  unit?: [singular: string, plural: string]
  /** Accessible name of the grid. */
  label: string
  showMonths?: boolean
}

const styles = `
.wlkr-heat-grid{display:block;width:100%;max-width:100%;color:var(--foreground,currentColor);font-variant-numeric:tabular-nums;font-feature-settings:"tnum"}
.wlkr-heat-grid-scroll{display:block;box-sizing:border-box;contain:inline-size;padding:3px;overflow-x:auto;overflow-y:hidden;direction:rtl;scrollbar-width:thin;outline:none}
.wlkr-heat-grid-scroll:focus-visible{outline:2px solid var(--ring,currentColor);outline-offset:3px}
.wlkr-heat-grid-plane{direction:ltr;display:flex;flex-direction:column;gap:var(--wlkr-heat-grid-gap);width:max-content}
.wlkr-heat-grid-months{position:relative;height:13px;overflow:hidden;font-size:11px;line-height:11px;color:var(--muted-foreground,#696969)}
.wlkr-heat-grid-months>span{position:absolute;top:0}
.wlkr-heat-grid-row{display:flex;gap:var(--wlkr-heat-grid-gap)}
.wlkr-heat-grid-cell,.wlkr-heat-grid-swatch{position:relative;flex:none;width:var(--wlkr-heat-grid-cell);height:var(--wlkr-heat-grid-cell);border-radius:1px}
.wlkr-heat-grid-swatch{width:10px;height:10px}
.wlkr-heat-grid-cell::before,.wlkr-heat-grid-swatch::before{content:"";position:absolute;inset:0;border-radius:inherit;background:var(--foreground,currentColor)}
.wlkr-heat-grid [data-level="0"]::before{background:var(--muted,#f3f3f3)}
.dark .wlkr-heat-grid [data-level="0"]::before{background:var(--border,#343434);opacity:.6}
.wlkr-heat-grid [data-level="1"]::before{opacity:.25}
.wlkr-heat-grid [data-level="2"]::before{opacity:.5}
.wlkr-heat-grid [data-level="3"]::before{opacity:.8}
.wlkr-heat-grid [data-level="4"]::before{background:var(--brand,#33f282)}
.wlkr-heat-grid-cell[data-hover]{outline:1px solid var(--foreground,currentColor);outline-offset:1px;z-index:1}
.wlkr-heat-grid-scroll:focus-visible .wlkr-heat-grid-cell[data-active]{outline:2px solid var(--ring,currentColor);outline-offset:1px;z-index:1}
.wlkr-heat-grid-foot{display:flex;flex-wrap:wrap;align-items:center;column-gap:16px;margin-top:6px;padding:0 3px}
.wlkr-heat-grid-readout{flex:1 1 200px;min-width:0;height:20px;font-size:12px;line-height:20px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--muted-foreground,#696969)}
.wlkr-heat-grid-readout>b{font-weight:inherit;color:var(--foreground,currentColor)}
.wlkr-heat-grid-legend{display:flex;align-items:center;gap:3px;height:20px;margin-left:auto;font-size:11px;color:var(--muted-foreground,#696969)}
.wlkr-heat-grid-legend>span:first-child{margin-right:4px}
.wlkr-heat-grid-legend>span:last-child{margin-left:4px}
@keyframes wlkr-heat-grid-in{from{opacity:0;transform:scale(.3)}}
@media (prefers-reduced-motion:no-preference){
.wlkr-heat-grid[data-state=waiting] .wlkr-heat-grid-cell{opacity:0}
.wlkr-heat-grid[data-state=entering] .wlkr-heat-grid-cell{animation:wlkr-heat-grid-in 280ms cubic-bezier(.2,.7,.2,1) both;animation-delay:var(--wlkr-heat-grid-delay)}
}
`

const DAY = 86400000
const SWEEP = 520
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const dateFormat = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" })
const numberFormat = new Intl.NumberFormat("en-US")

const clamp = (input: unknown, min: number, max: number, fallback: number) => {
  const number = Number(input)
  return input === "" || input === null || !Number.isFinite(number) ? fallback : Math.min(max, Math.max(min, number))
}
/** `YYYY-MM-DD` → whole days since 1970-01-01 (UTC), or null. */
const parseDay = (value: unknown) => {
  const match = typeof value === "string" ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(value) : null
  if (!match) return null
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])]
  const time = Date.UTC(year, month - 1, day)
  const date = new Date(time)
  return date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? time / DAY : null
}
const weekday = (day: number) => (((day + 4) % 7) + 7) % 7

/** An activity grid: seven rows of days, one column per week, with the busiest days in brand green. */
export function HeatGrid({ data, end, weeks = 26, weekStart = 0, levels, cell = 11, gap = 3, formatDate, unit, label, showMonths = true, className, style, ...props }: HeatGridProps) {
  const weekCount = Math.round(clamp(weeks, 4, 53, 26))
  const size = Math.round(clamp(cell, 6, 24, 11))
  const spacing = Math.round(clamp(gap, 1, 8, 3))
  const [singular, plural] = Array.isArray(unit) && typeof unit[0] === "string" && typeof unit[1] === "string" ? unit : ["contribution", "contributions"]
  const id = `wlkr-heat-grid-${React.useId().replace(/[^a-zA-Z0-9_-]/g, "")}`

  const model = React.useMemo(() => {
    const describe = typeof formatDate === "function" ? formatDate : (date: Date) => dateFormat.format(date)
    const counts = new Map<number, number>()
    let latest: number | null = null
    for (const entry of Array.isArray(data) ? data : []) {
      const day = parseDay(entry?.date)
      if (day === null) continue
      const count = Number(entry?.count)
      counts.set(day, (counts.get(day) ?? 0) + (Number.isFinite(count) && count > 0 ? count : 0))
      latest = latest === null ? day : Math.max(latest, day)
    }
    const last = parseDay(end) ?? latest ?? 0
    const tail = (weekday(last) - (weekStart === 1 ? 1 : 0) + 7) % 7
    const first = last - tail - (weekCount - 1) * 7
    const days = Array.from({ length: (weekCount - 1) * 7 + tail + 1 }, (_, index) => {
      const date = new Date((first + index) * DAY)
      return { count: counts.get(first + index) ?? 0, date, text: describe(date) }
    })
    const busy = days.map(day => day.count).filter(count => count > 0).sort((a, b) => a - b)
    const at = (quantile: number) => busy[Math.min(busy.length - 1, Math.floor(quantile * busy.length))]
    const given = Array.isArray(levels) ? levels.filter(Number.isFinite).sort((a, b) => a - b).slice(0, 4) : []
    const thresholds = given.length ? given : busy.length ? [busy[0], at(0.4), at(0.7), at(0.9)] : []
    const months: { week: number; text: string }[] = []
    for (let index = 0; index < days.length; index++) if (days[index].date.getUTCDate() === 1) months.push({ week: Math.floor(index / 7), text: MONTHS[days[index].date.getUTCMonth()] })
    if (!months.length || months[0].week >= 3) months.unshift({ week: 0, text: MONTHS[days[0].date.getUTCMonth()] })
    return {
      days: days.map(day => ({ ...day, level: day.count > 0 ? thresholds.filter(threshold => day.count >= threshold).length : 0 })),
      months: months.filter(month => month.week <= weekCount - 3),
      total: busy.reduce((sum, count) => sum + count, 0),
    }
  }, [data, end, weekCount, weekStart, levels, formatDate])

  const lastIndex = model.days.length - 1
  const [hover, setHover] = React.useState<number | null>(null)
  const [active, setActive] = React.useState<number | null>(null)
  const [focused, setFocused] = React.useState(false)
  const [entered, setEntered] = React.useState(false)
  const root = React.useRef<HTMLDivElement>(null)
  const current = Math.min(active ?? lastIndex, lastIndex)
  const shownHover = hover !== null && hover <= lastIndex ? hover : null

  React.useEffect(() => {
    const element = root.current
    if (!element) return
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return
      setEntered(true)
      observer.disconnect()
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const dayAt = (event: React.PointerEvent) => {
    const index = Number((event.target as Element).closest?.("[data-day]")?.getAttribute("data-day"))
    return Number.isInteger(index) && index >= 0 ? index : null
  }
  const amount = (count: number) => `${numberFormat.format(count)} ${count === 1 ? singular : plural}`

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const row = current % 7
    let next: number
    switch (event.key) {
      case "ArrowUp": next = row > 0 ? current - 1 : current; break
      case "ArrowDown": next = row < 6 && current < lastIndex ? current + 1 : current; break
      case "ArrowLeft": next = current >= 7 ? current - 7 : current; break
      case "ArrowRight": next = current + 7; break
      case "PageUp": next = Math.max(row, current - 28); break
      case "PageDown": next = current + 28; break
      case "Home": next = event.ctrlKey ? 0 : row; break
      case "End": next = event.ctrlKey ? lastIndex : (weekCount - 1) * 7 + row; break
      default: return
    }
    event.preventDefault()
    while (next > lastIndex) next -= 7
    setActive(next)
    setHover(null)
    document.getElementById(`${id}-${next}`)?.scrollIntoView({ block: "nearest", inline: "nearest" })
  }

  const reading = shownHover ?? (focused ? current : null)
  const pitch = size + spacing
  return (
    <div
      {...props}
      ref={root}
      className={cn("wlkr-heat-grid", className)}
      data-state={entered ? "entering" : "waiting"}
      style={{ "--wlkr-heat-grid-cell": `${size}px`, "--wlkr-heat-grid-gap": `${spacing}px`, maxWidth: weekCount * pitch - spacing + 6, ...style } as React.CSSProperties}
    >
      <style>{styles}</style>
      <div
        className="wlkr-heat-grid-scroll"
        role="grid"
        aria-label={label}
        aria-activedescendant={`${id}-${current}`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onPointerOver={event => { const index = dayAt(event); if (index !== null) setHover(index) }}
        onPointerDown={event => { const index = dayAt(event); if (index !== null) { setActive(index); setHover(index) } }}
        onPointerLeave={event => { if (event.pointerType !== "touch") setHover(null) }}
      >
        <div className="wlkr-heat-grid-plane">
          {showMonths && (
            <div className="wlkr-heat-grid-months" aria-hidden="true">
              {model.months.map(month => <span key={month.week} style={{ left: month.week * pitch }}>{month.text}</span>)}
            </div>
          )}
          {Array.from({ length: 7 }, (_, row) => (
            <div key={row} className="wlkr-heat-grid-row" role="row">
              {Array.from({ length: weekCount }, (_, week) => week * 7 + row).filter(index => index <= lastIndex).map(index => (
                <div
                  key={index}
                  id={`${id}-${index}`}
                  role="gridcell"
                  aria-label={`${amount(model.days[index].count)} on ${model.days[index].text}`}
                  className="wlkr-heat-grid-cell"
                  data-day={index}
                  data-level={model.days[index].level}
                  data-active={index === current ? "" : undefined}
                  data-hover={index === shownHover ? "" : undefined}
                  style={{ "--wlkr-heat-grid-delay": `${Math.round(((Math.floor(index / 7) + row) / (weekCount + 5)) * SWEEP)}ms` } as React.CSSProperties}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="wlkr-heat-grid-foot" aria-hidden="true">
        <div className="wlkr-heat-grid-readout">
          {reading === null
            ? <><b>{numberFormat.format(model.total)}</b> {model.total === 1 ? singular : plural} in the last {weekCount} weeks</>
            : <><b>{numberFormat.format(model.days[reading].count)}</b> {model.days[reading].count === 1 ? singular : plural} on {model.days[reading].text}</>}
        </div>
        <div className="wlkr-heat-grid-legend">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map(level => <span key={level} className="wlkr-heat-grid-swatch" data-level={level} />)}
          <span>More</span>
        </div>
      </div>
    </div>
  )
}
