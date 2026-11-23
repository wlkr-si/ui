"use client"

import { useState } from "react"
import { Download, Copy, MoreHorizontal } from "lucide-react"
import { Menu } from "@/registry/wlkr/menu"
import { IconButton } from "@/registry/wlkr/icon-button"

export function MenuDemo() {
  const [selection, setSelection] = useState("")
  const items = [
    { id: "svg", label: "Export SVG", icon: <Download />, onSelect: () => setSelection("SVG selected") },
    { id: "png", label: "Export PNG", icon: <Download />, onSelect: () => setSelection("PNG selected") },
    { id: "separator", type: "separator" as const },
    { id: "copy", label: "Copy link", icon: <Copy />, onSelect: () => setSelection("Copy selected") },
    { id: "pdf", label: "Export PDF", disabled: true },
  ]
  return <div className="flex flex-wrap items-center justify-center gap-4">
    <Menu align="start" items={items} />
    <Menu label="Export options" trigger={<IconButton variant="plain" aria-label="Export options"><MoreHorizontal aria-hidden="true" /></IconButton>} items={items} />
    <output className="text-xs text-muted-foreground" aria-live="polite">{selection}</output>
  </div>
}
