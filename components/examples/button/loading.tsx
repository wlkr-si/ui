"use client"

import { useState } from "react"
import { Button } from "@/registry/wlkr/button"

export default function ButtonLoading() {
  const [saving, setSaving] = useState(false)
  function save() {
    setSaving(true)
    setTimeout(() => setSaving(false), 1600)
  }
  return <Button loading={saving} onClick={save}>Save changes</Button>
}
