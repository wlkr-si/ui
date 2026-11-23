"use client"

import * as React from "react"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type ComboboxOption = { value: string; label: string; disabled?: boolean }
export type ComboboxProps = Omit<React.ComponentProps<"input">, "size" | "value" | "defaultValue" | "children"> & {
  options: ComboboxOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  size?: "sm" | "md"
  emptyMessage?: string
  clearLabel?: string
}

const styles = `
.wlkr-combobox{box-sizing:border-box;position:relative;display:inline-flex;align-items:center;gap:6px;width:208px;max-width:100%;height:32px;padding:0 4px 0 8px;border:1px solid var(--input,var(--border,#dedede));border-radius:6px;background:var(--card,#fff);color:var(--muted-foreground,#696969);transition:border-color 120ms ease,background-color 120ms ease}
.wlkr-combobox[data-size=sm]{height:28px}.wlkr-combobox-icon{flex:none;width:14px;height:14px}.wlkr-combobox-input{flex:1;min-width:0;width:100%;height:100%;padding:0;border:0;background:transparent;outline:none;font:500 14px/1 var(--font-sans,Arial,sans-serif);color:var(--foreground,#010101)}.wlkr-combobox[data-size=sm] .wlkr-combobox-input{font-size:12px}.wlkr-combobox-input::placeholder{color:var(--muted-foreground,#696969);opacity:.7}
.wlkr-combobox:has(input:focus-visible){outline:2px solid var(--brand,#33f282);outline-offset:2px}.wlkr-combobox:has(input:disabled){opacity:.45}.wlkr-combobox:has([aria-invalid=true]){border-color:var(--destructive,#b42318)}
.wlkr-combobox-clear{display:inline-grid;place-items:center;flex:none;width:20px;height:20px;padding:0;border:0;border-radius:4px;background:transparent;color:var(--muted-foreground,#696969);cursor:pointer}.wlkr-combobox-clear svg{width:12px;height:12px}.wlkr-combobox-clear:focus-visible{outline:2px solid var(--brand,#33f282);outline-offset:2px}
.wlkr-combobox-list{box-sizing:border-box;position:absolute;left:-1px;right:-1px;top:calc(100% + 6px);z-index:30;max-height:288px;overflow:auto;margin:0;padding:4px;list-style:none;background:var(--popover,#fff);border:1px solid var(--border,#dedede);border-radius:8px;box-shadow:var(--wlkr-combobox-shadow,0 16px 40px rgb(0 0 0 / 55%));opacity:0;visibility:hidden;transform:translateY(-2px) scale(.98);transform-origin:top center;pointer-events:none;transition:opacity 140ms cubic-bezier(.23,1,.32,1),transform 140ms cubic-bezier(.23,1,.32,1),visibility 140ms}
.wlkr-combobox[data-open=true] .wlkr-combobox-list{opacity:1;visibility:visible;transform:none;pointer-events:auto}
.wlkr-combobox-option{display:flex;align-items:center;gap:8px;min-height:28px;padding:4px 8px;border-radius:4px;font:500 12px/1.4 var(--font-sans,Arial,sans-serif);color:var(--foreground,#010101);overflow-wrap:anywhere;cursor:pointer}
.wlkr-combobox-option[aria-selected=true]{color:var(--foreground,#010101)}.wlkr-combobox-option[data-active=true]{background:color-mix(in srgb,var(--foreground,#010101) 10%,transparent);color:var(--foreground,#010101)}.wlkr-combobox-option[aria-disabled=true]{opacity:.4;cursor:default}.wlkr-combobox-empty{padding:8px 10px;font-size:12px;color:var(--muted-foreground,#696969)}
@media(hover:hover) and (pointer:fine){.wlkr-combobox:not(:has(input:disabled)):hover{border-color:color-mix(in srgb,var(--border,#dedede),var(--foreground,#010101) 16%)}.wlkr-combobox-clear:hover{background:var(--secondary,#f3f3f3);color:var(--foreground,#010101)}.wlkr-combobox-option:not([aria-disabled=true]):hover{background:var(--accent,#f3f3f3)}}
@media(prefers-reduced-motion:reduce){.wlkr-combobox,.wlkr-combobox-list{transition:none}}
`

const fold = (text: string) => text.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase()

