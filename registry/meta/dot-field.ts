import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Dot field",
  category: "effects",
  description: "A surface that notices you. Dots swell, brighten, and step aside for the pointer, then settle back.",
  summary: "A canvas dot grid that swells, tints and springs away from the pointer, with a slow ambient wave.",
  keywords: ["background", "grid", "dots", "pointer", "hover", "canvas", "interactive", "hero", "surface", "spring"],
  since: "0.22.0",
  order: 10,
  stage: "fill",
  usage: `import { DotField } from "@/components/wlkr/dot-field"

<DotField className="h-[420px] w-full" radius={140}>
  <div className="flex h-full items-center justify-center">
    <h1>Brand Studio</h1>
  </div>
</DotField>
// You size the field; the dots fill it.`,
  api: [{
    props: [
      { name: "children", type: "React.ReactNode", description: "Rendered above the field, in a wrapper that fills the root’s height." },
      { name: "gap", type: "number", default: "18", description: "Pixels between dot centres, 8–64. Widens on very large areas to stay at or under 6,000 dots." },
      { name: "dotSize", type: "number", default: "2", description: "Dot size in pixels, 1–8." },
      { name: "radius", type: "number", default: "110", description: "Pointer reach in pixels, 20–400." },
      { name: "strength", type: "number", default: "0.5", description: "How far dots are pushed away, 0–1. At 0 they swell and tint without moving." },
      { name: "shape", type: `"square" | "round"`, default: `"square"`, description: "The dot shape." },
      { name: "ambient", type: "boolean", default: "true", description: "A slow wave of brightness and size, about seven seconds per cycle." },
      { name: "className", type: "string", description: "Merged onto the root. The root has no height of its own; size it here or let content do it." },
      { name: "...props", type: "React.ComponentProps<\"div\">", description: "Other div props are passed through." },
    ],
  }],
  notes: [
    "Colours come from --muted-foreground, --foreground and --brand, and are read again when the root class or the system colour scheme changes.",
    "Touch scrolling still works over the field.",
    "The loop runs only while dots are settling, or while the wave is on and the field is on screen in a visible tab.",
    "Reduced motion removes the wave and the springs; nearby dots still brighten and tint.",
  ],
  related: ["pixel-image", "pixel-object", "page-intro"],
}
