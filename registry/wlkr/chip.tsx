"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type ChipDecoration = { swatch?: string; icon?: React.ReactNode }
export type ChipProps = ChipDecoration & (
  | (React.ComponentProps<"button"> & { as?: "button"; pressed?: boolean; defaultPressed?: boolean; onPressedChange?: (pressed: boolean) => void })
  | (React.ComponentProps<"span"> & { as: "span"; pressed?: never; defaultPressed?: never; onPressedChange?: never })
)

const styles = `
.wlkr-chip{box-sizing:border-box;display:inline-flex;align-items:center;gap:5px;height:22px;padding:0 6px 0 4px;border:1px solid transparent;border-radius:999px;background:transparent;font-family:inherit;font-weight:500;font-size:12px;line-height:1;color:var(--foreground,#010101);white-space:nowrap;cursor:pointer;transition:border-color 120ms ease,background-color 120ms ease,opacity 160ms ease,transform 120ms cubic-bezier(.23,1,.32,1)}
.wlkr-chip-decoration{display:inline-flex;flex:none}.wlkr-chip svg{width:12px;height:12px;flex:none}.wlkr-chip-swatch{width:8px;height:8px;border-radius:50%;background:var(--wlkr-chip-color,currentColor)}
.wlkr-chip[aria-pressed=false]{color:var(--muted-foreground,#696969)}.wlkr-chip[aria-pressed=false] .wlkr-chip-decoration{opacity:.3}
.wlkr-chip:focus-visible{outline:2px solid var(--brand,#33f282);outline-offset:2px}.wlkr-chip:active{transform:scale(.97)}.wlkr-chip:disabled{opacity:.38;cursor:default;transform:none;pointer-events:none}.wlkr-chip[data-static=true]{cursor:default}.wlkr-chip[data-static=true]:active{transform:none}
@media(hover:hover) and (pointer:fine){.wlkr-chip:not([data-static=true]):not(:disabled):hover{border-color:var(--border,#dedede);background:var(--control-surface,#fafafa)}}
@media(prefers-reduced-motion:reduce){.wlkr-chip{transition:none}.wlkr-chip:active{transform:none}}
`

function Decoration({ swatch, icon }: ChipDecoration) {
  return <>{swatch && <span aria-hidden="true" className="wlkr-chip-decoration wlkr-chip-swatch" style={{ "--wlkr-chip-color": swatch } as React.CSSProperties} />}{icon && <span aria-hidden="true" className="wlkr-chip-decoration">{icon}</span>}</>
}

function ToggleChip({ as = "button", swatch, icon, pressed, defaultPressed = true, onPressedChange, className, children, onClick, type = "button", ...props }: Extract<ChipProps, { as?: "button" }>) {
  const [inner, setInner] = React.useState(defaultPressed)
  const selected = pressed ?? (props["aria-pressed"] === undefined ? inner : props["aria-pressed"] === true || props["aria-pressed"] === "true")
  const Tag = as
  return <Tag {...props} type={type} aria-pressed={selected} className={cn("wlkr-chip", className)} onClick={event => {
    onClick?.(event)
    if (event.defaultPrevented) return
    if (pressed === undefined && props["aria-pressed"] === undefined) setInner(!selected)
    onPressedChange?.(!selected)
  }}><Decoration swatch={swatch} icon={icon} />{children}</Tag>
}

export function Chip(props: ChipProps) {
  if (props.as === "span") {
    const { as: Tag, swatch, icon, className, children, ...rest } = props
    return <><style>{styles}</style><Tag {...rest} data-static="true" className={cn("wlkr-chip", className)}><Decoration swatch={swatch} icon={icon} />{children}</Tag></>
  }
  return <><style>{styles}</style><ToggleChip {...props} /></>
}
