"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type Variant = "orbit" | "snake" | "scan" | "dither" | "pulse" | "bar"

export type PixelSpinnerProps = Omit<React.ComponentPropsWithoutRef<"span">, "children"> & {
  variant?: Variant
  /** Any CSS length. Defaults to 1em so it sits inline with text. */
  size?: string
  /** One full cycle, in milliseconds. */
  speed?: number
  /** Paint the lead pixel in WLKR green. */
  accent?: boolean
  /** Visually hidden text read by assistive technology. */
  label?: string
}

/** Row-major phase for each of the nine cells; -1 stays dim. `steps` is the cycle length in phases. */
const GRIDS: Record<Exclude<Variant, "bar">, { steps: number; phases: number[] }> = {
  orbit: { steps: 8, phases: [0, 1, 2, 7, -1, 3, 6, 5, 4] },
  snake: { steps: 8, phases: [0, 1, 2, 7, -1, 3, 6, 5, 4] },
  scan: { steps: 3, phases: [0, 0, 0, 1, 1, 1, 2, 2, 2] },
  dither: { steps: 9, phases: [0, 7, 3, 6, 5, 2, 4, 1, 8] },
  pulse: { steps: 4, phases: [2, 1, 2, 1, 0, 1, 2, 1, 2] },
}

const VARIANTS: Variant[] = ["orbit", "snake", "scan", "dither", "pulse", "bar"]

const styles = `
.wlkr-pixel-spinner{--wlkr-pixel-spinner-ink:var(--foreground,currentColor);--wlkr-pixel-spinner-lead:var(--wlkr-pixel-spinner-ink);--wlkr-pixel-spinner-off:.14;position:relative;display:inline-block;flex:none;width:var(--wlkr-pixel-spinner-size);height:var(--wlkr-pixel-spinner-size);vertical-align:-.125em;color:inherit;line-height:0}
.wlkr-pixel-spinner[data-accent=true]{--wlkr-pixel-spinner-lead:var(--brand,#33f282)}
.wlkr-pixel-spinner-grid{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);gap:calc(var(--wlkr-pixel-spinner-size) * .12);width:100%;height:100%}
.wlkr-pixel-spinner[data-variant=bar]{height:calc(var(--wlkr-pixel-spinner-size) * .2);vertical-align:.2em}
.wlkr-pixel-spinner-track{position:relative;display:grid;grid-template-columns:repeat(5,1fr);gap:calc(var(--wlkr-pixel-spinner-size) * .05);width:100%;height:100%}
.wlkr-pixel-spinner-cell,.wlkr-pixel-spinner-head{display:block;border-radius:0;background:var(--wlkr-pixel-spinner-ink);opacity:var(--wlkr-pixel-spinner-off)}
.wlkr-pixel-spinner-head{position:absolute;top:0;left:0;width:calc((100% - var(--wlkr-pixel-spinner-size) * .2) / 5);height:100%;opacity:1;background:var(--wlkr-pixel-spinner-lead);transform:translateX(calc(2 * (100% + var(--wlkr-pixel-spinner-size) * .05)))}
.wlkr-pixel-spinner-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@keyframes wlkr-pixel-spinner-orbit{0%{opacity:1;background:var(--wlkr-pixel-spinner-lead)}12.5%{opacity:.6;background:var(--wlkr-pixel-spinner-ink)}25%{opacity:.32;background:var(--wlkr-pixel-spinner-ink)}37.5%,100%{opacity:var(--wlkr-pixel-spinner-off);background:var(--wlkr-pixel-spinner-ink)}}
@keyframes wlkr-pixel-spinner-snake{0%{opacity:1;background:var(--wlkr-pixel-spinner-lead)}12.5%{opacity:1;background:var(--wlkr-pixel-spinner-ink)}37.5%,100%{opacity:var(--wlkr-pixel-spinner-off);background:var(--wlkr-pixel-spinner-ink)}}
@keyframes wlkr-pixel-spinner-scan{0%{opacity:1;background:var(--wlkr-pixel-spinner-lead)}33.333%{opacity:.45;background:var(--wlkr-pixel-spinner-ink)}66.667%,100%{opacity:var(--wlkr-pixel-spinner-off);background:var(--wlkr-pixel-spinner-ink)}}
@keyframes wlkr-pixel-spinner-dither{0%{opacity:1;background:var(--wlkr-pixel-spinner-lead)}11.111%{opacity:1;background:var(--wlkr-pixel-spinner-ink)}50%,100%{opacity:var(--wlkr-pixel-spinner-off);background:var(--wlkr-pixel-spinner-ink)}}
@keyframes wlkr-pixel-spinner-pulse{0%{opacity:1;background:var(--wlkr-pixel-spinner-lead)}25%{opacity:.45;background:var(--wlkr-pixel-spinner-ink)}50%,100%{opacity:var(--wlkr-pixel-spinner-off);background:var(--wlkr-pixel-spinner-ink)}}
@keyframes wlkr-pixel-spinner-bar{from{transform:translateX(0)}to{transform:translateX(calc(4 * (100% + var(--wlkr-pixel-spinner-size) * .05)))}}
@media(prefers-reduced-motion:no-preference){
.wlkr-pixel-spinner-cell[data-phase]{animation:var(--wlkr-pixel-spinner-name) var(--wlkr-pixel-spinner-t) steps(1,end) infinite both}
.wlkr-pixel-spinner-head{animation:wlkr-pixel-spinner-bar calc(var(--wlkr-pixel-spinner-t) / 2) steps(4,jump-none) infinite alternate}
}
@media(prefers-reduced-motion:reduce){
.wlkr-pixel-spinner-cell[data-on]{opacity:1}
.wlkr-pixel-spinner-cell[data-lead]{background:var(--wlkr-pixel-spinner-lead)}
}
`

