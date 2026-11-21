import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Filter list",
  category: "inputs",
  description: "Find the thing you came for. A small, accessible search for lists that don’t need a whole search engine.",
  summary: "An accessible searchable list with accent-insensitive matching and empty states.",
  keywords: ["search", "input", "empty", "list", "filter"],
  since: "0.1.0",
  order: 10,
  usage: `import { FilterList } from "@/components/wlkr/filter-list"

<FilterList
  label="Search projects"
  placeholder="Search projects…"
  items={[
    { id: "studio", label: "Brand Studio", keywords: ["design"] },
    { id: "weather", label: "WeatherGoblin", description: "Your forecast." },
    { id: "bible", label: "PatriBible", description: "Scripture, within reach." },
  ]}
/>`,
  api: [{
    props: [
      { name: "items", type: "{ id: string; label: string; description?: string; keywords?: string[] }[]", description: "The list. Ids must be unique; results keep this order." },
      { name: "label", type: "string", default: `"Search items"`, description: "Accessible name for the search input." },
      { name: "placeholder", type: "string", default: `"Find something…"`, description: "Placeholder text in the input." },
    ],
  }],
  notes: [
    "Every word of the query must appear somewhere in an item’s label, description or keywords. Case and accents are ignored.",
    "A live result count is announced as you type and describes the input.",
    "A clear button appears once there is a query and returns focus to the input.",
    "An empty result shows a short message instead of a blank list.",
    "Text editing stays native, with a block caret where the browser supports caret-shape.",
  ],
  dependencies: ["lucide-react"],
  registryDependencies: ["input", "button"],
  related: ["liquid-tabs", "index-row"],
}
