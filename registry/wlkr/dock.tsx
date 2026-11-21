"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type DockItem = {
  label: string
  icon: React.ReactNode
  /** Renders the item as a link. Without it the item is a button. */
  href?: string
  onSelect?: () => void
  /** Marks the current page or tool with a green dot. */
  active?: boolean
  disabled?: boolean
}

export type DockProps = Omit<React.HTMLAttributes<HTMLElement>, "children"> & {
  items: DockItem[]
  /** Resting tile size in pixels, 32–72. */
  size?: number
  /** Peak scale of the tile under the pointer, 1–2.5. */
  magnification?: number
  /** How far along the row the pointer's pull reaches, in pixels, 40–320. */
  distance?: number
  /** Accessible name for the navigation landmark. */
  label?: string
}

const styles = `
.wlkr-dock{--wlkr-dock-lift:calc(var(--wlkr-dock-size) * (var(--wlkr-dock-mag) - 1));position:relative;display:flex;box-sizing:border-box;width:100%;min-width:0;max-width:100%;padding:calc(32px + var(--wlkr-dock-lift)) 8px 12px;overflow-x:auto;overflow-y:hidden;scrollbar-width:none}
.wlkr-dock::-webkit-scrollbar{display:none}
@media (hover:none),(pointer:coarse),(prefers-reduced-motion:reduce){.wlkr-dock{--wlkr-dock-lift:0px}}
.wlkr-dock-list{display:flex;gap:8px;flex:none;margin:0 auto;padding:0;list-style:none}
.wlkr-dock-slot{position:relative;flex:none;width:var(--wlkr-dock-size);height:var(--wlkr-dock-size)}
.wlkr-dock-tile{--wlkr-dock-x:0px;--wlkr-dock-s:1;position:absolute;inset:0;display:flex;align-items:center;justify-content:center;box-sizing:border-box;margin:0;padding:0;border:0;border-radius:2px;background:var(--muted,#f3f3f3);color:var(--foreground,currentColor);font:inherit;text-decoration:none;cursor:pointer;transform-origin:50% 100%;transform:translate3d(var(--wlkr-dock-x),0,0) scale(var(--wlkr-dock-s));transition:background-color 120ms ease,color 120ms ease;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.wlkr-dock-tile::before{content:"";position:absolute;inset:min(0px,calc((var(--wlkr-dock-size) - 44px) / 2))}
.wlkr-dock-icon{display:flex;width:45%;height:45%;pointer-events:none}
.wlkr-dock-icon>svg{width:100%;height:100%}
@media (hover:hover){.wlkr-dock-tile:not(:disabled):not([aria-disabled=true]):hover{background:var(--foreground,currentColor);color:var(--background,#fff)}}
.wlkr-dock-tile:focus-visible{outline:2px solid var(--ring,currentColor);outline-offset:4px;background:var(--foreground,currentColor);color:var(--background,#fff)}
.wlkr-dock-tile:disabled,.wlkr-dock-tile[aria-disabled=true]{opacity:.4;cursor:default}
.wlkr-dock-tile[data-active=true]::after{content:"";position:absolute;top:100%;left:50%;width:calc(4px / var(--wlkr-dock-s));height:calc(4px / var(--wlkr-dock-s));margin-top:calc(4px / var(--wlkr-dock-s));transform:translateX(-50%);background:var(--brand,#33f282)}
.wlkr-dock-label{position:absolute;left:0;bottom:0;pointer-events:none;white-space:nowrap}
.wlkr-dock-label>span{display:block;padding:4px 6px;background:var(--foreground,currentColor);color:var(--background,#fff);font-size:11px;font-weight:500;line-height:14px;animation:wlkr-dock-label 140ms cubic-bezier(.2,.7,.2,1)}
@keyframes wlkr-dock-label{from{opacity:0;transform:translateY(4px)}}
@media (prefers-reduced-motion:reduce){.wlkr-dock-tile{transition:none}.wlkr-dock-label>span{animation:none}}
`

