import * as React from "react"
import { cn } from "@/lib/utils"

export type StatProps = Omit<React.ComponentProps<"div">, "children"> & {
  label: React.ReactNode
  value: React.ReactNode
  note?: React.ReactNode
}
export type StatsProps = React.ComponentProps<"div">

const styles = `
.wlkr-stat {
  box-sizing: border-box; display: flex; flex-direction: column;
  min-width: 0; gap: var(--wlkr-space-1_5); padding: var(--wlkr-space-4);
  border: var(--wlkr-control-border) solid var(--wlkr-border-default); border-radius: var(--wlkr-radius-xl);
  background: var(--wlkr-surface-raised); color: var(--wlkr-content-primary); box-shadow: var(--wlkr-shadow-raised);
  font-family: inherit; overflow-wrap: anywhere;
}
.wlkr-stat-label { margin: 0; font-size: var(--wlkr-text-md); font-weight: var(--wlkr-weight-semibold); line-height: 1.4; }
.wlkr-stat-value {
  margin: 0; font-family: var(--wlkr-font-mono); font-size: var(--wlkr-text-2xl);
  font-weight: var(--wlkr-weight-semibold); font-variant-numeric: tabular-nums; line-height: 1.1;
}
.wlkr-stat-note { margin: 0; color: var(--wlkr-content-secondary); font-size: var(--wlkr-text-xs); line-height: 1.5; }
.wlkr-stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); min-width: 0; gap: var(--wlkr-space-2); margin: 0; }
.wlkr-stat:focus-visible, .wlkr-stats:focus-visible {
  outline: var(--wlkr-focus-width) solid var(--wlkr-focus-ring); outline-offset: var(--wlkr-focus-offset);
}
@media (min-width: 56.25em) {
  .wlkr-stats { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
`

export function Stat({ label, value, note, className, ...props }: StatProps) {
  return <>
    <style href="wlkr-stat" precedence="default">{styles}</style>
    <div {...props} className={cn("wlkr-stat", className)}>
      <p className="wlkr-stat-label">{label}</p>
      <p className="wlkr-stat-value">{value}</p>
      {note != null && <p className="wlkr-stat-note">{note}</p>}
    </div>
  </>
}
export function Stats({ className, children, ...props }: StatsProps) {
  return <>
    <style href="wlkr-stat" precedence="default">{styles}</style>
    <div {...props} className={cn("wlkr-stats", className)}>{children}</div>
  </>
}
