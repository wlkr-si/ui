"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type PixelCheckboxProps = Omit<
  React.ComponentPropsWithoutRef<"input">,
  "type" | "checked" | "defaultChecked" | "onChange" | "children" | "size"
> & {
  /** Controlled checked state. */
  checked?: boolean
  /** Starting state when uncontrolled. */
  defaultChecked?: boolean
  /** Called with the new checked state. */
  onCheckedChange?: (checked: boolean) => void
  /** Shows a single middle row of pixels and reports "mixed". */
  indeterminate?: boolean
  /** Visible label. */
  children?: React.ReactNode
  /** Passed to the native input change event as well. */
  onChange?: React.ChangeEventHandler<HTMLInputElement>
}

/** 4x4 Bayer matrix: the order each pixel lights in. */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]
const BAR = [1, 3, 0, 2]

const styles = `
.wlkr-pixel-checkbox{position:relative;display:inline-flex;align-items:center;gap:.6em;cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent;color:var(--foreground,currentColor);line-height:1.3}
.wlkr-pixel-checkbox[data-disabled]{cursor:not-allowed;opacity:.5}
.wlkr-pixel-checkbox-input{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;opacity:0}
.wlkr-pixel-checkbox-box{position:relative;box-sizing:border-box;flex:none;width:18px;height:18px;padding:2px;border:1px solid var(--border,currentColor);border-radius:0;background:var(--background,#fff);display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(4,1fr);transition:border-color 0s steps(1,end) 120ms}
.wlkr-pixel-checkbox:hover .wlkr-pixel-checkbox-box{border-color:var(--foreground,currentColor)}
.wlkr-pixel-checkbox[data-disabled]:hover .wlkr-pixel-checkbox-box{border-color:var(--border,currentColor)}
.wlkr-pixel-checkbox[data-state=checked] .wlkr-pixel-checkbox-box,.wlkr-pixel-checkbox[data-state=indeterminate] .wlkr-pixel-checkbox-box{border-color:var(--brand,#33f282);transition-delay:0s}
.wlkr-pixel-checkbox-input:focus-visible+.wlkr-pixel-checkbox-box{outline:2px solid var(--brand,#33f282);outline-offset:2px}
.wlkr-pixel-checkbox-px,.wlkr-pixel-checkbox-bar span{border-radius:0;background:var(--brand,#33f282);opacity:0;transition:opacity 1ms steps(1,end);transition-delay:calc(var(--wlkr-pixel-checkbox-out) * 16ms)}
.wlkr-pixel-checkbox[data-state=checked] .wlkr-pixel-checkbox-px{opacity:1;transition-delay:calc(var(--wlkr-pixel-checkbox-in) * 16ms)}
.wlkr-pixel-checkbox-bar{position:absolute;left:2px;right:2px;top:50%;height:3px;margin-top:-1.5px;display:grid;grid-template-columns:repeat(4,1fr)}
.wlkr-pixel-checkbox[data-state=indeterminate] .wlkr-pixel-checkbox-bar span{opacity:1;transition-delay:calc(var(--wlkr-pixel-checkbox-in) * 40ms)}
.wlkr-pixel-checkbox-label{min-width:0}
@media(prefers-reduced-motion:reduce){
.wlkr-pixel-checkbox-box,.wlkr-pixel-checkbox-px,.wlkr-pixel-checkbox-bar span{transition:none!important}
}
`

/** A checkbox whose box fills with dithered pixels. Built on a real native input. */
export function PixelCheckbox({
  checked,
  defaultChecked = false,
  onCheckedChange,
  indeterminate = false,
  disabled,
  children,
  className,
  style,
  id,
  onChange,
  ...props
}: PixelCheckboxProps) {
  const autoId = React.useId()
  const inputId = id ?? autoId
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [internal, setInternal] = React.useState(defaultChecked)
  const controlled = checked !== undefined
  const isChecked = controlled ? checked : internal

  React.useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate
  }, [indeterminate, isChecked])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!controlled) setInternal(event.target.checked)
    onChange?.(event)
    onCheckedChange?.(event.target.checked)
  }

  const state = indeterminate ? "indeterminate" : isChecked ? "checked" : "unchecked"

  return (
    <label
      htmlFor={inputId}
      className={cn("wlkr-pixel-checkbox", className)}
      style={style}
      data-state={state}
      data-disabled={disabled ? "" : undefined}
    >
      <style>{styles}</style>
      <input
        {...props}
        ref={inputRef}
        id={inputId}
        type="checkbox"
        className="wlkr-pixel-checkbox-input"
        checked={isChecked}
        disabled={disabled}
        onChange={handleChange}
      />
      <span className="wlkr-pixel-checkbox-box" aria-hidden="true">
        {BAYER.map((order, index) => (
          <span
            key={index}
            className="wlkr-pixel-checkbox-px"
            style={{ "--wlkr-pixel-checkbox-in": order, "--wlkr-pixel-checkbox-out": 15 - order } as React.CSSProperties}
          />
        ))}
        <span className="wlkr-pixel-checkbox-bar">
          {BAR.map((order, index) => (
            <span
              key={index}
              style={{ "--wlkr-pixel-checkbox-in": order, "--wlkr-pixel-checkbox-out": 3 - order } as React.CSSProperties}
            />
          ))}
        </span>
      </span>
      {children !== undefined && children !== null && <span className="wlkr-pixel-checkbox-label">{children}</span>}
    </label>
  )
}
