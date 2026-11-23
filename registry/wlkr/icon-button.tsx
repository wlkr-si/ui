import * as React from "react"
import { cn } from "@/lib/utils"

export type IconButtonProps = React.ComponentProps<"button"> & {
  "aria-label": string
  variant?: "glass" | "plain" | "outline"
  size?: "sm" | "md" | "lg"
}

const styles = `
.wlkr-icon-button{box-sizing:border-box;position:relative;display:inline-grid;place-items:center;flex:none;width:40px;height:40px;padding:0;border:0;border-radius:999px;background:color-mix(in srgb,var(--background,#fff) 52%,transparent);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--foreground,#010101) 14%,transparent);backdrop-filter:blur(16px) saturate(140%);-webkit-backdrop-filter:blur(16px) saturate(140%);color:var(--foreground,#010101);cursor:pointer;transition:background-color 120ms ease,box-shadow 120ms ease,color 120ms ease,opacity 160ms cubic-bezier(.23,1,.32,1),transform 120ms cubic-bezier(.23,1,.32,1)}
.wlkr-icon-button[data-size=sm]{width:32px;height:32px}.wlkr-icon-button[data-size=lg]{width:44px;height:44px}
.wlkr-icon-button svg{display:block;width:18px;height:18px}
.wlkr-icon-button[data-variant=plain]{background:transparent;box-shadow:none;backdrop-filter:none;-webkit-backdrop-filter:none;color:var(--muted-foreground,#696969)}
.wlkr-icon-button[data-variant=outline]{background:var(--card,#fff);box-shadow:inset 0 0 0 1px var(--border,#dedede);backdrop-filter:none;-webkit-backdrop-filter:none}
.wlkr-icon-button::after{content:'';position:absolute;bottom:5px;left:calc(50% - 2px);width:4px;height:4px;border-radius:50%;background:var(--brand,#33f282);opacity:0;transition:opacity 120ms ease}
.wlkr-icon-button[aria-pressed=true]{color:var(--brand,#33f282)}.wlkr-icon-button[aria-pressed=true]::after{opacity:1}
.wlkr-icon-button:focus-visible{outline:2px solid var(--brand,#33f282);outline-offset:2px}
.wlkr-icon-button:active{transform:scale(.94)}.wlkr-icon-button[data-variant=plain]:active{transform:scale(.92)}.wlkr-icon-button:disabled{opacity:.32;cursor:default;transform:none;pointer-events:none}
.wlkr-icon-button[data-variant=plain]:disabled{opacity:.28}
@media(hover:hover) and (pointer:fine){.wlkr-icon-button[data-variant=glass]:hover{background:color-mix(in srgb,color-mix(in srgb,var(--foreground,#010101) 16%,var(--background,#fff)) 72%,transparent);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--foreground,#010101) 24%,transparent)}.wlkr-icon-button[data-variant=plain]:hover{color:var(--foreground,#010101)}.wlkr-icon-button[data-variant=outline]:hover{background:var(--accent,#f3f3f3)}.wlkr-icon-button[aria-pressed=true]:hover{color:var(--brand,#33f282)}}
@media(prefers-reduced-motion:reduce){.wlkr-icon-button,.wlkr-icon-button::after{transition:none}.wlkr-icon-button:active,.wlkr-icon-button[data-variant=plain]:active{transform:none}}
`

export function IconButton({ variant = "glass", size = "md", type = "button", className, children, ...props }: IconButtonProps) {
  return <><style>{styles}</style><button {...props} type={type} data-variant={variant} data-size={size} className={cn("wlkr-icon-button", className)}>{children}</button></>
}
