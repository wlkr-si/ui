"use client"

import { useState } from "react"
import { Play, Repeat, Download, Volume2, Pause } from "lucide-react"
import { IconButton } from "@/registry/wlkr/icon-button"

export function IconButtonDemo() {
  const [repeat, setRepeat] = useState(true)
  return <div className="flex flex-wrap items-center justify-center gap-4">
    <IconButton size="sm" aria-label="Play"><Play aria-hidden="true" /></IconButton>
    <IconButton aria-label="Pause"><Pause aria-hidden="true" /></IconButton>
    <IconButton size="lg" variant="plain" aria-label="Repeat" aria-pressed={repeat} onClick={() => setRepeat(!repeat)}><Repeat aria-hidden="true" /></IconButton>
    <IconButton variant="outline" aria-label="Download"><Download aria-hidden="true" /></IconButton>
    <IconButton disabled variant="plain" aria-label="Volume"><Volume2 aria-hidden="true" /></IconButton>
  </div>
}
