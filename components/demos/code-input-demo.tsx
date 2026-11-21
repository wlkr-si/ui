"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { CodeInput } from "@/registry/wlkr/code-input"

export function CodeInputDemo() {
  const [code, setCode] = React.useState("")
  const [status, setStatus] = React.useState<"idle" | "error" | "success">("idle")
  const timers = React.useRef<number[]>([])
  const clear = () => { timers.current.forEach(window.clearTimeout); timers.current = [] }
  React.useEffect(() => () => timers.current.forEach(window.clearTimeout), [])

  const check = (next: string) => {
    clear()
    timers.current.push(window.setTimeout(() => {
      if (next === "424242") return setStatus("success")
      setStatus("error")
      timers.current.push(window.setTimeout(() => { setCode(""); setStatus("idle") }, 900))
    }, 600))
  }
  const change = (next: string) => { clear(); setCode(next); setStatus("idle") }
  const fill = () => { change("424242"); check("424242") }
  const reset = () => change("")

  return (
    <div className="flex w-full flex-col items-start gap-5">
      <CodeInput label="Verification code for Brand Studio" groups={[3, 3]} value={code} status={status} onValueChange={change} onComplete={check} />
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={fill}>Fill 424242</Button>
        <Button variant="ghost" onClick={reset}>Reset</Button>
      </div>
    </div>
  )
}
