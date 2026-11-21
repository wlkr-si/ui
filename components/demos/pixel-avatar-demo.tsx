"use client"

import * as React from "react"
import { PixelAvatar, PixelAvatarGroup } from "@/registry/wlkr/pixel-avatar"

const names = ["Brand Studio", "WeatherGoblin", "PatriBible", "wlkr/ui", "WLKR.SI"]
const team = ["Brand Studio", "WeatherGoblin", "PatriBible", "wlkr/ui", "WLKR.SI", "studio@wlkr.si", "build-0117"]

export function PixelAvatarDemo() {
  const [seed, setSeed] = React.useState("Brand Studio")
  return (
    <div className="flex w-full flex-col items-start gap-6">
      <div className="flex flex-wrap items-center gap-3">
        {names.map(name => <PixelAvatar key={name} seed={name} size={48} />)}
      </div>
      <PixelAvatarGroup label="Project members" max={4} size={36}>
        {team.map(name => <PixelAvatar key={name} seed={name} />)}
      </PixelAvatarGroup>
      <div className="flex max-w-full items-end gap-5">
        <PixelAvatar seed={seed} size={96} grid={7} />
        <label className="flex min-w-0 flex-col gap-1 text-xs text-muted-foreground">
          Seed
          <input value={seed} onChange={event => setSeed(event.target.value)} spellCheck={false} autoComplete="off" className="w-44 min-w-0 max-w-full rounded-none border-0 border-b border-border bg-transparent py-2 text-sm text-foreground outline-offset-4" />
        </label>
      </div>
    </div>
  )
}
