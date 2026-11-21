"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Countdown } from "@/registry/wlkr/countdown"

const SECOND = 1000
const presets = [
  { label: "10 seconds", length: 10 * SECOND },
  { label: "5 minutes", length: 5 * 60 * SECOND },
  { label: "3 days", length: 3 * 86400 * SECOND },
]

export function CountdownDemo() {
  const [target, setTarget] = React.useState<number | null>(null)
  React.useEffect(() => {
    const timer = window.setTimeout(() => setTarget(Date.now() + (2 * 86400 + 7 * 3600 + 41 * 60 + 8) * SECOND), 0)
    return () => window.clearTimeout(timer)
  }, [])
  return (
    <div className="flex w-full flex-col items-start gap-6">
      <Countdown
        to={target ?? NaN}
        completed={<span>Launched.</span>}
        aria-label="Time until WeatherGoblin launches"
        className="min-h-[64px] text-[40px] font-semibold tracking-[-0.04em] sm:min-h-[80px] sm:text-[56px]"
      />
      <div className="flex flex-wrap items-center gap-2">
        {presets.map(preset => <Button key={preset.label} variant="ghost" onClick={() => setTarget(Date.now() + preset.length)}>{preset.label}</Button>)}
      </div>
    </div>
  )
}
