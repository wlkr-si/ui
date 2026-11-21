"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type ShimmerTextProps = Omit<React.HTMLAttributes<HTMLElement>, "children"> & {
  /** Plain text only, so it can be drawn twice without repeating markup. */
  children: string
  /** `false` settles to the normal text colour, for the moment the work finishes. */
  active?: boolean
  /** Milliseconds per pass, 600–6000. A short rest follows each pass. */
  duration?: number
  /** Width of the light band in characters, 2–24. */
  spread?: number
  as?: "span" | "p" | "div"
}

const CHECKER = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='2' height='2' shape-rendering='crispEdges'%3E%3Crect width='1' height='1'/%3E%3Crect x='1' y='1' width='1' height='1'/%3E%3C/svg%3E\")"
const EDGE = "linear-gradient(90deg,#0005 0 20%,#000a 20% 40%,#000 40% 60%,#000a 60% 80%,#0005 80% 100%)"
const CORE = "linear-gradient(90deg,#0000 0 40%,#000 40% 60%,#0000 60% 100%)"
const MASK = `${CORE},${EDGE},${CHECKER}`

const styles = `
.wlkr-shimmer-text{--wlkr-shimmer-text-band:calc(var(--wlkr-shimmer-text-spread,6)*1ch);position:relative;display:inline-block;max-width:100%;white-space:nowrap;color:var(--muted-foreground,#696969);transition:color 240ms cubic-bezier(.2,.7,.2,1)}
p.wlkr-shimmer-text,div.wlkr-shimmer-text{display:block;width:fit-content}
.wlkr-shimmer-text[data-active=false]{color:var(--foreground,currentColor)}
.wlkr-shimmer-text-light{position:absolute;inset:0;display:none;color:var(--foreground,currentColor);white-space:inherit;pointer-events:none;user-select:none;-webkit-user-select:none;-webkit-mask-image:${MASK};mask-image:${MASK};-webkit-mask-repeat:no-repeat,no-repeat,repeat;mask-repeat:no-repeat,no-repeat,repeat;-webkit-mask-size:var(--wlkr-shimmer-text-band) 100%,var(--wlkr-shimmer-text-band) 100%,4px 4px;mask-size:var(--wlkr-shimmer-text-band) 100%,var(--wlkr-shimmer-text-band) 100%,4px 4px;-webkit-mask-composite:source-over,source-in,source-over;mask-composite:add,intersect,add;animation:wlkr-shimmer-text-sweep var(--wlkr-shimmer-text-cycle,2300ms) steps(var(--wlkr-shimmer-text-steps,20),end) infinite}
@supports ((mask-image:none) or (-webkit-mask-image:none)){@media(prefers-reduced-motion:no-preference){.wlkr-shimmer-text[data-active=true] .wlkr-shimmer-text-light{display:block}}}
.wlkr-shimmer-text[data-paused=true] .wlkr-shimmer-text-light{animation-play-state:paused}
@keyframes wlkr-shimmer-text-sweep{
0%{-webkit-mask-position:calc(0% - var(--wlkr-shimmer-text-band)) 0,calc(0% - var(--wlkr-shimmer-text-band)) 0,0 0;mask-position:calc(0% - var(--wlkr-shimmer-text-band)) 0,calc(0% - var(--wlkr-shimmer-text-band)) 0,0 0}
70%,100%{-webkit-mask-position:calc(100% + var(--wlkr-shimmer-text-band)) 0,calc(100% + var(--wlkr-shimmer-text-band)) 0,0 0;mask-position:calc(100% + var(--wlkr-shimmer-text-band)) 0,calc(100% + var(--wlkr-shimmer-text-band)) 0,0 0}}
`

const clamp = (input: unknown, min: number, max: number, fallback: number) => {
  const number = Number(input)
  return input === "" || input === null || !Number.isFinite(number) ? fallback : Math.min(max, Math.max(min, number))
}

const subscribeVisibility = (notify: () => void) => {
  document.addEventListener("visibilitychange", notify)
  return () => document.removeEventListener("visibilitychange", notify)
}

/** Readable grey text with a stepped, dithered band of light passing through it while work is in progress. */
export function ShimmerText({ children, active = true, duration = 1600, spread = 6, as: Tag = "span", className, style, ...props }: ShimmerTextProps) {
  const text = typeof children === "string" ? children : String(children ?? "")
  const pass = clamp(duration, 600, 6000, 1600)
  const band = Math.round(clamp(spread, 2, 24, 6))
  const [element, setElement] = React.useState<HTMLElement | null>(null)
  const [inView, setInView] = React.useState(false)
  const visible = React.useSyncExternalStore(subscribeVisibility, () => document.visibilityState === "visible", () => true)

  React.useEffect(() => {
    if (!element || !active) return
    const observer = new IntersectionObserver(entries => setInView(entries.some(entry => entry.isIntersecting)))
    observer.observe(element)
    return () => observer.disconnect()
  }, [element, active])

  const variables = {
    "--wlkr-shimmer-text-spread": band,
    "--wlkr-shimmer-text-cycle": `${Math.round(pass / 0.7)}ms`,
    "--wlkr-shimmer-text-steps": Math.max(1, Array.from(text).length + band),
  } as React.CSSProperties

  return (
    <Tag {...props} ref={setElement} data-active={active} data-paused={!(inView && visible)} className={cn("wlkr-shimmer-text", className)} style={{ ...variables, ...style }}>
      <style>{styles}</style>
      {text}
      <span className="wlkr-shimmer-text-light" aria-hidden="true">{text}</span>
    </Tag>
  )
}
