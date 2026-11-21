import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Split flap",
  category: "text",
  description: "A departure board in a line of text. Each cell clatters forward until the word lands.",
  summary: "A split-flap text display: square ink cells that step through a character set, staggered left to right, whenever the value changes.",
  keywords: ["split flap", "departure board", "solari", "flap display", "text animation", "airport", "mono"],
  since: "0.24.0",
  usage: `import { SplitFlap } from "@/components/wlkr/split-flap"

<SplitFlap value="DALLAS" length={10} accent />
<SplitFlap value="14:05" size="sm" />

// Slower, wider stagger, and heard by screen readers.
<SplitFlap value={gate} speed={70} stagger={60} announce />`,
  api: [{
    props: [
      { name: "value", type: "string", description: "The text to show. Uppercased; characters outside the set render as a space." },
      { name: "length", type: "number", default: "value.length", description: "Fixed number of cells. Shorter values pad with spaces, longer ones are cut." },
      { name: "speed", type: "number", default: "45", description: "Milliseconds per flap step." },
      { name: "stagger", type: "number", default: "40", description: "Milliseconds between each cell starting, left to right." },
      { name: "characters", type: "string", default: `" ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.:-/"`, description: "Ordered set the cells cycle through. The first character is the blank." },
      { name: "size", type: `"sm" | "md" | "lg"`, default: `"md"`, description: "Cell size. Cells shrink with the viewport so ten fit at 320px." },
      { name: "accent", type: "boolean", default: "false", description: "Flash the last cell to settle in WLKR green." },
      { name: "announce", type: "boolean", default: "false", description: "Makes the hidden text a polite live region so changes are read out." },
      { name: "className", type: "string", description: "Merged onto the root span. Native span props pass through." },
    ],
  }],
  notes: [
    "The cells are hidden from assistive technology; a visually hidden span carries the real value.",
    "Reduced motion skips the cycling and shows the new value at once.",
    "Cells only step forward, so a change can take up to one full lap of the character set per cell.",
    "The first render shows the value already settled, so server output matches the client.",
  ],
  related: ["rolling-number", "decode-text", "dot-matrix"],
}
