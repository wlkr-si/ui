"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type LiquidTabsItem = { value: string; label: React.ReactNode; disabled?: boolean }

export type LiquidTabsProps = Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "children" | "role" | "onChange"> & {
  items: LiquidTabsItem[]
  /** Controlled selection. Pair with `onValueChange`. */
  value?: string
  onValueChange?: (value: string) => void
  /** Uncontrolled starting selection. Defaults to the first enabled item. */
  defaultValue?: string
  /** Accessible name for the group. */
  label: string
  /** "ink": a foreground blob with background text. "brand": a green blob with brand-foreground text. */
  tone?: "ink" | "brand"
  size?: "sm" | "md"
}

type Layout = { width: number; slots: [number, number][] }

const styles = `
.wlkr-liquid-tabs{--wlkr-liquid-tabs-fill:var(--foreground,currentColor);--wlkr-liquid-tabs-ink:var(--background,#fff);--wlkr-liquid-tabs-inset:6px;display:inline-flex;max-width:calc(100% + 12px);margin:-6px;padding:6px;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;vertical-align:middle}
.wlkr-liquid-tabs::-webkit-scrollbar{display:none}
.wlkr-liquid-tabs[data-tone=brand]{--wlkr-liquid-tabs-fill:var(--brand,#33f282);--wlkr-liquid-tabs-ink:var(--brand-foreground,#010101)}
.wlkr-liquid-tabs[data-size=sm]{--wlkr-liquid-tabs-inset:9px}
.wlkr-liquid-tabs-row{position:relative;display:inline-flex;flex:none}
.wlkr-liquid-tabs-row>svg{position:absolute;width:0;height:0}
.wlkr-liquid-tabs-blob{position:absolute;inset:0;pointer-events:none;visibility:hidden}
.wlkr-liquid-tabs[data-ready=true] .wlkr-liquid-tabs-blob{visibility:visible}
.wlkr-liquid-tabs-blob>span{position:absolute;left:0;background:var(--wlkr-liquid-tabs-fill)}
.wlkr-liquid-tabs-head,.wlkr-liquid-tabs-tail{top:var(--wlkr-liquid-tabs-inset);bottom:var(--wlkr-liquid-tabs-inset);width:1px;transform-origin:0 0}
.wlkr-liquid-tabs-neck{top:50%;height:calc((100% - 2 * var(--wlkr-liquid-tabs-inset)) * .42);transform:translateY(-50%)}
.wlkr-liquid-tabs[data-live=true] .wlkr-liquid-tabs-head{transition:transform 260ms cubic-bezier(.3,1.3,.5,1)}
.wlkr-liquid-tabs[data-live=true] .wlkr-liquid-tabs-tail{transition:transform 460ms cubic-bezier(.5,0,.2,1)}
.wlkr-liquid-tabs[data-live=true][data-direction=forward] .wlkr-liquid-tabs-neck{transition:right 260ms cubic-bezier(.3,1.3,.5,1),left 460ms cubic-bezier(.5,0,.2,1)}
.wlkr-liquid-tabs[data-live=true][data-direction=back] .wlkr-liquid-tabs-neck{transition:left 260ms cubic-bezier(.3,1.3,.5,1),right 460ms cubic-bezier(.5,0,.2,1)}
.wlkr-liquid-tabs-option{position:relative;display:inline-flex;align-items:center;justify-content:center;flex:none;min-height:44px;padding:0 16px;border:0;border-radius:0;background:none;font:inherit;font-size:14px;font-weight:500;line-height:1;letter-spacing:-.01em;white-space:nowrap;color:var(--muted-foreground,#696969);cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.wlkr-liquid-tabs[data-size=sm] .wlkr-liquid-tabs-option{padding:0 12px;font-size:13px}
.wlkr-liquid-tabs[data-live=true] .wlkr-liquid-tabs-option{transition:color 120ms ease}
@media(hover:hover){.wlkr-liquid-tabs-option:not(:disabled):not([aria-checked=true]):hover{color:var(--foreground,currentColor)}}
.wlkr-liquid-tabs-option[aria-checked=true]{color:var(--foreground,currentColor)}
.wlkr-liquid-tabs[data-ready=true] .wlkr-liquid-tabs-option[aria-checked=true]{color:var(--wlkr-liquid-tabs-ink)}
.wlkr-liquid-tabs[data-live=true] .wlkr-liquid-tabs-option[aria-checked=true]{transition:color 140ms ease 120ms}
.wlkr-liquid-tabs-option:disabled{opacity:.4;cursor:default}
.wlkr-liquid-tabs-option:focus-visible{outline:2px solid var(--ring,currentColor);outline-offset:4px}
@media(prefers-reduced-motion:reduce){.wlkr-liquid-tabs .wlkr-liquid-tabs-blob>span,.wlkr-liquid-tabs .wlkr-liquid-tabs-option{transition:none!important}}
`

// The neck stops short of the drop's ends; flush with them, the goo filter swells it into a bump on the resting edge.
const NECK_INSET = 6

const sameLayout = (a: Layout, b: Layout) => a.width === b.width && a.slots.length === b.slots.length && a.slots.every((slot, index) => slot[0] === b.slots[index][0] && slot[1] === b.slots[index][1])

