import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Pixel slider",
  category: "inputs",
  description: "A slider you can count. Drag the green column, or step it with the keys.",
  summary: "A range slider drawn as a pixel grid with a dithered fill and a green thumb column, over a native range input.",
  keywords: ["slider", "range", "input", "pixel", "dither", "volume", "control"],
  since: "0.23.0",
  order: 40,
  usage: `import { PixelSlider } from "@/components/wlkr/pixel-slider"

const [volume, setVolume] = React.useState(64)

<PixelSlider label="Volume" value={volume} onValueChange={setVolume} showValue />

<PixelSlider
  label="Resolution"
  min={8}
  max={64}
  step={8}
  rows={2}
  defaultValue={32}
  formatValue={value => \`\${value} px\`}
  onValueCommit={save}
/>`,
  api: [{
    props: [
      { name: "label", type: "string", description: "Accessible name for the slider." },
      { name: "value", type: "number", description: "Controlled value. Pair with onValueChange." },
      { name: "onValueChange", type: "(value: number) => void", description: "Called on every change while dragging or stepping." },
      { name: "defaultValue", type: "number", default: "50", description: "Uncontrolled starting value." },
      { name: "onValueCommit", type: "(value: number) => void", description: "Called once when a drag ends or a key is released." },
      { name: "min", type: "number", default: "0", description: "Lowest value." },
      { name: "max", type: "number", default: "100", description: "Highest value. A max at or below min becomes min + 1." },
      { name: "step", type: "number", default: "1", description: "Increment. Values snap to it." },
      { name: "columns", type: "number", default: "40", description: "Grid width in cells, 8–120." },
      { name: "rows", type: "number", default: "3", description: "Track height in cells, 1–6. The thumb stands one cell taller above and below." },
      { name: "showValue", type: "boolean", default: "false", description: "Shows the value on the right, at a fixed width." },
      { name: "formatValue", type: "(value: number) => string", description: "Formats the shown value and the value read to screen readers." },
      { name: "disabled", type: "boolean", default: "false", description: "Dims the slider and ignores input." },
      { name: "className", type: "string", description: "Merged onto the root." },
    ],
  }],
  notes: [
    "A transparent native range input covers the track, so dragging, touch, screen readers and the keys (arrows, Page Up and Down, Home, End) all behave as they do on any slider.",
    "The pixel grid is decorative and hidden from assistive technology. Focus shows as a ring around the track.",
    "Clicks and key steps ease the front toward the new value over about 120ms. Dragging follows the pointer exactly.",
    "Reduced motion moves the front immediately, with no easing.",
    "The hit area is at least 44px tall, and vertical page scrolling still works over it on touch screens.",
  ],
  related: ["pixel-progress", "liquid-switch"],
}
