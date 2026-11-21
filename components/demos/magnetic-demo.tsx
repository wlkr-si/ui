"use client"

import { Button } from "@/components/ui/button"
import { Magnetic } from "@/registry/wlkr/magnetic"

export function MagneticDemo() {
  return (
    <div className="flex w-full flex-wrap items-center gap-12 py-10">
      <Magnetic>
        <Button variant="ghost">Start a project</Button>
      </Magnetic>
      <Magnetic>
        <a href="#magnetic" className="text-sm underline underline-offset-4">Read the notes</a>
      </Magnetic>
      <Magnetic strength={0.5}>
        <button type="button" aria-label="Open" className="flex size-14 items-center justify-center bg-foreground text-xl text-background">↗</button>
      </Magnetic>
    </div>
  )
}
