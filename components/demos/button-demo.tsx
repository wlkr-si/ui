"use client"

import { useState } from "react"
import { Download, Play } from "lucide-react"
import { Button } from "@/registry/wlkr/button"

export function ButtonDemo() {
  const [pressed, setPressed] = useState(false)
  return <div className="flex flex-wrap items-center justify-center gap-3">
    <Button glow><Play aria-hidden="true" />Listen</Button>
    <Button variant="outline" aria-pressed={pressed} onClick={() => setPressed(!pressed)}>Repeat</Button>
    <Button variant="quiet">Cancel</Button>
    <Button variant="destructive">Delete</Button>
    <Button size="sm"><Download aria-hidden="true" />Save</Button>
    <Button size="lg">Continue</Button>
    <Button loading>Saving</Button>
    <Button disabled>Unavailable</Button>
    <Button asChild variant="quiet"><a href="#usage">Usage</a></Button>
  </div>
}
