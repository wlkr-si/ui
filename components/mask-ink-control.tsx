"use client"
import * as React from "react"
import { ChoiceControl } from "@/components/playground-controls"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { normalizeInk } from "@/lib/pixel-mask"

const colours = [{ value: "theme", label: "Theme" }, { value: "#010101", label: "Black" }, { value: "#ffffff", label: "White" }, { value: "#33f282", label: "Green" }, { value: "#2563eb", label: "Blue" }, { value: "custom", label: "Custom" }]
export function MaskInkControl({ ink, onChange }: { ink: string | null; onChange: (ink: string | null) => void }) {
  const [custom, setCustom] = React.useState(false)
  const [draft, setDraft] = React.useState(ink || "#010101")
  const [error, setError] = React.useState("")
  const value = custom || ink !== null && !colours.some(colour => colour.value === ink) ? "custom" : ink || "theme"
  return <div className="mask-ink-control"><ChoiceControl label="Ink" value={value} options={colours} onChange={value => { if (value === "custom") setCustom(true); else { setCustom(false); onChange(value === "theme" ? null : value) } }} />
    {value === "custom" && <form className="mask-ink-form" onSubmit={event => { event.preventDefault(); try { onChange(normalizeInk(draft)); setError("") } catch { setError("Use #rrggbb.") } }}>
      <Input className="min-h-11" aria-label="Hex ink" aria-invalid={Boolean(error)} value={draft} maxLength={7} spellCheck={false} autoComplete="off" onChange={event => { setDraft(event.target.value.slice(0, 7)); setError("") }} />
      <Button type="submit" variant="ghost" className="min-h-11">Apply</Button>
      {error && <p className="mask-link-error" role="alert">{error}</p>}
    </form>}
  </div>
}
