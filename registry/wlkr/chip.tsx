"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type ChipSize = "xs" | "sm"
type ChipDecoration = { swatch?: boolean; icon?: never } | { swatch?: never; icon?: React.ReactNode }
type ChipStyle = React.CSSProperties & { "--wlkr-chip-color"?: string }

type ToggleChipProps = React.ComponentProps<"button"> & {
  as?: "button"
  pressed?: boolean
  defaultPressed?: boolean
  onPressedChange?: (pressed: boolean) => void
}

type StaticChipProps = React.ComponentProps<"span"> & {
  as: "span"
  pressed?: never
  defaultPressed?: never
  onPressedChange?: never
  "aria-pressed"?: never
  disabled?: never
}

type SharedChipProps = ChipDecoration & { size?: ChipSize; style?: ChipStyle }
export type ChipProps = SharedChipProps & (ToggleChipProps | StaticChipProps)

const styles = `
.wlkr-chip {
  --wlkr-chip-h: var(--wlkr-control-h-sm);
  --wlkr-chip-px: var(--wlkr-control-px-sm);
  --wlkr-chip-text: var(--wlkr-control-text-sm);
  --wlkr-chip-icon: var(--wlkr-control-icon-sm);
  --wlkr-chip-gap: var(--wlkr-control-gap-sm);
  box-sizing: border-box;
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  gap: var(--wlkr-chip-gap);
  max-width: 100%;
  height: var(--wlkr-chip-h);
  padding: 0 var(--wlkr-chip-px);
  border: var(--wlkr-control-border) solid var(--wlkr-border-default);
  border-radius: var(--wlkr-radius-full);
  background: var(--wlkr-fill-subtle);
  color: var(--wlkr-content-primary);
  font-family: inherit;
  font-size: var(--wlkr-chip-text);
  font-weight: var(--wlkr-weight-medium);
  line-height: 1;
  white-space: nowrap;
}

.wlkr-chip[data-size=xs] {
  --wlkr-chip-h: var(--wlkr-control-h-xs);
  --wlkr-chip-px: var(--wlkr-control-px-xs);
  --wlkr-chip-text: var(--wlkr-control-text-xs);
  --wlkr-chip-icon: var(--wlkr-control-icon-xs);
  --wlkr-chip-gap: var(--wlkr-control-gap-xs);
}

.wlkr-chip-label { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.wlkr-chip-icon { display: inline-flex; flex: none; }
.wlkr-chip-icon svg { width: var(--wlkr-chip-icon); height: var(--wlkr-chip-icon); }
.wlkr-chip-swatch {
  box-sizing: border-box;
  flex: none;
  width: var(--wlkr-space-2);
  height: var(--wlkr-space-2);
  border: var(--wlkr-control-border) solid var(--wlkr-border-default);
  border-radius: var(--wlkr-radius-full);
  background: var(--wlkr-chip-color);
}

button.wlkr-chip {
  cursor: pointer;
  transition: color var(--wlkr-duration-fast) var(--wlkr-ease-out),
    border-color var(--wlkr-duration-fast) var(--wlkr-ease-out),
    background-color var(--wlkr-duration-fast) var(--wlkr-ease-out),
    transform var(--wlkr-duration-fast) var(--wlkr-ease-out);
}

.wlkr-chip[aria-pressed=false] { color: var(--wlkr-content-tertiary); }
.wlkr-chip[aria-pressed=true] {
  border-color: var(--wlkr-border-strong);
  background: var(--wlkr-fill-active);
}

.wlkr-chip:focus-visible { outline: var(--wlkr-focus-width) solid var(--wlkr-focus-ring); outline-offset: var(--wlkr-focus-offset); }
button.wlkr-chip:not(:disabled, [aria-disabled=true]):active { transform: scale(var(--wlkr-press-scale)); }
button.wlkr-chip:is(:disabled, [aria-disabled=true]) { opacity: var(--wlkr-disabled-opacity); cursor: default; }

@media (hover: hover) and (pointer: fine) {
  .wlkr-chip[aria-pressed=false]:not(:disabled, [aria-disabled=true]):hover {
    border-color: var(--wlkr-border-strong);
    background: var(--wlkr-fill-hover);
  }
}

@media (prefers-reduced-motion: reduce) {
  button.wlkr-chip { transition: none; }
  button.wlkr-chip:not(:disabled, [aria-disabled=true]):active { transform: none; }
}
`

function ToggleChip({
  as: Tag = "button", pressed, defaultPressed = true, onPressedChange, onClick, type = "button",
  "aria-pressed": ariaPressed, "aria-disabled": ariaDisabled, ...props
}: ToggleChipProps) {
  const [inner, setInner] = React.useState(defaultPressed)
  const selected = pressed ?? (ariaPressed === undefined ? inner : ariaPressed === true || ariaPressed === "true")

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    if (ariaDisabled === true || ariaDisabled === "true") {
      event.preventDefault()
      return
    }
    onClick?.(event)
    if (event.defaultPrevented) return
    if (pressed === undefined && ariaPressed === undefined) setInner(!selected)
    onPressedChange?.(!selected)
  }

  return <Tag {...props} type={type} aria-pressed={selected} aria-disabled={ariaDisabled} onClick={handleClick} />
}

export function Chip({ size = "sm", swatch, icon, className, children, ...props }: ChipProps) {
  const stylesheet = <style href="wlkr-chip" precedence="default">{styles}</style>
  const shared = { "data-size": size, className: cn("wlkr-chip", className) }
  const content = <>
    {swatch && <span aria-hidden="true" className="wlkr-chip-swatch" />}
    {icon && <span aria-hidden="true" className="wlkr-chip-icon">{icon}</span>}
    <span className="wlkr-chip-label">{children}</span>
  </>

  if (props.as === "span") {
    const { as: Tag, ...spanProps } = props
    return <>
      {stylesheet}
      <Tag {...spanProps} {...shared}>{content}</Tag>
    </>
  }

  return <>
    {stylesheet}
    <ToggleChip {...props} {...shared}>{content}</ToggleChip>
  </>
}
