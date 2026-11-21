"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type DialProps = Omit<React.ComponentPropsWithoutRef<"div">, "defaultValue" | "onChange" | "children"> & {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  /** Knob size in px. */
  size?: number
  /** Visible label under the knob; also its accessible name. */
  label?: string
  /** Formats the centre readout and aria-valuetext. */
  format?: (n: number) => string
  disabled?: boolean
}

const TICKS = 32
const SWEEP = 270

const styles = `
.wlkr-dial{display:inline-flex;flex-direction:column;align-items:center;gap:.5rem;color:var(--foreground,currentColor);user-select:none;-webkit-user-select:none}
.wlkr-dial-knob{position:relative;flex:none;touch-action:none;cursor:ns-resize;border-radius:0;outline:none}
.wlkr-dial-knob:focus-visible{outline:2px solid var(--brand,#33f282);outline-offset:2px}
.wlkr-dial[data-disabled] .wlkr-dial-knob{cursor:not-allowed;opacity:.45}
.wlkr-dial[data-dragging] .wlkr-dial-knob{cursor:grabbing}
.wlkr-dial-svg{display:block;width:100%;height:100%;overflow:visible}
.wlkr-dial-tick{stroke:var(--border,currentColor);stroke-width:2;stroke-linecap:butt;opacity:.55;transition:stroke 90ms steps(2,end),opacity 90ms steps(2,end)}
.wlkr-dial-tick[data-on]{stroke:var(--foreground,currentColor);opacity:1}
.wlkr-dial-tick[data-current]{stroke:var(--brand,#33f282);stroke-width:3;opacity:1}
.wlkr-dial-hub{fill:none;stroke:var(--border,currentColor);stroke-width:1;opacity:.6}
.wlkr-dial-readout{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--font-mono,ui-monospace,monospace);font-variant-numeric:tabular-nums;font-size:var(--wlkr-dial-font);line-height:1;letter-spacing:-.02em;pointer-events:none}
.wlkr-dial-label{font-size:.75rem;line-height:1;color:var(--muted-foreground,#6b6b6b);font-family:var(--font-mono,ui-monospace,monospace);text-transform:uppercase;letter-spacing:.08em}
@media (prefers-reduced-motion:reduce){.wlkr-dial-tick{transition:none}}
`

const r2 = (n: number) => Math.round(n * 100) / 100

function decimalsOf(step: number) {
  const s = String(step)
  const i = s.indexOf(".")
  return i === -1 ? 0 : s.length - i - 1
}

