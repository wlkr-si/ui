import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Pixel canvas",
  category: "inputs",
  description: "A small grid to draw on. Drag to paint, square by square.",
  summary: "A pixel-art drawing pad: a grid of square cells you paint by click or drag in ink, WLKR green or erase, with keyboard control and a numeric value.",
  keywords: ["pixel", "canvas", "drawing", "paint", "pixel art", "grid", "sprite", "icon editor"],
  since: "0.24.0",
  usage: `import { PixelCanvas, pixelsFromRows } from "@/components/wlkr/pixel-canvas"

const heart = pixelsFromRows([
  ".##.##.",
  "#######",
  ".#####.",
  "..###..",
  "...#...",
])

<PixelCanvas cols={7} rows={5} defaultValue={heart} />

// Controlled
const [pixels, setPixels] = React.useState<number[]>([])
<PixelCanvas value={pixels} onValueChange={setPixels} />`,
  api: [
    {
      title: "PixelCanvas",
      props: [
        { name: "value", type: "number[]", description: "Controlled pixels, row by row, length cols * rows: 0 empty, 1 ink, 2 green." },
        { name: "defaultValue", type: "number[]", description: "Starting pixels when uncontrolled. Missing cells are empty." },
        { name: "onValueChange", type: "(value: number[]) => void", description: "Called with a fresh array on every painted cell, Clear and Invert." },
        { name: "cols", type: "number", default: "16", description: "Cells per row." },
        { name: "rows", type: "number", default: "16", description: "Number of rows." },
        { name: "readOnly", type: "boolean", default: "false", description: "Shows the picture without the palette and actions, and ignores painting." },
        { name: "aria-label", type: "string", default: `"Pixel canvas"`, description: "Accessible name for the grid." },
        { name: "className", type: "string", description: "Merged onto the root. Native div props pass through." },
      ],
    },
    {
      title: "pixelsFromRows",
      columns: { name: "Argument", type: "Type" },
      props: [
        { name: "rows", type: "string[]", description: "One string per row: \".\" empty, \"#\" ink, \"+\" green. Returns number[]." },
      ],
    },
  ],
  notes: [
    "The first cell a stroke touches decides it: painting over the current ink erases, anything else paints.",
    "The grid is one tab stop. Arrow keys move between cells, Home and End jump along the row, and Space or Enter toggles the focused cell.",
    "Painting uses pointer capture and touch-action none, so a drag on a phone paints instead of scrolling.",
    "Each cell is a real button, so very large grids get heavy; it is meant for icons and sprites up to about 32 by 32.",
    "The stepped colour change is skipped under reduced motion.",
  ],
  related: ["pixel-avatar", "pixel-image", "heat-grid"],
}
