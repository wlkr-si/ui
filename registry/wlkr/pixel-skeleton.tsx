"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type PixelSkeletonProps = Omit<React.ComponentPropsWithoutRef<"div">, "children"> & {
  /** `text` draws lines sized by the parent's font, `block` a rectangle, `circle` an avatar-sized dot. */
  variant?: "text" | "block" | "circle"
  /** Text lines, 1–12. The last of several is 60% wide. */
  lines?: number
  /** Number (px) or any CSS length. Text and block default to 100%, circle to 40px. */
  width?: number | string
  /** Number (px) or any CSS length. Block defaults to 120px, circle to its width. Ignored for text. */
  height?: number | string
  /** Pixel pitch in px, 2–12. */
  cell?: number
  /** `false` holds the texture still. */
  active?: boolean
  /** When set, a visually hidden status announces it, e.g. "Loading projects". */
  label?: string
}

/** 4×4 ordered-dither thresholds. Values below 8 form the resting checker. */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]
/** Per column of the band, the threshold it fills up to: 62%, 75%, 87%, then solid in the middle. */
const RAMP = [10, 10, 10, 12, 12, 12, 14, 14, 14, 16, 16, 16, 16, 16, 16, 14, 14, 14, 12, 12, 12, 10, 10, 10]
const svg = (width: number, height: number, rects: string) => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' shape-rendering='crispEdges'>${rects}</svg>`)}")`
const pixel = (x: number, y: number) => `<rect x='${x}' y='${y}' width='1' height='1'/>`
const CHECKER = svg(2, 2, pixel(0, 0) + pixel(1, 1))
const BAND = svg(RAMP.length, 4, RAMP.flatMap((limit, x) => [0, 1, 2, 3].filter(y => BAYER[y * 4 + (x % 4)] >= 8 && BAYER[y * 4 + (x % 4)] < limit).map(y => pixel(x, y))).join(""))

const styles = `
@property --wlkr-pixel-skeleton-p{syntax:"<number>";inherits:false;initial-value:0}
.wlkr-pixel-skeleton{--wlkr-pixel-skeleton-pitch:calc(var(--wlkr-pixel-skeleton-cell,4px)*2);--wlkr-pixel-skeleton-band:calc(var(--wlkr-pixel-skeleton-cell,4px)*24);position:relative;display:block;max-width:100%}
.wlkr-pixel-skeleton[data-variant=circle]{display:inline-block;flex:none;vertical-align:middle}
.wlkr-pixel-skeleton-visual{display:block;width:100%;height:100%}
.wlkr-pixel-skeleton-row{display:flex;align-items:center;height:1.5em;height:1lh}
.wlkr-pixel-skeleton-shape{position:relative;display:block;width:100%;height:100%;overflow:hidden;container-type:inline-size;border-radius:1px;background:var(--muted,#f3f3f3)}
@supports (color:color-mix(in srgb,red 10%,blue)){.wlkr-pixel-skeleton-shape{background:color-mix(in srgb,var(--muted-foreground,#696969) 9%,var(--muted,#f3f3f3))}}
.wlkr-pixel-skeleton-row .wlkr-pixel-skeleton-shape{height:.7em}
.wlkr-pixel-skeleton[data-variant=circle] .wlkr-pixel-skeleton-shape{border-radius:50%}
.wlkr-pixel-skeleton-shape::before,.wlkr-pixel-skeleton-shape::after{content:"";position:absolute;inset:0;background:var(--muted-foreground,#696969);pointer-events:none}
.wlkr-pixel-skeleton-shape::before{opacity:.22;-webkit-mask-image:${CHECKER};mask-image:${CHECKER};-webkit-mask-size:var(--wlkr-pixel-skeleton-pitch) var(--wlkr-pixel-skeleton-pitch);mask-size:var(--wlkr-pixel-skeleton-pitch) var(--wlkr-pixel-skeleton-pitch)}
.wlkr-pixel-skeleton-shape::after{--wlkr-pixel-skeleton-x:calc(var(--wlkr-pixel-skeleton-p)*(100cqw + var(--wlkr-pixel-skeleton-band)) - var(--wlkr-pixel-skeleton-band));display:none;opacity:.22;-webkit-mask-image:${BAND};mask-image:${BAND};-webkit-mask-repeat:repeat-y;mask-repeat:repeat-y;-webkit-mask-size:var(--wlkr-pixel-skeleton-band) calc(var(--wlkr-pixel-skeleton-pitch)*2);mask-size:var(--wlkr-pixel-skeleton-band) calc(var(--wlkr-pixel-skeleton-pitch)*2);-webkit-mask-position:var(--wlkr-pixel-skeleton-x) 0;mask-position:var(--wlkr-pixel-skeleton-x) 0;animation:wlkr-pixel-skeleton-sweep 2300ms linear var(--wlkr-pixel-skeleton-delay,0ms) infinite}
@supports (width:round(down,5px,2px)){.wlkr-pixel-skeleton-shape::after{--wlkr-pixel-skeleton-x:calc(round(down,var(--wlkr-pixel-skeleton-p)*(100cqw + var(--wlkr-pixel-skeleton-band)),var(--wlkr-pixel-skeleton-pitch)) - var(--wlkr-pixel-skeleton-band))}}
@media(prefers-reduced-motion:no-preference){.wlkr-pixel-skeleton[data-active=true] .wlkr-pixel-skeleton-shape::after{display:block}}
.wlkr-pixel-skeleton[data-paused=true] .wlkr-pixel-skeleton-shape::after{animation-play-state:paused}
@keyframes wlkr-pixel-skeleton-sweep{0%{--wlkr-pixel-skeleton-p:0}70%,100%{--wlkr-pixel-skeleton-p:1}}
.wlkr-pixel-skeleton-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
`