export function Combobox({ options, value, defaultValue = "", onValueChange, size = "md", emptyMessage = "No results", clearLabel = "Clear selection", className, disabled, readOnly, onKeyDown, onChange, onFocus, onBlur, ref, ...props }: ComboboxProps) {
  const id = React.useId()
  const [inner, setInner] = React.useState(defaultValue)
  const [query, setQuery] = React.useState<string | null>(null)
  const [open, setOpen] = React.useState(false)
  const [active, setActive] = React.useState<string | null>(null)
  const input = React.useRef<HTMLInputElement>(null)
  const list = React.useRef<HTMLUListElement>(null)
  const current = value ?? inner
  const text = query ?? options.find(option => option.value === current)?.label ?? ""
  const filtered = options.filter(option => fold(option.label).includes(fold(query ?? "")))
  const enabled = filtered.filter(option => !option.disabled)
  const activeValue = enabled.some(option => option.value === active) ? active : null
  const expanded = open && !disabled && !readOnly
  const activeIndex = filtered.findIndex(option => option.value === activeValue)
  React.useEffect(() => {
    if (expanded && activeIndex >= 0) list.current?.children[activeIndex]?.scrollIntoView({ block: "nearest" })
  }, [expanded, activeIndex])
  function commit(next: string) {
    if (value === undefined) setInner(next)
    if (next !== current) onValueChange?.(next)
    setQuery(null); setOpen(false); setActive(null)
  }
  return <><style>{styles}</style><span data-size={size} data-open={expanded} className={cn("wlkr-combobox", className)}>
    <Search className="wlkr-combobox-icon" aria-hidden="true" />
    <input {...props} ref={node => {
      input.current = node
      if (typeof ref === "function") return ref(node)
      if (ref) ref.current = node
    }} disabled={disabled} readOnly={readOnly} className="wlkr-combobox-input" role="combobox" aria-autocomplete="list" aria-expanded={expanded} aria-controls={`${id}-list`} aria-activedescendant={expanded && activeIndex >= 0 ? `${id}-${activeIndex}` : undefined} autoComplete="off" value={text} onChange={event => {
      onChange?.(event)
      setQuery(event.target.value); setOpen(true); setActive(null)
    }} onFocus={event => { onFocus?.(event); if (!event.defaultPrevented) setOpen(true) }} onBlur={event => {
      onBlur?.(event)
      if (!event.currentTarget.parentElement?.contains(event.relatedTarget)) { setOpen(false); setQuery(null); setActive(null) }
    }} onKeyDown={event => {
      onKeyDown?.(event)
      if (event.defaultPrevented || event.nativeEvent.isComposing || disabled || readOnly) return
      const index = enabled.findIndex(option => option.value === activeValue)
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault(); setOpen(true)
        const next = !expanded || index < 0 ? (event.key === "ArrowDown" ? 0 : enabled.length - 1) : (index + (event.key === "ArrowDown" ? 1 : -1) + enabled.length) % enabled.length
        setActive(enabled[next]?.value ?? null)
      } else if (expanded && (event.key === "Home" || event.key === "End")) {
        event.preventDefault(); setActive((event.key === "Home" ? enabled[0] : enabled.at(-1))?.value ?? null)
      } else if (event.key === "Enter" && expanded && activeValue !== null) {
        event.preventDefault(); commit(activeValue)
      } else if (event.key === "Escape" && expanded) {
        event.preventDefault(); event.stopPropagation(); setOpen(false); setQuery(null); setActive(null)
      } else if (event.key === "Tab") { setOpen(false); setQuery(null); setActive(null) }
    }} />
    {text && !readOnly && <button type="button" className="wlkr-combobox-clear" aria-label={clearLabel} disabled={disabled} onPointerDown={event => event.preventDefault()} onClick={() => { commit(""); input.current?.focus() }}><X aria-hidden="true" /></button>}
    <ul ref={list} id={`${id}-list`} role="listbox" aria-label={props["aria-label"] ? `${props["aria-label"]} options` : "Options"} className="wlkr-combobox-list" inert={!expanded}>
      {filtered.map((option, index) => <li key={option.value} id={`${id}-${index}`} role="option" aria-selected={current === option.value} aria-disabled={option.disabled || undefined} data-active={activeValue === option.value} className="wlkr-combobox-option" onPointerDown={event => event.preventDefault()} onClick={() => { if (!option.disabled) commit(option.value) }}>{option.label}</li>)}
      {!filtered.length && <li role="presentation" className="wlkr-combobox-empty"><span role="status">{emptyMessage}</span></li>}
    </ul>
  </span></>
}
