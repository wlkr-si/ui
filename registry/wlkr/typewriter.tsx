"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type TypewriterProps = Omit<React.HTMLAttributes<HTMLElement>, "children"> & {
  /** Phrases to cycle through. The first is in server HTML; a single phrase stays put. */
  phrases: string[]
  /** Milliseconds per character typed, 10–300. */
  typeSpeed?: number
  /** Milliseconds per character deleted, 5–300. */
  deleteSpeed?: number
  /** Milliseconds a finished phrase stays, 200–20000. */
  hold?: number
  /** Cycle forever. False stops on the last phrase. */
  loop?: boolean
  /** Only delete back to the beginning shared with the next phrase. */
  smart?: boolean
  caret?: "block" | "line" | "none"
  /** Always occupy the width and height of the longest phrase, so nothing around it moves. */
  reserve?: boolean
  /** "view" starts once 30% is visible; "mount" starts straight away. */
  trigger?: "view" | "mount"
  as?: "span" | "p" | "div" | "h1" | "h2" | "h3"
  /** What assistive tech reads. Defaults to the first phrase. */
  label?: string
}

type Position = { index: number; shown: number; phase: "type" | "delete" | "hold" }

const styles = `
.wlkr-typewriter{position:relative}
.wlkr-typewriter[data-reserve=true]{display:inline-grid;max-width:100%;vertical-align:baseline}
.wlkr-typewriter[data-reserve=true][data-block=true]{display:grid}
.wlkr-typewriter-layer{grid-area:1/1;min-width:0}
.wlkr-typewriter-sizer{visibility:hidden}
.wlkr-typewriter-caret{display:inline-block;width:.55em;height:1em;margin-left:.06em;vertical-align:-.12em;background:var(--foreground,currentColor)}
.wlkr-typewriter-caret[data-shape=line]{width:2px;height:1.15em;vertical-align:-.2em;margin-left:.08em}
.wlkr-typewriter-caret[data-solid=false]{animation:wlkr-typewriter-blink 1.06s steps(1) infinite}
@keyframes wlkr-typewriter-blink{50%{opacity:0}}
.wlkr-typewriter-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0}
@media(prefers-reduced-motion:reduce){.wlkr-typewriter-caret{animation:none!important}}
`

const segmenter = typeof Intl !== "undefined" && "Segmenter" in Intl ? new Intl.Segmenter(undefined, { granularity: "grapheme" }) : null
const graphemes = (text: string) => segmenter ? Array.from(segmenter.segment(text), part => part.segment) : Array.from(text)
const clamp = (value: unknown, min: number, max: number, fallback: number) => typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback

function sharedPrefix(a: string[], b: string[]) {
  let length = 0
  while (length < a.length && length < b.length && a[length] === b[length]) length++
  return length
}

/** One line that keeps rewriting itself: it types a phrase, holds, deletes back to the shared beginning and types the next, behind a block caret. */
export function Typewriter({ phrases, typeSpeed = 55, deleteSpeed = 28, hold = 1600, loop = true, smart = true, caret = "block", reserve = true, trigger = "view", as: Tag = "span", label, className, ...props }: TypewriterProps) {
  const root = React.useRef<HTMLElement | null>(null)
  const list = Array.isArray(phrases) ? phrases.filter((phrase): phrase is string => typeof phrase === "string") : []
  const source = JSON.stringify(list)
  const split = list.map(graphemes)
  const typeMs = clamp(typeSpeed, 10, 300, 55), deleteMs = clamp(deleteSpeed, 5, 300, 28), holdMs = clamp(hold, 200, 20000, 1600)
  const key = `${source}|${typeMs}|${deleteMs}|${holdMs}|${loop}|${smart}|${trigger}`
  const initial: Position = { index: 0, shown: split[0]?.length ?? 0, phase: "hold" }
  const [frame, setFrame] = React.useState({ key, ...initial })
  const position = frame.key === key ? frame : initial

  React.useEffect(() => {
    const element = root.current
    const split = (JSON.parse(source) as string[]).map(graphemes)
    const count = split.length
    if (!element || count < 2) return
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    let pos: Position = { index: 0, shown: split[0].length, phase: "hold" }
    let timer: ReturnType<typeof setTimeout> | undefined
    let started = trigger === "mount", visible = false
    const running = () => started && visible && !document.hidden && !motion.matches
    const goal = () => smart ? sharedPrefix(split[pos.index], split[(pos.index + 1) % count]) : 0
    function delay() {
      if (pos.phase === "hold") return !loop && pos.index === count - 1 ? null : holdMs
      return pos.phase === "delete" ? deleteMs : typeMs
    }
    function advance() {
      timer = undefined
      if (pos.phase === "type") {
        const shown = pos.shown + 1
        pos = { ...pos, shown, phase: shown >= split[pos.index].length ? "hold" : "type" }
      } else if (pos.shown > goal()) {
        pos = { ...pos, shown: pos.shown - 1, phase: "delete" }
      } else {
        const index = (pos.index + 1) % count
        pos = { index, shown: pos.shown, phase: pos.shown < split[index].length ? "type" : "hold" }
      }
      setFrame({ key, ...pos })
      sync()
    }
    function sync() {
      if (!running()) { clearTimeout(timer); timer = undefined; return }
      const next = timer ? null : delay()
      if (next !== null) timer = setTimeout(advance, next)
    }
    function settle() {
      if (motion.matches) { pos = { index: 0, shown: split[0].length, phase: "hold" }; setFrame({ key, ...pos }) }
      sync()
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (entry.intersectionRatio >= .3) started = true
      sync()
    }, { threshold: [0, .3] })
    observer.observe(element)
    document.addEventListener("visibilitychange", sync)
    motion.addEventListener("change", settle)
    return () => {
      clearTimeout(timer)
      observer.disconnect()
      document.removeEventListener("visibilitychange", sync)
      motion.removeEventListener("change", settle)
    }
  }, [source, key, typeMs, deleteMs, holdMs, loop, smart, trigger])

  const setRoot = React.useCallback((node: HTMLElement | null) => { root.current = node }, [])
  const shape = caret === "line" ? "line" : "block"
  const text = (split[position.index] ?? []).slice(0, position.shown).join("")
  return (
    <Tag ref={setRoot} {...props} className={cn("wlkr-typewriter", className)} data-reserve={reserve} data-block={Tag !== "span"}>
      <style>{styles}</style>
      <span className="wlkr-typewriter-sr">{label ?? list[0] ?? ""}</span>
      {reserve && list.map((phrase, index) => (
        <span key={index} className="wlkr-typewriter-layer wlkr-typewriter-sizer" aria-hidden="true">
          {phrase}{caret !== "none" && <span className="wlkr-typewriter-caret" data-shape={shape} data-solid="true" />}
        </span>
      ))}
      <span className="wlkr-typewriter-layer" aria-hidden="true">
        {text}{caret !== "none" && <span className="wlkr-typewriter-caret" data-shape={shape} data-solid={position.phase !== "hold"} />}
      </span>
    </Tag>
  )
}
