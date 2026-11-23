"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { Slot } from "radix-ui"
import { Button } from "@/registry/wlkr/button"
import { cn } from "@/lib/utils"

export type MenuSize = "xs" | "sm" | "default" | "lg"
export type MenuItem =
  | { id: string; label: React.ReactNode; icon?: React.ReactNode; disabled?: boolean; onSelect?: () => void; type?: "item" }
  | { id: string; type: "separator" }

export type MenuProps = Omit<React.ComponentProps<"span">, "children" | "dangerouslySetInnerHTML"> & {
  trigger?: React.ReactElement<{ id?: string }>
  items: readonly MenuItem[]
  size?: MenuSize
  align?: "start" | "end"
  label?: string
}

const styles = `
.wlkr-menu {
  --wlkr-menu-width: 208px;
  --wlkr-menu-max-width: 320px;
  --wlkr-menu-list-height: min(288px, 60vh);
  --wlkr-menu-h: var(--wlkr-control-h-md);
  --wlkr-menu-px: var(--wlkr-control-px-md);
  --wlkr-menu-text: var(--wlkr-control-text-md);
  --wlkr-menu-icon: var(--wlkr-control-icon-md);
  --wlkr-menu-gap: var(--wlkr-control-gap-md);
  position: relative;
  display: inline-flex;
  max-width: 100%;
}
.wlkr-menu[data-size=xs] {
  --wlkr-menu-h: var(--wlkr-control-h-xs);
  --wlkr-menu-px: var(--wlkr-control-px-xs);
  --wlkr-menu-text: var(--wlkr-control-text-xs);
  --wlkr-menu-icon: var(--wlkr-control-icon-xs);
  --wlkr-menu-gap: var(--wlkr-control-gap-xs);
}
.wlkr-menu[data-size=sm] {
  --wlkr-menu-h: var(--wlkr-control-h-sm);
  --wlkr-menu-px: var(--wlkr-control-px-sm);
  --wlkr-menu-text: var(--wlkr-control-text-sm);
  --wlkr-menu-icon: var(--wlkr-control-icon-sm);
  --wlkr-menu-gap: var(--wlkr-control-gap-sm);
}
.wlkr-menu[data-size=lg] {
  --wlkr-menu-h: var(--wlkr-control-h-lg);
  --wlkr-menu-px: var(--wlkr-control-px-lg);
  --wlkr-menu-text: var(--wlkr-control-text-lg);
  --wlkr-menu-icon: var(--wlkr-control-icon-lg);
  --wlkr-menu-gap: var(--wlkr-control-gap-lg);
}

.wlkr-menu-trigger:focus-visible, .wlkr-menu-popup:focus-visible {
  outline: var(--wlkr-focus-width) solid var(--wlkr-focus-ring);
  outline-offset: var(--wlkr-focus-offset);
}

.wlkr-menu-popup {
  box-sizing: border-box;
  position: absolute;
  display: block;
  inset-inline-end: 0;
  top: calc(100% + var(--wlkr-space-1_5));
  z-index: var(--wlkr-z-overlay);
  width: max-content;
  min-width: min(var(--wlkr-menu-width), 100vw - var(--wlkr-space-8));
  max-width: min(var(--wlkr-menu-max-width), 100vw - var(--wlkr-space-8));
  max-height: var(--wlkr-menu-list-height);
  overflow: auto;
  padding: var(--wlkr-space-1);
  background: var(--wlkr-surface-overlay);
  border: var(--wlkr-control-border) solid var(--wlkr-border-default);
  border-radius: var(--wlkr-radius-lg);
  box-shadow: var(--wlkr-shadow-overlay);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translateY(calc(-1 * var(--wlkr-space-0_5)));
  transition: opacity var(--wlkr-duration-base) var(--wlkr-ease-out), transform var(--wlkr-duration-base) var(--wlkr-ease-out), visibility var(--wlkr-duration-base) var(--wlkr-ease-out);
}
.wlkr-menu[data-align=start] .wlkr-menu-popup {
  inset-inline-start: 0;
  inset-inline-end: auto;
}
.wlkr-menu[data-open=true] .wlkr-menu-popup {
  opacity: 1;
  visibility: visible;
  transform: none;
  pointer-events: auto;
  /* Make items focusable immediately while opacity and position animate in. */
  transition-property: opacity, transform;
}
.wlkr-menu-item {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: var(--wlkr-menu-gap);
  width: 100%;
  min-height: var(--wlkr-menu-h);
  padding: var(--wlkr-space-0_5) var(--wlkr-menu-px);
  border: 0;
  border-radius: var(--wlkr-radius-md);
  background: transparent;
  color: var(--wlkr-content-secondary);
  font-family: inherit;
  font-weight: var(--wlkr-weight-medium);
  font-size: var(--wlkr-menu-text);
  line-height: 1.25;
  text-align: start;
  overflow-wrap: anywhere;
  cursor: pointer;
  transition: transform var(--wlkr-duration-fast) var(--wlkr-ease-out);
}
.wlkr-menu-item:focus {
  outline: none;
  background: var(--wlkr-fill-hover);
}
.wlkr-menu-item:not([aria-disabled=true]):active { transform: scale(var(--wlkr-press-scale)); }
.wlkr-menu-item[aria-disabled=true] { opacity: var(--wlkr-disabled-opacity); cursor: default; }
.wlkr-menu-icon { display: inline-flex; flex: none; }
.wlkr-menu-icon svg { width: var(--wlkr-menu-icon); height: var(--wlkr-menu-icon); }
.wlkr-menu-separator {
  display: block;
  border-top: var(--wlkr-control-border) solid var(--wlkr-border-subtle);
  margin: var(--wlkr-space-1) var(--wlkr-space-0_5);
}

@media (hover: hover) and (pointer: fine) {
  .wlkr-menu-popup:not(:has(.wlkr-menu-item:focus)) .wlkr-menu-item:not([aria-disabled=true]):hover { background: var(--wlkr-fill-hover); }
}
@media (prefers-reduced-motion: reduce) {
  .wlkr-menu-popup, .wlkr-menu-item { transition: none; }
  .wlkr-menu-popup, .wlkr-menu-item:not([aria-disabled=true]):active { transform: none; }
}
`

