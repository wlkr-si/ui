"use client"

import { useState } from "react"
import { Copy, Pencil } from "lucide-react"
import { Menu } from "@/registry/wlkr/menu"

export function MenuDemo() {
  const [selection, setSelection] = useState("")

  return <div className="flex flex-col items-center gap-2">
    <Menu items={[
      { id: "rename", label: "Rename", icon: <Pencil />, onSelect: () => setSelection("Rename selected") },
      { id: "duplicate", label: "Duplicate", icon: <Copy />, onSelect: () => setSelection("Duplicate selected") },
    ]} />
    <output className="text-xs text-muted-foreground empty:sr-only">{selection}</output>
  </div>
}
