"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type ScrollSpyItem = {
  /** The id of a section element in the document. */
  id: string
  label: string
  /** Indent level for sub-sections. */
  depth?: 0 | 1 | 2
}

export type ScrollSpyProps = Omit<React.HTMLAttributes<HTMLElement>, "children"> & {
  items: ScrollSpyItem[]
  /** Accessible name for the navigation landmark. */
  label?: string
  /** Pixels from the top of the viewport (or `root`) that count as the reading line, 0–600. */
  offset?: number
  /** Scroll container holding the sections. Defaults to the window. */
  root?: React.RefObject<HTMLElement | null>
  onActiveChange?: (id: string | null) => void
}

type Layout = { height: number; slots: [number, number][] }

const styles = `
.wlkr-scroll-spy{display:block;font-size:13px;line-height:18px;letter-spacing:-.005em}
.wlkr-scroll-spy-track{position:relative}
.wlkr-scroll-spy-track::before{content:"";position:absolute;top:0;bottom:0;left:0;width:1px;background:var(--border,#dedede)}
.wlkr-scroll-spy-track>svg{position:absolute;width:0;height:0}
.wlkr-scroll-spy-marker{position:absolute;top:0;bottom:0;left:-6px;width:14px;pointer-events:none;visibility:hidden}
.wlkr-scroll-spy[data-ready=true] .wlkr-scroll-spy-marker{visibility:visible}
.wlkr-scroll-spy-marker>span{position:absolute;left:6px;width:2px;background:var(--foreground,currentColor)}
.wlkr-scroll-spy-head,.wlkr-scroll-spy-tail{top:0;height:1px;transform-origin:0 0}
.wlkr-scroll-spy[data-live=true] .wlkr-scroll-spy-head{transition:transform 240ms cubic-bezier(.3,1.3,.5,1)}
.wlkr-scroll-spy[data-live=true] .wlkr-scroll-spy-tail{transition:transform 480ms cubic-bezier(.5,0,.2,1)}
.wlkr-scroll-spy[data-live=true][data-direction=down] .wlkr-scroll-spy-neck{transition:bottom 240ms cubic-bezier(.3,1.3,.5,1),top 480ms cubic-bezier(.5,0,.2,1)}
.wlkr-scroll-spy[data-live=true][data-direction=up] .wlkr-scroll-spy-neck{transition:top 240ms cubic-bezier(.3,1.3,.5,1),bottom 480ms cubic-bezier(.5,0,.2,1)}
.wlkr-scroll-spy-list{margin:0;padding:0;list-style:none}
.wlkr-scroll-spy-link{display:flex;align-items:center;min-height:32px;padding:0 4px 0 16px;color:var(--muted-foreground,#696969);text-decoration:none;transition:color 120ms ease;-webkit-tap-highlight-color:transparent}
.wlkr-scroll-spy-link[data-depth="1"]{padding-left:28px}
.wlkr-scroll-spy-link[data-depth="2"]{padding-left:40px}
.wlkr-scroll-spy-link[aria-current]{color:var(--foreground,currentColor)}
@media (hover:hover){.wlkr-scroll-spy-link:hover{color:var(--foreground,currentColor)}}
.wlkr-scroll-spy-link:focus-visible{outline:2px solid var(--ring,currentColor);outline-offset:3px}
@media (pointer:coarse){.wlkr-scroll-spy-link{min-height:44px}}
@media (prefers-reduced-motion:reduce){.wlkr-scroll-spy .wlkr-scroll-spy-marker>span,.wlkr-scroll-spy .wlkr-scroll-spy-link{transition:none!important}}
`

