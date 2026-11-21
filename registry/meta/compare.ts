import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Compare",
  category: "media",
  description: "Before and after, either side of a line you can drag.",
  summary: "A before-and-after comparison with a draggable, clickable and keyboard-controlled divider.",
  keywords: ["before", "after", "compare", "slider", "image", "wipe", "divider", "reveal"],
  since: "0.23.0",
  order: 30,
  usage: `import { Compare } from "@/components/wlkr/compare"

<Compare
  aspectRatio={16 / 10}
  beforeLabel="Draft"
  afterLabel="Final"
  before={<img src="/draft.jpg" alt="The first draft" />}
  after={<img src="/final.jpg" alt="The final cover" />}
/>

// Controlled
const [position, setPosition] = React.useState(30)
<Compare position={position} onPositionChange={setPosition} before={before} after={after} />`,
  api: [{
    props: [
      { name: "before", type: "React.ReactNode", description: "Shown left of the divider, laid over after. Images, video and SVG fill the layer with object-fit: cover." },
      { name: "after", type: "React.ReactNode", description: "Shown right of the divider. Without aspectRatio it sets the height." },
      { name: "beforeLabel", type: "string", default: `"Before"`, description: "Top-left corner label, also used in the value read to screen readers." },
      { name: "afterLabel", type: "string", default: `"After"`, description: "Top-right corner label, also used in the value read to screen readers." },
      { name: "position", type: "number", description: "Controlled divider position, 0–100 from the left. Pair with onPositionChange." },
      { name: "onPositionChange", type: "(position: number) => void", description: "Called as the divider moves, by pointer or keyboard." },
      { name: "defaultPosition", type: "number", default: "50", description: "Uncontrolled starting position, 0–100." },
      { name: "aspectRatio", type: "number | string", description: "Reserves this ratio up front, such as 16 / 10 or the string 4 / 3." },
      { name: "showLabels", type: "boolean", default: "true", description: "Small ink labels in the top corners that fade as the divider nears them." },
      { name: "hint", type: "boolean", default: "true", description: "One small sweep the first time it scrolls into view." },
      { name: "label", type: "string", default: `"Comparison position"`, description: "Accessible name of the slider." },
      { name: "className", type: "string", description: "Merged onto the root." },
    ],
  }],
  notes: [
    "The handle is a slider: Left and Right move it 2 points, Shift or Page Up and Page Down move it 10, Home and End go to the edges.",
    "Press anywhere to send the divider there and keep dragging. On touch, a mostly vertical swipe scrolls the page instead.",
    "Both layers keep the same geometry; the top one is clipped, so images never squash.",
    "Screen readers hear the split, such as 40% Before, 60% After, once a drag or key press settles. Controlled use reports each change you pass back.",
    "The intro sweep plays once, stops at the first interaction, and is skipped under reduced motion.",
  ],
  related: ["pixel-image", "pixel-slider"],
}
