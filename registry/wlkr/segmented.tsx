"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type SegmentedOption = { value: string; label: React.ReactNode; disabled?: boolean }
type GroupName = { label: string } | { "aria-label": string } | { "aria-labelledby": string }

export type SegmentedProps = Omit<React.ComponentProps<"div">, "defaultValue" | "onChange" | "children" | "role"> & GroupName & {
  options: SegmentedOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  label?: string
  size?: "sm" | "default"
  disabled?: boolean
}

const styles = `
.wlkr-segmented {
  --wlkr-segmented-h: var(--wlkr-control-h-md);
  --wlkr-segmented-px: var(--wlkr-control-px-md);
  --wlkr-segmented-text: var(--wlkr-control-text-md);
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: var(--wlkr-space-0_5);
  max-width: 100%;
  height: var(--wlkr-segmented-h);
  padding: var(--wlkr-space-0_5);
  border: var(--wlkr-control-border) solid var(--wlkr-border-default);
  border-radius: var(--wlkr-radius-md);
  font-family: inherit;
  font-size: var(--wlkr-segmented-text);
  font-weight: var(--wlkr-weight-medium);
  line-height: 1;
  transition: border-color var(--wlkr-duration-fast) var(--wlkr-ease-out);
}
.wlkr-segmented[data-size=sm] {
  --wlkr-segmented-h: var(--wlkr-control-h-sm);
  --wlkr-segmented-px: var(--wlkr-control-px-sm);
  --wlkr-segmented-text: var(--wlkr-control-text-sm);
}
.wlkr-segmented-label {
  padding-inline: var(--wlkr-space-1);
  color: var(--wlkr-content-secondary);
  font-size: var(--wlkr-text-2xs);
}
.wlkr-segmented-option {
  box-sizing: border-box;
  height: 100%;
  padding-inline: var(--wlkr-segmented-px);
  border: 0;
  border-radius: var(--wlkr-radius-sm);
  background: transparent;
  color: var(--wlkr-content-secondary);
  font: inherit;
  cursor: pointer;
  transition: background-color var(--wlkr-duration-fast) var(--wlkr-ease-out),
    color var(--wlkr-duration-fast) var(--wlkr-ease-out),
    transform var(--wlkr-duration-fast) var(--wlkr-ease-out);
}
.wlkr-segmented-label, .wlkr-segmented-option {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.wlkr-segmented-option[aria-checked=true] {
  background: var(--wlkr-fill-active);
  color: var(--wlkr-content-primary);
}
.wlkr-segmented-option:focus-visible {
  z-index: var(--wlkr-z-raised);
  outline: var(--wlkr-focus-width) solid var(--wlkr-focus-ring);
  outline-offset: var(--wlkr-focus-offset);
}
.wlkr-segmented-option:enabled:active { transform: scale(var(--wlkr-press-scale)); }
.wlkr-segmented-option:disabled { cursor: default; }
.wlkr-segmented[aria-disabled=true],
.wlkr-segmented:not([aria-disabled=true]) .wlkr-segmented-option:disabled {
  opacity: var(--wlkr-disabled-opacity);
}
@media (hover: hover) and (pointer: fine) {
  .wlkr-segmented:has(.wlkr-segmented-option:enabled:hover) { border-color: var(--wlkr-border-strong); }
  .wlkr-segmented-option[aria-checked=false]:enabled:hover {
    background: var(--wlkr-fill-hover);
    color: var(--wlkr-content-primary);
  }
}
@media (prefers-reduced-motion: reduce) {
  .wlkr-segmented, .wlkr-segmented-option { transition: none; }
  .wlkr-segmented-option:enabled:active { transform: none; }
}
`

export function Segmented({
  options, value, defaultValue, onValueChange, label, size = "default", disabled = false,
  className, onKeyDown, "aria-label": ariaLabel, "aria-labelledby": labelledBy, ...props
}: SegmentedProps) {
  const labelId = React.useId()
  const [inner, setInner] = React.useState(defaultValue ?? options.find(option => !option.disabled)?.value)
  const current = value ?? inner
  const buttons = React.useRef<(HTMLButtonElement | null)[]>([])
  const enabled = options.map((option, index) => !disabled && !option.disabled ? index : -1).filter(index => index >= 0)
  const selected = options.findIndex(option => option.value === current)
  const tabStop = enabled.includes(selected) ? selected : enabled[0]
  function choose(next: string) {
    if (value === undefined) setInner(next)
    if (next !== current) onValueChange?.(next)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event)
    if (event.defaultPrevented || !enabled.length) return

    let next: number | undefined
    if (event.key === "Home") next = enabled[0]
    if (event.key === "End") next = enabled.at(-1)
    if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(event.key)) {
      const rtl = getComputedStyle(event.currentTarget).direction === "rtl"
      const forward = event.key === "ArrowDown" || event.key === (rtl ? "ArrowLeft" : "ArrowRight")
      const position = enabled.findIndex(index => buttons.current[index] === event.target)
      const start = position === -1 && !forward ? 0 : position
      next = enabled[(start + (forward ? 1 : -1) + enabled.length) % enabled.length]
    }
    if (next === undefined) return
    event.preventDefault()
    choose(options[next].value)
    buttons.current[next]?.focus()
  }

  return <>
    <style href="wlkr-segmented" precedence="default">{styles}</style>
    <div
      {...props}
      role="radiogroup"
      aria-label={ariaLabel}
      aria-labelledby={labelledBy ?? (label && !ariaLabel ? labelId : undefined)}
      aria-disabled={disabled || undefined}
      data-size={size}
      className={cn("wlkr-segmented", className)}
      onKeyDown={handleKeyDown}
    >
      {label && <span id={labelId} className="wlkr-segmented-label">{label}</span>}
      {options.map((option, index) => <button
        key={option.value}
        ref={node => { buttons.current[index] = node }}
        type="button"
        role="radio"
        aria-checked={current === option.value}
        disabled={disabled || option.disabled}
        tabIndex={index === tabStop ? 0 : -1}
        className="wlkr-segmented-option"
        onClick={() => choose(option.value)}
      >
        {option.label}
      </button>)}
    </div>
  </>
}
