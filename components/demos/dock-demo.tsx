"use client"

import * as React from "react"
import { House, Image as ImageIcon, LayoutGrid, PenLine, Search, Settings, Terminal } from "lucide-react"
import { Dock } from "@/registry/wlkr/dock"

const tools = [
  { label: "Home", icon: <House /> },
  { label: "Search", icon: <Search /> },
  { label: "Projects", icon: <LayoutGrid /> },
  { label: "Write", icon: <PenLine /> },
  { label: "Media", icon: <ImageIcon /> },
  { label: "Terminal", icon: <Terminal /> },
  { label: "Settings", icon: <Settings /> },
]

export function DockDemo() {
  const [active, setActive] = React.useState("Home")
  const items = tools.map(tool => ({ ...tool, active: tool.label === active, onSelect: () => setActive(tool.label) }))
  return (
    <div className="flex min-h-[200px] w-full min-w-0 items-end justify-center">
      <Dock label="Studio tools" items={items} />
    </div>
  )
}
