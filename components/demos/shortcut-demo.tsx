"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Shortcut } from "@/registry/wlkr/shortcut"

export function ShortcutDemo() {
  const [sent, setSent] = React.useState(0)
  const send = () => setSent(count => count + 1)
  return <div className="flex flex-col items-start gap-5">
    <div className="flex flex-col items-start gap-2">
      <Button type="button" variant="ghost" onClick={send} className="min-h-11 gap-8 pr-2.5">
        Send
        <Shortcut keys="mod+enter" onTrigger={send} />
      </Button>
      <p className="min-h-4 text-xs text-muted-foreground tabular-nums">{sent > 0 ? `Sent ${sent} ${sent === 1 ? "time" : "times"}` : ""}</p>
    </div>
    <div className="flex flex-wrap items-center gap-4">
      <Shortcut keys="shift+?" size="sm" />
      <Shortcut keys="ctrl+shift+p" size="sm" />
      <Shortcut keys="escape" size="sm" />
    </div>
  </div>
}
