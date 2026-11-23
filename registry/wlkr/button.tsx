"use client"

import * as React from "react"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

export type ButtonProps = React.ComponentProps<"button"> & {
  variant?: "solid" | "outline" | "quiet" | "destructive"
  size?: "sm" | "md" | "lg"
  glow?: boolean
  loading?: boolean
  asChild?: boolean
}

const styles = `
.wlkr-button{--wlkr-button-fill:var(--foreground,#010101);--wlkr-button-spectrum:linear-gradient(90deg,#ff6d1b,#ffee55,#5bff89,#4d8aff,#6b5fff,#ff64f9,#ff6565,#ff6d1b);box-sizing:border-box;position:relative;display:inline-flex;align-items:center;justify-content:center;gap:6px;min-width:0;max-width:100%;height:32px;padding:0 12px;border:1px solid transparent;border-radius:6px;background:var(--wlkr-button-fill);color:var(--background,#fff);font:500 14px/1 var(--font-sans,Arial,sans-serif);letter-spacing:-.006em;text-decoration:none;cursor:pointer;transition:color 120ms ease,border-color 120ms ease,background-color 120ms ease,transform 120ms cubic-bezier(.23,1,.32,1)}
.wlkr-button-content{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.wlkr-button svg{flex:none;width:16px;height:16px}
.wlkr-button[data-size=sm]{height:28px;padding-inline:9px;font-size:12px}
.wlkr-button[data-size=lg]{height:40px;padding-inline:16px}
.wlkr-button[data-variant=outline],.wlkr-button[data-variant=destructive]{--wlkr-button-fill:var(--card,#fff);border-color:var(--border,#dedede);background:var(--wlkr-button-fill);color:color-mix(in srgb,var(--foreground,#010101) 85%,var(--background,#fff))}
.wlkr-button[data-variant=outline][aria-pressed=true]{--wlkr-button-fill:var(--secondary,#f3f3f3);border-color:color-mix(in srgb,var(--border,#dedede),var(--foreground,#010101) 16%);color:var(--foreground,#010101)}
.wlkr-button[data-variant=destructive]{color:var(--destructive,#b42318);border-color:color-mix(in srgb,var(--destructive,#b42318) 55%,var(--border,#dedede))}
.wlkr-button[data-variant=quiet]{--wlkr-button-fill:var(--background,#fff);padding-inline:10px;background:transparent;color:var(--muted-foreground,#696969)}
.wlkr-button:focus-visible{outline:2px solid var(--brand,#33f282);outline-offset:2px}
.wlkr-button:active{transform:scale(.97)}
.wlkr-button:is(:disabled,[aria-disabled=true]){opacity:.45;cursor:default;transform:none;pointer-events:none}
.wlkr-button[data-loading=true] .wlkr-button-content{opacity:0}
.wlkr-button-spinner{position:absolute;left:calc(50% - 8px);top:calc(50% - 8px);box-sizing:border-box;width:16px;height:16px;border:1.5px solid color-mix(in srgb,currentColor 24%,transparent);border-top-color:currentColor;border-radius:50%;animation:wlkr-button-spin 800ms linear infinite}
.wlkr-button[data-glow=true]{isolation:isolate;background:transparent;border-color:transparent}
.wlkr-button[data-glow=true]::before,.wlkr-button[data-glow=true]::after{content:'';position:absolute;pointer-events:none;border-radius:inherit}
.wlkr-button[data-glow=true]::after{inset:-1px;z-index:-1;border:1.5px solid transparent;background:linear-gradient(var(--wlkr-button-fill),var(--wlkr-button-fill)) padding-box,linear-gradient(var(--wlkr-button-fill) 15%,transparent 70%) border-box,var(--wlkr-button-spectrum) border-box;background-size:100% 100%,100% 100%,200% 100%;animation:wlkr-button-rim 3s linear infinite}
.wlkr-button[data-glow=true]::before{inset:50% 0 -4px;z-index:-2;background:var(--wlkr-button-spectrum);background-size:200% 100%;filter:blur(9px) saturate(1.3) brightness(1.1);opacity:.9;animation:wlkr-button-light 3s linear infinite}
@keyframes wlkr-button-spin{to{transform:rotate(360deg)}}
@keyframes wlkr-button-rim{to{background-position:0 0,0 0,-200% 0}}
@keyframes wlkr-button-light{to{background-position:-200% 0}}
@media(hover:hover) and (pointer:fine){.wlkr-button[data-variant=solid]:hover{--wlkr-button-fill:color-mix(in srgb,var(--foreground,#010101) 88%,var(--background,#fff))}.wlkr-button[data-variant=outline]:hover{--wlkr-button-fill:var(--accent,#f3f3f3);color:var(--foreground,#010101);border-color:color-mix(in srgb,var(--border,#dedede),var(--foreground,#010101) 16%)}.wlkr-button[data-variant=quiet]:hover{--wlkr-button-fill:var(--control-surface,#fafafa);background:var(--wlkr-button-fill);color:color-mix(in srgb,var(--foreground,#010101) 85%,var(--background,#fff))}.wlkr-button[data-variant=destructive]:hover{--wlkr-button-fill:color-mix(in srgb,var(--destructive,#b42318) 9%,var(--card,#fff));border-color:var(--destructive,#b42318)}.wlkr-button[data-glow=true][data-variant=solid]:hover{--wlkr-button-fill:color-mix(in srgb,var(--foreground,#010101) 93%,var(--background,#fff))}.wlkr-button[data-glow=true]:hover{background:transparent}.wlkr-button[data-glow=true]:hover::before,.wlkr-button[data-glow=true]:hover::after{animation-duration:1.2s}}
@media(prefers-reduced-motion:reduce){.wlkr-button{transition:none}.wlkr-button:active{transform:none}.wlkr-button-spinner,.wlkr-button[data-glow=true]::before,.wlkr-button[data-glow=true]::after{animation:none}}
`

/** Bach's everyday action, with an optional spectrum rim. */
export function Button({ variant = "solid", size = "md", glow = false, loading = false, asChild = false, disabled, children, className, onClickCapture, type = "button", ...props }: ButtonProps) {
  const blocked = disabled || loading
  const content = (label: React.ReactNode) => <><span className="wlkr-button-content">{label}</span>{loading && <span className="wlkr-button-spinner" aria-hidden="true" />}</>
  const Comp = asChild ? Slot.Root : "button"
  // Slot receives exactly one element, preserving the child's props and ref.
  const child = asChild ? React.Children.only(children) as React.ReactElement<{ children?: React.ReactNode }> : null
  return <>
    <style>{styles}</style>
    <Comp {...props} type={asChild ? undefined : type} disabled={asChild ? undefined : blocked} aria-disabled={blocked || props["aria-disabled"] || undefined} aria-busy={loading || props["aria-busy"] || undefined} tabIndex={asChild && blocked ? -1 : props.tabIndex} data-variant={variant} data-size={size} data-glow={glow} data-loading={loading} className={cn("wlkr-button", className)} onClickCapture={event => {
      if (blocked) { event.preventDefault(); event.stopPropagation(); return }
      onClickCapture?.(event)
    }}>
      {child ? React.cloneElement(child, {}, content(child.props.children)) : content(children)}
    </Comp>
  </>
}
