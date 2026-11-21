"use client"

import * as React from "react"
import { SoftCombobox } from "@/components/soft-combobox"
import { GithubStar } from "@/registry/wlkr/github-star"

const examples = [
  { value: "4530", label: "4,530" },
  { value: "0", label: "Zero" },
  { value: "123456789", label: "123,456,789" },
  { value: "unknown", label: "Unavailable" },
]

export function GithubStarDemo() {
  const [example, setExample] = React.useState("4530")
  return (
    <div className="flex flex-col items-start gap-5">
      <GithubStar repository="shadcn-ui/ui" count={example === "unknown" ? null : Number(example)} />
      <label className="flex items-center gap-3 text-xs text-muted-foreground">
        Example count
        <SoftCombobox label="GitHub star example count" value={example} onChange={setExample} options={examples} />
      </label>
    </div>
  )
}
