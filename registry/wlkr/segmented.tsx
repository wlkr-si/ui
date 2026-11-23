"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type SegmentedOption = { value: string; label: React.ReactNode; disabled?: boolean }
export type SegmentedProps = Omit<React.ComponentProps<"div">, "defaultValue" | "onChange" | "children"> & {
  options: SegmentedOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  label?: string
  size?: "sm" | "md"
  disabled?: boolean
}

const styles = `
.wlkr-segmented{box-sizing:border-box;display:inline-flex;align-items:center;gap:2px;max-width:100%;height:32px;padding:2px;border:1px solid var(--border,#dedede);border-radius:6px;background:var(--card,#fff);font-family:inherit;font-weight:500;font-size:14px;line-height:1;transition:border-color 120ms ease}
.wlkr-segmented[data-size=sm]{height:28px;font-size:12px}.wlkr-segmented-label{padding:0 4px 0 5px;color:var(--muted-foreground,#696969);opacity:.7;font-size:11px;white-space:nowrap}
.wlkr-segmented-option{box-sizing:border-box;min-width:0;height:100%;padding:0 8px;border:0;border-radius:4px;background:transparent;color:var(--muted-foreground,#696969);font:inherit;white-space:nowrap;cursor:pointer;transition:background-color 120ms ease,color 120ms ease}
.wlkr-segmented-option[aria-checked=true]{background:var(--secondary,#f3f3f3);color:var(--foreground,#010101);box-shadow:inset 0 0 0 1px var(--border,#dedede)}
.wlkr-segmented-option:focus-visible{outline:2px solid var(--brand,#33f282);outline-offset:2px}.wlkr-segmented-option:disabled{opacity:.4;cursor:default}
@media(hover:hover) and (pointer:fine){.wlkr-segmented:hover{border-color:color-mix(in srgb,var(--border,#dedede),var(--foreground,#010101) 16%)}.wlkr-segmented-option:not(:disabled):hover{color:var(--foreground,#010101)}}
@media(prefers-reduced-motion:reduce){.wlkr-segmented,.wlkr-segmented-option{transition:none}}
`

export function Segmented({ options, value, defaultValue, onValueChange, label, size = "md", disabled = false, className, onKeyDown, "aria-label": ariaLabel, "aria-labelledby": labelledBy, ...props }: SegmentedProps) {
  const labelId = React.useId()
  const [inner, setInner] = React.useState(defaultValue ?? options.find(option => !option.disabled)?.value)
  const current = value ?? inner
  const buttons = React.useRef<(HTMLButtonElement | null)[]>([])
  const enabled = options.map((option, index) => !disabled && !option.disabled ? index : -1).filter(index => index >= 0)
  const selected = options.findIndex(option => option.value === current)
  const tabStop = enabled.includes(selected) ? selected : enabled[0]
  function choose(index: number) {
    const next = options[index]?.value
    if (next === undefined) return
    if (value === undefined) setInner(next)
    if (next !== current) onValueChange?.(next)
  }
  return <div {...props} role="radiogroup" aria-label={ariaLabel} aria-labelledby={labelledBy ?? (label && !ariaLabel ? labelId : undefined)} aria-disabled={disabled || undefined} data-size={size} className={cn("wlkr-segmented", className)} onKeyDown={event => {
    onKeyDown?.(event)
    if (event.defaultPrevented || !enabled.length) return
    const active = buttons.current.indexOf(document.activeElement as HTMLButtonElement)
    const position = enabled.indexOf(active)
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl"
    let next: number | undefined
    if (event.key === "Home") next = enabled[0]
    if (event.key === "End") next = enabled.at(-1)
    if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(event.key)) {
      const forward = event.key === "ArrowDown" || event.key === (rtl ? "ArrowLeft" : "ArrowRight")
      next = enabled[(position + (forward ? 1 : -1) + enabled.length) % enabled.length]
    }
    if (next === undefined) return
    event.preventDefault(); choose(next); buttons.current[next]?.focus()
  }}>
    <style>{styles}</style>
    {label && <span id={labelId} className="wlkr-segmented-label">{label}</span>}
    {options.map((option, index) => <button key={option.value} ref={node => { buttons.current[index] = node }} type="button" role="radio" aria-checked={current === option.value} disabled={disabled || option.disabled} tabIndex={index === tabStop ? 0 : -1} className="wlkr-segmented-option" onClick={() => choose(index)}>{option.label}</button>)}
  </div>
}
