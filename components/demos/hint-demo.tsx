"use client"

import { Hint } from "@/registry/wlkr/hint"

const items = [
  { side: "top", glyph: "B", label: "Bold", shortcut: "⌘B" },
  { side: "right", glyph: "I", label: "Italic" },
  { side: "bottom", glyph: "U", label: "Underline" },
  { side: "left", glyph: "S", label: "Strike" },
] as const

export function HintDemo() {
  return (
    <div className="flex items-center gap-2 py-8">
      {items.map(item => (
        <Hint key={item.side} side={item.side} label={item.label} shortcut={"shortcut" in item ? item.shortcut : undefined}>
          <button
            type="button"
            aria-label={item.label}
            className="flex size-9 items-center justify-center border border-border font-mono text-sm hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand,#33f282)]"
          >
            {item.glyph}
          </button>
        </Hint>
      ))}
    </div>
  )
}
