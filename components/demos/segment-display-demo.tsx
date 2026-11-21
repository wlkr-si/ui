"use client"

import { useState } from "react"
import { SegmentClock, SegmentDisplay } from "@/registry/wlkr/segment-display"

const button = "flex size-9 items-center justify-center border border-border font-mono text-lg leading-none hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"

export function SegmentDisplayDemo() {
  const [value, setValue] = useState(-12.5)
  const change = (delta: number) => setValue(v => Math.min(99.5, Math.max(-99.5, Math.round((v + delta) * 2) / 2)))
  return (
    <div className="flex flex-col items-center gap-8">
      <SegmentClock height={56} />
      <div className="flex items-center gap-4">
        <button type="button" className={button} aria-label="Decrease" onClick={() => change(-0.5)}>−</button>
        <SegmentDisplay value={value.toFixed(1)} tone="brand" pad={5} height={40} />
        <button type="button" className={button} aria-label="Increase" onClick={() => change(0.5)}>+</button>
      </div>
    </div>
  )
}
