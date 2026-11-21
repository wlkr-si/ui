import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Binary rain",
  category: "effects",
  description: "Columns of 0s and 1s falling one cell at a time. The head is green; the rest fades in steps.",
  summary: "A decorative canvas background of stepped, falling binary columns with a brand-green head and an ordered fade, with content layered on top.",
  keywords: ["binary", "rain", "matrix", "canvas", "background", "code", "effect"],
  since: "0.24.0",
  stage: "fill",
  usage: `import { BinaryRain } from "@/components/wlkr/binary-rain"

<BinaryRain className="h-64 w-full">
  <div className="flex h-full items-center justify-center">
    <span className="bg-background px-4 py-2 font-mono">01 WLKR</span>
  </div>
</BinaryRain>

<BinaryRain cellSize={10} speed={20} density={0.4} trail={16} seed={3} />`,
  api: [{
    props: [
      { name: "cellSize", type: "number", default: "14", description: "Size of one glyph cell in CSS pixels, 6–64." },
      { name: "speed", type: "number", default: "14", description: "Ticks per second. Each tick moves every head down exactly one cell." },
      { name: "density", type: "number", default: "0.6", description: "Share of columns that rain, 0–1. Rerolled each time a column restarts." },
      { name: "trail", type: "number", default: "10", description: "Cells of ink behind each head, faded through four fixed opacity steps." },
      { name: "seed", type: "number", default: "1", description: "Seed for the pattern. The same seed gives the same rain." },
      { name: "paused", type: "boolean", default: "false", description: "Holds the current frame." },
      { name: "className", type: "string", description: "Merged onto the wrapper. Give it a height." },
      { name: "style", type: "React.CSSProperties", description: "Inline styles on the wrapper." },
      { name: "children", type: "React.ReactNode", description: "Content drawn above the rain." },
    ],
  }],
  notes: [
    "With reduced motion the rain draws one still frame and stops.",
    "The loop pauses while the rain is off screen or the tab is hidden, and only redraws on a tick.",
    "The canvas is hidden from assistive technology; children stay in the normal reading order.",
    "Colours come from --foreground and --brand on every redraw, so theme changes carry through without a remount.",
    "The canvas is scaled for high-density screens up to 2x and resizes with its wrapper.",
  ],
  related: ["dither-field", "dot-field", "pixel-wave"],
}
