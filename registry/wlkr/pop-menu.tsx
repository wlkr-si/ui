"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type PopMenuAction = {
  id: string
  label: string
  shortcut?: string
  disabled?: boolean
  danger?: boolean
  onSelect?: () => void
}

export type PopMenuItem = PopMenuAction | { separator: true }

export type PopMenuProps = Omit<React.ComponentPropsWithoutRef<"div">, "children"> & {
  /** Text on the trigger. */
  label: React.ReactNode
  items: PopMenuItem[]
  /** Which edge of the trigger the menu lines up with. */
  align?: "start" | "end"
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

const styles = `
.wlkr-pop-menu{position:relative;display:inline-block;font:inherit}
.wlkr-pop-menu-trigger{display:inline-flex;align-items:center;gap:.6em;height:2.25rem;padding:0 .8rem;border:1px solid var(--foreground,currentColor);border-radius:0;background:var(--background,#fff);color:var(--foreground,currentColor);font:inherit;font-size:.875rem;line-height:1;cursor:pointer}
.wlkr-pop-menu-trigger:hover,.wlkr-pop-menu-trigger[aria-expanded=true]{background:var(--foreground,currentColor);color:var(--background,#fff)}
.wlkr-pop-menu-trigger:focus-visible,.wlkr-pop-menu-item:focus-visible{outline:2px solid var(--brand,#33f282);outline-offset:2px}
.wlkr-pop-menu-chevron{flex:none;width:8px;height:5px;fill:currentColor;shape-rendering:crispEdges}
@media(prefers-reduced-motion:no-preference){.wlkr-pop-menu-chevron{transition:transform 120ms steps(2,end)}}
.wlkr-pop-menu-trigger[aria-expanded=true] .wlkr-pop-menu-chevron{transform:rotate(180deg)}
.wlkr-pop-menu-list{position:absolute;top:calc(100% + 4px);left:0;z-index:50;box-sizing:border-box;min-width:12rem;max-width:min(18rem,calc(100vw - 32px));margin:0;padding:4px;list-style:none;border:1px solid var(--foreground,currentColor);border-radius:0;background:var(--background,#fff);color:var(--foreground,currentColor);box-shadow:none}
.wlkr-pop-menu[data-align=end] .wlkr-pop-menu-list{left:auto;right:0}
.wlkr-pop-menu-item{display:flex;align-items:center;justify-content:space-between;gap:1.5rem;padding:.45rem .6rem;border-radius:0;font-size:.875rem;line-height:1.25;cursor:pointer;user-select:none;outline:none}
.wlkr-pop-menu-item[data-active=true]{background:var(--foreground,currentColor);color:var(--background,#fff)}
.wlkr-pop-menu-item[data-active=true] .wlkr-pop-menu-key{color:inherit}
.wlkr-pop-menu-item[data-danger=true]:not([data-active=true]){color:var(--destructive,#b42318)}
.wlkr-pop-menu-item[aria-disabled=true]{color:var(--muted-foreground,#6b6b6b);cursor:default}
.wlkr-pop-menu-key{font-family:var(--font-mono,ui-monospace,monospace);font-size:.75rem;color:var(--muted-foreground,#6b6b6b)}
.wlkr-pop-menu-sep{height:1px;margin:4px 0;background:var(--border,currentColor)}
@keyframes wlkr-pop-menu-in{0%{opacity:0;clip-path:inset(0 0 100% 0)}100%{opacity:1;clip-path:inset(0)}}
@media(prefers-reduced-motion:no-preference){
.wlkr-pop-menu-list>li{animation:wlkr-pop-menu-in 120ms steps(3,end) both;animation-delay:calc(var(--wlkr-pop-menu-i,0) * 35ms)}
}
`

const isAction = (item: PopMenuItem): item is PopMenuAction => !("separator" in item)

/** A square button that drops a flat, outlined menu. Rows step in from the top. */
export function PopMenu({ label, items, align = "start", open, defaultOpen = false, onOpenChange, className, ...props }: PopMenuProps) {
  const uid = React.useId()
  const triggerId = `${uid}-trigger`
  const menuId = `${uid}-menu`
  const [innerOpen, setInnerOpen] = React.useState(defaultOpen)
  const [active, setActive] = React.useState(-1)
  const isOpen = open ?? innerOpen
  const rootRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const itemRefs = React.useRef<(HTMLLIElement | null)[]>([])

  const enabled = items.flatMap((item, i) => (isAction(item) && !item.disabled ? [i] : []))

  const setOpen = React.useCallback((next: boolean) => {
    if (open === undefined) setInnerOpen(next)
    onOpenChange?.(next)
  }, [open, onOpenChange])

  const close = React.useCallback((returnFocus: boolean) => {
    setOpen(false)
    setActive(-1)
    if (returnFocus) triggerRef.current?.focus()
  }, [setOpen])

  React.useEffect(() => {
    if (isOpen && active >= 0) itemRefs.current[active]?.focus()
  }, [isOpen, active])

  React.useEffect(() => {
    if (!isOpen) return
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) close(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [isOpen, close])

  const openAt = (index: number) => {
    setOpen(true)
    setActive(index)
  }

  const onTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
      event.preventDefault()
      openAt(enabled[0] ?? -1)
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      openAt(enabled[enabled.length - 1] ?? -1)
    }
  }

  const select = (item: PopMenuAction) => {
    if (item.disabled) return
    item.onSelect?.()
    close(true)
  }

  const onMenuKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    const pos = enabled.indexOf(active)
    const move = (index: number | undefined) => {
      event.preventDefault()
      if (index !== undefined) setActive(index)
    }
    switch (event.key) {
      case "ArrowDown": return move(enabled[(pos + 1) % enabled.length])
      case "ArrowUp": return move(enabled[(pos - 1 + enabled.length) % enabled.length])
      case "Home": return move(enabled[0])
      case "End": return move(enabled[enabled.length - 1])
      case "Escape": event.preventDefault(); return close(true)
      case "Tab": triggerRef.current?.focus(); return close(false)
      case "Enter":
      case " ": {
        event.preventDefault()
        const item = items[active]
        if (item && isAction(item)) select(item)
        return
      }
    }
    if (event.key.length === 1 && /\S/.test(event.key) && !event.metaKey && !event.ctrlKey && !event.altKey) {
      const char = event.key.toLowerCase()
      const order = [...enabled.slice(pos + 1), ...enabled.slice(0, pos + 1)]
      const hit = order.find(i => {
        const item = items[i]
        return isAction(item) && item.label.trim().toLowerCase().startsWith(char)
      })
      if (hit !== undefined) move(hit)
    }
  }

  let row = 0
  return (
    <div {...props} ref={rootRef} className={cn("wlkr-pop-menu", className)} data-align={align === "end" ? "end" : "start"}>
      <style>{styles}</style>
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        className="wlkr-pop-menu-trigger"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={() => (isOpen ? close(true) : openAt(-1))}
        onKeyDown={onTriggerKeyDown}
      >
        <span>{label}</span>
        <svg className="wlkr-pop-menu-chevron" viewBox="0 0 8 5" aria-hidden="true">
          <rect x="0" y="0" width="2" height="1" /><rect x="6" y="0" width="2" height="1" />
          <rect x="1" y="1" width="2" height="1" /><rect x="5" y="1" width="2" height="1" />
          <rect x="2" y="2" width="4" height="1" /><rect x="3" y="3" width="2" height="2" />
        </svg>
      </button>
      {isOpen && (
        <ul id={menuId} role="menu" aria-labelledby={triggerId} className="wlkr-pop-menu-list" onKeyDown={onMenuKeyDown}>
          {items.map((item, i) => {
            const style = { "--wlkr-pop-menu-i": row++ } as React.CSSProperties
            if (!isAction(item)) return <li key={`sep-${i}`} role="separator" className="wlkr-pop-menu-sep" style={style} />
            return (
              <li
                key={item.id}
                ref={el => { itemRefs.current[i] = el }}
                role="menuitem"
                tabIndex={-1}
                className="wlkr-pop-menu-item"
                style={style}
                aria-disabled={item.disabled || undefined}
                data-danger={item.danger || undefined}
                data-active={active === i || undefined}
                onPointerMove={() => { if (!item.disabled && active !== i) setActive(i) }}
                onClick={() => select(item)}
              >
                <span>{item.label}</span>
                {item.shortcut && <kbd className="wlkr-pop-menu-key">{item.shortcut}</kbd>}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
