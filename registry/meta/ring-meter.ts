import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Ring meter",
  category: "data",
  description: "A ring of square ticks. Changes tick round one at a time.",
  summary: "A radial progress meter drawn as discrete SVG segments, with a green leading tick, stepped fill transitions and a mono value in the centre.",
  keywords: ["meter", "progress", "radial", "gauge", "ring", "dial", "percentage", "usage"],
  since: "0.24.0",
  usage: `import { RingMeter } from "@/components/wlkr/ring-meter"

<RingMeter value={68} label="Disk" />

<RingMeter value={3.2} min={0} max={8} segments={32} size={120} format={v => \`\${v.toFixed(1)} GB\`} label="Memory" />

<RingMeter value={12} max={20} aria-label="Builds today">
  <span className="font-mono text-sm">12/20</span>
</RingMeter>`,
  api: [{
    props: [
      { name: "value", type: "number", description: "Current value. Clamped between min and max." },
      { name: "min", type: "number", default: "0", description: "Lowest value." },
      { name: "max", type: "number", default: "100", description: "Highest value." },
      { name: "segments", type: "number", default: "40", description: "Ticks round the ring, starting at 12 o'clock and running clockwise." },
      { name: "size", type: "number", default: "140", description: "Outer diameter in px." },
      { name: "thickness", type: "number", default: "12", description: "Tick length in px." },
      { name: "label", type: "string", description: "Small caps line under the number. Also the accessible name when no aria-label is given." },
      { name: "format", type: "(value: number) => string", default: "rounds, adds % for 0-100", description: "Formats the centre number and the announced value text." },
      { name: "children", type: "React.ReactNode", description: "Replaces the centre content." },
      { name: "className", type: "string", description: "Merged onto the root. Native div props pass through." },
    ],
  }],
  notes: [
    "It uses role=\"meter\" with aria-valuemin, aria-valuemax, aria-valuenow and a formatted aria-valuetext.",
    "Each change starts from the previous fill and switches ticks one at a time with stepped CSS transition delays; there is no JavaScript animation loop.",
    "Reduced motion switches the ticks instantly.",
    "The value is shown by the count of filled ticks, so very small changes may not move the ring until they cross a segment.",
  ],
  related: ["pixel-progress", "pixel-bars", "rolling-number"],
}
