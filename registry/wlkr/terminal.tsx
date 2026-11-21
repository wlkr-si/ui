"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type TerminalLine =
  | { type: "command"; text: string }
  | { type: "output"; text: string; tone?: "default" | "muted" | "success" | "error" }

export type TerminalProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "title"> & {
  /** The session, in order. Output text may hold "\n" for several rows. */
  lines: TerminalLine[]
  /** Small label in the top row, e.g. "zsh — wlkr/ui". */
  title?: string
  prompt?: string
  /** Milliseconds per typed character, 5–200, with a small steady variation. */
  typeSpeed?: number
  /** Milliseconds between output rows, 0–2000. */
  lineDelay?: number
  /** Milliseconds before the first keystroke, 0–10000. */
  startDelay?: number
  /** Wait about 2.4s at the end, clear and replay. */
  loop?: boolean
  /** "view" starts once 30% is visible; "mount" starts straight away. */
  trigger?: "view" | "mount"
  /** Finished command rows show a button that copies the command. */
  copyable?: boolean
  /** Accessible name for the terminal. */
  label?: string
}

type Row = { kind: "command" | "output"; text: string; tone: string; length: number }
type Position = { shown: number; typed: number }

const ENTER_MS = 320
const PROMPT_MS = 560
const LOOP_MS = 2400
const TONES = ["muted", "success", "error"]

const styles = `
.wlkr-terminal{position:relative;display:block;background:var(--control-surface,var(--muted,#f3f3f3));color:var(--foreground,currentColor);border-radius:0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;line-height:1.7;text-align:left;cursor:default;-webkit-tap-highlight-color:transparent}
.wlkr-terminal:focus-visible{outline:2px solid var(--ring,currentColor);outline-offset:4px}
.wlkr-terminal-head{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:36px;padding:0 10px 0 20px;border-bottom:1px solid var(--border,#dedede);font-size:11px;line-height:1.4;color:var(--muted-foreground,#696969)}
.wlkr-terminal-title{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wlkr-terminal-skip,.wlkr-terminal-copy{position:relative;flex:none;padding:0;border:0;border-radius:0;background:none;font:inherit;color:var(--muted-foreground,#696969);cursor:pointer;touch-action:manipulation}
.wlkr-terminal-skip{height:24px;margin-left:auto;padding:0 10px}
.wlkr-terminal-skip::before{content:"";position:absolute;inset:-10px 0}
.wlkr-terminal-copy::before{content:"";position:absolute;inset:-11px}
.wlkr-terminal-skip:focus-visible,.wlkr-terminal-copy:focus-visible{outline:2px solid var(--ring,currentColor);outline-offset:3px}
.wlkr-terminal-body{display:grid;padding:20px}
.wlkr-terminal-body>*{grid-area:1/1;min-width:0}
.wlkr-terminal-sizer{visibility:hidden}
.wlkr-terminal-row{position:relative;min-height:1.7em;white-space:pre-wrap;overflow-wrap:anywhere}
.wlkr-terminal-row[data-kind=command]{padding-right:30px}
.wlkr-terminal-prompt{margin-right:1ch;color:var(--muted-foreground,#696969)}
.wlkr-terminal-row[data-tone=default]{color:color-mix(in srgb,var(--foreground,currentColor) 80%,transparent)}
.wlkr-terminal-row[data-tone=muted]{color:var(--muted-foreground,#696969)}
.wlkr-terminal-row[data-tone=success]{color:var(--success,#087d3d)}
.wlkr-terminal-row[data-tone=error]{color:var(--destructive,#b42318)}
.wlkr-terminal-caret{display:inline-block;width:1ch;height:1.15em;vertical-align:-.2em;background:var(--foreground,currentColor)}
.wlkr-terminal-caret[data-solid=false]{animation:wlkr-terminal-blink 1.06s steps(1) infinite}
@keyframes wlkr-terminal-blink{50%{opacity:0}}
.wlkr-terminal-copy{position:absolute;top:calc(.85em - 11px);right:0;display:grid;place-items:center;width:22px;height:22px;opacity:0;transition:opacity 120ms cubic-bezier(.2,.7,.2,1)}
.wlkr-terminal-copy:focus-visible,.wlkr-terminal-copy[data-copied=true]{opacity:1}
.wlkr-terminal-copy[data-copied=true]{color:var(--success,#087d3d)}
@media(hover:hover){.wlkr-terminal-row:hover .wlkr-terminal-copy{opacity:1}.wlkr-terminal-skip:hover,.wlkr-terminal-copy:hover{color:var(--foreground,currentColor)}}
@media(hover:none){.wlkr-terminal-copy{opacity:.7}}
.wlkr-terminal-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0}
@media(prefers-reduced-motion:reduce){.wlkr-terminal-caret{animation:none!important}.wlkr-terminal-skip{visibility:hidden}.wlkr-terminal-copy{transition:none}}
`