const clamp = (value: number | undefined, min: number, max: number, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback

/** A row of square tools that leans toward the pointer: the nearest tiles grow from a fixed baseline and their neighbours follow. */
export function Dock({ items, size, magnification, distance, label = "Dock", className, style, onKeyDown, ...props }: DockProps) {
  const rootRef = React.useRef<HTMLElement>(null)
  const labelRef = React.useRef<HTMLSpanElement>(null)
  const slots = React.useRef<(HTMLLIElement | null)[]>([])
  const tiles = React.useRef<(HTMLElement | null)[]>([])
  const hotRef = React.useRef<number | null>(null)
  const placeRef = React.useRef<(() => void) | null>(null)
  const [hot, setHot] = React.useState<number | null>(null)
  const tile = clamp(size, 32, 72, 44)
  const peak = clamp(magnification, 1, 2.5, 1.6)
  const reach = clamp(distance, 40, 320, 120)
  const count = items.length

  React.useLayoutEffect(() => {
    hotRef.current = hot
    placeRef.current?.()
  }, [hot])

  React.useEffect(() => {
    const root = rootRef.current
    const tag = labelRef.current
    if (!root || !tag) return
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)")
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const scales = new Float64Array(count).fill(1)
    const shifts = new Float64Array(count)
    let centers: number[] = []
    let pointer: number | null = null
    let hovering = false
    let frame = 0, last = 0

    const magnifies = () => fine.matches && !motion.matches && peak > 1
    const measure = () => { centers = slots.current.slice(0, count).map(slot => slot ? slot.offsetLeft + tile / 2 : 0) }
    const targetFor = (i: number) => {
      const d = pointer === null ? reach : Math.abs(pointer - centers[i])
      return d >= reach ? 1 : 1 + (peak - 1) * (1 + Math.cos((Math.PI * d) / reach)) / 2
    }
    const place = () => {
      const i = hotRef.current
      if (i === null || i >= count) return
      const width = tag.offsetWidth
      const left = root.scrollLeft + 4, right = root.scrollLeft + root.clientWidth - width - 4
      const x = Math.min(Math.max(centers[i] + shifts[i] - width / 2, left), Math.max(left, right))
      const slot = slots.current[i]
      const floor = slot ? root.clientHeight - slot.offsetTop - tile : 0
      tag.style.transform = `translate3d(${x}px,${-(floor + scales[i] * tile + 8)}px,0)`
    }
    const apply = () => {
      let grown = 0
      for (let i = 0; i < count; i++) grown += (scales[i] - 1) * tile
      let run = -grown / 2
      for (let i = 0; i < count; i++) {
        const growth = (scales[i] - 1) * tile
        shifts[i] = run + growth / 2
        run += growth
        tiles.current[i]?.style.setProperty("--wlkr-dock-x", `${shifts[i]}px`)
        tiles.current[i]?.style.setProperty("--wlkr-dock-s", `${scales[i]}`)
      }
      place()
    }
    const tick = (now: number) => {
      frame = 0
      const ease = 1 - Math.exp(-Math.min(0.05, (now - last) / 1000) * 18)
      last = now
      let moving = false
      for (let i = 0; i < count; i++) {
        const target = targetFor(i)
        scales[i] += (target - scales[i]) * ease
        if (Math.abs(target - scales[i]) < 0.002) scales[i] = target
        else moving = true
      }
      apply()
      if (moving) frame = requestAnimationFrame(tick)
    }
    const wake = () => {
      measure()
      if (!magnifies()) { pointer = null; scales.fill(1); apply(); return }
      if (frame) return
      last = performance.now()
      frame = requestAnimationFrame(tick)
    }
    const nearest = (x: number) => {
      let best: number | null = null
      for (let i = 0; i < count; i++) if (best === null || Math.abs(centers[i] + shifts[i] - x) < Math.abs(centers[best] + shifts[best] - x)) best = i
      return best
    }
    const focusedIndex = () => tiles.current.findIndex(node => node !== null && node === document.activeElement && node.matches(":focus-visible"))

    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") return
      hovering = true
      const x = event.clientX - root.getBoundingClientRect().left + root.scrollLeft
      pointer = x
      setHot(nearest(x))
      wake()
    }
    const leave = () => {
      hovering = false
      const focused = focusedIndex()
      pointer = focused >= 0 ? centers[focused] : null
      setHot(focused >= 0 ? focused : null)
      wake()
    }
    const focusIn = (event: FocusEvent) => {
      const index = tiles.current.indexOf(event.target as HTMLElement)
      if (index < 0 || !(event.target as HTMLElement).matches(":focus-visible")) return
      measure()
      pointer = centers[index]
      setHot(index)
      wake()
    }
    const focusOut = (event: FocusEvent) => {
      if (hovering || root.contains(event.relatedTarget as Node | null)) return
      pointer = null
      setHot(null)
      wake()
    }

    placeRef.current = place
    const resizer = new ResizeObserver(() => { measure(); apply() })
    resizer.observe(root)
    root.addEventListener("pointermove", move)
    root.addEventListener("pointerleave", leave)
    root.addEventListener("focusin", focusIn)
    root.addEventListener("focusout", focusOut)
    fine.addEventListener("change", wake)
    motion.addEventListener("change", wake)
    return () => {
      cancelAnimationFrame(frame)
      placeRef.current = null
      resizer.disconnect()
      root.removeEventListener("pointermove", move)
      root.removeEventListener("pointerleave", leave)
      root.removeEventListener("focusin", focusIn)
      root.removeEventListener("focusout", focusOut)
      fine.removeEventListener("change", wake)
      motion.removeEventListener("change", wake)
    }
  }, [count, tile, peak, reach])

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    onKeyDown?.(event)
    if (event.defaultPrevented) return
    const enabled = items.flatMap((item, index) => item.disabled ? [] : [index])
    if (!enabled.length) return
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl"
    const steps: Record<string, number> = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 }
    const from = enabled.indexOf(tiles.current.indexOf(event.target as HTMLElement))
    let target: number | undefined
    if (event.key === "Home") target = enabled[0]
    else if (event.key === "End") target = enabled[enabled.length - 1]
    else if (event.key in steps) target = enabled[((from < 0 ? 0 : from) + steps[event.key] + enabled.length) % enabled.length]
    if (target === undefined) return
    event.preventDefault()
    tiles.current[target]?.focus()
  }

  const vars = { ...style, "--wlkr-dock-size": `${tile}px`, "--wlkr-dock-mag": peak } as React.CSSProperties
  return (
    <nav {...props} ref={rootRef} aria-label={label} className={cn("wlkr-dock", className)} style={vars} onKeyDown={handleKeyDown}>
      <style>{styles}</style>
      <ul className="wlkr-dock-list">
        {items.map((item, index) => {
          const shared = {
            ref: (node: HTMLElement | null) => { tiles.current[index] = node },
            className: "wlkr-dock-tile",
            "aria-label": item.label,
            "data-active": item.active || undefined,
          }
          const icon = <span className="wlkr-dock-icon" aria-hidden="true">{item.icon}</span>
          return (
            <li key={`${item.label}-${index}`} ref={node => { slots.current[index] = node }} className="wlkr-dock-slot">
              {item.href !== undefined && item.disabled ? <a {...shared} role="link" aria-disabled="true">{icon}</a>
                : item.href !== undefined ? <a {...shared} href={item.href} aria-current={item.active ? "page" : undefined} onClick={item.onSelect}>{icon}</a>
                : <button {...shared} type="button" disabled={item.disabled} aria-current={item.active ? "true" : undefined} onClick={item.onSelect}>{icon}</button>}
            </li>
          )
        })}
      </ul>
      <span ref={labelRef} className="wlkr-dock-label" aria-hidden="true">
        {hot !== null && items[hot] ? <span key={hot}>{items[hot].label}</span> : null}
      </span>
    </nav>
  )
}
