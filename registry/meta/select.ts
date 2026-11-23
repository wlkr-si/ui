import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Select",
  category: "basics",
  order: 4,
  description: "A native select with a quiet prefix. The browser handles the choices.",
  summary: "A native select with an optional prefix label, chevron, two sizes and a wrapper focus ring.",
  keywords: [
    "select",
    "native",
    "dropdown",
    "sort",
    "choice",
    "Bach Bench"
  ],
  since: "0.25.0",
  usage: `import { Select } from "@/components/wlkr/select"

<Select label="Sort" aria-label="Sort recordings" defaultValue="recent">
  <option value="recent">Recent</option>
  <option value="name">Name</option>
</Select>`,
  api: [
    {
      props: [
        {
          name: "label",
          type: "string",
          description: "Optional faint prefix. The wrapping label names the select; use aria-label when the prefix is abbreviated."
        },
        {
          name: "size",
          type: "\"sm\" | \"md\"",
          default: "\"md\"",
          description: "28 or 32px high. Replaces the native size attribute."
        },
        {
          name: "children",
          type: "ReactNode",
          description: "Native option or optgroup elements."
        },
        {
          name: "value / defaultValue",
          type: "string | readonly string[] | number",
          description: "Native controlled or uncontrolled value."
        },
        {
          name: "onChange",
          type: "ChangeEventHandler<HTMLSelectElement>",
          description: "Receives the native change event."
        },
        {
          name: "Native props and ref",
          type: "React.ComponentProps<\"select\">",
          description: "Native select props and ref pass through. className styles the wrapper."
        }
      ]
    }
  ],
  notes: [
    "Keeps the browser’s select popup, keyboard navigation and touch picker. It is intended for single-choice selects.",
    "Use aria-label or aria-labelledby for an accessible name when no visible label is supplied.",
    "Focus is drawn on the wrapper via :has(select:focus-visible). Disabled and aria-invalid states use theme tokens."
  ],
  related: [
    "segmented",
    "combobox"
  ],
  dependencies: [
    "lucide-react"
  ]
}
