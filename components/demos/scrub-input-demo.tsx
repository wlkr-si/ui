"use client"

import * as React from "react"
import { ScrubInput } from "@/registry/wlkr/scrub-input"

export function ScrubInputDemo() {
  const [width, setWidth] = React.useState(72)
  const [radius, setRadius] = React.useState(2)
  const [opacity, setOpacity] = React.useState(100)
  return (
    <div className="flex w-full flex-col items-start gap-5">
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <ScrubInput label="Width" unit="px" min={24} max={120} value={width} onValueChange={setWidth} />
        <ScrubInput label="Radius" unit="px" min={0} max={40} value={radius} onValueChange={setRadius} />
        <ScrubInput label="Opacity" unit="%" min={0} max={100} step={5} value={opacity} onValueChange={setOpacity} />
      </div>
      <div className="flex h-[120px] w-[120px] items-center justify-center">
        <div className="bg-foreground" style={{ width, height: width, borderRadius: Math.min(radius, width / 2), opacity: opacity / 100 }} />
      </div>
    </div>
  )
}
