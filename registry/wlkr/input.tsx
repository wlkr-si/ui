"use client"

import type * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export type InputProps = Omit<React.ComponentProps<"input">, "size" | "children" | "dangerouslySetInnerHTML"> & {
  size?: "xs" | "sm" | "default" | "lg"
  icon?: React.ReactNode
  clearable?: boolean
  clearLabel?: string
}

const styles = `
.wlkr-input {
  --wlkr-input-height: var(--wlkr-control-h-md);
  --wlkr-input-padding: var(--wlkr-control-px-md);
  --wlkr-input-text-size: var(--wlkr-control-text-md);
  --wlkr-input-icon-size: var(--wlkr-control-icon-md);
  --wlkr-input-gap: var(--wlkr-control-gap-md);
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: var(--wlkr-input-gap);
  max-width: 100%;
  height: var(--wlkr-input-height);
  padding: 0 var(--wlkr-input-padding);
  border: var(--wlkr-control-border) solid var(--wlkr-border-default);
  border-radius: var(--wlkr-radius-md);
  color: var(--wlkr-content-primary);
  transition: border-color var(--wlkr-duration-fast) var(--wlkr-ease-out);
}
.wlkr-input[data-size=xs] {
  --wlkr-input-height: var(--wlkr-control-h-xs);
  --wlkr-input-padding: var(--wlkr-control-px-xs);
  --wlkr-input-text-size: var(--wlkr-control-text-xs);
  --wlkr-input-icon-size: var(--wlkr-control-icon-xs);
  --wlkr-input-gap: var(--wlkr-control-gap-xs);
  border-radius: var(--wlkr-radius-sm);
}
.wlkr-input[data-size=sm] {
  --wlkr-input-height: var(--wlkr-control-h-sm);
  --wlkr-input-padding: var(--wlkr-control-px-sm);
  --wlkr-input-text-size: var(--wlkr-control-text-sm);
  --wlkr-input-icon-size: var(--wlkr-control-icon-sm);
  --wlkr-input-gap: var(--wlkr-control-gap-sm);
}
.wlkr-input[data-size=lg] {
  --wlkr-input-height: var(--wlkr-control-h-lg);
  --wlkr-input-padding: var(--wlkr-control-px-lg);
  --wlkr-input-text-size: var(--wlkr-control-text-lg);
  --wlkr-input-icon-size: var(--wlkr-control-icon-lg);
  --wlkr-input-gap: var(--wlkr-control-gap-lg);
}
.wlkr-input-control {
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
  font-size: var(--wlkr-input-text-size);
  font-weight: var(--wlkr-weight-medium);
  line-height: 1;
}
.wlkr-input-control::placeholder { color: var(--wlkr-content-tertiary); opacity: 1; }
.wlkr-input-icon { display: inline-flex; flex: none; color: var(--wlkr-content-secondary); }
.wlkr-input-icon svg, .wlkr-input-clear svg { width: var(--wlkr-input-icon-size); height: var(--wlkr-input-icon-size); }
.wlkr-input:has(> .wlkr-input-control:focus), .wlkr-input-clear:focus-visible {
  outline: var(--wlkr-focus-width) solid var(--wlkr-focus-ring);
  outline-offset: var(--wlkr-focus-offset);
}
.wlkr-input:has(> .wlkr-input-control:is([aria-invalid=true],[aria-invalid=grammar],[aria-invalid=spelling])) {
  border-color: var(--wlkr-danger);
}
.wlkr-input:has(> .wlkr-input-control:disabled) { opacity: var(--wlkr-disabled-opacity); }
.wlkr-input-clear {
  display: inline-grid;
  place-items: center;
  flex: none;
  width: calc(var(--wlkr-input-icon-size) + var(--wlkr-input-gap));
  height: calc(var(--wlkr-input-icon-size) + var(--wlkr-input-gap));
  padding: 0;
  border: 0;
  border-radius: inherit;
  background: transparent;
  color: var(--wlkr-content-secondary);
  cursor: pointer;
  transition: color var(--wlkr-duration-fast) var(--wlkr-ease-out), background-color var(--wlkr-duration-fast) var(--wlkr-ease-out), transform var(--wlkr-duration-fast) var(--wlkr-ease-out);
}
.wlkr-input-control:placeholder-shown + .wlkr-input-clear, .wlkr-input-clear:disabled { visibility: hidden; }
.wlkr-input:has(> .wlkr-input-clear) .wlkr-input-control::-webkit-search-cancel-button { appearance: none; }
.wlkr-input-clear:active { transform: scale(var(--wlkr-press-scale)); }
@media (hover: hover) and (pointer: fine) {
  .wlkr-input:hover:has(> .wlkr-input-control:enabled:not([aria-invalid=true],[aria-invalid=grammar],[aria-invalid=spelling])) {
    border-color: var(--wlkr-border-strong);
  }
  .wlkr-input-clear:hover { background: var(--wlkr-fill-hover); color: var(--wlkr-content-primary); }
}
@media (prefers-reduced-motion: reduce) {
  .wlkr-input, .wlkr-input-clear { transition: none; }
  .wlkr-input-clear:active { transform: none; }
}
`

function clearInput(event: React.MouseEvent<HTMLButtonElement>) {
  const input = event.currentTarget.previousElementSibling
  if (!(input instanceof HTMLInputElement)) return

  // The native setter lets React observe the value change as it would for typing.
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(input, "")
  input.dispatchEvent(new Event("input", { bubbles: true }))
  input.focus()
}

export function Input({ size = "default", icon, clearable = false, clearLabel = "Clear input", className, placeholder, disabled, readOnly, ...props }: InputProps) {
  const showClear = clearable && !readOnly

  return <>
    <style href="wlkr-input" precedence="default">{styles}</style>
    <span data-size={size} className={cn("wlkr-input", className)}>
      {icon && <span className="wlkr-input-icon" aria-hidden="true">{icon}</span>}
      <input
        {...props}
        placeholder={showClear ? placeholder || " " : placeholder}
        disabled={disabled}
        readOnly={readOnly}
        className="wlkr-input-control"
      />
      {showClear && <button type="button" className="wlkr-input-clear" aria-label={clearLabel} disabled={disabled} onClick={clearInput}>
        <X aria-hidden="true" />
      </button>}
    </span>
  </>
}
