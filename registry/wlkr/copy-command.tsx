"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const styles = `
.wlkr-copy-command:focus-visible{outline:2px solid var(--ring,currentColor);outline-offset:3px}
.wlkr-copy-icon{width:16px;height:16px;overflow:visible}
.wlkr-copy-icon g{transform-origin:12px 12px;transition:opacity 180ms ease,transform 180ms ease}
.wlkr-copy-icon g[data-visible=false]{opacity:0;transform:scale(.65) rotate(-12deg)}
.wlkr-copy-icon g[data-visible=true]{opacity:1;transform:scale(1) rotate(0)}
.wlkr-copy-success{color:var(--success,#087d3d)}
.dark .wlkr-copy-success{color:var(--success,#33f282)}
.wlkr-copy-error{color:var(--destructive,#b42318)}
@media(prefers-reduced-motion:reduce){.wlkr-copy-icon g{transition:none}}
`

/** A fixed-slot copy control. Feedback is visual in the icon and announced off-screen. */
export function CopyCommand({ command, className }: { command: string; className?: string }) {
  const [state, setState] = React.useState<"idle" | "copying" | "copied" | "error">("idle")
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const mounted = React.useRef(true)
  const locked = React.useRef(false)
  React.useEffect(() => { mounted.current = true; return () => { mounted.current = false; if (timer.current) clearTimeout(timer.current) } }, [])
  async function copy() {
    if (locked.current) return
    locked.current = true
    if (timer.current) clearTimeout(timer.current)
    setState("copying")
    try {
      await navigator.clipboard.writeText(command)
      if (mounted.current) {
        setState("copied")
        timer.current = setTimeout(() => setState("idle"), 2200)
      }
    } catch { if (mounted.current) setState("error") }
    finally { locked.current = false }
  }
  return (
    <div className={cn("relative flex min-w-0 items-center gap-4", className)}>
      <style>{styles}</style>
      <code tabIndex={0} className="wlkr-copy-command min-w-0 flex-1 overflow-x-auto py-3 text-sm whitespace-pre">{command}</code>
      <Button type="button" variant="ghost" size="icon" onClick={copy} disabled={state === "copying"} style={{ width: 44, height: 44, flexShrink: 0, padding: 0 }} aria-label={state === "copied" ? "Command copied; copy again" : state === "error" ? "Copy failed; try again" : "Copy command"}>
        <svg className="wlkr-copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <g data-visible={state === "idle" || state === "copying"}><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></g>
          <g data-visible={state === "copied"} className="wlkr-copy-success"><path d="m5 12 4 4L19 6" /></g>
          <g data-visible={state === "error"} className="wlkr-copy-error"><path d="m6 6 12 12M18 6 6 18" /></g>
        </svg>
      </Button>
      <span role="status" className="sr-only">{state === "error" ? "Clipboard unavailable. Select and copy the command, or try again." : state === "copied" ? "Copied to clipboard." : ""}</span>
    </div>
  )
}
