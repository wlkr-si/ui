"use client"

import * as React from "react"
import { Check, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type ComboboxOption = { value: string; label: string; disabled?: boolean }
export type ComboboxSize = "xs" | "sm" | "default" | "lg"
export type ComboboxProps = Omit<React.ComponentProps<"input">, "size" | "value" | "defaultValue" | "children" | "dangerouslySetInnerHTML"> & {
  options: readonly ComboboxOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  size?: ComboboxSize
  emptyMessage?: string
  clearLabel?: string
}

const styles = `
.wlkr-combobox {
  --wlkr-combobox-width: 208px;
  --wlkr-combobox-list-height: 288px;
  --wlkr-combobox-h: var(--wlkr-control-h-md);
  --wlkr-combobox-px: var(--wlkr-control-px-md);
  --wlkr-combobox-text: var(--wlkr-control-text-md);
  --wlkr-combobox-icon: var(--wlkr-control-icon-md);
  --wlkr-combobox-gap: var(--wlkr-control-gap-md);
  --wlkr-combobox-radius: var(--wlkr-radius-md);
  position: relative;
  display: inline-flex;
  width: var(--wlkr-combobox-width);
  max-width: 100%;
}
.wlkr-combobox[data-size=xs] {
  --wlkr-combobox-h: var(--wlkr-control-h-xs);
  --wlkr-combobox-px: var(--wlkr-control-px-xs);
  --wlkr-combobox-text: var(--wlkr-control-text-xs);
  --wlkr-combobox-icon: var(--wlkr-control-icon-xs);
  --wlkr-combobox-gap: var(--wlkr-control-gap-xs);
  --wlkr-combobox-radius: var(--wlkr-radius-sm);
}
.wlkr-combobox[data-size=sm] {
  --wlkr-combobox-h: var(--wlkr-control-h-sm);
  --wlkr-combobox-px: var(--wlkr-control-px-sm);
  --wlkr-combobox-text: var(--wlkr-control-text-sm);
  --wlkr-combobox-icon: var(--wlkr-control-icon-sm);
  --wlkr-combobox-gap: var(--wlkr-control-gap-sm);
}
.wlkr-combobox[data-size=lg] {
  --wlkr-combobox-h: var(--wlkr-control-h-lg);
  --wlkr-combobox-px: var(--wlkr-control-px-lg);
  --wlkr-combobox-text: var(--wlkr-control-text-lg);
  --wlkr-combobox-icon: var(--wlkr-control-icon-lg);
  --wlkr-combobox-gap: var(--wlkr-control-gap-lg);
}

.wlkr-combobox-field {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: var(--wlkr-combobox-gap);
  width: 100%;
  height: var(--wlkr-combobox-h);
  padding: 0 var(--wlkr-combobox-px);
  border: var(--wlkr-control-border) solid var(--wlkr-border-default);
  border-radius: var(--wlkr-combobox-radius);
  color: var(--wlkr-content-primary);
  transition: border-color var(--wlkr-duration-fast) var(--wlkr-ease-out);
}
.wlkr-combobox-field > svg {
  flex: none;
  width: var(--wlkr-combobox-icon);
  height: var(--wlkr-combobox-icon);
  color: var(--wlkr-content-secondary);
}
.wlkr-combobox-input {
  flex: 1;
  min-width: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  outline: none;
  color: inherit;
  font-family: inherit;
  font-weight: var(--wlkr-weight-medium);
  font-size: var(--wlkr-combobox-text);
  line-height: 1;
}
.wlkr-combobox-input::placeholder { color: var(--wlkr-content-tertiary); opacity: 1; }
.wlkr-combobox-input::-webkit-search-cancel-button { appearance: none; }
.wlkr-combobox-field:has(> .wlkr-combobox-input:is([aria-invalid=true],[aria-invalid=grammar],[aria-invalid=spelling])) {
  border-color: var(--wlkr-danger);
}
.wlkr-combobox-field:has(> .wlkr-combobox-input:disabled) { opacity: var(--wlkr-disabled-opacity); }

.wlkr-combobox-clear {
  display: inline-grid;
  place-items: center;
  flex: none;
  width: calc(var(--wlkr-combobox-icon) + var(--wlkr-combobox-gap));
  height: calc(var(--wlkr-combobox-icon) + var(--wlkr-combobox-gap));
  padding: 0;
  border: 0;
  border-radius: inherit;
  background: transparent;
  color: var(--wlkr-content-secondary);
  cursor: pointer;
  transition: color var(--wlkr-duration-fast) var(--wlkr-ease-out), background-color var(--wlkr-duration-fast) var(--wlkr-ease-out), transform var(--wlkr-duration-fast) var(--wlkr-ease-out);
}
.wlkr-combobox-clear svg { width: var(--wlkr-combobox-icon); height: var(--wlkr-combobox-icon); }
.wlkr-combobox-field:has(> .wlkr-combobox-input:focus), .wlkr-combobox-clear:focus-visible {
  outline: var(--wlkr-focus-width) solid var(--wlkr-focus-ring);
  outline-offset: var(--wlkr-focus-offset);
}
.wlkr-combobox-clear:disabled { visibility: hidden; }
.wlkr-combobox-clear:not(:disabled):active, .wlkr-combobox-option:not([aria-disabled=true]):active {
  transform: scale(var(--wlkr-press-scale));
}

.wlkr-combobox-list {
  box-sizing: border-box;
  position: absolute;
  inset-inline: 0;
  top: calc(100% + var(--wlkr-space-1_5));
  z-index: var(--wlkr-z-overlay);
  max-height: var(--wlkr-combobox-list-height);
  overflow: auto;
  margin: 0;
  padding: var(--wlkr-space-1);
  list-style: none;
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
.wlkr-combobox[data-open=true] .wlkr-combobox-list {
  opacity: 1;
  visibility: visible;
  transform: none;
  pointer-events: auto;
}
.wlkr-combobox-option, .wlkr-combobox-empty {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: var(--wlkr-combobox-gap);
  min-height: var(--wlkr-combobox-h);
  padding: var(--wlkr-space-0_5) var(--wlkr-combobox-px);
  border-radius: var(--wlkr-radius-md);
  color: var(--wlkr-content-secondary);
  font-family: inherit;
  font-weight: var(--wlkr-weight-medium);
  font-size: var(--wlkr-combobox-text);
  line-height: 1.25;
  overflow-wrap: anywhere;
}
.wlkr-combobox-option {
  cursor: pointer;
  transition: transform var(--wlkr-duration-fast) var(--wlkr-ease-out);
}
.wlkr-combobox-option svg {
  flex: none;
  width: var(--wlkr-combobox-icon);
  height: var(--wlkr-combobox-icon);
  margin-inline-start: auto;
}
.wlkr-combobox-option[aria-selected=true] { color: var(--wlkr-content-primary); }
.wlkr-combobox-option[data-active=true] { background: var(--wlkr-fill-hover); }
.wlkr-combobox-option[aria-disabled=true] { opacity: var(--wlkr-disabled-opacity); cursor: default; }

@media (hover: hover) and (pointer: fine) {
  .wlkr-combobox-field:hover:has(> .wlkr-combobox-input:enabled:not([aria-invalid=true],[aria-invalid=grammar],[aria-invalid=spelling])) {
    border-color: var(--wlkr-border-strong);
  }
  .wlkr-combobox-clear:not(:disabled):hover { background: var(--wlkr-fill-hover); color: var(--wlkr-content-primary); }
  .wlkr-combobox-list:not(:has([data-active=true])) .wlkr-combobox-option:not([aria-disabled=true]):hover { background: var(--wlkr-fill-hover); }
}
@media (prefers-reduced-motion: reduce) {
  .wlkr-combobox-field, .wlkr-combobox-clear, .wlkr-combobox-option, .wlkr-combobox-list { transition: none; }
  .wlkr-combobox-list, .wlkr-combobox-clear:not(:disabled):active, .wlkr-combobox-option:not([aria-disabled=true]):active { transform: none; }
}
`

const fold = (text: string) => text.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase()

export function Combobox({
  options, value, defaultValue = "", onValueChange, size = "default", emptyMessage = "No results",
  clearLabel = "Clear selection", className, disabled, readOnly, onKeyDown, onChange, onFocus, ref, ...props
}: ComboboxProps) {
  const id = React.useId()
  const [inner, setInner] = React.useState(defaultValue)
  const [query, setQuery] = React.useState<string | null>(null)
  const [open, setOpen] = React.useState(false)
  const [active, setActive] = React.useState<string | null>(null)
  const input = React.useRef<HTMLInputElement>(null)
  const list = React.useRef<HTMLUListElement>(null)
  const current = value ?? inner
  const text = query ?? options.find(option => option.value === current)?.label ?? ""
  const search = fold(query ?? "")
  const filtered = options.filter(option => fold(option.label).includes(search))
  const enabled = filtered.filter(option => !option.disabled)
  const activeValue = enabled.some(option => option.value === active) ? active : null
  const expanded = open && !disabled && !readOnly
  const activeIndex = filtered.findIndex(option => option.value === activeValue)

  React.useEffect(() => {
    if (expanded && activeIndex >= 0) list.current?.children[activeIndex]?.scrollIntoView({ block: "nearest" })
  }, [expanded, activeIndex])

  function close() {
    setQuery(null)
    setOpen(false)
    setActive(null)
  }

  function commit(next: string) {
    if (value === undefined) setInner(next)
    if (next !== current) onValueChange?.(next)
    close()
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(event)
    if (event.defaultPrevented || event.nativeEvent.isComposing || disabled || readOnly) return

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault()
      setOpen(true)
      const direction = event.key === "ArrowDown" ? 1 : -1
      const index = expanded ? enabled.findIndex(option => option.value === activeValue) : -1
      const startingIndex = direction === 1 ? 0 : enabled.length - 1
      const next = index < 0 ? startingIndex : (index + direction + enabled.length) % enabled.length
      setActive(enabled[next]?.value ?? null)
    } else if (expanded && (event.key === "Home" || event.key === "End")) {
      event.preventDefault()
      setActive((event.key === "Home" ? enabled[0] : enabled.at(-1))?.value ?? null)
    } else if (event.key === "Enter" && expanded && activeValue !== null) {
      event.preventDefault()
      commit(activeValue)
    } else if (event.key === "Escape" && expanded) {
      event.preventDefault()
      event.stopPropagation()
      close()
    } else if (event.key === "Tab") {
      close()
    }
  }

  return <>
    <style href="wlkr-combobox" precedence="default">{styles}</style>
    <div data-size={size} data-open={expanded} className={cn("wlkr-combobox", className)} onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget)) close()
    }}>
      <span className="wlkr-combobox-field">
        <Search aria-hidden="true" />
        <input
          {...props}
          ref={node => {
            input.current = node
            if (typeof ref === "function") return ref(node)
            if (ref) ref.current = node
          }}
          disabled={disabled}
          readOnly={readOnly}
          className="wlkr-combobox-input"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={expanded}
          aria-controls={`${id}-list`}
          aria-activedescendant={expanded && activeIndex >= 0 ? `${id}-${activeIndex}` : undefined}
          autoComplete="off"
          value={text}
          onChange={event => {
            onChange?.(event)
            setQuery(event.target.value)
            setOpen(true)
            setActive(null)
          }}
          onFocus={event => {
            onFocus?.(event)
            if (!event.defaultPrevented && !readOnly) setOpen(true)
          }}
          onKeyDown={handleKeyDown}
        />
        {text && !readOnly && <button
          type="button"
          className="wlkr-combobox-clear"
          aria-label={clearLabel}
          disabled={disabled}
          onPointerDown={event => event.preventDefault()}
          onClick={() => {
            input.current?.focus()
            commit("")
          }}
        ><X aria-hidden="true" /></button>}
      </span>
      <ul
        ref={list}
        id={`${id}-list`}
        role="listbox"
        aria-label={props["aria-label"] ? `${props["aria-label"]} options` : "Options"}
        className="wlkr-combobox-list"
        inert={!expanded}
      >
        {filtered.map((option, index) => <li
          key={option.value}
          id={`${id}-${index}`}
          role="option"
          aria-selected={current === option.value}
          aria-disabled={option.disabled || undefined}
          data-active={activeValue === option.value}
          className="wlkr-combobox-option"
          onPointerDown={event => event.preventDefault()}
          onClick={() => {
            if (!option.disabled) commit(option.value)
          }}
        >
          <span>{option.label}</span>
          {current === option.value && <Check aria-hidden="true" />}
        </li>)}
        {!filtered.length && <li role="presentation" className="wlkr-combobox-empty"><span role="status">{emptyMessage}</span></li>}
      </ul>
    </div>
  </>
}
