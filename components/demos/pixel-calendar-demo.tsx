"use client"

import * as React from "react"
import { PixelCalendar } from "@/registry/wlkr/pixel-calendar"

const start = new Date(2026, 10, 20)

export function PixelCalendarDemo() {
  const [date, setDate] = React.useState<Date | null>(start)
  const readout = date
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
    : "----------"
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <PixelCalendar defaultValue={start} defaultMonth={start} onValueChange={setDate} />
      <output className="font-mono text-xs tracking-widest tabular-nums" aria-live="polite">{readout}</output>
    </div>
  )
}
