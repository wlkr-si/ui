"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type LiquidSwitchProps = Omit<React.ComponentPropsWithoutRef<"button">, "type" | "role" | "value" | "children" | "defaultChecked" | "aria-checked"> & {
  /** Controlled state. Pair with `onCheckedChange`. */
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  /** Uncontrolled starting state. */
  defaultChecked?: boolean
  /** Accessible name when there is no visible label. Otherwise wrap the switch in a `<label>` or pass `aria-labelledby`. */
  label?: string
  /** Colour of the on state. */
  tone?: "ink" | "brand"
  size?: "sm" | "md"
  /** With `name`, a hidden checkbox carries the state in native form submissions. */
  name?: string
  /** Submitted value while on. */
  value?: string
}

const FAST = "260ms cubic-bezier(.3,1.3,.5,1)"
const SLOW = "460ms cubic-bezier(.5,0,.2,1)"
const SQUISH = "140ms cubic-bezier(.2,.7,.2,1)"
const LAND = "180ms cubic-bezier(.2,.7,.2,1) 140ms"

const styles = `
.wlkr-liquid-switch{--wlkr-liquid-switch-w:44px;--wlkr-liquid-switch-h:24px;--wlkr-liquid-switch-on:var(--brand,#33f282);--wlkr-liquid-switch-knob-on:var(--brand-foreground,#010101);position:relative;display:inline-flex;flex:none;width:var(--wlkr-liquid-switch-w);height:var(--wlkr-liquid-switch-h);margin:0;padding:0;border:0;border-radius:3px;background:none;cursor:pointer;vertical-align:middle;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.wlkr-liquid-switch[data-size=sm]{--wlkr-liquid-switch-w:36px;--wlkr-liquid-switch-h:20px}
.wlkr-liquid-switch[data-tone=ink]{--wlkr-liquid-switch-on:var(--foreground,currentColor);--wlkr-liquid-switch-knob-on:var(--background,#fff)}
.wlkr-liquid-switch::before{content:"";position:absolute;left:50%;top:50%;width:max(100%,44px);height:44px;transform:translate(-50%,-50%)}
.wlkr-liquid-switch:focus-visible{outline:2px solid var(--ring,currentColor);outline-offset:4px}
.wlkr-liquid-switch:disabled{opacity:.5;cursor:default}
.wlkr-liquid-switch-track{--wlkr-liquid-switch-t:calc(var(--wlkr-liquid-switch-h) - 4px);--wlkr-liquid-switch-travel:calc(var(--wlkr-liquid-switch-w) - var(--wlkr-liquid-switch-h));--wlkr-liquid-switch-knob:var(--muted-foreground,#696969);position:absolute;inset:0;overflow:hidden;border-radius:3px;background:var(--muted,#f3f3f3);box-shadow:inset 0 0 0 1px var(--border,#dedede);pointer-events:none;transition:background-color ${LAND},box-shadow ${LAND}}
.wlkr-liquid-switch[aria-checked=true] .wlkr-liquid-switch-track{--wlkr-liquid-switch-knob:var(--wlkr-liquid-switch-knob-on);background:var(--wlkr-liquid-switch-on);box-shadow:inset 0 0 0 1px var(--wlkr-liquid-switch-on)}
.wlkr-liquid-switch-track>svg{position:absolute;width:0;height:0}
.wlkr-liquid-switch-goo{position:absolute;inset:2px}
.wlkr-liquid-switch-goo>span{position:absolute;left:0;background:var(--wlkr-liquid-switch-knob)}
.wlkr-liquid-switch-head,.wlkr-liquid-switch-tail{top:0;bottom:0;width:var(--wlkr-liquid-switch-t);border-radius:1px}
.wlkr-liquid-switch-neck{top:50%;height:42%;transform:translateY(-50%);right:calc(100% - var(--wlkr-liquid-switch-t))}
.wlkr-liquid-switch-head{transition:background-color ${LAND},transform ${FAST},width ${SQUISH}}
.wlkr-liquid-switch-tail{transition:background-color ${LAND},transform ${SLOW}}
.wlkr-liquid-switch-neck{transition:background-color ${LAND},left ${FAST},right ${SLOW}}
.wlkr-liquid-switch[aria-checked=true] .wlkr-liquid-switch-head,.wlkr-liquid-switch[aria-checked=true] .wlkr-liquid-switch-tail{transform:translateX(var(--wlkr-liquid-switch-travel))}
.wlkr-liquid-switch[aria-checked=true] .wlkr-liquid-switch-neck{left:var(--wlkr-liquid-switch-travel);right:0;transition:background-color ${LAND},right ${FAST},left ${SLOW}}
@media(prefers-reduced-motion:no-preference){.wlkr-liquid-switch:active:not(:disabled) .wlkr-liquid-switch-head{width:calc(var(--wlkr-liquid-switch-t) * 1.25)}.wlkr-liquid-switch[aria-checked=true]:active:not(:disabled) .wlkr-liquid-switch-head{transform:translateX(calc(var(--wlkr-liquid-switch-travel) - var(--wlkr-liquid-switch-t) * .25))}}
@media(prefers-reduced-motion:reduce){.wlkr-liquid-switch .wlkr-liquid-switch-track,.wlkr-liquid-switch .wlkr-liquid-switch-goo>span{transition:none!important}}
`

/** A switch whose thumb is a drop: it stretches across the track, necks, and snaps to the other side. */
export function LiquidSwitch({ checked, onCheckedChange, defaultChecked = false, label, tone = "brand", size = "md", name, value = "on", disabled = false, className, onClick, ...props }: LiquidSwitchProps) {
  const [internal, setInternal] = React.useState(Boolean(defaultChecked))
  const on = checked !== undefined ? Boolean(checked) : internal
  const filter = `wlkr-liquid-switch-${React.useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
  const blur = size === "sm" ? 1.5 : 2

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    onClick?.(event)
    if (event.defaultPrevented || disabled) return
    if (checked === undefined) setInternal(!on)
    onCheckedChange?.(!on)
  }

  return (
    <>
      <button
        aria-label={label}
        {...props}
        type="button"
        role="switch"
        aria-checked={on}
        disabled={disabled}
        className={cn("wlkr-liquid-switch", className)}
        data-tone={tone === "ink" ? "ink" : "brand"}
        data-size={size === "sm" ? "sm" : "md"}
        onClick={handleClick}
      >
        <style>{styles}</style>
        <span className="wlkr-liquid-switch-track" aria-hidden="true">
          <svg focusable="false">
            <filter id={filter} colorInterpolationFilters="sRGB">
              <feGaussianBlur in="SourceGraphic" stdDeviation={blur} />
              <feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 16 -7" />
            </filter>
          </svg>
          <span className="wlkr-liquid-switch-goo" style={{ filter: `url(#${filter})` }}>
            <span className="wlkr-liquid-switch-tail" />
            <span className="wlkr-liquid-switch-neck" />
            <span className="wlkr-liquid-switch-head" />
          </span>
        </span>
      </button>
      {name && <input type="checkbox" hidden aria-hidden="true" tabIndex={-1} name={name} value={value} checked={on} disabled={disabled} readOnly />}
    </>
  )
}
