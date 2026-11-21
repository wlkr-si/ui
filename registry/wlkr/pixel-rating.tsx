"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type PixelRatingProps = Omit<React.ComponentPropsWithoutRef<"div">, "children" | "defaultValue" | "onChange"> & {
  /** Controlled value, 0 (none) to `max`. */
  value?: number
  /** Starting value when uncontrolled. */
  defaultValue?: number
  onValueChange?: (value: number) => void
  /** Number of blocks. */
  max?: number
  readOnly?: boolean
  disabled?: boolean
  /** Block size: 12px, 16px or 22px. */
  size?: "sm" | "md" | "lg"
}

const styles = `
.wlkr-pixel-rating{--wlkr-pixel-rating-size:16px;display:inline-flex;flex-wrap:wrap;gap:4px;max-width:100%;vertical-align:middle;touch-action:manipulation}
.wlkr-pixel-rating[data-size=sm]{--wlkr-pixel-rating-size:12px;gap:3px}
.wlkr-pixel-rating[data-size=lg]{--wlkr-pixel-rating-size:22px;gap:5px}
.wlkr-pixel-rating-block{position:relative;box-sizing:border-box;flex:none;width:var(--wlkr-pixel-rating-size);height:var(--wlkr-pixel-rating-size);border:1px solid var(--border,currentColor);border-radius:0;background:var(--background,#fff);outline:none;cursor:pointer}
.wlkr-pixel-rating[data-interactive=false] .wlkr-pixel-rating-block{cursor:default}
.wlkr-pixel-rating[data-disabled] .wlkr-pixel-rating-block{cursor:not-allowed}
.wlkr-pixel-rating[data-disabled]{opacity:.45}
.wlkr-pixel-rating-block:focus-visible{outline:2px solid var(--brand,#33f282);outline-offset:2px}
.wlkr-pixel-rating-fill{position:absolute;inset:1px;border-radius:0;background:var(--foreground,currentColor)}
.wlkr-pixel-rating-block[data-newest] .wlkr-pixel-rating-fill{background:var(--brand,#33f282)}
.wlkr-pixel-rating-block[data-state=dim] .wlkr-pixel-rating-fill{opacity:.3}
.wlkr-pixel-rating-block[data-state=preview] .wlkr-pixel-rating-fill{background:repeating-conic-gradient(var(--foreground,currentColor) 0 25%,transparent 0 50%) 0 0/4px 4px}
.wlkr-pixel-rating-block[data-state=preview][data-newest] .wlkr-pixel-rating-fill{background:repeating-conic-gradient(var(--brand,#33f282) 0 25%,transparent 0 50%) 0 0/4px 4px}
@keyframes wlkr-pixel-rating-pop{0%{transform:scale(0)}50%{transform:scale(.5)}100%{transform:none}}
@media(prefers-reduced-motion:no-preference){
.wlkr-pixel-rating-fill[data-pop]{animation:wlkr-pixel-rating-pop 150ms steps(3,end) both;animation-delay:calc(var(--wlkr-pixel-rating-i,0) * 45ms)}
}
`

const clamp = (n: number, max: number) => Math.min(max, Math.max(0, Math.round(n)))

/** A row of square blocks. Click to rate; click the current value to clear. */
export function PixelRating({
  value: valueProp,
  defaultValue = 0,
  onValueChange,
  max: maxProp = 5,
  readOnly = false,
  disabled = false,
  size = "md",
  className,
  onPointerLeave,
  ...props
}: PixelRatingProps) {
  const max = Math.max(1, Math.floor(maxProp))
  const [inner, setInner] = React.useState(() => clamp(defaultValue, max))
  const [hover, setHover] = React.useState<number | null>(null)
  const [popFrom, setPopFrom] = React.useState(max)
  const [stamp, setStamp] = React.useState(0)
  const blocks = React.useRef<(HTMLSpanElement | null)[]>([])
  const id = React.useId()
  const controlled = valueProp !== undefined
  const value = clamp(controlled ? valueProp : inner, max)
  const interactive = !readOnly && !disabled

  const commit = (next: number, focus: boolean) => {
    const v = clamp(next, max)
    if (focus) blocks.current[Math.max(0, v - 1)]?.focus()
    if (v === value) return
    setPopFrom(value)
    setStamp(s => s + 1)
    if (!controlled) setInner(v)
    onValueChange?.(v)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>, index: number) => {
    if (!interactive) return
    const key = event.key
    let next: number | null = null
    if (key === "ArrowRight" || key === "ArrowUp") next = Math.max(1, value + 1)
    else if (key === "ArrowLeft" || key === "ArrowDown") next = Math.max(1, value - 1)
    else if (key === "Home") next = 1
    else if (key === "End") next = max
    else if (key === "0" || key === "Backspace" || key === "Delete") next = 0
    else if (/^[1-9]$/.test(key) && Number(key) <= max) next = Number(key)
    else if (key === " " || key === "Enter") next = index + 1 === value ? 0 : index + 1
    if (next === null) return
    event.preventDefault()
    commit(next, true)
  }

  const focusIndex = value > 0 ? value - 1 : 0
  const shown = interactive && hover !== null ? hover : value

  return (
    <div
      {...props}
      role="radiogroup"
      aria-readonly={readOnly || undefined}
      aria-disabled={disabled || undefined}
      className={cn("wlkr-pixel-rating", className)}
      data-size={size === "sm" || size === "lg" ? size : "md"}
      data-interactive={interactive}
      data-disabled={disabled ? "" : undefined}
      onPointerLeave={event => {
        setHover(null)
        onPointerLeave?.(event)
      }}
    >
      <style>{styles}</style>
      {Array.from({ length: max }, (_, i) => {
        const n = i + 1
        let state: "on" | "preview" | "dim" | "off" = "off"
        if (interactive && hover !== null) state = n <= hover ? (n <= value ? "on" : "preview") : n <= value ? "dim" : "off"
        else if (n <= value) state = "on"
        const newest = state !== "off" && state !== "dim" && n === shown
        const pop = state === "on" && n > popFrom && stamp > 0
        return (
          <span
            key={n}
            id={`${id}-${n}`}
            ref={el => {
              blocks.current[i] = el
            }}
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} of ${max}`}
            aria-disabled={disabled || undefined}
            tabIndex={disabled ? -1 : i === focusIndex ? 0 : -1}
            className="wlkr-pixel-rating-block"
            data-state={state}
            data-newest={newest ? "" : undefined}
            onKeyDown={event => onKeyDown(event, i)}
            onPointerEnter={event => {
              if (interactive && event.pointerType === "mouse") setHover(n)
            }}
            onClick={() => {
              if (interactive) commit(n === value ? 0 : n, false)
            }}
          >
            {state !== "off" && (
              <span
                key={pop ? `pop-${stamp}` : "still"}
                className="wlkr-pixel-rating-fill"
                data-pop={pop ? "" : undefined}
                style={{ "--wlkr-pixel-rating-i": n - popFrom - 1 } as React.CSSProperties}
                aria-hidden="true"
              />
            )}
          </span>
        )
      })}
    </div>
  )
}
