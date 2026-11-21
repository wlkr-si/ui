import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Scroll progress",
  category: "navigation",
  description: "How far you've read, counted in pixels.",
  summary: "A one-cell-tall strip of pixels pinned to the viewport edge, or inline, that fills as the page or a scroll container scrolls.",
  keywords: ["scroll", "reading", "progress", "indicator", "pixel", "dither", "article", "position"],
  since: "0.23.0",
  order: 90,
  usage: `import { ScrollProgress } from "@/components/wlkr/scroll-progress"

// Pinned across the top of the viewport, tracking the page.
<ScrollProgress />

// Inline, tracking a scroll container you own.
const article = React.useRef<HTMLDivElement>(null)

<ScrollProgress position="inline" target={article} rows={2} />
<div ref={article} className="h-80 overflow-y-auto">…</div>`,
  api: [{
    props: [
      { name: "target", type: "React.RefObject<HTMLElement | null>", description: "A scroll container to track. Leave it off to track the page." },
      { name: "position", type: `"top" | "bottom" | "inline"`, default: `"top"`, description: "Top and bottom are fixed to that edge of the viewport, inside the safe area. Inline is a normal block, 100% of its parent's width." },
      { name: "columns", type: "number", default: "64", description: "Cells across, 8–240. Columns stretch to fill the width." },
      { name: "rows", type: "number", default: "1", description: "Cells down, 1–4." },
      { name: "cell", type: "number", default: "4", description: "Cell height in pixels, 2–12. The strip is rows × cell tall." },
      { name: "label", type: "string", default: `"Reading progress"`, description: "Accessible name for the progress bar." },
      { name: "className", type: "string", description: "Merged onto the root." },
    ],
  }],
  notes: [
    "It is a passive progressbar: aria-valuenow holds the rounded percentage and nothing is announced as you scroll.",
    "Progress is scrollTop over the scrollable distance, read on scroll and resize, and again whenever the content changes size.",
    "Pinned strips ignore the pointer and leave unlit cells transparent, so nothing shows at the top of the page until you scroll.",
    "Reduced motion draws the exact position with no easing.",
    "The last column turns green when you reach the end.",
  ],
  related: ["pixel-progress", "pager"],
}
