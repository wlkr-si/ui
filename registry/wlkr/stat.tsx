import * as React from "react"
import { cn } from "@/lib/utils"

export type StatProps = Omit<React.ComponentProps<"div">, "children"> & {
  label: React.ReactNode
  value: React.ReactNode
  note?: React.ReactNode
}
export type StatsProps = React.ComponentProps<"div">

const styles = `
.wlkr-stat{box-sizing:border-box;display:flex;flex-direction:column;gap:6px;min-width:0;padding:14px 16px 16px;border:1px solid var(--border,#dedede);border-radius:12px;background:var(--card,#fff);color:var(--foreground,#010101);font-family:inherit}
.wlkr-stat-label{margin:0;font-size:13px;line-height:1.4;color:var(--muted-foreground,#696969)}.wlkr-stat-value{margin:0;font:600 28px/1.1 var(--font-mono,ui-monospace,monospace);letter-spacing:-.04em;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}.wlkr-stat-note{margin:4px 0 0;font-size:12px;line-height:1.45;color:var(--muted-foreground,#696969);overflow-wrap:anywhere}.wlkr-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:0}
.wlkr-stat:focus-visible,.wlkr-stats:focus-visible{outline:2px solid var(--brand,#33f282);outline-offset:2px}
@media(min-width:900px){.wlkr-stats{grid-template-columns:repeat(4,minmax(0,1fr))}}
`

export function Stat({ label, value, note, className, ...props }: StatProps) {
  return <div {...props} className={cn("wlkr-stat", className)}><style>{styles}</style><p className="wlkr-stat-label">{label}</p><p className="wlkr-stat-value">{value}</p>{note != null && <p className="wlkr-stat-note">{note}</p>}</div>
}
export function Stats({ className, children, ...props }: StatsProps) {
  return <div {...props} className={cn("wlkr-stats", className)}><style>{styles}</style>{children}</div>
}
