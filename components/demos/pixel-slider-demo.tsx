"use client"

import * as React from "react"
import { PixelSlider } from "@/registry/wlkr/pixel-slider"

export function PixelSliderDemo() {
  const [volume, setVolume] = React.useState(64)
  const [resolution, setResolution] = React.useState(32)
  return (
    <div className="flex w-full flex-col items-start gap-5">
      <div className="flex w-full flex-col gap-2">
        <span className="text-xs text-muted-foreground">Volume</span>
        <PixelSlider label="Volume" value={volume} onValueChange={setVolume} showValue />
      </div>
      <div className="flex w-full flex-col gap-2">
        <span className="text-xs text-muted-foreground">Resolution</span>
        <PixelSlider label="Resolution" min={8} max={64} step={8} rows={2} value={resolution} onValueChange={setResolution} formatValue={value => `${value} px`} showValue />
      </div>
    </div>
  )
}
