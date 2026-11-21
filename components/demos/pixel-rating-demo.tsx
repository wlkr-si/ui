"use client"

import * as React from "react"
import { PixelRating } from "@/registry/wlkr/pixel-rating"

export function PixelRatingDemo() {
  const [value, setValue] = React.useState(3)
  return (
    <div className="flex w-full flex-col items-start gap-6">
      <div className="flex items-center gap-4">
        <PixelRating value={value} onValueChange={setValue} size="lg" aria-label="Rating" />
        <span className="font-mono text-sm tabular-nums" aria-hidden="true">{value}/5</span>
      </div>
      <PixelRating defaultValue={7} max={10} readOnly size="sm" aria-label="Rated 7 of 10" />
    </div>
  )
}
