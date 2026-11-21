"use client"

import * as React from "react"
import { Switch } from "@/components/ui/switch"
import { PixelWave } from "@/registry/wlkr/pixel-wave"

export function PixelWaveDemo() {
  const [listening, setListening] = React.useState(true)
  return (
    <div className="flex w-full flex-col items-center gap-8">
      <PixelWave active={listening} label={listening ? "Listening" : "Idle"} />
      <div className="flex w-full flex-wrap items-center justify-between gap-4">
        <label className="flex min-h-11 items-center gap-3 text-xs text-muted-foreground"><Switch checked={listening} onCheckedChange={setListening} />Listening</label>
        <div className="flex items-center gap-3">
          <PixelWave bars={12} rows={5} mirror={false} tone="brand" cell={3} gap={1} />
          <span className="text-xs tabular-nums text-muted-foreground">Recording 00:42</span>
        </div>
      </div>
    </div>
  )
}
