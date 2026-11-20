"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { PixelProgress } from "@/registry/wlkr/pixel-progress"

const UPLOAD: [number, number][] = [[0, 0], [220, 14], [480, 29], [700, 37], [1000, 43], [2500, 51], [3000, 72], [3450, 91], [3900, 100]]

export function PixelProgressDemo() {
  const [value, setValue] = React.useState(64)
  const [unknown, setUnknown] = React.useState(false)
  const timers = React.useRef<number[]>([])
  const clear = () => { timers.current.forEach(window.clearTimeout); timers.current = [] }
  React.useEffect(() => () => timers.current.forEach(window.clearTimeout), [])
  const start = () => { clear(); timers.current = UPLOAD.map(([delay, next]) => window.setTimeout(() => setValue(next), delay)) }
  const reset = () => { clear(); setValue(0) }
  return (
    <div className="flex w-full flex-col items-start gap-5">
      <PixelProgress label="Uploading WeatherGoblin assets" value={unknown ? null : value} showValue />
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={start}>Start</Button>
        <Button variant="ghost" onClick={reset}>Reset</Button>
        <label className="ml-2 flex min-h-11 items-center gap-3 text-xs text-muted-foreground"><Switch checked={unknown} onCheckedChange={setUnknown} />Unknown length</label>
      </div>
    </div>
  )
}
