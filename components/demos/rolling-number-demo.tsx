"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { RollingNumber } from "@/registry/wlkr/rolling-number"

const START = 9472
const changes = [
  { label: "+1", amount: 1 },
  { label: "+987", amount: 987 },
  { label: "−250", amount: -250 },
]

export function RollingNumberDemo() {
  const [total, setTotal] = React.useState(START)
  return (
    <div className="flex flex-col items-start gap-5">
      <div className="flex flex-col gap-3">
        <RollingNumber value={total} className="text-[64px] font-semibold tracking-[-0.045em]" />
        <RollingNumber value={total * 12} format={{ style: "currency", currency: "USD" }} className="text-sm text-muted-foreground" />
      </div>
      <div className="flex flex-wrap gap-1">
        {changes.map(change => <Button key={change.label} variant="ghost" className="min-h-11 tabular-nums" onClick={() => setTotal(value => Math.max(0, value + change.amount))}>{change.label}</Button>)}
        <Button variant="ghost" className="min-h-11" onClick={() => setTotal(START)}>Reset</Button>
      </div>
    </div>
  )
}
