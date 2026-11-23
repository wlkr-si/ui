"use client"

import { useState } from "react"
import { Repeat } from "lucide-react"
import { IconButton } from "@/registry/wlkr/icon-button"

export function IconButtonDemo() {
  const [repeat, setRepeat] = useState(false)
  return <div className="flex justify-center">
    <IconButton aria-label="Repeat" aria-pressed={repeat} onClick={() => setRepeat(on => !on)}>
      <Repeat aria-hidden="true" />
    </IconButton>
  </div>
}
