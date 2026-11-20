"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type DecodeTextProps = Omit<React.HTMLAttributes<HTMLElement>, "children"> & {
  /** The final text. Present in server HTML and read once by assistive tech. */
  text: string
  /** "view" plays once on scroll into view, "hover" replays on pointer or focus, "both" does each. */
  trigger?: "view" | "hover" | "both"
  /** Sweep length in milliseconds, clamped to 200–4000. */
  duration?: number
  /** Characters the noise is drawn from, e.g. "01", "▚▞░▒▓" or "ABCDEFGHIJKLMNOPQRSTUVWXYZ". */
  glyphs?: string
  as?: "span" | "p" | "div" | "h1" | "h2" | "h3"
}

const styles = `
.wlkr-decode-text-word{display:inline-block;white-space:nowrap}
.wlkr-decode-text-cell{position:relative;display:inline-block}
.wlkr-decode-text-real{transition:color 160ms cubic-bezier(.2,.7,.2,1)}
.wlkr-decode-text-cell[data-state=noise]>.wlkr-decode-text-real{visibility:hidden}
.wlkr-decode-text-cell[data-state=landed]>.wlkr-decode-text-real{color:var(--success,#087d3d);transition:none}
.wlkr-decode-text-glyph{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--muted-foreground,#696969);font-variant-numeric:tabular-nums;pointer-events:none}
.wlkr-decode-text-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0}
@media(prefers-reduced-motion:reduce){.wlkr-decode-text-glyph{display:none}.wlkr-decode-text-cell>.wlkr-decode-text-real{visibility:visible!important;color:inherit!important}}
`
const FRAME_MS = 50
const FLASH_MS = 120
const FLICKER_MS = 180

type Frame = { elapsed: number; tick: number } | null

function pick(set: string[], index: number, tick: number) {
  const mixed = Math.imul(index + 1, 0x9e3779b1) ^ Math.imul(tick + 7, 0x85ebca6b)
  return set[((mixed ^ (mixed >>> 15)) >>> 0) % set.length]
}

/** Inline text that resolves out of glyph noise, left to right, into its final words. Width never changes. */
export function DecodeText({ text, trigger = "both", duration = 700, glyphs = "01", as: Tag = "span", className, ...props }: DecodeTextProps) {
  const root = React.useRef<HTMLElement | null>(null)
  const lastText = React.useRef(text)
  const [frame, setFrame] = React.useState<Frame>(null)
  const timing = Number.isFinite(duration) ? Math.max(200, Math.min(4000, duration)) : 700
  const content = typeof text === "string" ? text : ""
  const glyphSet = React.useMemo(() => { const set = Array.from(glyphs ?? "").filter(glyph => !/\s/.test(glyph)); return set.length ? set : ["0", "1"] }, [glyphs])
  const words = React.useMemo(() => {
    let position = 0
    return content.split(/(\s+)/).filter(Boolean).map(chunk => /\s/.test(chunk) ? chunk : Array.from(chunk).map(character => ({ character, index: position++ })))
  }, [content])
  const count = words.reduce((total, word) => total + (typeof word === "string" ? 0 : word.length), 0)

  React.useEffect(() => {
    const element = root.current
    if (!element || count === 0) return
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)")
    let request = 0
    let started = 0
    let drawn = 0
    function finish() { if (request) cancelAnimationFrame(request); request = 0; setFrame(null) }
    function step(time: number) {
      if (!started) { started = time; drawn = time - FRAME_MS }
      const elapsed = time - started
      if (elapsed >= timing + FLASH_MS) { finish(); return }
      if (time - drawn >= FRAME_MS) { drawn = time; setFrame({ elapsed, tick: Math.floor(elapsed / FRAME_MS) }) }
      request = requestAnimationFrame(step)
    }
    function play() {
      if (preference.matches || document.hidden) return
      if (request) cancelAnimationFrame(request)
      started = 0
      request = requestAnimationFrame(step)
    }
    function hover(event: Event) { if (event instanceof PointerEvent && event.pointerType === "touch") return; play() }
    function settle() { if (preference.matches || document.hidden) finish() }
    const hosts = trigger === "view" ? [] : [element, element.parentElement?.closest("a,button")].filter((host, index, list): host is HTMLElement => host instanceof HTMLElement && list.indexOf(host) === index)
    hosts.forEach(host => { host.addEventListener("pointerenter", hover); host.addEventListener("focus", play) })
    const observer = trigger === "hover" ? null : new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { observer?.disconnect(); play() } }, { threshold: .4 })
    observer?.observe(element)
    if (lastText.current !== text) { lastText.current = text; play() }
    preference.addEventListener("change", settle)
    document.addEventListener("visibilitychange", settle)
    return () => {
      finish()
      observer?.disconnect()
      hosts.forEach(host => { host.removeEventListener("pointerenter", hover); host.removeEventListener("focus", play) })
      preference.removeEventListener("change", settle)
      document.removeEventListener("visibilitychange", settle)
    }
  }, [text, trigger, timing, count])

  const landing = (index: number) => timing * (1 - Math.sqrt(1 - (index + 1) / count))
  const setRoot = React.useCallback((node: HTMLElement | null) => { root.current = node }, [])
  return <Tag ref={setRoot} className={cn("wlkr-decode-text", className)} {...props}>
    <style>{styles}</style>
    <span className="wlkr-decode-text-sr">{content}</span>
    <span aria-hidden="true">{words.map((word, wordIndex) => typeof word === "string" ? word : <span className="wlkr-decode-text-word" key={wordIndex}>{word.map(({ character, index }) => {
      const until = frame ? landing(index) - frame.elapsed : -Infinity
      const state = until > 0 ? "noise" : frame && until > -FLASH_MS ? "landed" : "final"
      const tick = frame?.tick ?? 0
      const glyph = state === "noise" ? pick(glyphSet, index, until < FLICKER_MS ? tick : Math.floor(tick / 4)) : null
      return <span className="wlkr-decode-text-cell" data-state={state} key={index}><span className="wlkr-decode-text-real">{character}</span>{glyph && <span className="wlkr-decode-text-glyph">{glyph}</span>}</span>
    })}</span>)}</span>
  </Tag>
}
