"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const styles = `
.wlkr-scrub-input{display:inline-grid;grid-template-columns:auto minmax(0,1fr);grid-template-rows:44px 8px;column-gap:12px;width:10rem;max-width:100%;color:var(--foreground,currentColor);font-size:13px;line-height:1;vertical-align:middle}
.wlkr-scrub-input[data-disabled]{opacity:.5}
.wlkr-scrub-input-label{display:flex;align-items:center;min-width:44px;height:44px;color:var(--muted-foreground,#696969);white-space:nowrap;cursor:ew-resize;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;touch-action:pan-y}
.wlkr-scrub-input[data-scrubbing] .wlkr-scrub-input-label{color:var(--foreground,currentColor)}
.wlkr-scrub-input[data-disabled] .wlkr-scrub-input-label{cursor:not-allowed}
.wlkr-scrub-input-field{position:relative;display:flex;align-items:center;gap:2px;min-width:0}
.wlkr-scrub-input-sizer{display:inline-grid;min-width:1ch;max-width:100%}
.wlkr-scrub-input-mirror,.wlkr-scrub-input-control{grid-area:1/1;font:inherit;font-size:16px;font-weight:500;letter-spacing:0;font-variant-numeric:tabular-nums;font-feature-settings:"tnum";white-space:pre}
.wlkr-scrub-input-mirror{visibility:hidden;overflow:hidden}
.wlkr-scrub-input-control{width:100%;min-width:0;height:44px;margin:0;padding:0;border:0;border-radius:0;outline:0;background:none;color:inherit;caret-color:var(--foreground,currentColor)}
@supports(caret-shape:block){.wlkr-scrub-input-control{caret-shape:block}}
.wlkr-scrub-input-unit{flex:none;color:var(--muted-foreground,#696969)}
.wlkr-scrub-input-field:focus-within::after{content:"";position:absolute;left:0;bottom:4px;width:16px;height:2px;background:var(--foreground,currentColor)}
.wlkr-scrub-input-ruler{grid-column:1/-1;position:relative;overflow:hidden;color:var(--border,#dedede)}
.wlkr-scrub-input[data-scrubbing] .wlkr-scrub-input-ruler{color:var(--muted-foreground,#696969)}
.wlkr-scrub-input-ticks{position:absolute;top:0;left:50%;width:1200px;height:8px;margin-left:-600px;background:linear-gradient(to right,currentColor 1px,transparent 1px) var(--wlkr-scrub-input-x,0) 100%/6px 3px repeat-x,linear-gradient(to right,var(--muted-foreground,#696969) 1px,transparent 1px) var(--wlkr-scrub-input-x,0) 100%/30px 6px repeat-x}
.wlkr-scrub-input-ruler::after{content:"";position:absolute;left:calc(50% - 1px);bottom:0;width:2px;height:8px;background:var(--brand,#33f282)}
@media(prefers-reduced-motion:no-preference){.wlkr-scrub-input-ticks{transition:background-position 160ms cubic-bezier(.2,.7,.2,1)}}
`

const THRESHOLD = 3
const TICK = 6

const finite = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value)
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const decimalsOf = (value: number) => {
  const text = String(value)
  const exponent = text.match(/e-(\d+)$/)
  return exponent ? Number(exponent[1]) : (text.split(".")[1] ?? "").length
}

export type ScrubInputProps = Omit<React.ComponentPropsWithoutRef<"div">, "children" | "defaultValue" | "onChange"> & {
  /** Visible label. It is also the drag handle. */
  label: string
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  /** Decimals shown and kept. Defaults to the decimals in `step`, 0–6. */
  precision?: number
  /** Suffix such as "px" or "%". Not part of the editable text. */
  unit?: string
  /** Pixels of drag per step, 1–40. */
  sensitivity?: number
  disabled?: boolean
}

/** A number field you can drag. Scrub the label, type, or use the arrow keys; a tick ruler glides with the value. */
export function ScrubInput({ label, value, defaultValue = 0, onValueChange, min, max, step = 1, precision, unit, sensitivity = 6, disabled = false, className, style, ...props }: ScrubInputProps) {
  const safeStep = finite(step) && step > 0 ? step : 1
  const digits = clamp(Math.round(finite(precision) ? precision : decimalsOf(safeStep)), 0, 6)
  const factor = 10 ** digits
  const stepQ = Math.max(1, Math.round(safeStep * factor))
  const fineQ = Math.max(1, Math.round(stepQ / 10))
  const lowQ = finite(min) ? Math.round(min * factor) : -Infinity
  const highQ = finite(max) ? Math.round(max * factor) : Infinity
  const [minQ, maxQ] = lowQ <= highQ ? [lowQ, highQ] : [highQ, lowQ]
  const pixelsPerStep = finite(sensitivity) ? clamp(sensitivity, 1, 40) : 6
  const fit = (quanta: number) => clamp(quanta, minQ, maxQ)

  const [inner, setInner] = React.useState(() => finite(defaultValue) ? defaultValue : 0)
  const [draft, setDraft] = React.useState<string | null>(null)
  const [scrubbing, setScrubbing] = React.useState(false)
  const input = React.useRef<HTMLInputElement>(null)
  const scrub = React.useRef<{ id: number; x: number; active: boolean; quanta: number; last: number } | null>(null)
  const labelId = React.useId()

  const controlled = value !== undefined
  const current = controlled ? (finite(value) ? value : 0) : inner
  const quanta = fit(Math.round(current * factor))
  const text = (quanta / factor).toFixed(digits)
  const toNumber = (next: number) => Number((next / factor).toFixed(digits))

  function commit(next: number) {
    const number = toNumber(fit(next))
    if (!controlled) setInner(number)
    onValueChange?.(number)
  }

  function parse(raw: string) {
    let cleaned = raw.trim().replace(/\s/g, "").replace(",", ".").replace("−", "-")
    if (unit && cleaned.endsWith(unit)) cleaned = cleaned.slice(0, -unit.length)
    const number = cleaned === "" ? NaN : Number(cleaned)
    return Number.isFinite(number) ? fit(Math.round(number * factor)) : null
  }

  function commitDraft() {
    if (draft === null) return
    const parsed = parse(draft)
    setDraft(null)
    if (parsed !== null && parsed !== quanta) commit(parsed)
  }

  function endScrub(event: React.PointerEvent<HTMLSpanElement>, focus: boolean) {
    const state = scrub.current
    if (!state || state.id !== event.pointerId) return
    scrub.current = null
    setScrubbing(false)
    if (focus && !state.active) { input.current?.focus(); input.current?.select() }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") { event.preventDefault(); commitDraft(); return }
    if (event.key === "Escape") { if (draft !== null) { event.preventDefault(); setDraft(null) } return }
    const base = (draft !== null ? parse(draft) : null) ?? quanta
    const nudge = event.altKey ? fineQ : stepQ * (event.shiftKey ? 10 : 1)
    const targets: Record<string, number> = { ArrowUp: base + nudge, ArrowDown: base - nudge, PageUp: base + stepQ * 10, PageDown: base - stepQ * 10 }
    if (Number.isFinite(minQ)) targets.Home = minQ
    if (Number.isFinite(maxQ)) targets.End = maxQ
    if (!(event.key in targets)) return
    event.preventDefault()
    setDraft(null)
    commit(targets[event.key])
  }

  const shown = draft ?? text
  return (
    <div {...props} className={cn("wlkr-scrub-input", className)} style={{ ...style, "--wlkr-scrub-input-x": `${(quanta / stepQ) * TICK}px` } as React.CSSProperties} data-scrubbing={scrubbing || undefined} data-disabled={disabled || undefined}>
      <style>{styles}</style>
      <span
        id={labelId}
        className="wlkr-scrub-input-label"
        onPointerDown={event => {
          if (disabled || event.button !== 0 || !event.isPrimary) return
          if (event.pointerType === "mouse") event.preventDefault()
          try { event.currentTarget.setPointerCapture(event.pointerId) } catch {}
          scrub.current = { id: event.pointerId, x: event.clientX, active: false, quanta, last: quanta }
        }}
        onPointerMove={event => {
          const state = scrub.current
          if (!state || state.id !== event.pointerId) return
          const dx = event.clientX - state.x
          if (!state.active) {
            if (Math.abs(dx) < THRESHOLD) return
            state.active = true
            setScrubbing(true)
            setDraft(null)
          }
          state.x = event.clientX
          const grain = event.altKey ? fineQ : stepQ
          state.quanta = fit(state.quanta + (dx / pixelsPerStep) * (event.altKey ? fineQ : stepQ * (event.shiftKey ? 10 : 1)))
          const next = fit(Math.round(state.quanta / grain) * grain)
          if (next !== state.last) { state.last = next; commit(next) }
        }}
        onPointerUp={event => endScrub(event, true)}
        onPointerCancel={event => endScrub(event, false)}
        onLostPointerCapture={event => endScrub(event, false)}
      >
        {label}
      </span>
      <span className="wlkr-scrub-input-field">
        <span className="wlkr-scrub-input-sizer">
          <span className="wlkr-scrub-input-mirror" aria-hidden="true">{shown || "0"}</span>
          <input
            ref={input}
            type="text"
            inputMode="decimal"
            size={1}
            role="spinbutton"
            className="wlkr-scrub-input-control"
            autoComplete="off"
            spellCheck={false}
            disabled={disabled}
            value={shown}
            aria-labelledby={labelId}
            aria-valuenow={toNumber(quanta)}
            aria-valuemin={Number.isFinite(minQ) ? toNumber(minQ) : undefined}
            aria-valuemax={Number.isFinite(maxQ) ? toNumber(maxQ) : undefined}
            aria-valuetext={`${text}${unit ?? ""}`}
            onChange={event => setDraft(event.target.value)}
            onBlur={commitDraft}
            onKeyDown={onKeyDown}
          />
        </span>
        {unit ? <span className="wlkr-scrub-input-unit" aria-hidden="true">{unit}</span> : null}
      </span>
      <span className="wlkr-scrub-input-ruler" aria-hidden="true"><span className="wlkr-scrub-input-ticks" /></span>
    </div>
  )
}
