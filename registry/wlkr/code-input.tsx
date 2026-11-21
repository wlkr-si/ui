"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const styles = `
.wlkr-code-input{display:block;width:100%;max-width:var(--wlkr-code-input-width,100%);color:var(--foreground,currentColor)}
.wlkr-code-input-row{position:relative;height:52px}
.wlkr-code-input .wlkr-code-input-native{position:absolute;inset:0;z-index:1;width:100%;height:100%;margin:0;padding:0;border:0;border-radius:0;outline:0;background:transparent;color:transparent;-webkit-text-fill-color:transparent;caret-color:transparent;font-size:16px;cursor:text}
.wlkr-code-input-native::selection{background:transparent}
.wlkr-code-input-native:-webkit-autofill{transition:background-color 99999s 99999s}
.wlkr-code-input-native:focus-visible{outline:2px solid var(--ring,currentColor);outline-offset:4px}
.wlkr-code-input-native:disabled{cursor:not-allowed}
.wlkr-code-input[data-disabled] .wlkr-code-input-cells{opacity:.5}
.wlkr-code-input-cells{display:flex;gap:8px;height:100%}
.wlkr-code-input-cell{position:relative;display:grid;place-items:center;flex:1 1 0;min-width:0;height:100%;font-size:24px;font-weight:500;line-height:1;font-variant-numeric:tabular-nums;font-feature-settings:"tnum"}
.wlkr-code-input-cell::after{content:"";position:absolute;left:0;right:0;bottom:0;height:2px;background:var(--border,#dedede);transform-origin:50% 100%}
.wlkr-code-input-cell[data-active]::after{background:var(--foreground,currentColor)}
.wlkr-code-input-gap{flex:0 0 12px;display:grid;place-items:center}
.wlkr-code-input-gap::before{content:"";width:8px;height:2px;background:var(--muted-foreground,#696969)}
.wlkr-code-input-caret{width:12px;height:55%;background:var(--foreground,currentColor)}
.wlkr-code-input[data-status=error] .wlkr-code-input-cell{color:var(--destructive,#b42318)}
.wlkr-code-input[data-status=error] .wlkr-code-input-cell::after{background:var(--destructive,#b42318)}
.wlkr-code-input[data-status=success] .wlkr-code-input-cell{color:var(--success,#087d3d)}
.wlkr-code-input[data-status=success] .wlkr-code-input-cell::after{background:var(--brand,#33f282)}
.wlkr-code-input-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@keyframes wlkr-code-input-drop{0%{opacity:0;transform:translateY(-8px)}60%{opacity:1;transform:translateY(1px)}100%{transform:none}}
@keyframes wlkr-code-input-blink{0%{opacity:1}50%{opacity:0}}
@keyframes wlkr-code-input-shake{0%,100%{transform:none}20%{transform:translateX(-6px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(2px)}}
@keyframes wlkr-code-input-wave-line{0%{background:var(--foreground,currentColor)}35%{background:var(--brand,#33f282);transform:scaleY(3)}100%{transform:none}}
@keyframes wlkr-code-input-wave-char{0%{color:var(--foreground,currentColor)}35%{color:var(--success,#087d3d);transform:translateY(-3px)}100%{transform:none}}
@media(prefers-reduced-motion:no-preference){
.wlkr-code-input-char{display:block;animation:wlkr-code-input-drop 180ms cubic-bezier(.2,.7,.2,1)}
.wlkr-code-input-caret{animation:wlkr-code-input-blink 1s steps(1,end) 500ms infinite}
.wlkr-code-input[data-paused] .wlkr-code-input-caret{animation-play-state:paused}
.wlkr-code-input[data-status=error] .wlkr-code-input-cells{animation:wlkr-code-input-shake 320ms cubic-bezier(.2,.7,.2,1)}
.wlkr-code-input[data-status=success] .wlkr-code-input-cell::after{animation:wlkr-code-input-wave-line 420ms cubic-bezier(.2,.7,.2,1) calc(var(--wlkr-code-input-i,0)*60ms) backwards}
.wlkr-code-input[data-status=success] .wlkr-code-input-char{animation:wlkr-code-input-wave-char 420ms cubic-bezier(.2,.7,.2,1) calc(var(--wlkr-code-input-i,0)*60ms) backwards}
}
`

const MESSAGES = { error: "Incorrect code", success: "Code accepted" } as const

function sanitize(text: string, mode: "numeric" | "alphanumeric", length: number) {
  const cleaned = text.replace(/[\s-]/g, "")
  const kept = mode === "alphanumeric" ? cleaned.toUpperCase().replace(/[^A-Z0-9]/g, "") : cleaned.replace(/[^0-9]/g, "")
  return kept.slice(0, length)
}

export type CodeInputProps = Omit<React.ComponentPropsWithoutRef<"div">, "children" | "defaultValue" | "onChange"> & {
  /** Accessible name for the field, e.g. "Verification code". */
  label: string
  /** Number of cells, 3–12. */
  length?: number
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Fires once when typing, paste or autofill fills the last cell. */
  onComplete?: (value: string) => void
  /** `alphanumeric` accepts A–Z and 0–9 and uppercases. */
  mode?: "numeric" | "alphanumeric"
  /** Cell counts per group, e.g. `[3, 3]`. Ignored unless they sum to `length`. */
  groups?: number[]
  status?: "idle" | "error" | "success"
  disabled?: boolean
  autoFocus?: boolean
  /** Form field name for the real input. */
  name?: string
}

/** A one-time-code field: one real input under a row of presentational cells with a block caret. */
export function CodeInput({ label, length = 6, value, defaultValue = "", onValueChange, onComplete, mode = "numeric", groups, status = "idle", disabled = false, autoFocus, name, className, style, ...props }: CodeInputProps) {
  const size = Number.isFinite(length) ? Math.min(12, Math.max(3, Math.round(length))) : 6
  const [inner, setInner] = React.useState(() => sanitize(String(defaultValue ?? ""), mode, size))
  const [focused, setFocused] = React.useState(false)
  const [onScreen, setOnScreen] = React.useState(true)
  const root = React.useRef<HTMLDivElement>(null)
  const code = sanitize(value !== undefined ? String(value ?? "") : inner, mode, size)

  React.useEffect(() => {
    const element = root.current
    if (!element || typeof IntersectionObserver === "undefined") return
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const validGroups = Array.isArray(groups) && groups.length > 1 && groups.every(group => Number.isInteger(group) && group > 0) && groups.reduce((sum, group) => sum + group, 0) === size
  const breaks = new Set<number>()
  if (validGroups) groups.slice(0, -1).reduce((end, group) => { breaks.add(end + group); return end + group }, 0)
  const fullWidth = size * 44 + (size - 1) * 8 + breaks.size * 20

  function update(text: string) {
    const next = sanitize(text, mode, size)
    if (next === code) return
    if (value === undefined) setInner(next)
    onValueChange?.(next)
    if (next.length === size && code.length < size) onComplete?.(next)
  }

  function caretToEnd(element: HTMLInputElement) {
    const end = element.value.length
    if (element.selectionStart === element.selectionEnd && element.selectionStart !== end) element.setSelectionRange(end, end)
  }

  const message = status === "error" || status === "success" ? MESSAGES[status] : code.length === size ? "Code complete" : ""
  const cells: React.ReactNode[] = []
  for (let index = 0; index < size; index++) {
    if (breaks.has(index)) cells.push(<span key={`gap-${index}`} className="wlkr-code-input-gap" />)
    const char = code[index]
    const active = focused && index === code.length
    cells.push(
      <span key={index} className="wlkr-code-input-cell" data-active={active || undefined} style={{ "--wlkr-code-input-i": index } as React.CSSProperties}>
        {char ? <span key={char} className="wlkr-code-input-char">{char}</span> : active ? <span className="wlkr-code-input-caret" /> : null}
      </span>,
    )
  }

  return (
    <div {...props} ref={root} className={cn("wlkr-code-input", className)} style={{ ...style, "--wlkr-code-input-width": `${fullWidth}px` } as React.CSSProperties} data-status={status} data-disabled={disabled || undefined} data-paused={onScreen ? undefined : ""}>
      <style>{styles}</style>
      <div className="wlkr-code-input-row">
        <input
          className="wlkr-code-input-native"
          type="text"
          name={name}
          value={code}
          autoComplete="one-time-code"
          inputMode={mode === "numeric" ? "numeric" : "text"}
          pattern={mode === "numeric" ? "[0-9]*" : "[A-Za-z0-9]*"}
          autoCapitalize={mode === "numeric" ? "off" : "characters"}
          autoCorrect="off"
          spellCheck={false}
          maxLength={size}
          autoFocus={autoFocus}
          disabled={disabled}
          aria-label={label}
          aria-invalid={status === "error" || undefined}
          onChange={event => update(event.target.value)}
          onPaste={event => {
            event.preventDefault()
            const element = event.currentTarget
            const start = element.selectionStart ?? code.length
            const end = element.selectionEnd ?? code.length
            update(code.slice(0, start) + event.clipboardData.getData("text") + code.slice(end))
          }}
          onFocus={event => { setFocused(true); caretToEnd(event.currentTarget) }}
          onBlur={() => setFocused(false)}
          onSelect={event => caretToEnd(event.currentTarget)}
        />
        <div className="wlkr-code-input-cells" aria-hidden="true">{cells}</div>
      </div>
      <span role="status" className="wlkr-code-input-sr">{message}</span>
    </div>
  )
}
