import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export type IconButtonProps = ComponentProps<"button"> & {
  "aria-label": string
  variant?: "glass" | "plain" | "outline"
  size?: "xs" | "sm" | "default" | "lg"
}

const styles = `
.wlkr-icon-button {
  --wlkr-icon-button-glass-blur: 16px;
  --wlkr-icon-button-glass-opacity: 52%;
  --wlkr-icon-button-glass-saturation: 140%;
  --wlkr-icon-button-h: var(--wlkr-control-h-md);
  --wlkr-icon-button-icon: var(--wlkr-control-icon-md);
  --wlkr-icon-button-fill: transparent;
  --wlkr-icon-button-ink: var(--wlkr-content-primary);
  --wlkr-icon-button-line: transparent;
  box-sizing: border-box; position: relative; display: inline-grid; place-items: center; flex: none;
  width: var(--wlkr-icon-button-h); height: var(--wlkr-icon-button-h); padding: 0;
  border: var(--wlkr-control-border) solid var(--wlkr-icon-button-line); border-radius: var(--wlkr-radius-full);
  background: var(--wlkr-icon-button-fill); color: var(--wlkr-icon-button-ink);
  font-family: inherit; cursor: pointer; -webkit-tap-highlight-color: transparent;
  transition: background-color var(--wlkr-duration-fast) var(--wlkr-ease-out),
    border-color var(--wlkr-duration-fast) var(--wlkr-ease-out),
    color var(--wlkr-duration-fast) var(--wlkr-ease-out),
    transform var(--wlkr-duration-fast) var(--wlkr-ease-out);
}
.wlkr-icon-button svg { display: block; width: var(--wlkr-icon-button-icon); height: var(--wlkr-icon-button-icon); }
.wlkr-icon-button[data-size=xs] { --wlkr-icon-button-h: var(--wlkr-control-h-xs); --wlkr-icon-button-icon: var(--wlkr-control-icon-xs); }
.wlkr-icon-button[data-size=sm] { --wlkr-icon-button-h: var(--wlkr-control-h-sm); --wlkr-icon-button-icon: var(--wlkr-control-icon-sm); }
.wlkr-icon-button[data-size=lg] { --wlkr-icon-button-h: var(--wlkr-control-h-lg); --wlkr-icon-button-icon: var(--wlkr-control-icon-lg); }

.wlkr-icon-button[data-variant=glass] {
  --wlkr-icon-button-fill: color-mix(in srgb, var(--wlkr-surface-overlay) var(--wlkr-icon-button-glass-opacity), transparent);
  --wlkr-icon-button-line: var(--wlkr-border-subtle);
  -webkit-backdrop-filter: blur(var(--wlkr-icon-button-glass-blur)) saturate(var(--wlkr-icon-button-glass-saturation));
  backdrop-filter: blur(var(--wlkr-icon-button-glass-blur)) saturate(var(--wlkr-icon-button-glass-saturation));
}
.wlkr-icon-button[data-variant=plain] { --wlkr-icon-button-ink: var(--wlkr-content-secondary); }
.wlkr-icon-button[data-variant=outline] { --wlkr-icon-button-line: var(--wlkr-border-default); }
.wlkr-icon-button[aria-pressed=true] {
  --wlkr-icon-button-fill: var(--wlkr-brand);
  --wlkr-icon-button-ink: var(--wlkr-brand-ink);
  --wlkr-icon-button-line: transparent;
}
.wlkr-icon-button[aria-pressed=true]::after {
  content: ''; position: absolute; bottom: var(--wlkr-space-0_5); left: 50%; translate: -50% 0;
  width: var(--wlkr-space-0_5); height: var(--wlkr-space-0_5); border-radius: var(--wlkr-radius-full);
  background: var(--wlkr-brand-ink);
}
.wlkr-icon-button:focus-visible { outline: var(--wlkr-focus-width) solid var(--wlkr-focus-ring); outline-offset: var(--wlkr-focus-offset); }
.wlkr-icon-button:active { transform: scale(var(--wlkr-press-scale)); }
.wlkr-icon-button:disabled { opacity: var(--wlkr-disabled-opacity); cursor: default; transform: none; pointer-events: none; }

@media (hover: hover) and (pointer: fine) {
  .wlkr-icon-button:not(:disabled, [aria-pressed=true]):hover {
    --wlkr-icon-button-fill: var(--wlkr-fill-hover);
    --wlkr-icon-button-ink: var(--wlkr-content-primary);
  }
  .wlkr-icon-button:is([data-variant=glass], [data-variant=outline]):not(:disabled, [aria-pressed=true]):hover {
    --wlkr-icon-button-line: var(--wlkr-border-strong);
  }
  .wlkr-icon-button[data-variant=glass]:not(:disabled, [aria-pressed=true]):hover {
    --wlkr-icon-button-fill: color-mix(in srgb, var(--wlkr-fill-secondary) var(--wlkr-icon-button-glass-opacity), transparent);
  }
}
@media (prefers-reduced-motion: reduce) {
  .wlkr-icon-button { transition: none; }
  .wlkr-icon-button:active { transform: none; }
}
`

export function IconButton({ variant = "glass", size = "default", type = "button", className, children, ...props }: IconButtonProps) {
  return <>
    <style href="wlkr-icon-button" precedence="default">{styles}</style>
    <button {...props} type={type} data-variant={variant} data-size={size} className={cn("wlkr-icon-button", className)}>
      {children}
    </button>
  </>
}
