"use client"

import * as React from "react"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

export type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "destructive" | "link"
export type ButtonSize = "xs" | "sm" | "default" | "lg" | "icon-xs" | "icon-sm" | "icon" | "icon-lg"

export type ButtonProps = React.ComponentProps<"button"> & {
  variant?: ButtonVariant
  size?: ButtonSize
  /** A moving spectrum rim and a soft light beneath. One per screen. */
  glow?: boolean
  /** Shows a spinner in place of the label, keeps the width and blocks presses. */
  loading?: boolean
  /** Renders the single child (a link, usually) with the button's look and behaviour. */
  asChild?: boolean
}

const styles = `
.wlkr-button{--wlkr-button-fill:var(--foreground,#010101);--wlkr-button-ink:var(--background,#fff);--wlkr-button-line:transparent;--wlkr-button-h:32px;--wlkr-button-px:12px;--wlkr-button-icon:16px;--wlkr-button-spectrum:linear-gradient(90deg,#ff6d1b,#ffee55,#5bff89,#4d8aff,#6b5fff,#ff64f9,#ff6565,#ff6d1b);box-sizing:border-box;position:relative;display:inline-flex;flex:none;align-items:center;justify-content:center;gap:6px;max-width:100%;height:var(--wlkr-button-h);padding:0 var(--wlkr-button-px);border:1px solid var(--wlkr-button-line);border-radius:6px;background:var(--wlkr-button-fill);color:var(--wlkr-button-ink);font-family:inherit;font-weight:500;font-size:14px;line-height:1;letter-spacing:-.006em;white-space:nowrap;text-decoration:none;cursor:pointer;-webkit-tap-highlight-color:transparent;will-change:transform;backface-visibility:hidden;transition:color 120ms ease,border-color 120ms ease,background-color 120ms ease,transform 120ms cubic-bezier(.23,1,.32,1)}
.wlkr-button-label{display:inline-flex;align-items:center;justify-content:center;gap:inherit;min-width:0;overflow:hidden;text-overflow:ellipsis}
.wlkr-button svg{flex:none;width:var(--wlkr-button-icon);height:var(--wlkr-button-icon)}
.wlkr-button[data-size=xs]{--wlkr-button-h:24px;--wlkr-button-px:8px;--wlkr-button-icon:12px;gap:4px;font-size:12px;border-radius:5px}
.wlkr-button[data-size=sm]{--wlkr-button-h:28px;--wlkr-button-px:10px;--wlkr-button-icon:14px;gap:5px;font-size:13px}
.wlkr-button[data-size=lg]{--wlkr-button-h:36px;--wlkr-button-px:12px;gap:8px}
.wlkr-button:not([data-size^=icon]):has(>.wlkr-button-label>svg:first-child){padding-left:calc(var(--wlkr-button-px) * .75)}
.wlkr-button[data-size^=icon]{width:var(--wlkr-button-h);min-width:var(--wlkr-button-h);padding:0}
.wlkr-button[data-size=icon-xs]{--wlkr-button-h:24px;--wlkr-button-icon:12px;border-radius:5px}
.wlkr-button[data-size=icon-sm]{--wlkr-button-h:28px;--wlkr-button-icon:14px}
.wlkr-button[data-size=icon-lg]{--wlkr-button-h:36px}
.wlkr-button[data-variant=secondary]{--wlkr-button-fill:var(--secondary,#f3f3f3);--wlkr-button-ink:var(--secondary-foreground,#010101)}
.wlkr-button[data-variant=outline]{--wlkr-button-fill:var(--background,#fff);--wlkr-button-ink:var(--foreground,#010101);--wlkr-button-line:var(--border,#dedede)}
.wlkr-button[data-variant=outline][aria-pressed=true]{--wlkr-button-fill:var(--accent,#f3f3f3);--wlkr-button-line:color-mix(in srgb,var(--border,#dedede),var(--foreground,#010101) 18%)}
.wlkr-button[data-variant=ghost]{--wlkr-button-fill:transparent;--wlkr-button-ink:var(--foreground,#010101)}
.wlkr-button[data-variant=ghost][aria-pressed=true]{--wlkr-button-fill:var(--accent,#f3f3f3)}
.wlkr-button[data-variant=destructive]{--wlkr-button-fill:color-mix(in srgb,var(--destructive,#b42318) 12%,var(--background,#fff));--wlkr-button-ink:var(--destructive,#b42318)}
.wlkr-button[data-variant=link]{--wlkr-button-fill:transparent;--wlkr-button-ink:var(--foreground,#010101);--wlkr-button-px:0px;height:auto;min-height:var(--wlkr-button-h);text-underline-offset:4px;text-decoration-thickness:1px}
.wlkr-button:focus-visible{outline:2px solid var(--brand,#33f282);outline-offset:2px}
.wlkr-button:not([data-variant=link]):active{transform:scale(.97)}
.wlkr-button:is(:disabled,[aria-disabled=true]){opacity:.5;cursor:default;transform:none;pointer-events:none}
.wlkr-button[data-loading=true]{opacity:1}
.wlkr-button[data-loading=true] .wlkr-button-label{visibility:hidden}
.wlkr-button-spinner{position:absolute;inset:0;margin:auto;box-sizing:border-box;width:var(--wlkr-button-icon);height:var(--wlkr-button-icon);border:1.5px solid color-mix(in srgb,currentColor 25%,transparent);border-top-color:currentColor;border-radius:50%;animation:wlkr-button-spin 800ms linear infinite}
.wlkr-button[data-glow=true]{isolation:isolate;background:transparent;border-color:transparent}
.wlkr-button[data-glow=true]::before,.wlkr-button[data-glow=true]::after{content:'';position:absolute;pointer-events:none;border-radius:inherit}
.wlkr-button[data-glow=true]::after{inset:-1px;z-index:-1;border:1.5px solid transparent;background:linear-gradient(var(--wlkr-button-fill),var(--wlkr-button-fill)) padding-box,linear-gradient(var(--wlkr-button-fill) 15%,transparent 70%) border-box,var(--wlkr-button-spectrum) border-box;background-size:100% 100%,100% 100%,200% 100%;animation:wlkr-button-rim 3s linear infinite}
.wlkr-button[data-glow=true]::before{inset:50% 0 -4px;z-index:-2;background:var(--wlkr-button-spectrum);background-size:200% 100%;filter:blur(9px) saturate(1.3) brightness(1.1);opacity:.9;animation:wlkr-button-light 3s linear infinite}
@keyframes wlkr-button-spin{to{transform:rotate(360deg)}}
@keyframes wlkr-button-rim{to{background-position:0 0,0 0,-200% 0}}
@keyframes wlkr-button-light{to{background-position:-200% 0}}
@media(hover:hover) and (pointer:fine){
.wlkr-button[data-variant=default]:hover{--wlkr-button-fill:color-mix(in srgb,var(--foreground,#010101) 86%,var(--background,#fff))}
.wlkr-button[data-variant=secondary]:hover{--wlkr-button-fill:color-mix(in srgb,var(--secondary,#f3f3f3),var(--foreground,#010101) 7%)}
.wlkr-button:is([data-variant=outline],[data-variant=ghost]):hover{--wlkr-button-fill:var(--accent,#f3f3f3)}
.wlkr-button[data-variant=destructive]:hover{--wlkr-button-fill:color-mix(in srgb,var(--destructive,#b42318) 18%,var(--background,#fff))}
.wlkr-button[data-variant=link]:hover{text-decoration-line:underline}
.wlkr-button[data-glow=true]:hover::before,.wlkr-button[data-glow=true]:hover::after{animation-duration:1.2s}
}
@media(prefers-reduced-motion:reduce){.wlkr-button{transition:none}.wlkr-button:active{transform:none!important}.wlkr-button-spinner{animation-duration:2s}.wlkr-button[data-glow=true]::before,.wlkr-button[data-glow=true]::after{animation:none}}
`

