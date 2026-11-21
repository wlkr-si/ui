"use client"

import * as React from "react"
import { CommandMenu, type CommandMenuItem } from "@/registry/wlkr/command-menu"

export function CommandMenuDemo() {
  const [open, setOpen] = React.useState(false)
  const [last, setLast] = React.useState<string | null>(null)

  const items = React.useMemo<CommandMenuItem[]>(() => {
    const make = (id: string, label: string, group: string, shortcut?: string, keywords?: string[]): CommandMenuItem => ({
      id, label, group, shortcut, keywords, onSelect: () => setLast(label),
    })
    return [
      make("new", "New project", "Projects", "⌘N", ["create", "add"]),
      make("open", "Open project", "Projects", "⌘O", ["switch"]),
      make("deploy", "Deploy to production", "Projects", "⌘⇧D", ["ship", "release"]),
      make("logs", "View build logs", "Projects", undefined, ["output", "errors"]),
      make("theme", "Toggle theme", "System", "⌘J", ["dark", "light"]),
      make("settings", "Open settings", "System", "⌘,", ["preferences"]),
      make("docs", "Search docs", "System", "?", ["help"]),
      make("signout", "Sign out", "System", undefined, ["logout"]),
    ]
  }, [])

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-10 border border-foreground bg-transparent px-4 font-mono text-sm hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand,#33f282)]"
      >
        Open menu
      </button>
      <p className="font-mono text-xs text-muted-foreground" aria-live="polite">
        &gt; {last ?? "_"}
      </p>
      <CommandMenu items={items} open={open} onOpenChange={setOpen} hotkey={false} placeholder="Search commands" />
    </div>
  )
}
