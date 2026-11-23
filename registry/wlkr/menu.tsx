"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { Slot } from "radix-ui"
import { Button } from "@/registry/wlkr/button"
import { cn } from "@/lib/utils"

export type MenuItem = { id: string; label: React.ReactNode; icon?: React.ReactNode; disabled?: boolean; onSelect?: () => void; type?: "item" } | { id: string; type: "separator" }
export type MenuProps = Omit<React.ComponentProps<"span">, "children"> & {
  trigger?: React.ReactElement
  items: MenuItem[]
  align?: "start" | "end"
  label?: string
}

const styles = `
.wlkr-menu{position:relative;display:inline-flex;max-width:100%}
.wlkr-menu-trigger:focus-visible{outline:2px solid var(--brand,#33f282);outline-offset:2px}
.wlkr-menu-popup{box-sizing:border-box;position:absolute;right:0;top:calc(100% + 6px);z-index:25;min-width:168px;max-width:min(320px,calc(100vw - 32px));max-height: min(360px,60vh);overflow:auto;padding:4px;background:var(--popover,#fff);border:1px solid var(--border,#dedede);border-radius:8px;box-shadow:var(--wlkr-menu-shadow,0 16px 40px rgb(0 0 0 / 55%));opacity:0;visibility:hidden;transform:translateY(-2px) scale(.97);transform-origin:top right;pointer-events:none;transition:opacity 150ms cubic-bezier(.23,1,.32,1),transform 150ms cubic-bezier(.23,1,.32,1),visibility 150ms}
.wlkr-menu[data-align=start] .wlkr-menu-popup{right:auto;left:0;transform-origin:top left}.wlkr-menu[data-open=true] .wlkr-menu-popup{opacity:1;visibility:visible;transform:none;pointer-events:auto}
.wlkr-menu-item{box-sizing:border-box;display:flex;align-items:center;gap:10px;width:100%;min-height:32px;padding:6px 10px;border:0;border-radius:4px;background:transparent;font-family:inherit;font-weight:500;font-size:12.5px;line-height:1.4;color:color-mix(in srgb,var(--foreground,#010101) 85%,var(--background,#fff));cursor:pointer;text-align:left;overflow-wrap:anywhere}
.wlkr-menu-item:focus-visible{outline:none;background:color-mix(in srgb,var(--foreground,#010101) 10%,transparent);color:var(--foreground,#010101)}.wlkr-menu-item:disabled{opacity:.4;cursor:default}.wlkr-menu-icon{display:inline-flex;flex:none;color:var(--muted-foreground,#696969)}.wlkr-menu-icon svg{width:14px;height:14px}.wlkr-menu-separator{border:0;border-top:1px solid var(--border,#dedede);margin:4px 2px}
@media(hover:hover) and (pointer:fine){.wlkr-menu-item:not(:disabled):hover{background:color-mix(in srgb,var(--foreground,#010101) 10%,transparent);color:var(--foreground,#010101)}}
@media(prefers-reduced-motion:reduce){.wlkr-menu-popup{transition:none}}
`

export function Menu({ trigger, items, align = "end", label, className, ref, ...props }: MenuProps) {
  const id = React.useId()
  const [open, setOpen] = React.useState(false)
  const root = React.useRef<HTMLSpanElement>(null)
  const triggerRef = React.useRef<HTMLElement>(null)
  const popup = React.useRef<HTMLDivElement>(null)
  const initial = React.useRef(0)
  const search = React.useRef({ text: "", time: 0 })
  const buttons = React.useCallback(() => Array.from(popup.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)') ?? []), [])
  React.useEffect(() => {
    if (!open) return
    const available = buttons()
    const target = initial.current === -1 ? available.at(-1) : available[0]
    ;(target ?? popup.current)?.focus()
    function outside(event: Event) {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener("pointerdown", outside)
    document.addEventListener("focusin", outside)
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("focusin", outside) }
  }, [open, buttons])
  function close() { setOpen(false); triggerRef.current?.focus() }
  return <><style>{styles}</style><span {...props} ref={node => {
    root.current = node
    if (typeof ref === "function") return ref(node)
    if (ref) ref.current = node
  }} className={cn("wlkr-menu", className)} data-align={align} data-open={open}>
    <Slot.Root ref={triggerRef} id={`${id}-trigger`} className="wlkr-menu-trigger" aria-haspopup="menu" aria-expanded={open} aria-controls={`${id}-popup`} onClick={event => { if (event.defaultPrevented) return; initial.current = 0; setOpen(!open) }} onKeyDown={event => {
      if (event.defaultPrevented) return
      if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); initial.current = event.key === "ArrowUp" ? -1 : 0; setOpen(true) }
      if (event.key === "Escape" && open) { event.preventDefault(); close() }
    }}>
      {trigger ?? <Button variant="outline">Actions<ChevronDown aria-hidden="true" /></Button>}
    </Slot.Root>
    <div ref={popup} id={`${id}-popup`} role="menu" aria-label={label} aria-labelledby={label ? undefined : `${id}-trigger`} className="wlkr-menu-popup" inert={!open} tabIndex={-1} onKeyDown={event => {
      const available = buttons()
      const index = available.indexOf(document.activeElement as HTMLButtonElement)
      let next: number | undefined
      if (event.key === "ArrowDown") next = (index + 1) % available.length
      if (event.key === "ArrowUp") next = (index - 1 + available.length) % available.length
      if (event.key === "Home") next = 0
      if (event.key === "End") next = available.length - 1
      if (next !== undefined) { event.preventDefault(); available[next]?.focus() }
      else if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close() }
      else if (event.key === "Tab") close()
      else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault()
        const now = Date.now()
        search.current = { text: (now - search.current.time < 700 ? search.current.text : "") + event.key.toLocaleLowerCase(), time: now }
        const text = search.current.text
        const term = [...text].every(char => char === text[0]) ? text[0] : text
        const ordered = [...available.slice(index + 1), ...available.slice(0, index + 1)]
        ordered.find(button => button.textContent?.trim().toLocaleLowerCase().startsWith(term))?.focus()
      }
    }}>
      {items.map(item => item.type === "separator" ? <hr key={item.id} role="separator" className="wlkr-menu-separator" /> : <button key={item.id} type="button" role="menuitem" tabIndex={-1} disabled={item.disabled} className="wlkr-menu-item" onClick={() => { close(); item.onSelect?.() }}>{item.icon && <span className="wlkr-menu-icon" aria-hidden="true">{item.icon}</span>}{item.label}</button>)}
    </div>
  </span></>
}
