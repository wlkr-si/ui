import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Pixel bars",
  category: "data",
  description: "A bar chart you can count. Point at a bar and it tells you.",
  summary: "A bar chart drawn as stacks of square cells that build up on view, with a hover and keyboard readout.",
  keywords: ["chart", "bar", "bars", "pixel", "data", "histogram", "graph", "readout"],
  since: "0.23.0",
  order: 40,
  usage: `import { PixelBars } from "@/components/wlkr/pixel-bars"

const deploys = [
  { label: "Mon 16", value: 8 },
  { label: "Tue 17", value: 12 },
  { label: "Wed 18", value: 9 },
  { label: "Thu 19", value: 10 },
  { label: "Fri 20", value: 7 },
]

<PixelBars label="Deploys per day" data={deploys} rows={12} max={12} />`,
  api: [{
    props: [
      { name: "data", type: "{ label: string; value: number }[]", description: "One bar per item, left to right. Non-finite values count as 0. Changing it animates each bar to its new height." },
      { name: "label", type: "string", description: "Accessible name of the chart, also the caption of its hidden data table." },
      { name: "rows", type: "number", default: "12", description: "Vertical resolution in cells, 4–40." },
      { name: "max", type: "number", default: "largest value", description: "The value drawn at full height. Values clamp to 0…max." },
      { name: "gap", type: "number", default: "3", description: "Px between bars at full size, 0–16. Cells keep at least 1px between them vertically." },
      { name: "highlight", type: `"max" | "last" | "none"`, default: `"max"`, description: "Which bar is drawn in brand green and read out at rest." },
      { name: "formatValue", type: "(value: number) => string", default: "en-US number", description: "Formats values in the readout, the announcement and the table." },
      { name: "className", type: "string", description: "Merged onto the root." },
    ],
  }],
  notes: [
    "The chart is one tab stop. Arrow Left and Right move between bars, Home and End jump to the ends, and Escape clears the selection.",
    "Keyboard moves are announced once through a polite live region; screen readers also get a hidden table with one row per item.",
    "Pointer hit areas are full-height columns. On touch, tap or drag sideways to select; vertical scrolling still works.",
    "Cells are square and at most 24px, so the chart's height follows its width and is reserved from the first render.",
    "Bars grow in whole cells the first time the chart scrolls into view. Reduced motion shows final heights immediately.",
  ],
  related: ["heat-grid", "pixel-progress", "dot-matrix"],
}
