"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

export type SecretFieldProps = Omit<React.ComponentPropsWithoutRef<"div">, "children" | "onCopy"> & {
  /** The secret. While masked only its length and visible tail are in the page. */
  value: string
  /** Visible label above the value, e.g. "Secret key". Also names the controls. */
  label: string
  /** Characters left readable at the end while masked, 0–8. Never more than half the value. */
  visibleEnd?: number
  /** Milliseconds before it masks itself again, 1000–600000. `null` stays revealed until toggled. */
  revealFor?: number | null
  /** Runs after the value reaches the clipboard. */
  onCopy?: () => void
  /** Runs when the value is revealed. */
  onReveal?: () => void
}

const edge = (side: string) => `linear-gradient(to ${side},#0000 0 4px,#0006 4px 8px,#000b 8px 12px,#000 12px)`
const styles = `
.wlkr-secret-field{display:flex;flex-direction:column;gap:4px;width:100%;min-width:0;color:var(--foreground,currentColor)}
.wlkr-secret-field-label{font-size:12px;line-height:16px;color:var(--muted-foreground,#696969)}
.wlkr-secret-field-row{display:flex;align-items:center;gap:2px;min-width:0}
.wlkr-secret-field-box{position:relative;flex:1 1 auto;min-width:0;contain:inline-size;margin-right:6px;border-bottom:1px solid var(--border,#dedede)}
.wlkr-secret-field-scroll{overflow-x:auto;overflow-y:hidden;scrollbar-width:none;padding:12px 0 11px;font:13px/20px ui-monospace,SFMono-Regular,Menlo,monospace;font-variant-ligatures:none;white-space:pre}
.wlkr-secret-field-scroll::-webkit-scrollbar{display:none}
.wlkr-secret-field-scroll:focus-visible{outline:2px solid var(--ring,currentColor);outline-offset:3px}
.wlkr-secret-field-scroll[data-edge=end]{-webkit-mask-image:${edge("left")};mask-image:${edge("left")}}
.wlkr-secret-field-scroll[data-edge=start]{-webkit-mask-image:${edge("right")};mask-image:${edge("right")}}
.wlkr-secret-field-scroll[data-edge=both]{-webkit-mask-image:${edge("left")},${edge("right")};-webkit-mask-composite:source-in;mask-image:${edge("left")},${edge("right")};mask-composite:intersect}
.wlkr-secret-field-value{display:inline-block}
.wlkr-secret-field-cell{position:relative;display:inline-block;width:1ch;height:20px;text-align:center;vertical-align:top}
.wlkr-secret-field-cell[data-state=block]::before{content:"";position:absolute;inset:0;margin:auto;width:5px;height:5px;background:var(--muted-foreground,#696969)}
.wlkr-secret-field-cell[data-state=noise]{color:var(--muted-foreground,#696969)}
.wlkr-secret-field-drain{position:absolute;left:0;right:0;bottom:-1px;height:2px;background:var(--brand,#33f282);transform-origin:0 50%;animation:wlkr-secret-field-drain 1s steps(48,end) forwards;pointer-events:none}
@keyframes wlkr-secret-field-drain{from{transform:scaleX(1)}to{transform:scaleX(0)}}
.wlkr-secret-field-button{display:inline-grid;place-items:center;flex:none;width:44px;height:44px;padding:0;border:0;border-radius:2px;background:none;color:inherit;cursor:pointer}
.wlkr-secret-field-button:focus-visible{outline:2px solid var(--ring,currentColor);outline-offset:3px}
.wlkr-secret-field-button:disabled{cursor:not-allowed;opacity:.5}
.wlkr-secret-field-button svg{width:16px;height:16px;overflow:visible}
.wlkr-secret-field-button g{transform-origin:12px 12px;transition:opacity 180ms ease,transform 180ms ease}
.wlkr-secret-field-button g[data-visible=false]{opacity:0;transform:scale(.65) rotate(-12deg)}
.wlkr-secret-field-success{color:var(--success,#087d3d)}
.wlkr-secret-field-error{color:var(--destructive,#b42318)}
.wlkr-secret-field-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0}
@media(hover:hover){.wlkr-secret-field-button:not(:disabled):hover{background:var(--muted,#f3f3f3)}}
@media(prefers-reduced-motion:reduce){.wlkr-secret-field-drain{animation-timing-function:linear}.wlkr-secret-field-button g{transition:none}}
`

