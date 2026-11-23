"use client"

import { useState } from "react"
import { Segmented } from "@/registry/wlkr/segmented"

const options = [{ value: "day", label: "Day" }, { value: "week", label: "Week" }, { value: "month", label: "Month" }]
export function SegmentedDemo() {
  const [value, setValue] = useState("week")
  return <div className="flex flex-wrap items-center justify-center gap-4">
    <Segmented label="View" options={options} value={value} onValueChange={setValue} />
    <Segmented size="sm" label="Range" options={options} defaultValue="day" />
    <Segmented size="sm" aria-label="Unavailable range" options={options} defaultValue="month" disabled />
  </div>
}