/** A rotary knob of square ticks. Drag up or around it; the arrow keys step. */
export function Dial({
  value,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  size = 120,
  label,
  format,
  disabled = false,
  className,
  style,
  "aria-label": ariaLabel,
  ...props
}: DialProps) {
  const labelId = React.useId()
  const lo = Math.min(min, max)
  const hi = Math.max(min, max)
  const safeStep = step > 0 ? step : 1
  const [inner, setInner] = React.useState(() => defaultValue ?? lo)
  const raw = value ?? inner
  const current = Math.min(hi, Math.max(lo, raw))
  const [dragging, setDragging] = React.useState(false)
  const drag = React.useRef<{ id: number; acc: number; y: number; angle: number } | null>(null)

  const snap = React.useCallback((n: number) => {
    const clamped = Math.min(hi, Math.max(lo, n))
    const snapped = Math.round((clamped - lo) / safeStep) * safeStep + lo
    return Math.min(hi, Number(snapped.toFixed(decimalsOf(safeStep))))
  }, [lo, hi, safeStep])

  const commit = React.useCallback((n: number) => {
    const next = snap(n)
    if (next === current) return
    if (value === undefined) setInner(next)
    onValueChange?.(next)
  }, [snap, current, value, onValueChange])

  const range = hi - lo || 1
  const frac = (current - lo) / range
  const active = Math.round(frac * (TICKS - 1))
  const c = size / 2
  const outer = c - 2
  const len = Math.max(6, size * 0.08)
  const text = format ? format(current) : String(current)

  const ticks = Array.from({ length: TICKS }, (_, i) => {
    const deg = -SWEEP / 2 + (i * SWEEP) / (TICKS - 1)
    const rad = (deg * Math.PI) / 180
    const isCurrent = i === active
    const r1 = outer - (isCurrent ? len * 1.7 : len)
    const sin = Math.sin(rad)
    const cos = Math.cos(rad)
    return {
      i,
      on: i <= active,
      isCurrent,
      x1: r2(c + sin * r1), y1: r2(c - cos * r1),
      x2: r2(c + sin * outer), y2: r2(c - cos * outer),
    }
  })

  function pointerAngle(e: React.PointerEvent<HTMLDivElement>) {
    const box = e.currentTarget.getBoundingClientRect()
    const dx = e.clientX - (box.left + box.width / 2)
    const dy = e.clientY - (box.top + box.height / 2)
    return { angle: (Math.atan2(dx, -dy) * 180) / Math.PI, dist: Math.hypot(dx, dy), radius: box.width / 2 }
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (disabled || e.button !== 0) return
    e.preventDefault()
    e.currentTarget.focus()
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { id: e.pointerId, acc: current, y: e.clientY, angle: pointerAngle(e).angle }
    setDragging(true)
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    const { angle, dist, radius } = pointerAngle(e)
    let delta: number
    if (dist > radius * 0.45) {
      let da = angle - d.angle
      if (da > 180) da -= 360
      if (da < -180) da += 360
      delta = (da / SWEEP) * range
    } else {
      delta = ((d.y - e.clientY) / (size * 1.6)) * range
    }
    d.y = e.clientY
    d.angle = angle
    d.acc = Math.min(hi, Math.max(lo, d.acc + delta))
    commit(d.acc)
  }

  function endDrag(e: React.PointerEvent<HTMLDivElement>) {
    if (drag.current?.id !== e.pointerId) return
    drag.current = null
    setDragging(false)
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (disabled) return
    const big = Math.max(safeStep, Number((safeStep * 10).toFixed(decimalsOf(safeStep))))
    const by = e.shiftKey ? big : safeStep
    let next: number | null = null
    switch (e.key) {
      case "ArrowUp": case "ArrowRight": next = current + by; break
      case "ArrowDown": case "ArrowLeft": next = current - by; break
      case "PageUp": next = current + big; break
      case "PageDown": next = current - big; break
      case "Home": next = lo; break
      case "End": next = hi; break
    }
    if (next === null) return
    e.preventDefault()
    commit(next)
  }

  return (
    <div
      {...props}
      className={cn("wlkr-dial", className)}
      data-disabled={disabled || undefined}
      data-dragging={dragging || undefined}
      style={{ ...style, ["--wlkr-dial-font" as string]: `${r2(Math.max(12, size * 0.2))}px` }}
    >
      <style>{styles}</style>
      <div
        className="wlkr-dial-knob"
        style={{ width: size, height: size }}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={ariaLabel}
        aria-labelledby={label && !ariaLabel ? labelId : undefined}
        aria-valuemin={lo}
        aria-valuemax={hi}
        aria-valuenow={current}
        aria-valuetext={text}
        aria-disabled={disabled || undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
      >
        <svg className="wlkr-dial-svg" viewBox={`0 0 ${size} ${size}`} aria-hidden="true" focusable="false">
          <rect className="wlkr-dial-hub" x={r2(c - size * 0.28)} y={r2(c - size * 0.28)} width={r2(size * 0.56)} height={r2(size * 0.56)} />
          {ticks.map(t => (
            <line
              key={t.i}
              className="wlkr-dial-tick"
              x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
              data-on={t.on || undefined}
              data-current={t.isCurrent || undefined}
            />
          ))}
        </svg>
        <span className="wlkr-dial-readout" aria-hidden="true">{text}</span>
      </div>
      {label && <span id={labelId} className="wlkr-dial-label">{label}</span>}
    </div>
  )
}
