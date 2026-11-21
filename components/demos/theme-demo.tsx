"use client"

const swatches = [
  ["Canvas", "var(--background)"],
  ["Ink", "var(--foreground)"],
  ["Quiet", "var(--muted-foreground)"],
  ["WLKR green", "var(--brand)"],
]

export function ThemeDemo() {
  return <div className="swatches">
    {swatches.map(([name, color]) => <div className="swatch" key={name}><i style={{ background: color }} /><span>{name}</span></div>)}
  </div>
}
