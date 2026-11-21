"use client"

import * as React from "react"
import { SplitFlap } from "@/registry/wlkr/split-flap"

const destinations = ["DALLAS", "FORT WORTH", "AUSTIN", "SAN ANTONIO"]

export function SplitFlapDemo() {
  const [index, setIndex] = React.useState(0)
  return (
    <div className="flex w-full flex-col items-start gap-5">
      <SplitFlap value={destinations[index]} length={10} accent announce />
      <div className="flex w-full items-center justify-between gap-4">
        <SplitFlap value={index % 2 ? "14:20" : "14:05"} size="sm" />
        <button
          type="button"
          onClick={() => setIndex(i => (i + 1) % destinations.length)}
          className="border border-foreground px-3 py-1.5 font-mono text-xs uppercase hover:bg-foreground hover:text-background"
        >
          Next
        </button>
      </div>
    </div>
  )
}
