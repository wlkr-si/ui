"use client"

import * as React from "react"
import { PixelButton } from "@/registry/wlkr/pixel-button"

export function PixelButtonDemo() {
  const [loading, setLoading] = React.useState(false)
  const timer = React.useRef<number | undefined>(undefined)
  React.useEffect(() => () => window.clearTimeout(timer.current), [])
  const save = () => {
    setLoading(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setLoading(false), 1800)
  }
  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <PixelButton variant="solid">Deploy</PixelButton>
        <PixelButton variant="outline">Preview</PixelButton>
        <PixelButton variant="brand">Ship it</PixelButton>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <PixelButton size="sm" variant="outline">Small</PixelButton>
        <PixelButton size="md" variant="outline">Medium</PixelButton>
        <PixelButton size="lg" variant="outline">Large</PixelButton>
      </div>
      <PixelButton variant="brand" loading={loading} onClick={save}>Save</PixelButton>
    </div>
  )
}
