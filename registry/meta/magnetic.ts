import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Magnetic",
  category: "effects",
  description: "Things that lean toward the pointer, then let go.",
  summary: "A wrapper that pulls its children a little way toward a nearby pointer on a spring, with a deeper parallax layer, and springs them home on leave.",
  keywords: ["magnetic", "pointer", "hover", "spring", "attract", "button", "cursor", "effect"],
  since: "0.23.0",
  order: 50,
  usage: `import { Magnetic } from "@/components/wlkr/magnetic"

<Magnetic>
  <a href="/work">See the work</a>
</Magnetic>

// A stronger pull with no inner parallax, capped at 16px.
<Magnetic strength={0.5} inner={0} max={16}>
  <button type="button" aria-label="Open">↗</button>
</Magnetic>`,
  api: [{
    props: [
      { name: "children", type: "React.ReactNode", description: "The thing that leans: a button, a link, a logo." },
      { name: "strength", type: "number", default: "0.35", description: "Share of the pointer's offset from the centre the element follows, 0–1." },
      { name: "radius", type: "number", default: "60", description: "Pixels beyond the element's edge where the pull begins, 0–300. The pull fades in across this band." },
      { name: "inner", type: "number", default: "0.4", description: "Extra travel for the content layer as a fraction of the outer movement, 0–1. 0 turns the parallax layer off." },
      { name: "max", type: "number", default: "24", description: "Largest outer displacement in pixels, 0–120." },
      { name: "disabled", type: "boolean", default: "false", description: "Leaves the children still." },
      { name: "as", type: `"span" | "div"`, default: `"span"`, description: "The wrapper element. A span is inline-block and shrinks to its child." },
      { name: "className", type: "string", description: "Merged onto the wrapper, which never moves and is the hit region." },
    ],
  }],
  notes: [
    "The effect is decorative: the wrapper adds no role, focus stop or label, and the child keeps its own size, focus ring and click target. Give the child its own hover and focus styles.",
    "All instances share one pointer listener, attached only while some Magnetic is near the screen. Each keeps a cached position refreshed on scroll and resize.",
    "Touch pointers and coarse-pointer devices are ignored, and keyboard focus causes no movement.",
    "Reduced motion or disabled leaves the children completely still.",
    "Transforms are written straight to the layers each frame; React does not re-render while it moves, and the loop stops once the spring settles.",
  ],
  related: ["dot-field", "text-link"],
}
