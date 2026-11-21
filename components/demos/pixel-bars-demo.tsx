"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { PixelBars, type PixelBarsDatum } from "@/registry/wlkr/pixel-bars"

const days = (labels: string[], values: number[]) => values.map((value, index) => ({ label: labels[index], value }))
const THIS: PixelBarsDatum[] = days(
  ["Sat 7", "Sun 8", "Mon 9", "Tue 10", "Wed 11", "Thu 12", "Fri 13", "Sat 14", "Sun 15", "Mon 16", "Tue 17", "Wed 18", "Thu 19", "Fri 20"],
  [1, 0, 6, 9, 7, 11, 5, 2, 1, 8, 12, 9, 10, 7],
)
const LAST: PixelBarsDatum[] = days(
  ["Sat 24", "Sun 25", "Mon 26", "Tue 27", "Wed 28", "Thu 29", "Fri 30", "Sat 31", "Sun 1", "Mon 2", "Tue 3", "Wed 4", "Thu 5", "Fri 6"],
  [0, 2, 5, 7, 4, 9, 6, 1, 0, 4, 6, 10, 8, 3],
)
const deploys = (value: number) => `${value} ${value === 1 ? "deploy" : "deploys"}`

export function PixelBarsDemo() {
  const [current, setCurrent] = React.useState(true)
  return (
    <div className="flex w-full flex-col items-start gap-5">
      <PixelBars label="Deploys per day" data={current ? THIS : LAST} rows={12} max={12} formatValue={deploys} />
      <div className="flex items-center gap-2">
        <Button variant="ghost" aria-pressed={current} onClick={() => setCurrent(true)}>This fortnight</Button>
        <Button variant="ghost" aria-pressed={!current} onClick={() => setCurrent(false)}>Last fortnight</Button>
      </div>
    </div>
  )
}