const NOISE = "01"
const REVEAL_MS = 500
const HIDE_MS = 300
const TICK_MS = 50

type View = { progress: number; moving: boolean; tick: number }

const clamp = (input: unknown, min: number, max: number, fallback: number) => {
  const number = Number(input)
  return input === "" || input === null || !Number.isFinite(number) ? fallback : Math.min(max, Math.max(min, number))
}
const noise = (index: number, tick: number) => {
  const mixed = Math.imul(index + 1, 0x9e3779b1) ^ Math.imul(tick + 7, 0x85ebca6b)
  return NOISE[((mixed ^ (mixed >>> 15)) >>> 0) % NOISE.length]
}
const lower = (text: string) => /^[A-Z][a-z]/.test(text) ? text[0].toLowerCase() + text.slice(1) : text

/** An API key or token, masked as blocks. Reveal decodes it for a while; Copy never shows it. */
export function SecretField({ value, label, visibleEnd = 4, revealFor = 10000, onCopy, onReveal, className, ...props }: SecretFieldProps) {
  const characters = React.useMemo(() => Array.from(typeof value === "string" ? value : ""), [value])
  const name = typeof label === "string" && label.trim() ? label.trim() : "Secret"
  const tail = Math.min(Math.round(clamp(visibleEnd, 0, 8, 4)), Math.floor(characters.length / 2))
  const masked = characters.length - tail
  const hideAfter = revealFor === null ? null : clamp(revealFor, 1000, 600000, 10000)
  const [revealed, setRevealed] = React.useState(false)
  const [view, setView] = React.useState<View>({ progress: 0, moving: false, tick: 0 })
  const [round, setRound] = React.useState(0)
  const [copy, setCopy] = React.useState<"idle" | "copying" | "copied" | "error">("idle")
  const [message, setMessage] = React.useState("")
  const progress = React.useRef(0)
  const frame = React.useRef(0)
  const hideTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const copyTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const locked = React.useRef(false)
  const mounted = React.useRef(true)
  const scroller = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      cancelAnimationFrame(frame.current)
      if (hideTimer.current) clearTimeout(hideTimer.current)
      if (copyTimer.current) clearTimeout(copyTimer.current)
    }
  }, [])

  React.useEffect(() => {
    const element = scroller.current
    if (!element) return
    const update = () => {
      const overflow = element.scrollWidth - element.clientWidth
      const start = element.scrollLeft > 1
      const end = element.scrollLeft < overflow - 1
      element.dataset.edge = start && end ? "both" : start ? "start" : end ? "end" : "none"
      if (overflow > 1) element.setAttribute("tabindex", "0")
      else element.removeAttribute("tabindex")
    }
    element.scrollLeft = element.scrollWidth
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    if (element.firstElementChild) observer.observe(element.firstElementChild)
    element.addEventListener("scroll", update, { passive: true })
    return () => { observer.disconnect(); element.removeEventListener("scroll", update) }
  }, [characters.length])

  function move(target: 0 | 1) {
    cancelAnimationFrame(frame.current)
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.hidden) {
      progress.current = target
      setView({ progress: target, moving: false, tick: 0 })
      return
    }
    const span = target ? REVEAL_MS : HIDE_MS
    let start = 0
    let last = 0
    const step = (time: number) => {
      if (!start) { start = time; last = time }
      const next = clamp(progress.current + (target ? 1 : -1) * (time - last) / span, 0, 1, target)
      last = time
      progress.current = next
      setView({ progress: next, moving: next !== target, tick: Math.floor((time - start) / TICK_MS) })
      frame.current = next === target ? 0 : requestAnimationFrame(step)
    }
    frame.current = requestAnimationFrame(step)
  }

  function conceal() {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = null
    setRevealed(false)
    setMessage("Hidden")
    scroller.current?.scrollTo({ left: scroller.current.scrollWidth })
    move(0)
  }

  function reveal() {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    setRevealed(true)
    setRound(count => count + 1)
    setMessage("Revealed")
    scroller.current?.scrollTo({ left: 0 })
    move(1)
    if (hideAfter !== null) hideTimer.current = setTimeout(conceal, hideAfter)
    onReveal?.()
  }

  const leave = React.useEffectEvent(() => { if (document.hidden && revealed) conceal() })
  React.useEffect(() => {
    const listener = () => leave()
    document.addEventListener("visibilitychange", listener)
    return () => document.removeEventListener("visibilitychange", listener)
  }, [])

  async function copyValue() {
    if (locked.current) return
    locked.current = true
    if (copyTimer.current) clearTimeout(copyTimer.current)
    setCopy("copying")
    try {
      await navigator.clipboard.writeText(characters.join(""))
      if (!mounted.current) return
      setCopy("copied")
      setMessage("Copied to clipboard")
      copyTimer.current = setTimeout(() => setCopy("idle"), 2000)
      onCopy?.()
    } catch {
      if (mounted.current) { setCopy("error"); setMessage("Copy failed") }
    } finally { locked.current = false }
  }

  const front = Math.max(3, Math.round(masked / 5))
  const resolved = view.progress * masked
  const tailText = characters.slice(masked).join("")
  const subject = lower(name)
  return (
    <div {...props} className={cn("wlkr-secret-field", className)}>
      <style>{styles}</style>
      <span className="wlkr-secret-field-label" aria-hidden="true">{name}</span>
      <div className="wlkr-secret-field-row">
        <div className="wlkr-secret-field-box">
          <div ref={scroller} className="wlkr-secret-field-scroll" role="group" aria-label={revealed ? name : `${name}, hidden${tail ? `, ends in ${tailText}` : ""}`}>
            <span className="wlkr-secret-field-value" aria-hidden="true">{characters.map((character, index) => {
              if (index >= masked || index < resolved) return <span className="wlkr-secret-field-cell" key={index}>{character}</span>
              const state = view.moving && index < resolved + front ? "noise" : "block"
              return <span className="wlkr-secret-field-cell" data-state={state} key={index}>{state === "noise" ? noise(index, view.tick) : null}</span>
            })}</span>
            {revealed && <span className="wlkr-secret-field-sr">{characters.join("")}</span>}
          </div>
          {revealed && hideAfter !== null && <span key={round} className="wlkr-secret-field-drain" style={{ animationDuration: `${hideAfter}ms` }} aria-hidden="true" />}
        </div>
        <button type="button" className="wlkr-secret-field-button" aria-pressed={revealed} aria-label={`${revealed ? "Hide" : "Reveal"} ${subject}`} disabled={masked === 0} onClick={revealed ? conceal : reveal}>
          {revealed ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </button>
        <button type="button" className="wlkr-secret-field-button" aria-label={`Copy ${subject}`} disabled={characters.length === 0} onClick={copyValue}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <g data-visible={copy === "idle" || copy === "copying"}><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></g>
            <g data-visible={copy === "copied"} className="wlkr-secret-field-success"><path d="m5 12 4 4L19 6" /></g>
            <g data-visible={copy === "error"} className="wlkr-secret-field-error"><path d="m6 6 12 12M18 6 6 18" /></g>
          </svg>
        </button>
      </div>
      <span role="status" className="wlkr-secret-field-sr">{message}</span>
    </div>
  )
}
