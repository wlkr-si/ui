"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type DiffLine = { type: "same" | "add" | "remove"; text: string; oldLine?: number; newLine?: number }

export type DiffViewProps = Omit<React.ComponentPropsWithoutRef<"div">, "children" | "title"> & {
  before: string
  after: string
  /** File name shown in the header. */
  title?: React.ReactNode
  /** Unchanged lines kept around each change before the rest collapse. */
  context?: number
  lineNumbers?: boolean
  /** Wrap long lines instead of scrolling sideways. */
  wrap?: boolean
}

function toLines(text: string): string[] {
  if (text === "") return []
  const lines = text.replace(/\r\n?/g, "\n").split("\n")
  if (lines[lines.length - 1] === "") lines.pop()
  return lines
}

/** Line diff by longest common subsequence. Fine up to a few hundred lines each side. */
export function diffLines(before: string, after: string): DiffLine[] {
  const a = toLines(before)
  const b = toLines(after)
  const n = a.length
  const m = b.length
  const w = m + 1
  const dp = new Uint32Array((n + 1) * w)
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i * w + j] = a[i] === b[j] ? dp[(i + 1) * w + j + 1] + 1 : Math.max(dp[(i + 1) * w + j], dp[i * w + j + 1])
    }
  }
  const out: DiffLine[] = []
  let i = 0
  let j = 0
  while (i < n || j < m) {
    if (i < n && j < m && a[i] === b[j]) {
      out.push({ type: "same", text: a[i], oldLine: i + 1, newLine: j + 1 })
      i++
      j++
    } else if (j < m && (i >= n || dp[i * w + j + 1] >= dp[(i + 1) * w + j])) {
      out.push({ type: "add", text: b[j], newLine: j + 1 })
      j++
    } else {
      out.push({ type: "remove", text: a[i], oldLine: i + 1 })
      i++
    }
  }
  return out
}

type Segment = { kind: "lines"; lines: DiffLine[] } | { kind: "fold"; id: number; lines: DiffLine[] }

function segment(lines: DiffLine[], context: number): Segment[] {
  const out: Segment[] = []
  let k = 0
  while (k < lines.length) {
    if (lines[k].type !== "same") {
      const start = k
      while (k < lines.length && lines[k].type !== "same") k++
      out.push({ kind: "lines", lines: lines.slice(start, k) })
      continue
    }
    const start = k
    while (k < lines.length && lines[k].type === "same") k++
    const run = lines.slice(start, k)
    const head = start === 0 ? 0 : context
    const tail = k === lines.length ? 0 : context
    if (run.length > context * 2 && run.length - head - tail > 0) {
      if (head) out.push({ kind: "lines", lines: run.slice(0, head) })
      out.push({ kind: "fold", id: start, lines: run.slice(head, run.length - tail) })
      if (tail) out.push({ kind: "lines", lines: run.slice(run.length - tail) })
    } else out.push({ kind: "lines", lines: run })
  }
  return out
}

const styles = `
.wlkr-diff-view{--wlkr-diff-view-fg:var(--foreground,currentColor);display:block;min-width:0;max-width:100%;border:1px solid var(--border,currentColor);border-radius:0;background:var(--background,#fff);color:var(--wlkr-diff-view-fg);font-size:13px}
.wlkr-diff-view-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:8px 12px;border-bottom:1px solid var(--border,currentColor);min-width:0}
.wlkr-diff-view-title{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:var(--font-mono,ui-monospace,monospace);font-weight:500}
.wlkr-diff-view-counts{flex:none;margin-left:auto;font-family:var(--font-mono,ui-monospace,monospace);font-variant-numeric:tabular-nums;display:flex;gap:10px}
.wlkr-diff-view-counts [data-k=add]{display:inline-flex;align-items:center;gap:5px}
.wlkr-diff-view-counts [data-k=add]::before{content:"";width:6px;height:6px;background:var(--brand,#33f282)}
.wlkr-diff-view-counts [data-k=remove]{color:var(--muted-foreground,#6b6b6b)}
.wlkr-diff-view-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
.wlkr-diff-view-table{border-collapse:collapse;min-width:100%;font-family:var(--font-mono,ui-monospace,monospace);line-height:1.6;tab-size:2;-moz-tab-size:2}
.wlkr-diff-view-table td{padding:0;vertical-align:top}
.wlkr-diff-view-row>td:first-child{border-left:3px solid transparent}
.wlkr-diff-view-num{width:1%;min-width:3ch;padding:0 6px!important;text-align:right;color:var(--muted-foreground,#6b6b6b);user-select:none;font-variant-numeric:tabular-nums;white-space:nowrap}
.wlkr-diff-view-sign{width:1%;padding:0 6px 0 4px!important;user-select:none;text-align:center;white-space:pre}
.wlkr-diff-view-text{width:100%;padding-right:12px!important;white-space:pre}
.wlkr-diff-view[data-wrap] .wlkr-diff-view-text{white-space:pre-wrap;overflow-wrap:anywhere}
.wlkr-diff-view-row[data-type=add]{background:color-mix(in srgb,var(--brand,#33f282) 14%,transparent)}
.wlkr-diff-view-row[data-type=add]>td:first-child{border-left-color:var(--brand,#33f282)}
.wlkr-diff-view-row[data-type=remove]{color:var(--muted-foreground,#6b6b6b);background-image:repeating-linear-gradient(135deg,color-mix(in srgb,var(--wlkr-diff-view-fg) 9%,transparent) 0 1px,transparent 1px 4px)}
.wlkr-diff-view-row[data-type=remove]>td:first-child{border-left-color:var(--wlkr-diff-view-fg)}
.wlkr-diff-view-fold td{padding:0;border-left:3px solid transparent}
.wlkr-diff-view-more{display:flex;align-items:center;gap:8px;width:100%;min-height:28px;padding:2px 12px;border:0;border-block:1px dashed color-mix(in srgb,var(--wlkr-diff-view-fg) 25%,transparent);border-radius:0;background:color-mix(in srgb,var(--wlkr-diff-view-fg) 4%,transparent);color:var(--muted-foreground,#6b6b6b);font:inherit;text-align:left;cursor:pointer}
.wlkr-diff-view-more:hover{color:var(--wlkr-diff-view-fg);background:color-mix(in srgb,var(--wlkr-diff-view-fg) 8%,transparent)}
.wlkr-diff-view-more:focus-visible{outline:2px solid var(--brand,#33f282);outline-offset:-2px}
.wlkr-diff-view-scroll:focus-visible{outline:2px solid var(--brand,#33f282);outline-offset:2px}
.wlkr-diff-view-empty{padding:12px;color:var(--muted-foreground,#6b6b6b);font-family:var(--font-mono,ui-monospace,monospace)}
.wlkr-diff-view-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@keyframes wlkr-diff-view-in{from{opacity:0}to{opacity:1}}
.wlkr-diff-view-row[data-opened]{animation:wlkr-diff-view-in .24s steps(4,end)}
@media(prefers-reduced-motion:reduce){.wlkr-diff-view-row[data-opened]{animation:none}}
`

