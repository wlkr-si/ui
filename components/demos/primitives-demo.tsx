"use client"

import * as React from "react"
import { ArrowUpRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

export function PrimitivesDemo() {
  const [continued, setContinued] = React.useState(false)
  const [notifications, setNotifications] = React.useState(true)
  return <div className="flex flex-col gap-7">
    <div className="demo-actions">
      <Button variant="ghost" onClick={() => setContinued(!continued)}>{continued ? <Check data-icon="inline-start" /> : <ArrowUpRight data-icon="inline-start" />}{continued ? "You’re all set" : "Continue"}</Button>
      <label className="flex min-h-11 items-center gap-3 text-sm"><Switch checked={notifications} onCheckedChange={setNotifications} />Notifications {notifications ? "on" : "off"}</label>
    </div>
    <div className="terminal-field">
      <label htmlFor="demo-name" className="sr-only">Your name</label>
      <Input id="demo-name" placeholder="Your name" autoComplete="name" />
    </div>
  </div>
}
