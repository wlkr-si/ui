"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type PixelButtonProps = React.ComponentPropsWithoutRef<"button"> & {
  variant?: "solid" | "outline" | "brand"
  size?: "sm" | "md" | "lg"
  /** Shows a three-pixel marching indicator, sets aria-busy and ignores clicks. */
  loading?: boolean
}

const COLS = 16
const ROWS = 4
const STEP = 14
/** 4x4 Bayer matrix: the ordered-dither threshold for each pixel. */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]

const SPAN = COLS + 3
const PIXELS = Array.from({ length: COLS * ROWS }, (_, i) => {
  const row = Math.floor(i / COLS)
  const col = i % COLS
  const t = col + (BAYER[(row % 4) * 4 + (col % 4)] / 16) * 3
  return { key: i, d: Math.round(t * STEP), r: Math.round((SPAN - t) * STEP) }
})

const styles = `
.wlkr-pixel-button{--wlkr-pixel-button-bg:var(--foreground,#0a0a0a);--wlkr-pixel-button-fg:var(--background,#fff);--wlkr-pixel-button-px:var(--brand,#33f282);--wlkr-pixel-button-on:var(--brand-foreground,#0a0a0a);--wlkr-pixel-button-line:transparent;--wlkr-pixel-button-h:40px;--wlkr-pixel-button-pad:16px;--wlkr-pixel-button-fs:14px;position:relative;isolation:isolate;display:inline-flex;align-items:center;justify-content:center;gap:8px;box-sizing:border-box;height:var(--wlkr-pixel-button-h);max-width:100%;padding:0 var(--wlkr-pixel-button-pad);border:1px solid var(--wlkr-pixel-button-line);border-radius:0;background:var(--wlkr-pixel-button-bg);color:var(--wlkr-pixel-button-fg);font:inherit;font-size:var(--wlkr-pixel-button-fs);font-weight:500;line-height:1;white-space:nowrap;cursor:pointer;overflow:hidden;user-select:none;-webkit-tap-highlight-color:transparent;transition:color 0s linear ${Math.round(SPAN * STEP * 0.45)}ms}
.wlkr-pixel-button[data-variant=outline]{--wlkr-pixel-button-bg:transparent;--wlkr-pixel-button-fg:var(--foreground,currentColor);--wlkr-pixel-button-px:var(--foreground,currentColor);--wlkr-pixel-button-on:var(--background,#fff);--wlkr-pixel-button-line:var(--border,currentColor)}
.wlkr-pixel-button[data-variant=brand]{--wlkr-pixel-button-bg:var(--brand,#33f282);--wlkr-pixel-button-fg:var(--brand-foreground,#0a0a0a);--wlkr-pixel-button-px:var(--foreground,#0a0a0a);--wlkr-pixel-button-on:var(--background,#fff)}
.wlkr-pixel-button[data-size=sm]{--wlkr-pixel-button-h:32px;--wlkr-pixel-button-pad:12px;--wlkr-pixel-button-fs:13px;gap:6px}
.wlkr-pixel-button[data-size=lg]{--wlkr-pixel-button-h:48px;--wlkr-pixel-button-pad:22px;--wlkr-pixel-button-fs:15px;gap:10px}
.wlkr-pixel-button-grid{position:absolute;inset:0;z-index:-1;display:grid;grid-template-columns:repeat(${COLS},1fr);grid-template-rows:repeat(${ROWS},1fr);pointer-events:none}
.wlkr-pixel-button-px{background:var(--wlkr-pixel-button-px);opacity:0;transition:opacity 0s linear;transition-delay:var(--wlkr-pixel-button-r)}
.wlkr-pixel-button:where(:hover,:focus-visible):not(:disabled,[data-loading]){color:var(--wlkr-pixel-button-on);transition-delay:${Math.round(SPAN * STEP * 0.5)}ms}
.wlkr-pixel-button:where(:hover,:focus-visible):not(:disabled,[data-loading]) .wlkr-pixel-button-px{opacity:1;transition-delay:var(--wlkr-pixel-button-d)}
.wlkr-pixel-button:active:not(:disabled,[data-loading]){color:var(--wlkr-pixel-button-on);transform:translateY(1px);transition-delay:0s}
.wlkr-pixel-button:active:not(:disabled,[data-loading]) .wlkr-pixel-button-px{opacity:1;transition-delay:0s}
.wlkr-pixel-button:focus-visible{outline:2px solid var(--brand,#33f282);outline-offset:2px}
.wlkr-pixel-button:disabled{cursor:not-allowed;opacity:.45}
.wlkr-pixel-button[data-loading]{cursor:progress}
.wlkr-pixel-button-label{display:inline-flex;align-items:center;gap:inherit;min-width:0}
.wlkr-pixel-button[data-loading] .wlkr-pixel-button-label{visibility:hidden}
.wlkr-pixel-button-load{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:3px}
.wlkr-pixel-button-load i{display:block;width:4px;height:4px;background:currentColor;opacity:.25}
.wlkr-pixel-button[data-size=lg] .wlkr-pixel-button-load i{width:5px;height:5px}
.wlkr-pixel-button-load i:nth-child(2){animation-delay:200ms}
.wlkr-pixel-button-load i:nth-child(3){animation-delay:400ms}
.wlkr-pixel-button-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@keyframes wlkr-pixel-button-march{0%,33.2%{opacity:1}33.3%,100%{opacity:.25}}
@media(prefers-reduced-motion:no-preference){
.wlkr-pixel-button-load i{animation:wlkr-pixel-button-march 600ms steps(1,end) infinite}
}
@media(prefers-reduced-motion:reduce){
.wlkr-pixel-button,.wlkr-pixel-button:where(:hover,:focus-visible){transition-delay:0s}
.wlkr-pixel-button-px,.wlkr-pixel-button:where(:hover,:focus-visible) .wlkr-pixel-button-px{transition-delay:0s}
.wlkr-pixel-button:active{transform:none}
.wlkr-pixel-button-load i{opacity:1}
}
`

/** A flat button whose fill sweeps in as an ordered-dither grid of square pixels. */
export const PixelButton = React.forwardRef<HTMLButtonElement, PixelButtonProps>(function PixelButton(
  { variant = "solid", size = "md", loading = false, type = "button", className, children, onClick, ...props },
  ref,
) {
  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (loading) {
        event.preventDefault()
        return
      }
      onClick?.(event)
    },
    [loading, onClick],
  )
  return (
    <button
      {...props}
      ref={ref}
      type={type}
      className={cn("wlkr-pixel-button", className)}
      data-variant={variant === "outline" || variant === "brand" ? variant : "solid"}
      data-size={size === "sm" || size === "lg" ? size : "md"}
      data-loading={loading ? "" : undefined}
      aria-busy={loading || undefined}
      onClick={handleClick}
    >
      <style>{styles}</style>
      <span className="wlkr-pixel-button-grid" aria-hidden="true">
        {PIXELS.map(p => (
          <span
            key={p.key}
            className="wlkr-pixel-button-px"
            style={{ "--wlkr-pixel-button-d": `${p.d}ms`, "--wlkr-pixel-button-r": `${p.r}ms` } as React.CSSProperties}
          />
        ))}
      </span>
      <span className="wlkr-pixel-button-label">{children}</span>
      {loading && (
        <span className="wlkr-pixel-button-load">
          <i aria-hidden="true" />
          <i aria-hidden="true" />
          <i aria-hidden="true" />
          <span className="wlkr-pixel-button-sr">Loading</span>
        </span>
      )}
    </button>
  )
})
