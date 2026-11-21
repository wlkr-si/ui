"use client"

import * as React from "react"

export type CommandMenuItem = {
  id: string
  label: string
  group?: string
  shortcut?: string
  keywords?: string[]
  onSelect?: () => void
}

export type CommandMenuProps = {
  items: CommandMenuItem[]
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  placeholder?: string
  /** Letter that opens the menu with Cmd/Ctrl. False turns the shortcut off. */
  hotkey?: string | false
  /** Accessible name for the dialog. */
  label?: string
  className?: string
}

const styles = `
.wlkr-command-menu{box-sizing:border-box;width:min(560px,calc(100vw - 32px));max-width:none;max-height:min(480px,calc(100vh - 64px));margin:12vh auto auto;padding:0;border:0;border-radius:0;outline:1px solid var(--foreground,#010101);background:var(--background,#fff);color:var(--foreground,#010101);font:inherit;overflow:hidden}
.wlkr-command-menu[open]{display:flex;flex-direction:column}
.wlkr-command-menu::backdrop{background:rgba(1,1,1,.45);background:color-mix(in srgb,var(--foreground,#010101) 45%,transparent)}
.wlkr-command-menu-field{display:flex;align-items:center;gap:.6em;padding:0 14px;border-bottom:1px solid var(--border,currentColor);font-family:var(--font-mono,ui-monospace,monospace);font-size:14px}
.wlkr-command-menu-prompt{flex:none;color:var(--brand,#33f282);font-weight:600}
.wlkr-command-menu-input{flex:1;min-width:0;height:48px;padding:0;border:0;border-radius:0;background:transparent;color:inherit;font:inherit;outline:none;caret-color:var(--brand,#33f282);caret-shape:block}
.wlkr-command-menu-input::placeholder{color:var(--muted-foreground,#6b6b6b);opacity:1}
.wlkr-command-menu-field:focus-within{box-shadow:inset 0 -2px 0 var(--brand,#33f282)}
.wlkr-command-menu-list{flex:1;min-height:0;margin:0;padding:6px 0;overflow-y:auto;overscroll-behavior:contain}
.wlkr-command-menu-heading{margin:0;padding:10px 14px 4px;font-family:var(--font-mono,ui-monospace,monospace);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted-foreground,#6b6b6b)}
.wlkr-command-menu-option{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:36px;padding:0 14px;font-size:14px;cursor:default;user-select:none}
.wlkr-command-menu-option[aria-selected=true]{background:var(--foreground,#010101);color:var(--background,#fff)}
.wlkr-command-menu-option-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wlkr-command-menu-option-label::before{content:"";display:inline-block;width:6px;height:6px;margin-right:10px;vertical-align:middle;background:transparent}
.wlkr-command-menu-option[aria-selected=true] .wlkr-command-menu-option-label::before{background:var(--brand,#33f282)}
.wlkr-command-menu-shortcut{flex:none;font-family:var(--font-mono,ui-monospace,monospace);font-size:12px;color:var(--muted-foreground,#6b6b6b)}
.wlkr-command-menu-option[aria-selected=true] .wlkr-command-menu-shortcut{color:inherit;opacity:.7}
.wlkr-command-menu-empty{padding:20px 14px;font-family:var(--font-mono,ui-monospace,monospace);font-size:13px;color:var(--muted-foreground,#6b6b6b)}
@keyframes wlkr-command-menu-in{0%{clip-path:inset(0 0 100% 0)}25%{clip-path:inset(0 0 75% 0)}50%{clip-path:inset(0 0 50% 0)}75%{clip-path:inset(0 0 25% 0)}100%{clip-path:inset(0)}}
@media(prefers-reduced-motion:no-preference){.wlkr-command-menu[open]{animation:wlkr-command-menu-in 160ms steps(4,end)}}
@media(prefers-reduced-motion:reduce){.wlkr-command-menu[open]{animation:none}}
`

function isSubsequence(needle: string, hay: string) {
  let i = 0
  for (let j = 0; j < hay.length && i < needle.length; j++) if (hay[j] === needle[i]) i++
  return i === needle.length
}

