"use client"

import * as React from "react"
import { LiquidTabs } from "@/registry/wlkr/liquid-tabs"

const views = [
  { value: "overview", label: "Overview", note: "Brand Studio ships on Friday." },
  { value: "activity", label: "Activity", note: "12 updates since Monday." },
  { value: "files", label: "Files", note: "3 files changed today." },
  { value: "settings", label: "Settings", note: "Only you can edit this project." },
]

const ranges = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
]

export function LiquidTabsDemo() {
  const [view, setView] = React.useState("overview")
  const note = views.find(item => item.value === view)?.note
  return (
    <div className="flex max-w-full flex-col items-start gap-5">
      <div className="flex max-w-full flex-col items-start gap-3">
        <LiquidTabs label="Project view" items={views} value={view} onValueChange={setView} />
        <p className="text-sm" aria-live="polite">{note}</p>
      </div>
      <LiquidTabs label="Range" items={ranges} tone="brand" size="sm" defaultValue="week" />
    </div>
  )
}
