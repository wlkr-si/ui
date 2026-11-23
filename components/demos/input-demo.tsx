"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/registry/wlkr/input"

export function InputDemo() {
  const [value, setValue] = useState("Bach")
  return <div className="flex flex-wrap items-center justify-center gap-4">
    <Input aria-label="Search recordings" icon={<Search />} value={value} onChange={event => setValue(event.target.value)} clearable />
    <Input size="sm" aria-label="Title" placeholder="Title" />
    <Input aria-label="Invalid title" aria-invalid="true" defaultValue="Untitled" />
    <Input disabled aria-label="Unavailable input" placeholder="Unavailable" />
  </div>
}
