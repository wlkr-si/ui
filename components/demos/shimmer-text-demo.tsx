"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { ShimmerText } from "@/registry/wlkr/shimmer-text"

const tasks = [
  { text: "Thinking…", duration: 1400 },
  { text: "Reading 12 files in Brand Studio…", duration: 2000 },
  { text: "Drafting a reply…", duration: 1700 },
]

export function ShimmerTextDemo() {
  const [active, setActive] = React.useState(true)
  return (
    <div className="flex w-full flex-col items-start gap-5">
      <div className="flex max-w-full flex-col items-start gap-2 text-[15px]">
        {tasks.map(task => <ShimmerText key={task.text} as="p" active={active} duration={task.duration}>{task.text}</ShimmerText>)}
      </div>
      <Button variant="ghost" onClick={() => setActive(value => !value)}>{active ? "Finish" : "Start again"}</Button>
    </div>
  )
}