const clamp = (input: unknown, min: number, max: number, fallback: number) => {
  const number = Number(input)
  return input === "" || input === null || !Number.isFinite(number) ? fallback : Math.min(max, Math.max(min, number))
}
const length = (input: unknown, fallback: string) => {
  if (typeof input === "number") return Number.isFinite(input) && input >= 0 ? `${input}px` : fallback
  return typeof input === "string" && input.trim() !== "" ? input.trim() : fallback
}

const subscribeVisibility = (notify: () => void) => {
  document.addEventListener("visibilitychange", notify)
  return () => document.removeEventListener("visibilitychange", notify)
}

/** A loading placeholder drawn in coarse pixels, with a denser band that sweeps across it in whole cells. */
export function PixelSkeleton({ variant = "text", lines = 3, width, height, cell = 4, active = true, label, className, style, ...props }: PixelSkeletonProps) {
  const lineCount = Math.round(clamp(lines, 1, 12, 3))
  const pitch = Math.round(clamp(cell, 2, 12, 4))
  const root = React.useRef<HTMLDivElement>(null)
  const [inView, setInView] = React.useState(false)
  const visible = React.useSyncExternalStore(subscribeVisibility, () => document.visibilityState === "visible", () => true)

  React.useEffect(() => {
    const element = root.current
    if (!element || !active) return
    const observer = new IntersectionObserver(entries => setInView(entries.some(entry => entry.isIntersecting)))
    observer.observe(element)
    return () => observer.disconnect()
  }, [active])

  const circle = variant === "circle"
  const boxWidth = length(width, circle ? "40px" : "100%")
  const boxHeight = variant === "text" ? undefined : length(height, circle ? boxWidth : "120px")
  const announced = typeof label === "string" && label.trim() !== "" ? label.trim() : null

  return (
    <div
      {...props}
      ref={root}
      data-variant={variant === "block" || circle ? variant : "text"}
      data-active={active}
      data-paused={!(inView && visible)}
      className={cn("wlkr-pixel-skeleton", className)}
      style={{ "--wlkr-pixel-skeleton-cell": `${pitch}px`, width: boxWidth, height: boxHeight, ...style } as React.CSSProperties}
    >
      <style>{styles}</style>
      {announced && <span role="status" className="wlkr-pixel-skeleton-sr">{announced}</span>}
      <span className="wlkr-pixel-skeleton-visual" aria-hidden="true">
        {variant === "block" || circle
          ? <span className="wlkr-pixel-skeleton-shape" />
          : Array.from({ length: lineCount }, (_, index) => (
            <span key={index} className="wlkr-pixel-skeleton-row">
              <span
                className="wlkr-pixel-skeleton-shape"
                style={{ width: lineCount > 1 && index === lineCount - 1 ? "60%" : "100%", "--wlkr-pixel-skeleton-delay": `${index * 90}ms` } as React.CSSProperties}
              />
            </span>
          ))}
      </span>
    </div>
  )
}
