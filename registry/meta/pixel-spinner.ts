import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Pixel spinner",
  category: "feedback",
  description: "Nine square pixels, stepping in turn. Small enough to sit in a line of text.",
  summary: "A family of inline loading indicators drawn on a 3x3 pixel grid, animated with stepped CSS keyframes in six patterns.",
  keywords: ["spinner", "loading", "loader", "busy", "pixel", "progress", "indicator", "activity"],
  since: "0.24.0",
  usage: `import { PixelSpinner } from "@/components/wlkr/pixel-spinner"

<PixelSpinner />
<PixelSpinner variant="dither" accent />
<PixelSpinner variant="bar" size="2em" speed={1200} />

<span>
  <PixelSpinner variant="snake" label="Syncing" /> Syncing
</span>`,
  api: [{
    props: [
      { name: "variant", type: `"orbit" | "snake" | "scan" | "dither" | "pulse" | "bar"`, default: `"orbit"`, description: "The pattern. Bar is a 5x1 row with a bouncing pixel; the rest use a 3x3 grid." },
      { name: "size", type: "string", default: `"1em"`, description: "Any CSS length. In em it scales with the surrounding text." },
      { name: "speed", type: "number", default: "900", description: "One full cycle in milliseconds." },
      { name: "accent", type: "boolean", default: "false", description: "Paints the lead pixel in WLKR green. The rest follow the text colour." },
      { name: "label", type: "string", default: `"Loading"`, description: "Visually hidden text announced by the status role." },
      { name: "className", type: "string", description: "Merged onto the root span. Native span props pass through." },
    ],
  }],
  notes: [
    "The root has role=\"status\" with a visually hidden label, so screen readers hear the label once rather than the animation.",
    "Motion is pure CSS with steps() timing and per-cell delays; there are no JavaScript timers.",
    "With reduced motion the pixels stop and show a still, half-filled pattern.",
    "It shows that work is happening, not how much. Use a progress bar when the amount is known.",
  ],
  related: ["wlkr-loader", "pixel-progress", "status-dot"],
}