/** A command palette in a native modal dialog. Type to filter, arrows to move, Enter to run. */
export function CommandMenu({
  items,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  placeholder = "Type a command",
  hotkey = "k",
  label = "Command menu",
  className,
}: CommandMenuProps) {
  const [openState, setOpenState] = React.useState(defaultOpen)
  const controlled = openProp !== undefined
  const open = controlled ? openProp : openState
  const [query, setQuery] = React.useState("")
  const [activeIndex, setActiveIndex] = React.useState(0)
  const dialogRef = React.useRef<HTMLDialogElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const base = React.useId()
  const listId = `${base}-list`

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!controlled) setOpenState(next)
      onOpenChange?.(next)
    },
    [controlled, onOpenChange],
  )

  const groups = React.useMemo(() => {
    const q = query.trim().toLowerCase().replace(/\s+/g, "")
    const order: string[] = []
    const byGroup = new Map<string, CommandMenuItem[]>()
    for (const item of items) {
      const hay = [item.label, ...(item.keywords ?? [])].join(" ").toLowerCase()
      if (q && !isSubsequence(q, hay)) continue
      const key = item.group ?? ""
      if (!byGroup.has(key)) {
        byGroup.set(key, [])
        order.push(key)
      }
      byGroup.get(key)!.push(item)
    }
    return order.map(name => ({ name, items: byGroup.get(name)! }))
  }, [items, query])

  const flat = React.useMemo(() => groups.flatMap(g => g.items), [groups])
  const active = flat.length ? Math.min(activeIndex, flat.length - 1) : -1
  const optionId = (i: number) => `${base}-option-${i}`

  React.useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      inputRef.current?.focus()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  React.useEffect(() => {
    if (!hotkey) return
    const key = hotkey.toLowerCase()
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && !event.altKey && event.key.toLowerCase() === key) {
        event.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [hotkey, setOpen])

  React.useEffect(() => {
    if (!open || active < 0) return
    document.getElementById(`${base}-option-${active}`)?.scrollIntoView({ block: "nearest" })
  }, [open, active, base])

  const run = (item: CommandMenuItem | undefined) => {
    if (!item) return
    setOpen(false)
    item.onSelect?.()
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!flat.length) return
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActiveIndex((active + 1) % flat.length)
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex((active - 1 + flat.length) % flat.length)
    } else if (event.key === "Home") {
      event.preventDefault()
      setActiveIndex(0)
    } else if (event.key === "End") {
      event.preventDefault()
      setActiveIndex(flat.length - 1)
    } else if (event.key === "Enter") {
      event.preventDefault()
      run(flat[active])
    }
  }

  let index = -1
  return (
    <dialog
      ref={dialogRef}
      className={className ? `wlkr-command-menu ${className}` : "wlkr-command-menu"}
      aria-label={label}
      onClose={() => {
        setQuery("")
        setActiveIndex(0)
        if (open) setOpen(false)
      }}
      onClick={event => {
        if (event.target === event.currentTarget) setOpen(false)
      }}
    >
      <style>{styles}</style>
      <div className="wlkr-command-menu-field">
        <span className="wlkr-command-menu-prompt" aria-hidden="true">&gt;</span>
        <input
          ref={inputRef}
          className="wlkr-command-menu-input"
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? optionId(active) : undefined}
          aria-label={label}
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder}
          value={query}
          onChange={event => {
            setQuery(event.target.value)
            setActiveIndex(0)
          }}
          onKeyDown={onKeyDown}
        />
      </div>
      <div className="wlkr-command-menu-list" id={listId} role="listbox" aria-label={label}>
        {flat.length === 0 && <div className="wlkr-command-menu-empty" role="presentation">No matches</div>}
        {groups.map((group, g) => {
          const headingId = `${base}-group-${g}`
          return (
            <div key={group.name || `_${g}`} role="group" aria-labelledby={group.name ? headingId : undefined}>
              {group.name && <div className="wlkr-command-menu-heading" id={headingId} role="presentation">{group.name}</div>}
              {group.items.map(item => {
                index++
                const i = index
                return (
                  <div
                    key={item.id}
                    id={optionId(i)}
                    className="wlkr-command-menu-option"
                    role="option"
                    aria-selected={i === active}
                    onMouseMove={() => {
                      if (i !== active) setActiveIndex(i)
                    }}
                    onMouseDown={event => event.preventDefault()}
                    onClick={() => run(item)}
                  >
                    <span className="wlkr-command-menu-option-label">{item.label}</span>
                    {item.shortcut && <span className="wlkr-command-menu-shortcut">{item.shortcut}</span>}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </dialog>
  )
}
