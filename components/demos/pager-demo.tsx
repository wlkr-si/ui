"use client"

import * as React from "react"
import { Pager } from "@/registry/wlkr/pager"

const titles = [
  "Starting with a blank page.",
  "Paper white and ink black.",
  "Dither, and why we like it.",
  "One green, used sparingly.",
  "Numbers that roll.",
  "The block caret.",
  "Goo that stretches and snaps.",
  "Motion that means something.",
  "Square corners.",
  "Reduced motion, done properly.",
  "Fewer, better components.",
  "Shipping on a Friday.",
]

export function PagerDemo() {
  const [page, setPage] = React.useState(3)
  return (
    <div className="flex w-full flex-col items-start gap-5">
      <p className="text-sm">
        <span className="text-muted-foreground">Field notes, page {page} — </span>{titles[page - 1]}
      </p>
      <Pager page={page} count={titles.length} onPageChange={setPage} label="Field notes" />
    </div>
  )
}
