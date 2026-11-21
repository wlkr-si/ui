import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Pixel trail",
  category: "effects",
  description: "Move across it and the pointer leaves pixels behind.",
  summary: "A wrapper with an invisible grid whose cells light up under the pointer and switch off in stepped pixels, leaving a short blocky trail.",
  keywords: ["pixel", "trail", "cursor", "pointer", "grid", "canvas", "background", "hero", "interactive"],
  since: "0.23.0",
  order: 30,
  usage: `import { PixelTrail } from "@/components/wlkr/pixel-trail"

<PixelTrail className="h-[320px] w-full">
  <div className="grid h-full place-items-center">
    <h2>WeatherGoblin</h2>
  </div>
</PixelTrail>

// Larger round cells in brand green with a longer tail.
<PixelTrail className="h-64" cell={28} gap={4} shape="round" tone="brand" fade={1200} />`,
  api: [{
    props: [
      { name: "children", type: "React.ReactNode", description: "Content drawn above the trail." },
      { name: "cell", type: "number", default: "16", description: "Grid cell size in pixels, 6–64. Grows on very large areas to stay under about 20,000 cells." },
      { name: "fade", type: "number", default: "550", description: "Milliseconds for a lit cell to switch off, 100–4000." },
      { name: "tone", type: `"ink" | "brand" | "mixed"`, default: `"mixed"`, description: "Colour of lit cells. Mixed makes the newest cell --brand and the tail --foreground." },
      { name: "gap", type: "number", default: "1", description: "Pixels of space between cells, 0–8." },
      { name: "shape", type: `"square" | "round"`, default: `"square"`, description: "Cell shape." },
      { name: "idle", type: "boolean", default: "true", description: "Until a pointer first enters, a quiet sparkle lights a cell now and then while the element is on screen." },
      { name: "className", type: "string", description: "Merged onto the root. Give the root its size." },
    ],
  }],
  notes: [
    "Every cell between two pointer samples is lit, so fast movement leaves a continuous trail.",
    "Dying cells fade and shrink toward their centre in two discrete steps, like a low-resolution display switching off.",
    "On touch the trail follows the finger while it moves, and vertical page scrolling still works.",
    "The canvas only redraws while a cell is alive. The idle sparkle stops for good once a pointer enters, and pauses off screen or in a hidden tab.",
    "Reduced motion removes the sparkle and the stepped fade: cells light at full strength and switch off after the fade time.",
    "The canvas is decorative and hidden from assistive tech; children stay fully interactive.",
  ],
  related: ["dot-field", "dither-field"],
  stage: "fill",
}
