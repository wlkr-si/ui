"use client"

import { useState } from "react"
import { Repeat } from "lucide-react"
import { Button } from "@/registry/wlkr/button"

export default function ButtonPressed() {
  const [on, setOn] = useState(true)
  return <Button variant="outline" aria-pressed={on} onClick={() => setOn(!on)}><Repeat aria-hidden="true" />Repeat</Button>
}
