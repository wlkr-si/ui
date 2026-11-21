"use client"

import * as React from "react"
import { TagInput } from "@/registry/wlkr/tag-input"

export function TagInputDemo() {
  const [tags, setTags] = React.useState(["Design", "Pixels", "Motion"])
  return (
    <div className="w-full max-w-sm">
      <TagInput value={tags} onValueChange={setTags} placeholder="Add a tag" max={8} aria-label="Topics" />
    </div>
  )
}
