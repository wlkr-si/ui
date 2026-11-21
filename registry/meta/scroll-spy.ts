import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Scroll spy",
  category: "navigation",
  description: "A table of contents that keeps its place. The marker stretches to the section you are reading and snaps in.",
  summary: "An on-this-page list of section links with a liquid marker that tracks the section at the reading line.",
  keywords: ["toc", "table of contents", "on this page", "scrollspy", "anchor", "sections", "liquid", "navigation"],
  since: "0.23.0",
  order: 50,
  usage: `import { ScrollSpy } from "@/components/wlkr/scroll-spy"

<ScrollSpy
  items={[
    { id: "overview", label: "Overview" },
    { id: "install", label: "Install" },
    { id: "props", label: "Props", depth: 1 },
    { id: "notes", label: "Notes" },
  ]}
  offset={96}
/>

// Sections inside a scroll box: pass its ref as root.
<ScrollSpy items={items} root={boxRef} offset={16} />`,
  api: [{
    props: [
      { name: "items", type: "{ id: string; label: string; depth?: 0 | 1 | 2 }[]", description: "One link per section. ids that are not in the document are skipped." },
      { name: "offset", type: "number", default: "96", description: "Pixels from the top of the viewport, or of root, that count as the reading line, 0–600. Match it to a sticky header." },
      { name: "root", type: "React.RefObject<HTMLElement | null>", description: "A scroll container holding the sections. Defaults to the window." },
      { name: "onActiveChange", type: "(id: string | null) => void", description: "Called when the active section changes." },
      { name: "label", type: "string", default: `"On this page"`, description: "Accessible name for the navigation landmark." },
      { name: "className", type: "string", description: "Merged onto the root nav." },
    ],
  }],
  notes: [
    "The active section is the last one whose top has passed the reading line. Above the first section the first item is active, and at the end of the scroll range the last one is.",
    "Links are real anchors with aria-current=\"location\" on the active one. Clicking scrolls the section to the reading line and updates the hash without a jump.",
    "Activating a link from the keyboard also moves focus to its section, adding a temporary tabindex when the section has none.",
    "The clicked item holds the marker until the scroll settles, so it does not wander through the items in between.",
    "Reduced motion scrolls instantly and the marker jumps. On coarse pointers each link is at least 44px tall.",
  ],
  related: ["liquid-tabs", "dock"],
}
