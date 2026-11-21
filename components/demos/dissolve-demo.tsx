"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Dissolve } from "@/registry/wlkr/dissolve"

export function DissolveDemo() {
  const [shown, setShown] = React.useState(true)
  return (
    <div className="flex w-full flex-col items-start gap-5">
      <div className="flex w-full flex-col gap-4">
        <Dissolve show={shown} cell={4}>
          <p className="text-4xl font-semibold tracking-tighter">Less, but better.</p>
        </Dissolve>
        <Dissolve show={shown} delay={120} cell={4}>
          <p className="max-w-md text-sm text-muted-foreground">Brand Studio keeps what earns its place and lets the rest go. Every screen ships with one idea, done well.</p>
        </Dissolve>
        <Dissolve show={shown} delay={240} cell={6}>
          <div className="h-24 w-full bg-foreground" />
        </Dissolve>
      </div>
      <Button variant="ghost" onClick={() => setShown(value => !value)}>{shown ? "Dissolve out" : "Dissolve in"}</Button>
    </div>
  )
}