const clamp = (value: number | undefined, min: number, max: number, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback
const sameLayout = (a: Layout, b: Layout) => a.height === b.height && a.slots.length === b.slots.length && a.slots.every((slot, index) => slot[0] === b.slots[index][0] && slot[1] === b.slots[index][1])

/** An "on this page" list whose liquid marker follows the section being read, stretching between far-apart items. */
export function ScrollSpy({ items, label = "On this page", offset, root, onActiveChange, className, ...props }: ScrollSpyProps) {
  const track = React.useRef<HTMLDivElement>(null)
  const texts = React.useRef<(HTMLSpanElement | null)[]>([])
  const activeRef = React.useRef<string | null>(null)
  const changeRef = React.useRef(onActiveChange)
  const lockRef = React.useRef(0)
  const scheduleRef = React.useRef<(() => void) | null>(null)
  const [active, setActive] = React.useState<string | null>(null)
  const [layout, setLayout] = React.useState<Layout | null>(null)
  const [live, setLive] = React.useState(false)
  const [travel, setTravel] = React.useState({ y: 0, direction: "down" as "down" | "up" })
  const filter = `wlkr-scroll-spy-${React.useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
  const reading = clamp(offset, 0, 600, 96)
  const count = items.length
  const itemKey = items.map(item => item.id).join("\u0000")

  const activeIndex = items.findIndex(item => item.id === active)
  const slot = activeIndex >= 0 ? layout?.slots[activeIndex] : undefined
  const ready = Boolean(layout && slot && slot[1] > 0)
  if (slot && slot[0] !== travel.y) setTravel({ y: slot[0], direction: slot[0] < travel.y ? "up" : "down" })

  React.useEffect(() => { changeRef.current = onActiveChange }, [onActiveChange])

  const commit = React.useCallback((id: string | null) => {
    if (id === activeRef.current) return
    activeRef.current = id
    setActive(id)
    changeRef.current?.(id)
  }, [])

  /** Holds the clicked item until the scroll has been quiet for `ms`. */
  const hold = React.useCallback((ms: number) => {
    window.clearTimeout(lockRef.current)
    lockRef.current = window.setTimeout(() => { lockRef.current = 0; scheduleRef.current?.() }, ms)
  }, [])

  React.useEffect(() => {
    const container = root?.current ?? null
    const scroller: HTMLElement | Window = container ?? window
    const ids = itemKey ? itemKey.split("\u0000") : []
    let frame = 0
    const compute = () => {
      frame = 0
      if (lockRef.current) return
      const targets = ids.flatMap(id => { const element = document.getElementById(id); return element ? [{ id, element }] : [] })
      if (!targets.length) return commit(null)
      const line = (container ? container.getBoundingClientRect().top + container.clientTop : 0) + reading
      let current = targets[0].id
      for (const target of targets) if (target.element.getBoundingClientRect().top <= line + 1) current = target.id
      const [position, view, full] = container
        ? [container.scrollTop, container.clientHeight, container.scrollHeight]
        : [window.scrollY, window.innerHeight, document.documentElement.scrollHeight]
      if (full > view + 1 && position + view >= full - 2) current = targets[targets.length - 1].id
      commit(current)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(compute) }
    const scrolled = () => { if (lockRef.current) hold(150); else schedule() }
    scheduleRef.current = schedule
    const resizer = new ResizeObserver(schedule)
    resizer.observe(container ?? document.body)
    if (container) Array.from(container.children).forEach(child => resizer.observe(child))
    scroller.addEventListener("scroll", scrolled, { passive: true })
    window.addEventListener("resize", schedule, { passive: true })
    schedule()
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(lockRef.current)
      lockRef.current = 0
      scheduleRef.current = null
      resizer.disconnect()
      scroller.removeEventListener("scroll", scrolled)
      window.removeEventListener("resize", schedule)
    }
  }, [itemKey, reading, root, commit, hold])

  React.useEffect(() => {
    const element = track.current
    if (!element) return
    const measure = () => {
      const next = { height: element.offsetHeight, slots: texts.current.slice(0, count).map((text): [number, number] => text ? [text.offsetTop, text.offsetHeight] : [0, 0]) }
      setLayout(previous => previous && sameLayout(previous, next) ? previous : next)
    }
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    texts.current.slice(0, count).forEach(text => { if (text) observer.observe(text) })
    return () => observer.disconnect()
  }, [count, itemKey])

  // The first placement lands without motion; transitions switch on two frames later.
  React.useEffect(() => {
    if (!ready || live) return
    let inner = 0
    const outer = requestAnimationFrame(() => { inner = requestAnimationFrame(() => setLive(true)) })
    return () => { cancelAnimationFrame(outer); cancelAnimationFrame(inner) }
  }, [ready, live])

  function jump(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const target = document.getElementById(id)
    if (!target) return
    event.preventDefault()
    const container = root?.current ?? null
    const behavior: ScrollBehavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
    const top = target.getBoundingClientRect().top - reading
    if (container) container.scrollTo({ top: container.scrollTop + top - container.getBoundingClientRect().top - container.clientTop, behavior })
    else window.scrollTo({ top: window.scrollY + top, behavior })
    history.replaceState(history.state, "", `#${id}`)
    hold(800)
    commit(id)
    if (event.detail !== 0) return
    // Keyboard activation: carry focus to the section so the next Tab continues from there.
    if (!target.hasAttribute("tabindex")) {
      target.setAttribute("tabindex", "-1")
      target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true })
    }
    target.focus({ preventScroll: true })
  }

  const y = slot?.[0] ?? 0, height = slot?.[1] ?? 0
  const block = { transform: `translate3d(0,${y}px,0) scaleY(${height})` }
  return (
    <nav {...props} aria-label={label} className={cn("wlkr-scroll-spy", className)} data-ready={ready} data-live={ready && live} data-direction={travel.direction}>
      <style>{styles}</style>
      <div ref={track} className="wlkr-scroll-spy-track">
        <svg aria-hidden="true" focusable="false">
          <filter id={filter} colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
            <feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 14 -5" />
          </filter>
        </svg>
        <span className="wlkr-scroll-spy-marker" aria-hidden="true" style={{ filter: `url(#${filter})` }}>
          <span className="wlkr-scroll-spy-tail" style={block} />
          <span className="wlkr-scroll-spy-neck" style={{ top: y, bottom: Math.max(0, (layout?.height ?? 0) - y - height) }} />
          <span className="wlkr-scroll-spy-head" style={block} />
        </span>
        <ul className="wlkr-scroll-spy-list">
          {items.map((item, index) => (
            <li key={`${item.id}-${index}`}>
              <a href={`#${item.id}`} className="wlkr-scroll-spy-link" data-depth={item.depth ?? 0} aria-current={item.id === active ? "location" : undefined} onClick={event => jump(event, item.id)}>
                <span ref={node => { texts.current[index] = node }}>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
