"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const DEFAULT_CHARACTERS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.:-/"

export type SplitFlapProps = Omit<React.ComponentPropsWithoutRef<"span">, "children"> & {
  /** Text to show. Uppercased; characters outside the set render as a space. */
  value: string
  /** Fixed number of cells. Pads with spaces or truncates. Defaults to the value's length. */
  length?: number
  /** Milliseconds per flap step. */
  speed?: number
  /** Milliseconds between each cell starting, left to right. */
  stagger?: number
  /** The ordered set each cell cycles through. The first character is the blank. */
  characters?: string
  size?: "sm" | "md" | "lg"
  /** Flash the last cell to settle in WLKR green. */
  accent?: boolean
  /** Announce the new value to assistive technology. */
  announce?: boolean
}

type Board = { chars: string[]; flips: number[]; accent: number }

const styles = `
.wlkr-split-flap{position:relative;display:inline-flex;gap:var(--wlkr-split-flap-gap);max-width:100%;--wlkr-split-flap-cell:clamp(1.25rem,6.5vw,2rem);--wlkr-split-flap-gap:2px;font-family:var(--font-mono,ui-monospace,monospace);vertical-align:middle}
.wlkr-split-flap[data-size=sm]{--wlkr-split-flap-cell:clamp(.9rem,4.5vw,1.375rem);--wlkr-split-flap-gap:1px}
.wlkr-split-flap[data-size=lg]{--wlkr-split-flap-cell:clamp(1.5rem,8vw,2.75rem);--wlkr-split-flap-gap:3px}
.wlkr-split-flap-cell{position:relative;display:inline-flex;flex:none;align-items:center;justify-content:center;box-sizing:border-box;width:var(--wlkr-split-flap-cell);height:calc(var(--wlkr-split-flap-cell) * 1.3);border-radius:0;background:var(--foreground,currentColor);color:var(--background,#fff);font-size:calc(var(--wlkr-split-flap-cell) * .72);font-weight:500;line-height:1;overflow:hidden}
.wlkr-split-flap-cell::after{content:"";position:absolute;left:0;right:0;top:50%;height:1px;margin-top:-.5px;background:var(--background,#fff)}
.wlkr-split-flap-cell[data-accent]{background:var(--brand,#33f282);color:#000}
.wlkr-split-flap-glyph{display:block;transform-origin:50% 50%}
.wlkr-split-flap-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@keyframes wlkr-split-flap-a{0%{transform:scaleY(1)}50%{transform:scaleY(.2)}100%{transform:scaleY(1)}}
@keyframes wlkr-split-flap-b{0%{transform:scaleY(1)}50%{transform:scaleY(.2)}100%{transform:scaleY(1)}}
.wlkr-split-flap-glyph[data-flip=a]{animation:wlkr-split-flap-a var(--wlkr-split-flap-speed) steps(2,end)}
.wlkr-split-flap-glyph[data-flip=b]{animation:wlkr-split-flap-b var(--wlkr-split-flap-speed) steps(2,end)}
@media(prefers-reduced-motion:reduce){.wlkr-split-flap-glyph[data-flip]{animation:none}}
`

function normalize(value: string, cells: number, characters: string): string[] {
  const upper = value.toUpperCase()
  const out: string[] = []
  for (let i = 0; i < cells; i++) {
    const ch = upper[i] ?? " "
    out.push(characters.includes(ch) ? ch : characters[0] ?? " ")
  }
  return out
}

/** A departure-board row. Each cell flaps forward through the alphabet until it lands. */
export function SplitFlap({
  value,
  length,
  speed = 45,
  stagger = 40,
  characters = DEFAULT_CHARACTERS,
  size = "md",
  accent = false,
  announce = false,
  className,
  style,
  ...props
}: SplitFlapProps) {
  const set = characters.length > 0 ? characters : DEFAULT_CHARACTERS
  const cells = Math.max(0, Math.floor(length ?? value.length))
  const targetKey = normalize(value, cells, set).join("")
  const [board, setBoard] = React.useState<Board>(() => ({
    chars: targetKey.split(""),
    flips: targetKey.split("").map(() => 0),
    accent: -1,
  }))
  const boardRef = React.useRef<Board>(board)

  React.useEffect(() => {
    const target = targetKey.split("")
    const prev = boardRef.current
    let chars = target.map((_, i) => prev.chars[i] ?? set[0] ?? " ")
    let flips = target.map((_, i) => prev.flips[i] ?? 0)
    const commit = (next: Board) => {
      boardRef.current = next
      setBoard(next)
    }
    const timers: ReturnType<typeof setTimeout>[] = []
    let interval: ReturnType<typeof setInterval> | undefined

    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce || chars.join("") === targetKey) {
      timers.push(setTimeout(() => commit({ chars: target, flips, accent: -1 }), 0))
      return () => timers.forEach(clearTimeout)
    }

    const start = performance.now()
    const step = Math.max(16, speed)
    interval = setInterval(() => {
      const elapsed = performance.now() - start
      let last = -1
      const nextChars = chars.slice()
      const nextFlips = flips.slice()
      for (let i = 0; i < target.length; i++) {
        if (nextChars[i] === target[i] || elapsed < i * Math.max(0, stagger)) continue
        const at = set.indexOf(nextChars[i])
        nextChars[i] = set[(at + 1) % set.length] ?? " "
        nextFlips[i] = (nextFlips[i] ?? 0) + 1
        if (nextChars[i] === target[i]) last = i
      }
      chars = nextChars
      flips = nextFlips
      const done = chars.every((ch, i) => ch === target[i])
      const accentAt = done && accent ? (last >= 0 ? last : boardRef.current.accent) : -1
      commit({ chars, flips, accent: accentAt })
      if (done) {
        if (interval !== undefined) clearInterval(interval)
        interval = undefined
        if (accentAt >= 0) timers.push(setTimeout(() => commit({ ...boardRef.current, accent: -1 }), 600))
      }
    }, step)

    return () => {
      if (interval !== undefined) clearInterval(interval)
      timers.forEach(clearTimeout)
    }
  }, [targetKey, set, speed, stagger, accent])

  const target = targetKey.split("")
  return (
    <span
      {...props}
      className={cn("wlkr-split-flap", className)}
      data-size={size === "sm" || size === "lg" ? size : "md"}
      style={{ ...style, ["--wlkr-split-flap-speed" as string]: `${Math.max(16, speed)}ms` }}
    >
      <style>{styles}</style>
      {target.map((goal, i) => {
        const ch = board.chars[i] ?? goal
        const flips = board.flips[i] ?? 0
        return (
          <span key={i} className="wlkr-split-flap-cell" aria-hidden="true" data-accent={board.accent === i ? "" : undefined}>
            <span className="wlkr-split-flap-glyph" data-flip={flips === 0 ? undefined : flips % 2 ? "a" : "b"}>
              {ch === " " ? " " : ch}
            </span>
          </span>
        )
      })}
      <span className="wlkr-split-flap-sr" aria-live={announce ? "polite" : undefined}>{value}</span>
    </span>
  )
}
