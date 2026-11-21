import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Sparkline",
  category: "data",
  description: "A trend in a line of text. Stepped like a staircase, ending on a green square.",
  summary: "A small inline SVG trend line drawn as pixel steps, with an optional dithered fill and pointer or keyboard scrubbing.",
  keywords: ["sparkline", "chart", "trend", "line", "inline", "metric", "svg", "scrub"],
  since: "0.24.0",
  usage: `import { Sparkline } from "@/components/wlkr/sparkline"

<Sparkline data={[4, 6, 5, 9, 8, 12, 11, 15]} label="Requests" />

<Sparkline data={latency} fill width={200} height={48} min={0} />

const [point, setPoint] = React.useState<{ index: number; value: number } | null>(null)
<Sparkline data={data} onScrub={setPoint} />`,
  api: [{
    props: [
      { name: "data", type: "number[]", description: "The values, oldest first. Non-finite values are dropped." },
      { name: "width", type: "number", default: "160", description: "Width in pixels. Shrinks to fit its container." },
      { name: "height", type: "number", default: "40", description: "Height in pixels." },
      { name: "fill", type: "boolean", default: "false", description: "Draws an ordered-dither area under the line." },
      { name: "min", type: "number", description: "Bottom of the scale. Defaults to the smallest value." },
      { name: "max", type: "number", description: "Top of the scale. Defaults to the largest value." },
      { name: "label", type: "string", description: "Name read before the min, max and latest summary." },
      { name: "onScrub", type: "(point: { index: number; value: number } | null) => void", description: "Reports the nearest point while scrubbing, and null when scrubbing ends." },
      { name: "animate", type: "boolean", default: "true", description: "Draws the line in with stepped motion on mount." },
      { name: "className", type: "string", description: "Merged onto the root span. Native span props pass through." },
    ],
  }],
  notes: [
    "It is a single tab stop. Left and Right move between points, Home and End jump to the ends, and Escape clears.",
    "Screen readers hear the label with the min, max and latest value; scrubbed values are reported through onScrub only.",
    "Reduced motion shows the finished line straight away.",
    "Empty data draws nothing and a single point draws a flat line, with no NaN in the path.",
  ],
  related: ["pixel-bars", "heat-grid", "rolling-number"],
}
