import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Pager",
  category: "navigation",
  description: "Next, previous, and a counter that rolls.",
  summary: "Pagination with previous and next arrows, a zero-padded page counter whose digits roll in the direction of travel, and a strip of page numbers.",
  keywords: ["pagination", "pages", "next", "previous", "counter", "odometer", "rolling", "navigation"],
  since: "0.23.0",
  order: 70,
  usage: `import { Pager } from "@/components/wlkr/pager"

const [page, setPage] = React.useState(1)

<Pager page={page} count={12} onPageChange={setPage} />

// Real links, for crawlable archives.
<Pager
  page={3}
  count={40}
  getHref={page => \`/notes?page=\${page}\`}
/>`,
  api: [{
    props: [
      { name: "page", type: "number", description: "The current page, 1-based. Clamped into 1…count." },
      { name: "onPageChange", type: "(page: number) => void", description: "Called with the page a control asks for." },
      { name: "count", type: "number", description: "Total pages. Below 1 renders nothing." },
      { name: "getHref", type: "(page: number) => string", description: "When given, every control is an <a href> instead of a button." },
      { name: "siblings", type: "number", default: "1", description: "Pages either side of the current one in the number strip, 0–3." },
      { name: "showPages", type: "boolean", default: "true", description: "False shows only the arrows and the counter." },
      { name: "label", type: "string", default: `"Pagination"`, description: "Accessible name for the navigation landmark." },
      { name: "className", type: "string", description: "Merged onto the root." },
    ],
  }],
  notes: [
    "Every control is a native button or link, and ArrowLeft or ArrowRight moves a page while focus is inside the pager.",
    "Arrows are disabled at the ends; as links they drop their href and carry aria-disabled. Focus moves to the other arrow instead of being lost.",
    "The current page in the strip has aria-current, and a hidden status says \"Page 3 of 12\" once per change.",
    "The strip always has the same number of slots for a given count and siblings, so the arrows never shift while you click through.",
    "Reduced motion switches the digits instantly.",
  ],
  related: ["rolling-number", "liquid-tabs", "scroll-progress"],
}
