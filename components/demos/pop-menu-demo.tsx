"use client"

import * as React from "react"
import { PopMenu, type PopMenuItem } from "@/registry/wlkr/pop-menu"

export function PopMenuDemo() {
  const [last, setLast] = React.useState("none")
  const act = (name: string) => () => setLast(name)
  const items: PopMenuItem[] = [
    { id: "open", label: "Open", shortcut: "⌘O", onSelect: act("open") },
    { id: "rename", label: "Rename", shortcut: "F2", onSelect: act("rename") },
    { id: "duplicate", label: "Duplicate", shortcut: "⌘D", onSelect: act("duplicate") },
    { id: "share", label: "Share", onSelect: act("share") },
    { id: "archive", label: "Archive", disabled: true },
    { separator: true },
    { id: "delete", label: "Delete", shortcut: "⌫", danger: true, onSelect: act("delete") },
  ]
  return (
    <div className="flex min-h-[260px] w-full flex-col items-start gap-4">
      <PopMenu label="File" items={items} />
      <p className="font-mono text-xs text-muted-foreground">last: {last}</p>
    </div>
  )
}
