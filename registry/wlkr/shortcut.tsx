"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type ShortcutProps = Omit<React.ComponentProps<"kbd">, "children"> & {
  /** A combo such as `"mod+k"`, `"shift+?"` or `"escape"`. `mod` is ⌘ on Apple platforms, Ctrl elsewhere. */
  keys: string
  /** When given, the combo is listened for on `window` and this runs each time it lands. */
  onTrigger?: (event: KeyboardEvent) => void
  /** Cancel the browser's default for the combo. Defaults to true when `onTrigger` is set. */
  preventDefault?: boolean
  /** Also fire while typing in a field. Combos with mod, ctrl or alt always fire. */
  allowInInputs?: boolean
  disabled?: boolean
  size?: "sm" | "md"
}

const styles = `
.wlkr-shortcut{display:inline-flex;align-items:flex-start;gap:4px;height:24px;vertical-align:middle;font:inherit;font-size:12px;font-weight:500;line-height:1;font-variant-numeric:tabular-nums;color:var(--muted-foreground,#696969)}
.wlkr-shortcut[data-size=sm]{height:20px;gap:3px;font-size:11px}
.wlkr-shortcut-key{position:relative;display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;height:22px;min-width:24px;padding:0 5px;font:inherit;color:inherit;background:var(--background,#fff);border:1px solid var(--border,#dedede);border-radius:2px;white-space:nowrap;transition:transform 70ms cubic-bezier(.2,.7,.2,1),color 70ms ease,background-color 160ms ease,border-color 160ms ease}
.wlkr-shortcut[data-size=sm] .wlkr-shortcut-key{height:18px;min-width:20px;padding:0 4px}
.wlkr-shortcut-key::after{content:"";position:absolute;left:-1px;right:-1px;bottom:-3px;height:2px;background:var(--border,#dedede);border-radius:0 0 2px 2px;transform-origin:top;transition:transform 70ms cubic-bezier(.2,.7,.2,1),background-color 160ms ease}
.wlkr-shortcut-key[data-pressed=true]{transform:translateY(2px);color:var(--foreground,currentColor)}
.wlkr-shortcut-key[data-pressed=true]::after{transform:scaleY(0)}
.wlkr-shortcut[data-triggered=true] .wlkr-shortcut-key{background:var(--brand,#33f282);border-color:var(--brand,#33f282);color:var(--brand-foreground,#010101);transition-duration:70ms}
.wlkr-shortcut[data-triggered=true] .wlkr-shortcut-key::after{background:var(--brand,#33f282)}
.wlkr-shortcut-sr{position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@media(prefers-reduced-motion:reduce){.wlkr-shortcut-key,.wlkr-shortcut-key::after{transition:none}.wlkr-shortcut-key[data-pressed=true]{transform:none}.wlkr-shortcut-key[data-pressed=true]::after{transform:none}}
`

const modifierKeys: Record<string, string> = { meta: "Meta", ctrl: "Control", alt: "Alt", shift: "Shift" }
const aliases: Record<string, string> = { cmd: "meta", command: "meta", control: "ctrl", option: "alt", opt: "alt", esc: "escape", return: "enter", up: "arrowup", down: "arrowdown", left: "arrowleft", right: "arrowright", del: "delete" }
const symbols: Record<string, [string, string]> = {
  shift: ["⇧", "Shift"], enter: ["↵", "Enter"], backspace: ["⌫", "Backspace"], tab: ["⇥", "Tab"], escape: ["Esc", "Escape"],
  arrowup: ["↑", "Up arrow"], arrowdown: ["↓", "Down arrow"], arrowleft: ["←", "Left arrow"], arrowright: ["→", "Right arrow"],
  "?": ["?", "Question mark"], "/": ["/", "Slash"], ".": [".", "Period"], ",": [",", "Comma"], "+": ["+", "Plus"], "-": ["-", "Minus"],
}

function parse(keys: string, apple: boolean) {
  const parts = String(keys ?? "").toLowerCase().replace(/\s+/g, "").split("+")
  const tokens: string[] = []
  parts.forEach((part, index) => {
    if (part) tokens.push(part === "mod" ? (apple ? "meta" : "ctrl") : aliases[part] ?? part)
    else if (index === parts.length - 1 && index > 0) tokens.push("+")
  })
  return [...new Set(tokens)].slice(0, 8)
}

function label(token: string, apple: boolean): [string, string?] {
  if (token === "meta") return ["⌘", "Command"]
  if (token === "ctrl") return apple ? ["⌃", "Control"] : ["Ctrl"]
  if (token === "alt") return apple ? ["⌥", "Option"] : ["Alt"]
  if (token === "space") return ["Space"]
  return symbols[token] ?? [token.length === 1 ? token.toUpperCase() : token[0].toUpperCase() + token.slice(1)]
}

