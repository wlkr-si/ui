"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type MarkerProps = Omit<React.HTMLAttributes<HTMLElement>, "children"> & {
  /** Inline content: a few words inside a sentence. */
  children: React.ReactNode
  variant?: "highlight" | "underline" | "strike"
  tone?: "brand" | "ink"
  /** Milliseconds for the draw, 120–3000. */
  duration?: number
  /** Milliseconds to wait before drawing, 0–10000. */
  delay?: number
  /** Discrete steps in the draw, 2–60. Fewer steps look chunkier. */
  steps?: number
  /** "view" draws once at 60% visible, "mount" draws at once, "hover" follows hover and focus of the nearest link or button. */
  trigger?: "view" | "mount" | "hover"
  /** Controlled: overrides the trigger when set. */
  drawn?: boolean
}

const styles = `
.wlkr-marker{--wlkr-marker-fill:var(--brand,#33f282);color:inherit;background-color:transparent;background-image:linear-gradient(var(--wlkr-marker-fill),var(--wlkr-marker-fill));background-repeat:no-repeat;background-size:0% var(--wlkr-marker-height);-webkit-box-decoration-break:clone;box-decoration-break:clone;transition:background-size var(--wlkr-marker-duration) steps(var(--wlkr-marker-steps),jump-end)}
.wlkr-marker[data-drawn=true]{background-size:100% var(--wlkr-marker-height);transition-delay:var(--wlkr-marker-delay)}
.wlkr-marker[data-tone=ink]{--wlkr-marker-fill:var(--foreground,#010101)}
.wlkr-marker[data-variant=highlight]{--wlkr-marker-height:100%;padding:.06em .12em;margin:0 -.12em;background-position:0 0}
.wlkr-marker[data-variant=highlight][data-drawn=true]{color:var(--brand-foreground,#010101);animation:wlkr-marker-hold calc(var(--wlkr-marker-delay) + var(--wlkr-marker-duration) / 2) step-end}
.wlkr-marker[data-variant=highlight][data-tone=ink][data-drawn=true]{color:var(--background,#fff)}
@keyframes wlkr-marker-hold{from{color:inherit}}
.wlkr-marker[data-variant=underline]{--wlkr-marker-height:.14em;background-position:0 calc(100% - .04em)}
.wlkr-marker[data-variant=strike]{--wlkr-marker-height:.1em;background-position:0 58%}
@media(prefers-reduced-motion:reduce){.wlkr-marker,.wlkr-marker[data-variant][data-drawn]{transition:none;animation:none}}
`
const clamp = (value: number | undefined, min: number, max: number, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback

/** Inline emphasis that draws a highlight, underline or strike through its words in pixel steps. Follows line breaks. */
export function Marker({ children, variant = "highlight", tone = "brand", duration, delay, steps, trigger = "view", drawn, className, style, ...props }: MarkerProps) {
  const root = React.useRef<HTMLElement | null>(null)
  const [triggered, setTriggered] = React.useState(false)
  const controlled = typeof drawn === "boolean"
  const kind = variant === "underline" || variant === "strike" ? variant : "highlight"

  React.useEffect(() => {
    const element = root.current
    if (controlled || !element) return
    if (trigger === "mount") {
      const frame = requestAnimationFrame(() => setTriggered(true))
      return () => cancelAnimationFrame(frame)
    }
    if (trigger === "hover") {
      const host = element.parentElement?.closest<HTMLElement>("a,button") ?? element
      let hovered = false, focused = false
      const show = () => setTriggered(hovered || focused)
      const enter = (event: PointerEvent) => { if (event.pointerType !== "touch") { hovered = true; show() } }
      const leave = () => { hovered = false; show() }
      const focusIn = () => { focused = true; show() }
      const focusOut = (event: FocusEvent) => { if (!host.contains(event.relatedTarget as Node | null)) { focused = false; show() } }
      host.addEventListener("pointerenter", enter)
      host.addEventListener("pointerleave", leave)
      host.addEventListener("focusin", focusIn)
      host.addEventListener("focusout", focusOut)
      return () => {
        host.removeEventListener("pointerenter", enter)
        host.removeEventListener("pointerleave", leave)
        host.removeEventListener("focusin", focusIn)
        host.removeEventListener("focusout", focusOut)
      }
    }
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.intersectionRatio >= 0.6)) return
      observer.disconnect()
      setTriggered(true)
    }, { threshold: 0.6 })
    observer.observe(element)
    return () => observer.disconnect()
  }, [controlled, trigger])

  const timing = {
    "--wlkr-marker-duration": `${clamp(duration, 120, 3000, 520)}ms`,
    "--wlkr-marker-delay": `${clamp(delay, 0, 10000, 0)}ms`,
    "--wlkr-marker-steps": Math.round(clamp(steps, 2, 60, 12)),
  } as React.CSSProperties
  const setRoot = React.useCallback((node: HTMLElement | null) => { root.current = node }, [])
  const Tag = kind === "highlight" ? "mark" : "span"
  return <Tag ref={setRoot} {...props} className={cn("wlkr-marker", className)} style={{ ...timing, ...style }} data-variant={kind} data-tone={tone === "ink" ? "ink" : "brand"} data-drawn={String(controlled ? drawn : triggered)}>
    <style>{styles}</style>
    {children}
  </Tag>
}
