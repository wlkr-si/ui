"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type DitherDialogProps = Omit<React.ComponentPropsWithoutRef<"dialog">, "open" | "title" | "children" | "onCancel" | "onClose"> & {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  /** Footer slot, usually buttons. */
  actions?: React.ReactNode
  /** Close when the backdrop is clicked. Escape always closes. */
  dismissible?: boolean
  /** Max width: 360px or 480px. */
  size?: "sm" | "md"
}

const styles = `
.wlkr-dither-dialog{--wlkr-dither-dialog-ink:var(--foreground,#010101);box-sizing:border-box;width:calc(100% - 32px);max-width:480px;max-height:calc(100% - 32px);margin:auto;padding:0;border:1px solid var(--foreground,#010101);border-radius:0;box-shadow:none;background:var(--background,#fff);color:var(--foreground,#010101);overflow:auto}
.wlkr-dither-dialog[data-size=sm]{max-width:360px}
.wlkr-dither-dialog::backdrop{background-color:transparent;background-image:conic-gradient(var(--foreground,#010101) 25%,transparent 0 50%,var(--foreground,#010101) 0 75%,transparent 0);background-size:4px 4px;opacity:.55}
.wlkr-dither-dialog-panel{display:flex;flex-direction:column;gap:16px;padding:20px}
.wlkr-dither-dialog-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
.wlkr-dither-dialog-titles{display:flex;flex-direction:column;gap:6px;min-width:0}
.wlkr-dither-dialog-title{margin:0;font-size:1rem;font-weight:600;line-height:1.3}
.wlkr-dither-dialog-desc{margin:0;font-size:.875rem;line-height:1.5;color:var(--muted-foreground,#6b6b6b)}
.wlkr-dither-dialog-body{font-size:.875rem;line-height:1.5}
.wlkr-dither-dialog-body:empty{display:none}
.wlkr-dither-dialog-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px}
.wlkr-dither-dialog-close{flex:none;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;margin:-4px -4px 0 0;padding:0;border:1px solid var(--border,currentColor);border-radius:0;background:transparent;color:inherit;cursor:pointer}
.wlkr-dither-dialog-close:hover{background:var(--foreground,#010101);color:var(--background,#fff)}
.wlkr-dither-dialog-close:focus-visible{outline:2px solid var(--brand,#33f282);outline-offset:2px}
.wlkr-dither-dialog-close svg{display:block;width:10px;height:10px}
@keyframes wlkr-dither-dialog-dither{
0%{background-image:none}
25%{background-image:conic-gradient(from 270deg at 2px 2px,var(--foreground,#010101) 25%,transparent 0);background-size:8px 8px}
50%{background-image:conic-gradient(from 270deg at 2px 2px,var(--foreground,#010101) 25%,transparent 0);background-size:4px 4px}
75%,100%{background-image:conic-gradient(var(--foreground,#010101) 25%,transparent 0 50%,var(--foreground,#010101) 0 75%,transparent 0);background-size:4px 4px}
}
@keyframes wlkr-dither-dialog-snap{0%{transform:translateY(12px)}100%{transform:none}}
@media(prefers-reduced-motion:no-preference){
.wlkr-dither-dialog[open]::backdrop{animation:wlkr-dither-dialog-dither 240ms steps(1,end) both}
.wlkr-dither-dialog[open]{animation:wlkr-dither-dialog-snap 160ms steps(3,end) both}
}
`

/** A native modal over an ordered-dither backdrop. Flat paper, ink outline, stepped entrance. */
export function DitherDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  actions,
  dismissible = true,
  size = "md",
  className,
  ...props
}: DitherDialogProps) {
  const ref = React.useRef<HTMLDialogElement>(null)
  const downOnBackdrop = React.useRef(false)
  const id = React.useId()
  const titleId = `${id}-title`
  const descId = `${id}-desc`

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    else if (!open && el.open) el.close()
  }, [open])

  React.useEffect(() => {
    const el = ref.current
    return () => {
      if (el?.open) el.close()
    }
  }, [])

  return (
    <dialog
      {...props}
      ref={ref}
      className={cn("wlkr-dither-dialog", className)}
      data-size={size === "sm" ? "sm" : "md"}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onCancel={event => {
        event.preventDefault()
        onOpenChange(false)
      }}
      onClose={() => {
        if (open) onOpenChange(false)
      }}
      onPointerDown={event => {
        downOnBackdrop.current = event.target === event.currentTarget
      }}
      onClick={event => {
        const onBackdrop = event.target === event.currentTarget && downOnBackdrop.current
        downOnBackdrop.current = false
        if (onBackdrop && dismissible) onOpenChange(false)
      }}
    >
      <style>{styles}</style>
      <div className="wlkr-dither-dialog-panel">
        <div className="wlkr-dither-dialog-head">
          <div className="wlkr-dither-dialog-titles">
            <h2 id={titleId} className="wlkr-dither-dialog-title">{title}</h2>
            {description ? <p id={descId} className="wlkr-dither-dialog-desc">{description}</p> : null}
          </div>
          <button type="button" className="wlkr-dither-dialog-close" aria-label="Close" onClick={() => onOpenChange(false)}>
            <svg viewBox="0 0 5 5" aria-hidden="true" shapeRendering="crispEdges" fill="currentColor">
              <rect x="0" y="0" width="1" height="1" /><rect x="4" y="0" width="1" height="1" />
              <rect x="1" y="1" width="1" height="1" /><rect x="3" y="1" width="1" height="1" />
              <rect x="2" y="2" width="1" height="1" />
              <rect x="1" y="3" width="1" height="1" /><rect x="3" y="3" width="1" height="1" />
              <rect x="0" y="4" width="1" height="1" /><rect x="4" y="4" width="1" height="1" />
            </svg>
          </button>
        </div>
        {children !== undefined && children !== null ? <div className="wlkr-dither-dialog-body">{children}</div> : null}
        {actions ? <div className="wlkr-dither-dialog-actions">{actions}</div> : null}
      </div>
    </dialog>
  )
}