/** Tiny inline loading indicators drawn on square pixels with stepped CSS motion. */
export function PixelSpinner({ variant = "orbit", size = "1em", speed = 900, accent = false, label = "Loading", className, style, ...props }: PixelSpinnerProps) {
  const safeVariant: Variant = VARIANTS.includes(variant) ? variant : "orbit"
  const cycle = Number.isFinite(speed) && speed > 0 ? speed : 900
  const rootStyle = {
    ...style,
    "--wlkr-pixel-spinner-size": size,
    "--wlkr-pixel-spinner-t": `${cycle}ms`,
    "--wlkr-pixel-spinner-name": `wlkr-pixel-spinner-${safeVariant}`,
  } as React.CSSProperties

  let body: React.ReactNode
  if (safeVariant === "bar") {
    body = (
      <span className="wlkr-pixel-spinner-track">
        {[0, 1, 2, 3, 4].map(i => <span key={i} className="wlkr-pixel-spinner-cell" />)}
        <span className="wlkr-pixel-spinner-head" />
      </span>
    )
  } else {
    const { steps, phases } = GRIDS[safeVariant]
    body = (
      <span className="wlkr-pixel-spinner-grid">
        {phases.map((phase, i) => {
          if (phase < 0) return <span key={i} className="wlkr-pixel-spinner-cell" />
          const delay = -(((steps - phase) % steps) / steps) * cycle
          return (
            <span
              key={i}
              className="wlkr-pixel-spinner-cell"
              data-phase={phase}
              data-on={phase < steps / 2 ? "" : undefined}
              data-lead={phase === 0 ? "" : undefined}
              style={{ animationDelay: `${Math.round(delay)}ms` }}
            />
          )
        })}
      </span>
    )
  }

  return (
    <span
      {...props}
      role="status"
      className={cn("wlkr-pixel-spinner", className)}
      data-variant={safeVariant}
      data-accent={accent ? "true" : undefined}
      style={rootStyle}
    >
      <style>{styles}</style>
      <span aria-hidden="true" style={{ display: "contents" }}>{body}</span>
      <span className="wlkr-pixel-spinner-sr">{label}</span>
    </span>
  )
}
