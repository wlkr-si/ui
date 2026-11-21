import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Index row",
  category: "navigation",
  description: "An index with a little movement. Three digits roll on hover or focus, then settle where they belong.",
  summary: "Borderless index link with three fixed digits that roll on hover and focus.",
  keywords: ["index", "list", "row", "number", "counting", "spin", "link", "navigation"],
  since: "0.1.0",
  order: 20,
  usage: `import { IndexRow } from "@/components/wlkr/index-row"

<nav aria-label="Projects">
  <IndexRow number={7} title="Brand Studio" description="Considered tools for a clear identity." href="/projects/studio">
    In progress
  </IndexRow>
  <IndexRow number={42} title="WeatherGoblin" href="/projects/weather">
    In development
  </IndexRow>
</nav>`,
  api: [{
    props: [
      { name: "number", type: "number | string", description: "Shown as exactly three digits: numbers are clamped to 0–999, strings keep their last three digits." },
      { name: "title", type: "string", description: "The row’s main text." },
      { name: "description", type: "string", description: "A muted line under the title." },
      { name: "children", type: "React.ReactNode", description: "Small muted content at the end of the row, such as a status." },
      { name: "className", type: "string", description: "Merged onto the anchor." },
      { name: "...props", type: "Omit<React.ComponentProps<\"a\">, \"title\" | \"children\">", description: "Other anchor props, such as href, target and rel, are passed through." },
    ],
  }],
  notes: [
    "It is a normal anchor. The digits roll through CSS strips on hover and keyboard focus, with no timers or frame loop.",
    "The number sits in a fixed 3ch tabular slot, so rolling never moves the title.",
    "Screen readers hear the real number once; the rolling digits are hidden from them.",
    "Reduced motion keeps the number still.",
    "There are no borders or trailing arrow; add dividers in your own layout if you want them.",
  ],
  related: ["text-link", "rolling-number"],
}
