"use client"

import * as React from "react"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

export type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "destructive" | "link"
export type ButtonSize = "xs" | "sm" | "default" | "lg" | "icon-xs" | "icon-sm" | "icon" | "icon-lg"

type IconSize = "icon-xs" | "icon-sm" | "icon" | "icon-lg"
/** An icon-only button has no visible text, so it must be named. */
type SizeProps = { size?: Exclude<ButtonSize, IconSize> } | { size: IconSize; "aria-label": string } | { size: IconSize; "aria-labelledby": string }

export type ButtonProps = React.ComponentProps<"button"> & SizeProps & {
  variant?: ButtonVariant
  /** A moving spectrum rim and a soft light beneath. One per screen. */
  glow?: boolean
  /** Shows a spinner in place of the label, keeps the width and blocks presses. */
  loading?: boolean
  /** Renders the single child (a link, usually) with the button's look and behaviour. */
  asChild?: boolean
}

const styles = `
.wlkr-button {
  --wlkr-button-fill: var(--wlkr-action-primary);
  --wlkr-button-ink: var(--wlkr-action-primary-ink);
  --wlkr-button-line: transparent;
  --wlkr-button-h: var(--wlkr-control-h-md);
  --wlkr-button-px: var(--wlkr-control-px-md);
  --wlkr-button-icon: var(--wlkr-control-icon-md);
  --wlkr-button-glow-blur: 9px;
  --wlkr-button-glow-drop: 4px;
  --wlkr-button-glow-cycle: 3s;
  --wlkr-button-spin: 800ms;
  box-sizing: border-box; position: relative; display: inline-flex; flex: none; align-items: center; justify-content: center;
  gap: var(--wlkr-control-gap-md); max-width: 100%; height: var(--wlkr-button-h); padding: 0 var(--wlkr-button-px);
  border: var(--wlkr-control-border) solid var(--wlkr-button-line); border-radius: var(--wlkr-radius-md);
  background: var(--wlkr-button-fill); color: var(--wlkr-button-ink);
  font-family: inherit; font-weight: var(--wlkr-weight-medium); font-size: var(--wlkr-control-text-md); line-height: 1; letter-spacing: -.006em;
  white-space: nowrap; text-decoration: none; cursor: pointer; -webkit-tap-highlight-color: transparent;
  will-change: transform; backface-visibility: hidden;
  transition: color var(--wlkr-duration-fast) ease, border-color var(--wlkr-duration-fast) ease, background-color var(--wlkr-duration-fast) ease, transform var(--wlkr-duration-fast) var(--wlkr-ease-out);
}
.wlkr-button-label { display: inline-flex; align-items: center; justify-content: center; gap: inherit; min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.wlkr-button svg { flex: none; width: var(--wlkr-button-icon); height: var(--wlkr-button-icon); }

.wlkr-button:is([data-size=xs],[data-size=icon-xs]) { --wlkr-button-h: var(--wlkr-control-h-xs); --wlkr-button-px: var(--wlkr-control-px-xs); --wlkr-button-icon: var(--wlkr-control-icon-xs); gap: var(--wlkr-control-gap-xs); font-size: var(--wlkr-control-text-xs); border-radius: var(--wlkr-radius-sm); }
.wlkr-button:is([data-size=sm],[data-size=icon-sm]) { --wlkr-button-h: var(--wlkr-control-h-sm); --wlkr-button-px: var(--wlkr-control-px-sm); --wlkr-button-icon: var(--wlkr-control-icon-sm); gap: var(--wlkr-control-gap-sm); font-size: var(--wlkr-control-text-sm); }
.wlkr-button:is([data-size=lg],[data-size=icon-lg]) { --wlkr-button-h: var(--wlkr-control-h-lg); --wlkr-button-px: var(--wlkr-control-px-lg); --wlkr-button-icon: var(--wlkr-control-icon-lg); gap: var(--wlkr-control-gap-lg); font-size: var(--wlkr-control-text-lg); }
.wlkr-button[data-size^=icon] { width: var(--wlkr-button-h); min-width: var(--wlkr-button-h); padding: 0; }
.wlkr-button:not([data-size^=icon]):has(> .wlkr-button-label > svg:first-child) { padding-left: calc(var(--wlkr-button-px) * .75); }

.wlkr-button[data-variant=secondary] { --wlkr-button-fill: var(--wlkr-fill-secondary); --wlkr-button-ink: var(--wlkr-content-primary); }
.wlkr-button[data-variant=outline] { --wlkr-button-fill: transparent; --wlkr-button-ink: var(--wlkr-content-primary); --wlkr-button-line: var(--wlkr-border-default); }
.wlkr-button[data-variant=ghost] { --wlkr-button-fill: transparent; --wlkr-button-ink: var(--wlkr-content-primary); }
.wlkr-button:is([data-variant=outline],[data-variant=ghost])[aria-pressed=true] { --wlkr-button-fill: var(--wlkr-fill-active); --wlkr-button-line: var(--wlkr-border-strong); }
.wlkr-button[data-variant=ghost][aria-pressed=true] { --wlkr-button-line: transparent; }
.wlkr-button[data-variant=destructive] { --wlkr-button-fill: var(--wlkr-danger-subtle); --wlkr-button-ink: var(--wlkr-danger); }
.wlkr-button[data-variant=link] { --wlkr-button-fill: transparent; --wlkr-button-ink: var(--wlkr-content-primary); --wlkr-button-px: 0px; height: auto; min-height: var(--wlkr-button-h); text-underline-offset: var(--wlkr-space-1); text-decoration-thickness: 1px; }

.wlkr-button:focus-visible { outline: var(--wlkr-focus-width) solid var(--wlkr-focus-ring); outline-offset: var(--wlkr-focus-offset); }
.wlkr-button:not([data-variant=link]):active { transform: scale(var(--wlkr-press-scale)); }
.wlkr-button:is(:disabled,[aria-disabled=true]) { opacity: var(--wlkr-disabled-opacity); cursor: default; transform: none; pointer-events: none; }
.wlkr-button[data-loading=true] { opacity: 1; }
.wlkr-button[data-loading=true] .wlkr-button-label { visibility: hidden; }
.wlkr-button-spinner {
  position: absolute; inset: 0; margin: auto; box-sizing: border-box; width: var(--wlkr-button-icon); height: var(--wlkr-button-icon);
  border: 1.5px solid color-mix(in srgb, currentColor 25%, transparent); border-top-color: currentColor; border-radius: var(--wlkr-radius-full);
  animation: wlkr-button-spin var(--wlkr-button-spin) linear infinite;
}

.wlkr-button[data-glow=true] { isolation: isolate; background: transparent; border-color: transparent; }
.wlkr-button[data-glow=true]::before, .wlkr-button[data-glow=true]::after { content: ''; position: absolute; pointer-events: none; border-radius: inherit; }
.wlkr-button[data-glow=true]::after {
  inset: -1px; z-index: -1; border: 1.5px solid transparent;
  background: linear-gradient(var(--wlkr-button-fill), var(--wlkr-button-fill)) padding-box, linear-gradient(var(--wlkr-button-fill) 15%, transparent 70%) border-box, var(--wlkr-spectrum) border-box;
  background-size: 100% 100%, 100% 100%, 200% 100%; animation: wlkr-button-rim var(--wlkr-button-glow-cycle) linear infinite;
}
.wlkr-button[data-glow=true]::before {
  inset: 50% 0 calc(var(--wlkr-button-glow-drop) * -1); z-index: -2; background: var(--wlkr-spectrum); background-size: 200% 100%;
  filter: blur(var(--wlkr-button-glow-blur)) saturate(1.3) brightness(1.1); opacity: .9; animation: wlkr-button-light var(--wlkr-button-glow-cycle) linear infinite;
}
@keyframes wlkr-button-spin { to { transform: rotate(360deg); } }
@keyframes wlkr-button-rim { to { background-position: 0 0, 0 0, -200% 0; } }
@keyframes wlkr-button-light { to { background-position: -200% 0; } }

@media (hover: hover) and (pointer: fine) {
  .wlkr-button[data-variant=default]:hover { --wlkr-button-fill: var(--wlkr-action-primary-hover); }
  .wlkr-button[data-variant=secondary]:hover { --wlkr-button-fill: color-mix(in srgb, var(--wlkr-fill-secondary), var(--wlkr-content-primary) 7%); }
  .wlkr-button:is([data-variant=outline],[data-variant=ghost]):not([aria-pressed=true]):hover { --wlkr-button-fill: var(--wlkr-fill-hover); }
  .wlkr-button[data-variant=outline]:hover { --wlkr-button-line: var(--wlkr-border-strong); }
  .wlkr-button[data-variant=destructive]:hover { --wlkr-button-fill: var(--wlkr-danger-subtle-hover); }
  .wlkr-button[data-variant=link]:hover { text-decoration-line: underline; }
  .wlkr-button[data-glow=true]:hover::before, .wlkr-button[data-glow=true]:hover::after { animation-duration: calc(var(--wlkr-button-glow-cycle) * .4); }
}
@media (prefers-reduced-motion: reduce) {
  .wlkr-button { transition: none; }
  .wlkr-button:active { transform: none !important; }
  .wlkr-button-spinner { animation-duration: calc(var(--wlkr-button-spin) * 2.5); }
  .wlkr-button[data-glow=true]::before, .wlkr-button[data-glow=true]::after { animation: none; }
}
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