function matchesKey(event: KeyboardEvent, key: string) {
  const pressed = typeof event.key === "string" ? event.key.toLowerCase() : ""
  if (pressed === key || (key === "space" && pressed === " ")) return true
  if (/^[a-z0-9]$/.test(pressed)) return false
  if (/^[a-z]$/.test(key)) return event.code === `Key${key.toUpperCase()}`
  return /^[0-9]$/.test(key) && event.code === `Digit${key}`
}

function isEditable(target: EventTarget | null) {
  return target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
}

const subscribe = () => () => {}
function detectApple() {
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } }
  return /mac|iphone|ipad|ipod/i.test(nav.userAgentData?.platform || nav.platform || nav.userAgent)
}

/** Live keycaps: platform-correct symbols that press with the real keys and flash when the combo lands. */
export function Shortcut({ keys, onTrigger, preventDefault, allowInInputs = false, disabled = false, size = "md", className, ...props }: ShortcutProps) {
  const apple = React.useSyncExternalStore(subscribe, detectApple, () => false)
  const tokens = React.useMemo(() => parse(keys, apple), [keys, apple])
  const [pressed, setPressed] = React.useState(0)
  const [triggered, setTriggered] = React.useState(false)
  const triggerRef = React.useRef(onTrigger)
  const flashTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const hasTrigger = Boolean(onTrigger)
  const cancelDefault = preventDefault ?? hasTrigger

  React.useEffect(() => { triggerRef.current = onTrigger })
  React.useEffect(() => () => clearTimeout(flashTimer.current), [])

  React.useEffect(() => {
    if (disabled || tokens.length === 0) return
    const main = tokens.find(token => !(token in modifierKeys))
    const strong = tokens.some(token => token === "meta" || token === "ctrl" || token === "alt")
    const shiftImplied = main !== undefined && main.length === 1 && !/[a-z0-9]/.test(main)
    let releaseTimer: ReturnType<typeof setTimeout> | undefined
    const clearAll = () => { clearTimeout(releaseTimer); setPressed(0) }
    const capIndex = (event: KeyboardEvent) => {
      const modifier = Object.keys(modifierKeys).find(name => modifierKeys[name] === event.key)
      if (modifier) return tokens.indexOf(modifier)
      return main !== undefined && matchesKey(event, main) ? tokens.indexOf(main) : -1
    }
    const comboMatches = (event: KeyboardEvent) => main !== undefined && matchesKey(event, main)
      && event.metaKey === tokens.includes("meta") && event.ctrlKey === tokens.includes("ctrl") && event.altKey === tokens.includes("alt")
      && (event.shiftKey === tokens.includes("shift") || (shiftImplied && !tokens.includes("shift")))
    const down = (event: KeyboardEvent) => {
      if (event.isComposing || document.visibilityState !== "visible") return
      if (!allowInInputs && !strong && isEditable(event.target)) return
      const index = capIndex(event)
      if (index >= 0) {
        setPressed(bits => bits | (1 << index))
        if (tokens[index] === main) {
          clearTimeout(releaseTimer)
          releaseTimer = setTimeout(() => setPressed(bits => bits & ~(1 << index)), 1000)
        }
      }
      if (!hasTrigger || !comboMatches(event)) return
      if (cancelDefault) event.preventDefault()
      if (event.repeat) return
      setTriggered(true)
      clearTimeout(flashTimer.current)
      flashTimer.current = setTimeout(() => setTriggered(false), 450)
      triggerRef.current?.(event)
    }
    const up = (event: KeyboardEvent) => {
      if (event.key === "Meta") return clearAll()
      const index = capIndex(event)
      if (index >= 0) setPressed(bits => bits & ~(1 << index))
    }
    window.addEventListener("keydown", down)
    window.addEventListener("keyup", up)
    window.addEventListener("blur", clearAll)
    document.addEventListener("visibilitychange", clearAll)
    return () => {
      window.removeEventListener("keydown", down)
      window.removeEventListener("keyup", up)
      window.removeEventListener("blur", clearAll)
      document.removeEventListener("visibilitychange", clearAll)
      clearAll()
    }
  }, [tokens, disabled, allowInInputs, hasTrigger, cancelDefault])

  return (
    <kbd className={cn("wlkr-shortcut", className)} data-size={size === "sm" ? "sm" : "md"} data-triggered={!disabled && triggered} {...props}>
      <style>{styles}</style>
      {tokens.map((token, index) => {
        const [glyph, name] = label(token, apple)
        return <React.Fragment key={token}>
          {index > 0 && " "}
          <kbd className="wlkr-shortcut-key" data-pressed={!disabled && (pressed & (1 << index)) !== 0}>
            {name ? <><span aria-hidden="true">{glyph}</span><span className="wlkr-shortcut-sr">{name}</span></> : glyph}
          </kbd>
        </React.Fragment>
      })}
    </kbd>
  )
}
