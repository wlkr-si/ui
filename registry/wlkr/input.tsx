"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export type InputProps = Omit<React.ComponentProps<"input">, "size"> & {
  size?: "sm" | "md"
  icon?: React.ReactNode
  clearable?: boolean
  clearLabel?: string
}

const styles = `
.wlkr-input{box-sizing:border-box;display:inline-flex;align-items:center;gap:6px;max-width:100%;height:32px;padding:0 4px 0 8px;border:1px solid var(--input,var(--border,#dedede));border-radius:6px;background:var(--card,#fff);color:var(--muted-foreground,#696969);transition:border-color 120ms ease,background-color 120ms ease}
.wlkr-input[data-size=sm]{height:28px}.wlkr-input-control{flex:1;min-width:0;width:100%;height:100%;padding:0;border:0;background:transparent;outline:none;color:var(--foreground,#010101);font-family:inherit;font-weight:500;font-size:14px;line-height:1}
.wlkr-input[data-size=sm] .wlkr-input-control{font-size:12px}.wlkr-input-control::placeholder{color:var(--muted-foreground,#696969);opacity:.7}.wlkr-input-icon{display:inline-flex;flex:none}.wlkr-input-icon svg{width:14px;height:14px}
.wlkr-input:has(input:focus-visible){outline:2px solid var(--brand,#33f282);outline-offset:2px}.wlkr-input:has([aria-invalid=true]){border-color:var(--destructive,#b42318)}.wlkr-input:has(input:disabled){opacity:.45;cursor:default}
.wlkr-input-clear{display:inline-grid;place-items:center;flex:none;width:20px;height:20px;padding:0;border:0;border-radius:4px;background:transparent;color:var(--muted-foreground,#696969);cursor:pointer}.wlkr-input-clear svg{width:12px;height:12px}.wlkr-input:has(input:placeholder-shown) .wlkr-input-clear{visibility:hidden}.wlkr-input-clear:focus-visible{outline:2px solid var(--brand,#33f282);outline-offset:2px}
@media(hover:hover) and (pointer:fine){.wlkr-input:not(:has(input:disabled)):hover{border-color:color-mix(in srgb,var(--border,#dedede),var(--foreground,#010101) 16%)}.wlkr-input-clear:hover{background:var(--secondary,#f3f3f3);color:var(--foreground,#010101)}}
@media(prefers-reduced-motion:reduce){.wlkr-input{transition:none}}
`

export function Input({ size = "md", icon, clearable = false, clearLabel = "Clear input", className, placeholder = " ", ...props }: InputProps) {
  return <><style>{styles}</style><span data-size={size} className={cn("wlkr-input", className)}>
    {icon && <span className="wlkr-input-icon" aria-hidden="true">{icon}</span>}
    <input {...props} placeholder={placeholder} className="wlkr-input-control" />
    {clearable && !props.readOnly && <button type="button" className="wlkr-input-clear" aria-label={clearLabel} disabled={props.disabled} onClick={event => {
      const input = event.currentTarget.parentElement?.querySelector("input")
      if (!input) return
      // Use the native setter so React observes the same input event as typing.
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(input, "")
      input.dispatchEvent(new Event("input", { bubbles: true }))
      input.focus()
    }}><X aria-hidden="true" /></button>}
  </span></>
}
