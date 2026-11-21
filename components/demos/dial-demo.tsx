"use client"

import { useState } from "react"
import { Dial } from "@/registry/wlkr/dial"

function formatPan(n: number) {
  if (n === 0) return "C"
  return n < 0 ? `L${-n}` : `R${n}`
}

export function DialDemo() {
  const [gain, setGain] = useState(64)
  return (
    <div className="flex flex-wrap items-start justify-center gap-10">
      <Dial label="Gain" value={gain} onValueChange={setGain} />
      <Dial label="Pan" min={-50} max={50} defaultValue={0} format={formatPan} />
    </div>
  )
}
