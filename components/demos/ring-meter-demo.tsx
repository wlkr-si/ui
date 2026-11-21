"use client"

import { useState } from "react"
import { RingMeter } from "@/registry/wlkr/ring-meter"

const button = "h-8 min-w-12 border border-border px-2 font-mono text-xs tabular-nums hover:bg-foreground hover:text-background disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-foreground"

export function RingMeterDemo() {
  const [cpu, setCpu] = useState(24)
  return (
    <div className="flex w-full flex-wrap items-start justify-center gap-8">
      <div className="flex flex-col items-center gap-3">
        <RingMeter value={cpu} label="CPU" />
        <div className="flex gap-2">
          <button type="button" className={button} disabled={cpu <= 0} onClick={() => setCpu(v => Math.max(0, v - 10))}>−10</button>
          <button type="button" className={button} disabled={cpu >= 100} onClick={() => setCpu(v => Math.min(100, v + 10))}>+10</button>
        </div>
      </div>
      <RingMeter value={68} label="Disk" />
      <RingMeter value={100} label="Build" />
    </div>
  )
}