const clamp = (value: unknown, min: number, max: number, fallback: number) => typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback
const motionQuery = "(prefers-reduced-motion: reduce)"
const subscribeMotion = (notify: () => void) => { const query = window.matchMedia(motionQuery); query.addEventListener("change", notify); return () => query.removeEventListener("change", notify) }

function toRows(lines: TerminalLine[]): Row[] {
  return lines.flatMap((line): Row[] => {
    if (!line || typeof line.text !== "string") return []
    if (line.type === "command") return [{ kind: "command", text: line.text, tone: "command", length: Array.from(line.text).length }]
    const tone = line.tone && TONES.includes(line.tone) ? line.tone : "default"
    return line.text.split("\n").map(text => ({ kind: "output", text, tone, length: 0 }))
  })
}

/** A terminal session that plays itself: commands type out behind a block caret, output lands a row at a time. */
export function Terminal({ lines, title, prompt = "$", typeSpeed = 38, lineDelay = 110, startDelay = 300, loop = false, trigger = "view", copyable = true, label = "Terminal session", className, onClick, onKeyDown, ...props }: TerminalProps) {
  const root = React.useRef<HTMLDivElement>(null)
  const controls = React.useRef<(() => void) | null>(null)
  const reduced = React.useSyncExternalStore(subscribeMotion, () => window.matchMedia(motionQuery).matches, () => false)
  const source = JSON.stringify(Array.isArray(lines) ? lines : [])
  const rows = toRows(JSON.parse(source) as TerminalLine[])
  const speed = clamp(typeSpeed, 5, 200, 38), gap = clamp(lineDelay, 0, 2000, 110), wait = clamp(startDelay, 0, 10000, 300)
  const key = `${source}|${speed}|${gap}|${wait}|${loop}|${trigger}|${reduced}`
  const [frame, setFrame] = React.useState({ key, shown: 0, typed: 0 })
  const [copied, setCopied] = React.useState<number | null>(null)
  const position: Position = reduced ? { shown: rows.length, typed: 0 } : frame.key === key ? frame : { shown: 0, typed: 0 }
  const finished = position.shown >= rows.length

  React.useEffect(() => {
    const element = root.current
    const rows = toRows(JSON.parse(source) as TerminalLine[])
    if (!element || reduced || !rows.length) return
    let pos: Position = { shown: 0, typed: 0 }
    let timer: ReturnType<typeof setTimeout> | undefined
    let started = trigger === "mount", visible = false, held = false
    const running = () => started && visible && !held && !document.hidden
    const commit = () => setFrame({ key, ...pos })
    function delay() {
      const row = rows[pos.shown]
      if (!row) return loop ? LOOP_MS : null
      if (row.kind === "output") return gap
      if (pos.typed >= row.length) return ENTER_MS
      if (pos.typed > 0) return speed * (.6 + ((pos.typed * 7 + row.length) % 9) / 10)
      return pos.shown === 0 ? wait : PROMPT_MS
    }
    function advance() {
      timer = undefined
      const row = rows[pos.shown]
      if (!row) pos = { shown: 0, typed: 0 }
      else if (row.kind === "command" && pos.typed < row.length) pos = { shown: pos.shown, typed: pos.typed + 1 }
      else pos = { shown: pos.shown + 1, typed: 0 }
      commit()
      sync()
    }
    function sync() {
      if (!running()) { clearTimeout(timer); timer = undefined; return }
      const next = timer ? null : delay()
      if (next !== null) timer = setTimeout(advance, next)
    }
    controls.current = () => {
      clearTimeout(timer)
      timer = undefined
      const done = pos.shown >= rows.length
      pos = done ? { shown: 0, typed: 0 } : { shown: rows.length, typed: 0 }
      held = !done
      started = true
      commit()
      sync()
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (entry.intersectionRatio >= .3) started = true
      sync()
    }, { threshold: [0, .3] })
    observer.observe(element)
    document.addEventListener("visibilitychange", sync)
    return () => {
      clearTimeout(timer)
      observer.disconnect()
      document.removeEventListener("visibilitychange", sync)
      controls.current = null
    }
  }, [source, key, speed, gap, wait, loop, trigger, reduced])

  React.useEffect(() => {
    if (copied === null) return
    const timer = setTimeout(() => setCopied(null), 1400)
    return () => clearTimeout(timer)
  }, [copied])

  async function copy(index: number, text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(index)
    } catch {
      setCopied(null)
    }
  }

  function handleClick(event: React.MouseEvent<HTMLDivElement>) {
    onClick?.(event)
    if (event.defaultPrevented || (event.target as Element).closest("button") || window.getSelection()?.toString()) return
    controls.current?.()
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event)
    if (event.defaultPrevented || event.target !== event.currentTarget || (event.key !== "Enter" && event.key !== " ")) return
    event.preventDefault()
    controls.current?.()
  }

  const caret = (solid: boolean) => <span className="wlkr-terminal-caret" data-solid={solid} />
  const promptMark = prompt ? <span className="wlkr-terminal-prompt">{prompt}</span> : null
  function line(row: Row, index: number, live: boolean, typed = row.length) {
    const text = typed < row.length ? Array.from(row.text).slice(0, typed).join("") : row.text
    const done = live && typed >= row.length && index < position.shown
    return (
      <div key={index} className="wlkr-terminal-row" data-kind={row.kind} data-tone={row.tone}>
        <span aria-hidden={live || undefined}>{row.kind === "command" && promptMark}{text}{live && index === position.shown && caret(typed > 0)}</span>
        {done && copyable && row.kind === "command" && (
          <button type="button" className="wlkr-terminal-copy" data-copied={copied === index} aria-label={copied === index ? "Copied" : `Copy ${row.text}`} onClick={() => copy(index, row.text)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
              {copied === index ? <path d="m5 12 4 4L19 6" /> : <><rect x="8" y="8" width="12" height="12" /><path d="M16 8V4H4v12h4" /></>}
            </svg>
          </button>
        )}
      </div>
    )
  }

  const current = rows[position.shown]
  return (
    <div {...props} ref={root} role="group" aria-label={label} tabIndex={0} className={cn("wlkr-terminal", className)} data-finished={finished} onClick={handleClick} onKeyDown={handleKeyDown}>
      <style>{styles}</style>
      <div className="wlkr-terminal-head">
        {title && <span className="wlkr-terminal-title">{title}</span>}
        <button type="button" className="wlkr-terminal-skip" aria-label={finished ? "Replay session" : "Skip to the end"} onClick={() => controls.current?.()}>{finished ? "Replay" : "Skip"}</button>
      </div>
      <div className="wlkr-terminal-sr">{rows.map((row, index) => <div key={index}>{row.kind === "command" && prompt ? `${prompt} ${row.text}` : row.text}</div>)}</div>
      <div className="wlkr-terminal-body">
        <div className="wlkr-terminal-sizer" aria-hidden="true">
          {rows.map((row, index) => line(row, index, false))}
          <div className="wlkr-terminal-row" data-kind="command">{promptMark}{caret(true)}</div>
        </div>
        <div>
          {rows.slice(0, position.shown).map((row, index) => line(row, index, true))}
          {current?.kind === "command" && line(current, position.shown, true, position.typed)}
          {finished && <div className="wlkr-terminal-row" data-kind="command" aria-hidden="true">{promptMark}{caret(false)}</div>}
        </div>
      </div>
    </div>
  )
}
