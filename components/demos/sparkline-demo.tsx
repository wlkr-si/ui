"use client"

import * as React from "react"
import { Sparkline } from "@/registry/wlkr/sparkline"

const rows = [
  { name: "req/s", data: [42, 44, 41, 47, 52, 50, 49, 55, 58, 54, 60, 63, 61, 66, 64, 70, 72, 69, 74, 78, 76, 81, 84, 82], fill: false },
  { name: "p95 ms", data: [210, 198, 205, 220, 240, 236, 228, 251, 262, 248, 233, 219, 224, 230, 212, 204, 199, 207, 196, 188, 192, 185], fill: true },
  { name: "errors", data: [3, 2, 4, 3, 1, 0, 0, 2, 5, 9, 7, 4, 2, 1, 1, 0, 2, 1, 0, 0, 1, 0, 0, 0, 1, 0], fill: false },
]

function Row({ name, data, fill }: (typeof rows)[number]) {
  const [value, setValue] = React.useState<number | null>(null)
  const shown = value ?? data[data.length - 1]
  return (
    <li className="flex items-center gap-4">
      <span className="w-16 font-mono text-xs text-muted-foreground">{name}</span>
      <Sparkline data={data} fill={fill} label={name} width={180} height={36} onScrub={point => setValue(point ? point.value : null)} />
      <span className="w-10 text-right font-mono text-sm tabular-nums">{shown}</span>
    </li>
  )
}

export function SparklineDemo() {
  return (
    <ul className="flex flex-col gap-4">
      {rows.map(row => <Row key={row.name} {...row} />)}
    </ul>
  )
}