/** A unified line diff: green bars for added lines, hatched ink for removed ones. */
export function DiffView({ before, after, title, context = 3, lineNumbers = true, wrap = false, className, ...props }: DiffViewProps) {
  const id = React.useId()
  const ctx = Math.max(0, Math.floor(context))
  const lines = React.useMemo(() => diffLines(before, after), [before, after])
  const segments = React.useMemo(() => segment(lines, ctx), [lines, ctx])
  const [opened, setOpened] = React.useState<{ key: string; ids: number[] }>({ key: "", ids: [] })
  const key = `${before}\u0000${after}\u0000${ctx}`
  const openIds = opened.key === key ? opened.ids : []
  let added = 0
  let removed = 0
  for (const line of lines) {
    if (line.type === "add") added++
    else if (line.type === "remove") removed++
  }
  const cols = lineNumbers ? 4 : 2

  const row = (line: DiffLine, k: string, fresh?: boolean) => (
    <tr key={k} className="wlkr-diff-view-row" data-type={line.type} data-opened={fresh ? "" : undefined}>
      {lineNumbers && <td className="wlkr-diff-view-num">{line.oldLine ?? ""}</td>}
      {lineNumbers && <td className="wlkr-diff-view-num">{line.newLine ?? ""}</td>}
      <td className="wlkr-diff-view-sign">
        <span aria-hidden="true">{line.type === "add" ? "+" : line.type === "remove" ? "−" : " "}</span>
        {line.type !== "same" && <span className="wlkr-diff-view-sr">{line.type === "add" ? "added" : "removed"}</span>}
      </td>
      <td className="wlkr-diff-view-text">{line.text === "" ? "​" : line.text}</td>
    </tr>
  )

  return (
    <div {...props} className={cn("wlkr-diff-view", className)} data-wrap={wrap ? "" : undefined}>
      <style>{styles}</style>
      <div className="wlkr-diff-view-head">
        {title ? <span className="wlkr-diff-view-title" id={`${id}-title`}>{title}</span> : null}
        <span className="wlkr-diff-view-counts">
          <span data-k="add" aria-hidden="true">+{added}</span>
          <span data-k="remove" aria-hidden="true">{"−"}{removed}</span>
          <span className="wlkr-diff-view-sr">{added} added, {removed} removed</span>
        </span>
      </div>
      {lines.length === 0 ? (
        <div className="wlkr-diff-view-empty">No lines</div>
      ) : (
        <div className="wlkr-diff-view-scroll" tabIndex={0} role="region" aria-labelledby={title ? `${id}-title` : `${id}-cap`}>
          <table className="wlkr-diff-view-table">
            <caption className="wlkr-diff-view-sr" id={`${id}-cap`}>{title ? "Changes" : "Line diff"}: {added} added, {removed} removed</caption>
            <thead className="wlkr-diff-view-sr">
              <tr>
                {lineNumbers && <th scope="col">Old line</th>}
                {lineNumbers && <th scope="col">New line</th>}
                <th scope="col">Change</th>
                <th scope="col">Text</th>
              </tr>
            </thead>
            <tbody>
              {segments.map(seg => {
                if (seg.kind === "lines") return seg.lines.map((line, n) => row(line, `${line.oldLine ?? "x"}-${line.newLine ?? "x"}-${n}`))
                if (openIds.includes(seg.id)) return seg.lines.map(line => row(line, `${line.oldLine}-${line.newLine}`, true))
                const count = seg.lines.length
                return (
                  <tr key={`fold-${seg.id}`} className="wlkr-diff-view-fold">
                    <td colSpan={cols}>
                      <button
                        type="button"
                        className="wlkr-diff-view-more"
                        aria-label={`Show ${count} unchanged line${count === 1 ? "" : "s"}, ${seg.lines[0].newLine} to ${seg.lines[count - 1].newLine}`}
                        onClick={() => setOpened({ key, ids: [...openIds, seg.id] })}
                      >
                        <span aria-hidden="true">{"⋯"}</span>
                        {count} unchanged line{count === 1 ? "" : "s"}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
