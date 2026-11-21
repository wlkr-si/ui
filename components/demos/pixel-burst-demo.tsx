"use client"

import * as React from "react"
import { PixelBurst } from "@/registry/wlkr/pixel-burst"

export function PixelBurstDemo() {
  const [fired, setFired] = React.useState(0)
  return (
    <div className="flex items-center justify-center gap-6 p-[120px]">
      <PixelBurst>
        <button
          type="button"
          onClick={() => setFired(n => n + 1)}
          className="h-10 rounded-none bg-foreground px-5 text-sm font-medium text-background outline-offset-2 focus-visible:outline-2 focus-visible:outline-[var(--brand,#33f282)]"
        >
          Ship it
        </button>
      </PixelBurst>
      <span className="font-mono text-xs tabular-nums text-muted-foreground" aria-live="polite">
        {String(fired).padStart(3, "0")}
      </span>
    </div>
  )
}
