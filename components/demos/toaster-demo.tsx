"use client"

import { Button } from "@/components/ui/button"
import { Toaster, toast } from "@/registry/wlkr/toaster"

export function ToasterDemo() {
  return (
    <div className="flex w-full flex-col items-start gap-5">
      <Toaster />
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" onClick={() => toast.success("Changes saved")}>Saved</Button>
        <Button
          variant="ghost"
          onClick={() => toast.error("Couldn't publish", {
            description: "Check your connection and try again.",
            action: { label: "Retry", onClick: () => toast.success("Brand Studio published") },
          })}
        >
          Failed
        </Button>
        <Button variant="ghost" onClick={() => toast("Project archived", { action: { label: "Undo", onClick: () => toast("Project restored") } })}>With action</Button>
      </div>
    </div>
  )
}
