import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export type SelectSize = "xs" | "sm" | "default" | "lg"

export type SelectProps = Omit<React.ComponentProps<"select">, "size" | "multiple" | "value" | "defaultValue"> & {
  /** Visible prefix and accessible name, unless overridden by ARIA. */
  label?: string
  size?: SelectSize
  multiple?: false
  value?: string | number
  defaultValue?: string | number
}

const styles = `
.wlkr-select {
  --wlkr-select-h: var(--wlkr-control-h-md);
  --wlkr-select-px: var(--wlkr-control-px-md);
  --wlkr-select-gap: var(--wlkr-control-gap-md);
  --wlkr-select-icon: var(--wlkr-control-icon-md);
  box-sizing: border-box; position: relative; display: inline-flex; align-items: center;
  max-width: 100%; height: var(--wlkr-select-h);
  border: var(--wlkr-control-border) solid var(--wlkr-border-default); border-radius: var(--wlkr-radius-md);
  color: var(--wlkr-content-primary); cursor: pointer;
  font-family: inherit; font-size: var(--wlkr-control-text-md); font-weight: var(--wlkr-weight-medium); line-height: 1;
  transition: border-color var(--wlkr-duration-fast) var(--wlkr-ease-out), background-color var(--wlkr-duration-fast) var(--wlkr-ease-out), transform var(--wlkr-duration-fast) var(--wlkr-ease-out);
}
.wlkr-select[data-size=xs] {
  --wlkr-select-h: var(--wlkr-control-h-xs); --wlkr-select-px: var(--wlkr-control-px-xs);
  --wlkr-select-gap: var(--wlkr-control-gap-xs); --wlkr-select-icon: var(--wlkr-control-icon-xs);
  border-radius: var(--wlkr-radius-sm); font-size: var(--wlkr-control-text-xs);
}
.wlkr-select[data-size=sm] {
  --wlkr-select-h: var(--wlkr-control-h-sm); --wlkr-select-px: var(--wlkr-control-px-sm);
  --wlkr-select-gap: var(--wlkr-control-gap-sm); --wlkr-select-icon: var(--wlkr-control-icon-sm);
  font-size: var(--wlkr-control-text-sm);
}
.wlkr-select[data-size=lg] {
  --wlkr-select-h: var(--wlkr-control-h-lg); --wlkr-select-px: var(--wlkr-control-px-lg);
  --wlkr-select-gap: var(--wlkr-control-gap-lg); --wlkr-select-icon: var(--wlkr-control-icon-lg);
  font-size: var(--wlkr-control-text-lg);
}
.wlkr-select-label {
  min-width: 0; margin-inline-start: var(--wlkr-select-px);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  color: var(--wlkr-content-secondary);
}
.wlkr-select-control {
  appearance: none; box-sizing: border-box; flex: 1; min-width: 0; height: 100%;
  padding-block: 0; padding-inline-start: var(--wlkr-select-px);
  padding-inline-end: calc(var(--wlkr-select-px) + var(--wlkr-select-icon) + var(--wlkr-select-gap));
  border: 0; outline: none; background: transparent; color: inherit; cursor: inherit;
  font: inherit; text-overflow: ellipsis; color-scheme: var(--wlkr-color-scheme);
}
.wlkr-select-label + .wlkr-select-control { padding-inline-start: var(--wlkr-select-gap); }
.wlkr-select-chevron {
  position: absolute; inset-inline-end: var(--wlkr-select-px); inset-block: 0; margin-block: auto;
  width: var(--wlkr-select-icon); height: var(--wlkr-select-icon);
  color: var(--wlkr-content-secondary); pointer-events: none;
}
.wlkr-select:has(> .wlkr-select-control:focus-visible) {
  outline: var(--wlkr-focus-width) solid var(--wlkr-focus-ring); outline-offset: var(--wlkr-focus-offset);
}
.wlkr-select:active { transform: scale(var(--wlkr-press-scale)); }
.wlkr-select:has(> .wlkr-select-control:disabled) { opacity: var(--wlkr-disabled-opacity); cursor: default; transform: none; }
@media (hover: hover) and (pointer: fine) {
  .wlkr-select:hover:where(:not(:has(> .wlkr-select-control:disabled))) {
    border-color: var(--wlkr-border-strong); background-color: var(--wlkr-fill-hover);
  }
}
.wlkr-select:has(> .wlkr-select-control:is([aria-invalid=true],[aria-invalid=grammar],[aria-invalid=spelling])) {
  border-color: var(--wlkr-danger);
}
@media (prefers-reduced-motion: reduce) {
  .wlkr-select { transition: none; }
  .wlkr-select:active { transform: none; }
}
`

export function Select({ label, size = "default", className, children, ...props }: SelectProps) {
  const Wrapper = label ? "label" : "span"

  return <>
    <style href="wlkr-select" precedence="default">{styles}</style>
    <Wrapper data-size={size} className={cn("wlkr-select", className)}>
      {label && <span className="wlkr-select-label">{label}</span>}
      <select {...props} className="wlkr-select-control">{children}</select>
      <ChevronDown aria-hidden="true" className="wlkr-select-chevron" />
    </Wrapper>
  </>
}
