"use client"

import { useState } from "react"
import { Repeat } from "lucide-react"
import { IconButton } from "@/registry/wlkr/icon-button"

export default function IconButtonPressed() {
  const [repeat, setRepeat] = useState(true)
  return <IconButton variant="outline" aria-label="Repeat" aria-pressed={repeat} onClick={() => setRepeat(on => !on)}>
    <Repeat aria-hidden="true" />
  </IconButton>
}
