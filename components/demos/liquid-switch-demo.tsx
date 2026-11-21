"use client"

import * as React from "react"
import { LiquidSwitch } from "@/registry/wlkr/liquid-switch"

export function LiquidSwitchDemo() {
  const [notifications, setNotifications] = React.useState(true)
  const [digest, setDigest] = React.useState(false)
  const [calm, setCalm] = React.useState(false)
  const rows = [
    { label: "Notifications", checked: notifications, onChange: setNotifications, tone: "brand" as const, size: "md" as const },
    { label: "Weekly digest", checked: digest, onChange: setDigest, tone: "brand" as const, size: "md" as const },
    { label: "Reduce motion", checked: calm, onChange: setCalm, tone: "ink" as const, size: "sm" as const },
  ]
  return (
    <div className="flex w-full max-w-[280px] flex-col items-stretch gap-1">
      {rows.map(row => (
        <label key={row.label} className="flex min-h-11 cursor-pointer items-center justify-between gap-4 text-sm">
          {row.label}
          <LiquidSwitch checked={row.checked} onCheckedChange={row.onChange} tone={row.tone} size={row.size} />
        </label>
      ))}
    </div>
  )
}
