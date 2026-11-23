"use client"

import { useState } from "react"
import { Piano, Music2 } from "lucide-react"
import { Chip } from "@/registry/wlkr/chip"

export function ChipDemo() {
  const [pressed, setPressed] = useState(true)
  return <div className="flex flex-wrap items-center justify-center gap-3">
    <Chip swatch="var(--brand,#33f282)" pressed={pressed} onPressedChange={setPressed}>Piano</Chip>
    <Chip icon={<Piano />} defaultPressed={false}>Harpsichord</Chip>
    <Chip icon={<Music2 />} disabled>Unavailable</Chip>
    <Chip as="span" swatch="var(--foreground,#010101)">Reference</Chip>
  </div>
}