function menuItems(popup: HTMLSpanElement | null) {
  return Array.from(popup?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? [])
}

function focusMenuEdge(popup: HTMLSpanElement | null, edge: "first" | "last") {
  const rows = menuItems(popup)
  const target = edge === "first" ? rows[0] : rows.at(-1)
  const focusTarget = target ?? popup
  focusTarget?.focus()
}

export function Menu({ trigger, items, size = "default", align = "end", label, className, ref, ...props }: MenuProps) {
  const id = React.useId()
  const triggerId = trigger?.props.id ?? `${id}-trigger`
  const [open, setOpen] = React.useState(false)
  const root = React.useRef<HTMLSpanElement>(null)
  const triggerRef = React.useRef<HTMLElement>(null)
  const popup = React.useRef<HTMLSpanElement>(null)
  const openAt = React.useRef<"first" | "last">("first")
  const search = React.useRef({ text: "", time: 0 })

  React.useLayoutEffect(() => {
    if (open) focusMenuEdge(popup.current, openAt.current)
  }, [open])

  React.useEffect(() => {
    if (!open) return
    function dismissOutside(event: Event) {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener("pointerdown", dismissOutside)
    document.addEventListener("focusin", dismissOutside)
    return () => {
      document.removeEventListener("pointerdown", dismissOutside)
      document.removeEventListener("focusin", dismissOutside)
    }
  }, [open])

  function show(at: "first" | "last") {
    openAt.current = at
    search.current = { text: "", time: 0 }
    setOpen(true)
  }

  function close() {
    setOpen(false)
    triggerRef.current?.focus()
  }

  function handleTriggerKey(event: React.KeyboardEvent) {
    if (event.defaultPrevented || event.currentTarget.getAttribute("aria-disabled") === "true") return
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault()
      const at = event.key === "ArrowUp" ? "last" : "first"
      if (open) focusMenuEdge(popup.current, at)
      else show(at)
    } else if (event.key === "Escape" && open) {
      event.preventDefault()
      event.stopPropagation()
      close()
    }
  }

  function handleMenuKey(event: React.KeyboardEvent<HTMLSpanElement>) {
    if (event.key === "Escape") {
      event.preventDefault()
      event.stopPropagation()
      close()
      return
    }
    if (event.key === "Tab") {
      close()
      return
    }

    const rows = menuItems(popup.current)
    if (!rows.length) return

    const index = rows.findIndex(row => row === document.activeElement)
    let next: HTMLButtonElement | undefined
    if (event.key === "ArrowDown") {
      next = rows[(index + 1) % rows.length]
    } else if (event.key === "ArrowUp") {
      next = index < 0 ? rows.at(-1) : rows[(index - 1 + rows.length) % rows.length]
    } else if (event.key === "Home") {
      next = rows[0]
    } else if (event.key === "End") {
      next = rows.at(-1)
    } else if (event.key !== " " && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey && !event.nativeEvent.isComposing) {
      const now = Date.now()
      const prior = now - search.current.time < 700 ? search.current.text : ""
      const typed = prior + event.key.toLocaleLowerCase()
      search.current = { text: typed, time: now }
      const term = [...typed].every(char => char === typed[0]) ? typed[0] : typed
      const ordered = [...rows.slice(index + 1), ...rows.slice(0, index + 1)]
      next = ordered.find(row => row.querySelector(".wlkr-menu-label")?.textContent?.trim().toLocaleLowerCase().startsWith(term))
    }
    if (next) {
      event.preventDefault()
      next.focus()
    }
  }

  return <>
    <style href="wlkr-menu" precedence="default">{styles}</style>
    <span
      {...props}
      ref={node => {
        root.current = node
        if (typeof ref === "function") return ref(node)
        if (ref) ref.current = node
      }}
      className={cn("wlkr-menu", className)}
      data-align={align}
      data-size={size}
      data-open={open}
    >
      <Slot.Root
        ref={triggerRef}
        id={triggerId}
        className="wlkr-menu-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={`${id}-popup`}
        onClick={event => {
          if (event.defaultPrevented || event.currentTarget.getAttribute("aria-disabled") === "true") return
          if (open) close()
          else show("first")
        }}
        onKeyDown={handleTriggerKey}
      >
        {trigger ?? <Button variant="outline" size={size}>Actions<ChevronDown aria-hidden="true" /></Button>}
      </Slot.Root>
      <span
        ref={popup}
        id={`${id}-popup`}
        role="menu"
        aria-label={label}
        aria-labelledby={label ? undefined : triggerId}
        className="wlkr-menu-popup"
        inert={!open}
        tabIndex={-1}
        onKeyDown={handleMenuKey}
      >
        {items.map(item => item.type === "separator"
          ? <span key={item.id} role="separator" className="wlkr-menu-separator" />
          : <button
              key={item.id}
              type="button"
              role="menuitem"
              tabIndex={-1}
              aria-disabled={item.disabled || undefined}
              className="wlkr-menu-item"
              onPointerMove={event => {
                if (!item.disabled && event.pointerType === "mouse") event.currentTarget.focus({ preventScroll: true })
              }}
              onClick={() => {
                if (item.disabled) return
                close()
                item.onSelect?.()
              }}
            >
              {item.icon && <span className="wlkr-menu-icon" aria-hidden="true">{item.icon}</span>}
              <span className="wlkr-menu-label">{item.label}</span>
            </button>)}
      </span>
    </span>
  </>
}
