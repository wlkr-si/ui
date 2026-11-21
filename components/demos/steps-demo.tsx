"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Steps } from "@/registry/wlkr/steps"

const flow = [
  { label: "Draft", description: "Words and images" },
  { label: "Review", description: "Two sign-offs" },
  { label: "Schedule" },
  { label: "Publish" },
]

export function StepsDemo() {
  const [current, setCurrent] = React.useState(1)
  const finished = current >= flow.length
  const next = () => setCurrent(finished ? 0 : current + 1)
  return (
    <div className="flex w-full flex-col items-start gap-8">
      <Steps label="Publish flow" items={flow} current={current} onStepSelect={setCurrent} />
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0}>Back</Button>
        <Button variant="ghost" onClick={next}>{finished ? "Start over" : current === flow.length - 1 ? "Done" : "Next"}</Button>
      </div>
    </div>
  )
}
