"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type Status = "live" | "busy" | "warning" | "error" | "idle"

export type StatusDotProps = Omit<React.ComponentPropsWithoutRef<"span">, "children"> & {
  status?: Status
  /** Visible label beside the dot. */
  children?: React.ReactNode
  /** Accessible text when there is no visible label. Defaults to the status name. */
  label?: string
  /** Animate the dot. Defaults to on for `live` and `busy`. */
  pulse?: boolean
  shape?: "square" | "round"
  /** Dot size: 6px or 8px. */
  size?: "sm" | "md"
}

const NAMES: Record<Status, string> = { live: "Live", busy: "Busy", warning: "Warning", error: "Error", idle: "Idle" }

const styles = `
.wlkr-status-dot{position:relative;--wlkr-status-dot-size:8px;--wlkr-status-dot-warning:var(--warning,#b45309);display:inline-flex;align-items:baseline;gap:.5em;max-width:100%;vertical-align:baseline}
.dark .wlkr-status-dot{--wlkr-status-dot-warning:var(--warning,#f5a524)}
.wlkr-status-dot[data-size=sm]{--wlkr-status-dot-size:6px}
.wlkr-status-dot[data-status=live]{--wlkr-status-dot-color:var(--brand,#33f282)}
.wlkr-status-dot[data-status=busy]{--wlkr-status-dot-color:var(--foreground,currentColor)}
.wlkr-status-dot[data-status=warning]{--wlkr-status-dot-color:var(--wlkr-status-dot-warning)}
.wlkr-status-dot[data-status=error]{--wlkr-status-dot-color:var(--destructive,#b42318)}
.wlkr-status-dot[data-status=idle]{--wlkr-status-dot-color:var(--muted-foreground,#696969)}
.wlkr-status-dot-mark{position:relative;display:inline-flex;flex:none;align-items:center;justify-content:center;width:var(--wlkr-status-dot-size);height:1ex}
.wlkr-status-dot-core,.wlkr-status-dot-ring{box-sizing:border-box;width:var(--wlkr-status-dot-size);height:var(--wlkr-status-dot-size);border-radius:0}
.wlkr-status-dot-core{flex:none;background:var(--wlkr-status-dot-color)}
.wlkr-status-dot[data-status=idle] .wlkr-status-dot-core{background:none;border:1px solid var(--wlkr-status-dot-color)}
.wlkr-status-dot[data-shape=round] .wlkr-status-dot-core,.wlkr-status-dot[data-shape=round] .wlkr-status-dot-ring{border-radius:50%}
.wlkr-status-dot-ring{position:absolute;top:50%;left:50%;border:1px solid var(--wlkr-status-dot-color);opacity:0;pointer-events:none}
.wlkr-status-dot-ring:nth-child(2){margin:calc(var(--wlkr-status-dot-size) / -2 - 2px);width:calc(var(--wlkr-status-dot-size) + 4px);height:calc(var(--wlkr-status-dot-size) + 4px);--wlkr-status-dot-o:.9}
.wlkr-status-dot-ring:nth-child(3){margin:calc(var(--wlkr-status-dot-size) / -2 - 4px);width:calc(var(--wlkr-status-dot-size) + 8px);height:calc(var(--wlkr-status-dot-size) + 8px);--wlkr-status-dot-o:.55}
.wlkr-status-dot-ring:nth-child(4){margin:calc(var(--wlkr-status-dot-size) / -2 - 6px);width:calc(var(--wlkr-status-dot-size) + 12px);height:calc(var(--wlkr-status-dot-size) + 12px);--wlkr-status-dot-o:.25}
.wlkr-status-dot-text{min-width:0}
.wlkr-status-dot-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@keyframes wlkr-status-dot-ping{0%,8.3%{opacity:var(--wlkr-status-dot-o)}8.4%,100%{opacity:0}}
@keyframes wlkr-status-dot-blink{0%,49.9%{transform:none}50%,100%{transform:scaleY(.5)}}
@media(prefers-reduced-motion:no-preference){
.wlkr-status-dot[data-motion=ping] .wlkr-status-dot-ring{animation:wlkr-status-dot-ping 1.8s linear infinite}
.wlkr-status-dot[data-motion=ping] .wlkr-status-dot-ring:nth-child(3){animation-delay:150ms}
.wlkr-status-dot[data-motion=ping] .wlkr-status-dot-ring:nth-child(4){animation-delay:300ms}
.wlkr-status-dot[data-motion=blink] .wlkr-status-dot-core{transform-origin:50% 100%;animation:wlkr-status-dot-blink 1s steps(1,end) infinite}
}
`

/** A square dot and a word. Live things ping; busy things blink like a caret. */
export function StatusDot({ status = "idle", children, label, pulse, shape = "square", size = "md", className, ...props }: StatusDotProps) {
  const safeStatus: Status = status in NAMES ? status : "idle"
  const moving = pulse ?? (safeStatus === "live" || safeStatus === "busy")
  const motion = moving ? (safeStatus === "busy" ? "blink" : "ping") : undefined
  const hasLabel = children !== undefined && children !== null && children !== false && children !== ""
  return (
    <span
      {...props}
      className={cn("wlkr-status-dot", className)}
      data-status={safeStatus}
      data-shape={shape === "round" ? "round" : "square"}
      data-size={size === "sm" ? "sm" : "md"}
      data-motion={motion}
    >
      <style>{styles}</style>
      <span className="wlkr-status-dot-mark" aria-hidden="true">
        <span className="wlkr-status-dot-core" />
        {motion === "ping" && <><span className="wlkr-status-dot-ring" /><span className="wlkr-status-dot-ring" /><span className="wlkr-status-dot-ring" /></>}
      </span>
      {hasLabel ? <span className="wlkr-status-dot-text">{children}</span> : <span className="wlkr-status-dot-sr">{label || NAMES[safeStatus]}</span>}
    </span>
  )
}
