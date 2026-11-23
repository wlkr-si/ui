import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export type SelectProps = Omit<React.ComponentProps<"select">, "size"> & {
  label?: string
  size?: "sm" | "md"
}

const styles = `
.wlkr-select{position:relative;box-sizing:border-box;display:inline-flex;align-items:center;max-width:100%;height:32px;padding-left:8px;border:1px solid var(--input,var(--border,#dedede));border-radius:6px;background:var(--card,#fff);transition:border-color 120ms ease,background-color 120ms ease}
.wlkr-select[data-size=sm]{height:28px}.wlkr-select-label{color:var(--muted-foreground,#696969);opacity:.7;font:500 11px/1 var(--font-sans,Arial,sans-serif)}
.wlkr-select-control{appearance:none;-webkit-appearance:none;min-width:0;max-width:100%;height:100%;border:0;background:transparent;padding:0 24px 0 6px;font:500 14px/1 var(--font-sans,Arial,sans-serif);color:var(--foreground,#010101);cursor:pointer;outline:none}
.wlkr-select[data-size=sm] .wlkr-select-control{font-size:12px}.wlkr-select-control option{background:var(--popover,#fff);color:var(--foreground,#010101)}
.wlkr-select-chevron{position:absolute;right:7px;width:12px;height:12px;pointer-events:none;color:var(--muted-foreground,#696969)}
.wlkr-select:has(select:focus-visible){outline:2px solid var(--brand,#33f282);outline-offset:2px}.wlkr-select:has(select:disabled){opacity:.45;cursor:default}.wlkr-select-control:disabled{cursor:default}.wlkr-select:has([aria-invalid=true]){border-color:var(--destructive,#b42318)}
@media(hover:hover) and (pointer:fine){.wlkr-select:not(:has(select:disabled)):hover{border-color:color-mix(in srgb,var(--border,#dedede),var(--foreground,#010101) 16%)}}
@media(prefers-reduced-motion:reduce){.wlkr-select{transition:none}}
`

export function Select({ label, size = "md", className, children, ...props }: SelectProps) {
  return <><style>{styles}</style><label data-size={size} className={cn("wlkr-select", className)}>
    {label && <span className="wlkr-select-label">{label}</span>}
    <select {...props} className="wlkr-select-control">{children}</select>
    <ChevronDown aria-hidden="true" className="wlkr-select-chevron" />
  </label></>
}
