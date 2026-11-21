"use client"

import * as React from "react"
import { DitherDialog } from "@/registry/wlkr/dither-dialog"

const button =
  "inline-flex h-9 items-center border border-foreground px-4 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand,#33f282)]"

export function DitherDialogDemo() {
  const [open, setOpen] = React.useState(false)
  const [outcome, setOutcome] = React.useState("none")

  const finish = (result: string) => {
    setOutcome(result)
    setOpen(false)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button type="button" className={`${button} hover:bg-foreground hover:text-background`} onClick={() => setOpen(true)}>
        Delete project
      </button>
      <p className="font-mono text-xs text-muted-foreground">last: {outcome}</p>
      <DitherDialog
        open={open}
        onOpenChange={next => {
          if (!next) finish("dismissed")
          else setOpen(true)
        }}
        size="sm"
        title="Delete project?"
        description="Pixels and its 12 deploys will be removed. This cannot be undone."
        actions={
          <>
            <button type="button" className={`${button} hover:bg-foreground hover:text-background`} onClick={() => finish("cancelled")}>
              Cancel
            </button>
            <button type="button" className={`${button} bg-foreground text-background hover:opacity-90`} onClick={() => finish("deleted")}>
              Delete
            </button>
          </>
        }
      />
    </div>
  )
}
