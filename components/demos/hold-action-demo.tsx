"use client"

import { HoldAction } from "@/registry/wlkr/hold-action"

export function HoldActionDemo() {
  return (
    <div className="flex flex-wrap items-center gap-5">
      <HoldAction onConfirm={() => {}}>Hold to publish</HoldAction>
      <HoldAction onConfirm={() => {}} tone="destructive" confirmedLabel="Deleted">Hold to delete</HoldAction>
    </div>
  )
}
