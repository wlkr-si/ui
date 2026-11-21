"use client"

import * as React from "react"

type Side = "top" | "bottom" | "left" | "right"

export type HintProps = Omit<React.ComponentPropsWithoutRef<"span">, "children"> & {
  /** The single trigger element the hint describes. */
  children: React.ReactNode
  /** Text shown in the hint. */
  label: React.ReactNode
  side?: Side
  /** Milliseconds before the hint opens on hover. Keyboard focus opens it at once. */
  delay?: number
  /** Key combination shown after the label in a dimmer tone. */
  shortcut?: string
  /** Controlled open state. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
}

const OPPOSITE: Record<Side, Side> = { top: "bottom", bottom: "top", left: "right", right: "left" }
const GAP = 6

const styles = `
.wlkr-hint{position:relative;display:inline-flex;vertical-align:middle}
.wlkr-hint-label{position:absolute;z-index:50;display:inline-flex;align-items:baseline;gap:.75em;padding:4px 8px;border-radius:0;box-shadow:none;background:var(--foreground,currentColor);color:var(--background,#fff);font-family:var(--font-mono,ui-monospace,monospace);font-size:11px;line-height:16px;letter-spacing:.02em;white-space:nowrap;pointer-events:auto;animation:wlkr-hint-wipe 120ms steps(4,end) both}
.wlkr-hint-label[hidden]{display:none}
.wlkr-hint-label::before{content:"";position:absolute;inset:-${GAP}px;z-index:-1}
.wlkr-hint-label[data-side=top]{bottom:calc(100% + ${GAP}px);left:50%;translate:-50% 0;--wlkr-hint-from:inset(100% 0 0 0)}
.wlkr-hint-label[data-side=bottom]{top:calc(100% + ${GAP}px);left:50%;translate:-50% 0;--wlkr-hint-from:inset(0 0 100% 0)}
.wlkr-hint-label[data-side=left]{right:calc(100% + ${GAP}px);top:50%;translate:0 -50%;--wlkr-hint-from:inset(0 0 0 100%)}
.wlkr-hint-label[data-side=right]{left:calc(100% + ${GAP}px);top:50%;translate:0 -50%;--wlkr-hint-from:inset(0 100% 0 0)}
.wlkr-hint-key{color:var(--background,#fff);opacity:.55}
@keyframes wlkr-hint-wipe{from{clip-path:var(--wlkr-hint-from)}to{clip-path:inset(0)}}
@media(prefers-reduced-motion:reduce){.wlkr-hint-label{animation:none}}
`

function fits(side: Side, trigger: DOMRect, w: number, h: number) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  if (side === "top") return trigger.top - h - GAP >= 0
  if (side === "bottom") return trigger.bottom + h + GAP <= vh
  if (side === "left") return trigger.left - w - GAP >= 0
  return trigger.right + w + GAP <= vw
}

/** A small ink label that names a control on hover or focus. Wipes open in pixel steps. */
export function Hint({ children, label, side = "top", delay = 300, shortcut, open, onOpenChange, disabled = false, className, onPointerEnter, onPointerLeave, onFocus, onBlur, ...props }: HintProps) {
  const id = React.useId()
  const [inner, setInner] = React.useState(false)
  const [placement, setPlacement] = React.useState<Side>(side)
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const rootRef = React.useRef<HTMLSpanElement>(null)
  const labelRef = React.useRef<HTMLSpanElement>(null)
  const visible = !disabled && (open ?? inner)

  const setOpen = React.useCallback((next: boolean) => {
    clearTimeout(timer.current)
    setInner(next)
    onOpenChange?.(next)
  }, [onOpenChange])

  const schedule = (ms: number) => {
    clearTimeout(timer.current)
    if (ms <= 0) setOpen(true)
    else timer.current = setTimeout(() => setOpen(true), ms)
  }

  React.useEffect(() => () => clearTimeout(timer.current), [])

  React.useEffect(() => {
    if (!visible) return
    const frame = requestAnimationFrame(() => {
      const root = rootRef.current
      const tip = labelRef.current
      if (!root || !tip) return
      const rect = root.getBoundingClientRect()
      const { offsetWidth: w, offsetHeight: h } = tip
      setPlacement(fits(side, rect, w, h) || !fits(OPPOSITE[side], rect, w, h) ? side : OPPOSITE[side])
    })
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener("keydown", onKey)
    }
  }, [visible, side, setOpen])

  let trigger = children
  if (React.isValidElement<{ "aria-describedby"?: string }>(children)) {
    const existing = children.props["aria-describedby"]
    trigger = React.cloneElement(children, { "aria-describedby": existing ? `${existing} ${id}` : id })
  }

  return (
    <span
      {...props}
      ref={rootRef}
      className={className ? `wlkr-hint ${className}` : "wlkr-hint"}
      onPointerEnter={event => { onPointerEnter?.(event); if (!disabled && event.pointerType !== "touch") schedule(delay) }}
      onPointerLeave={event => { onPointerLeave?.(event); setOpen(false) }}
      onFocus={event => {
        onFocus?.(event)
        if (disabled) return
        const target = event.target as HTMLElement
        schedule(target.matches(":focus-visible") ? 0 : delay)
      }}
      onBlur={event => {
        onBlur?.(event)
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false)
      }}
    >
      <style>{styles}</style>
      {trigger}
      <span ref={labelRef} id={id} role="tooltip" className="wlkr-hint-label" data-side={placement} hidden={!visible}>
        <span>{label}</span>
        {shortcut && <kbd className="wlkr-hint-key" style={{ font: "inherit" }}>{shortcut}</kbd>}
      </span>
    </span>
  )
}