/** A segmented control whose selection is a drop of ink: it stretches toward the new option, necks, snaps across and settles. */
export function LiquidTabs({ items, value, onValueChange, defaultValue, label, tone = "ink", size = "md", className, onKeyDown, ...props }: LiquidTabsProps) {
  const root = React.useRef<HTMLDivElement>(null)
  const row = React.useRef<HTMLDivElement>(null)
  const buttons = React.useRef<(HTMLButtonElement | null)[]>([])
  const scrolled = React.useRef(false)
  const [internal, setInternal] = React.useState(defaultValue)
  const [layout, setLayout] = React.useState<Layout | null>(null)
  const [live, setLive] = React.useState(false)
  const [travel, setTravel] = React.useState({ x: 0, direction: "forward" as "forward" | "back" })
  const filter = `wlkr-liquid-tabs-${React.useId().replace(/[^a-zA-Z0-9_-]/g, "")}`

  const firstEnabled = items.findIndex(item => !item.disabled)
  const current = value !== undefined ? value : internal ?? items[firstEnabled]?.value
  const activeIndex = items.findIndex(item => item.value === current)
  const focusIndex = activeIndex >= 0 && !items[activeIndex].disabled ? activeIndex : firstEnabled
  const slot = activeIndex >= 0 ? layout?.slots[activeIndex] : undefined
  const ready = Boolean(layout && slot && slot[1] > 0)
  // Remember which way the drop last travelled; the neck's leading edge depends on it.
  if (slot && slot[0] !== travel.x) setTravel({ x: slot[0], direction: slot[0] < travel.x ? "back" : "forward" })

  const count = items.length
  const itemKey = items.map(item => item.value).join("\u0000")
  React.useEffect(() => {
    const element = row.current
    if (!element) return
    let cancelled = false
    const measure = () => {
      if (cancelled) return
      const slots = buttons.current.slice(0, count).map((button): [number, number] => button ? [button.offsetLeft, button.offsetWidth] : [0, 0])
      const next = { width: element.offsetWidth, slots }
      setLayout(previous => previous && sameLayout(previous, next) ? previous : next)
    }
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    buttons.current.slice(0, count).forEach(button => { if (button) observer.observe(button) })
    document.fonts?.ready.then(measure).catch(() => {})
    return () => { cancelled = true; observer.disconnect() }
  }, [count, itemKey])

  // The first placement lands without motion; transitions switch on two frames later.
  React.useEffect(() => {
    if (!ready || live) return
    let inner = 0
    const outer = requestAnimationFrame(() => { inner = requestAnimationFrame(() => setLive(true)) })
    return () => { cancelAnimationFrame(outer); cancelAnimationFrame(inner) }
  }, [ready, live])

  React.useEffect(() => {
    const scroller = root.current, button = buttons.current[activeIndex]
    if (!scroller || !button || scroller.scrollWidth <= scroller.clientWidth) return
    const smooth = scrolled.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    scrolled.current = true
    const outer = scroller.getBoundingClientRect(), inner = button.getBoundingClientRect()
    const shift = inner.left < outer.left + 6 ? inner.left - outer.left - 6 : inner.right > outer.right - 6 ? inner.right - outer.right + 6 : 0
    if (shift) scroller.scrollBy({ left: shift, behavior: smooth ? "smooth" : "auto" })
  }, [activeIndex, layout])

  function select(index: number) {
    const next = items[index]
    if (!next || next.disabled) return
    if (value === undefined) setInternal(next.value)
    if (next.value !== current) onValueChange?.(next.value)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event)
    if (event.defaultPrevented) return
    const enabled = items.flatMap((item, index) => item.disabled ? [] : [index])
    if (!enabled.length) return
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl"
    const steps: Record<string, number> = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1, ArrowDown: 1, ArrowUp: -1 }
    const from = enabled.indexOf(buttons.current.indexOf(event.target as HTMLButtonElement))
    let target: number | undefined
    if (event.key === "Home") target = enabled[0]
    else if (event.key === "End") target = enabled[enabled.length - 1]
    else if (event.key in steps) {
      const step = steps[event.key]
      const start = from < 0 ? (step > 0 ? -1 : 0) : from
      target = enabled[(start + step + enabled.length) % enabled.length]
    }
    if (target === undefined) return
    event.preventDefault()
    select(target)
    buttons.current[target]?.focus()
  }

  const x = slot?.[0] ?? 0, width = slot?.[1] ?? 0
  const block = { transform: `translate3d(${x}px,0,0) scaleX(${width})` }
  return (
    <div {...props} ref={root} role="radiogroup" aria-label={label} className={cn("wlkr-liquid-tabs", className)} data-tone={tone} data-size={size} data-ready={ready} data-live={ready && live} data-direction={travel.direction} onKeyDown={handleKeyDown}>
      <style>{styles}</style>
      <div ref={row} className="wlkr-liquid-tabs-row">
        <svg aria-hidden="true" focusable="false">
          <filter id={filter} colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
            <feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 16 -7" />
          </filter>
        </svg>
        <span className="wlkr-liquid-tabs-blob" aria-hidden="true" style={{ filter: `url(#${filter})` }}>
          <span className="wlkr-liquid-tabs-tail" style={block} />
          <span className="wlkr-liquid-tabs-neck" style={{ left: x + NECK_INSET, right: Math.max(0, (layout?.width ?? 0) - x - width) + NECK_INSET }} />
          <span className="wlkr-liquid-tabs-head" style={block} />
        </span>
        {items.map((item, index) => (
          <button key={item.value} ref={node => { buttons.current[index] = node }} type="button" role="radio" aria-checked={index === activeIndex} tabIndex={index === focusIndex ? 0 : -1} disabled={item.disabled} className="wlkr-liquid-tabs-option" onClick={() => select(index)}>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}