/** The everyday action: six variants, four sizes each with a square icon twin, loading and an optional spectrum glow. */
export function Button({ variant = "default", size = "default", glow = false, loading = false, asChild = false, disabled, children, className, onClickCapture, type = "button", ...props }: ButtonProps) {
  const blocked = disabled || loading
  const content = (label: React.ReactNode) => <><span className="wlkr-button-label">{label}</span>{loading && <span className="wlkr-button-spinner" aria-hidden="true" />}</>
  const Comp = asChild ? Slot.Root : "button"
  // Slot takes exactly one element; its own children become the label.
  const child = asChild ? React.Children.only(children) as React.ReactElement<{ children?: React.ReactNode }> : null
  return <>
    <style href="wlkr-button" precedence="default">{styles}</style>
    <Comp {...props} type={asChild ? undefined : type} disabled={asChild ? undefined : blocked} aria-disabled={blocked || props["aria-disabled"] || undefined} aria-busy={loading || props["aria-busy"] || undefined} tabIndex={asChild && blocked ? -1 : props.tabIndex} data-variant={variant} data-size={size} data-glow={glow || undefined} data-loading={loading || undefined} className={cn("wlkr-button", className)} onClickCapture={event => {
      if (blocked) { event.preventDefault(); event.stopPropagation(); return }
      onClickCapture?.(event)
    }}>
      {child ? React.cloneElement(child, {}, content(child.props.children)) : content(children)}
    </Comp>
  </>
}
