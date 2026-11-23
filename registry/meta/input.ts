import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Input",
  category: "basics",
  order: 5,
  description: "A plain field, with room for an icon and a clear action.",
  summary: "A native text input with two sizes, optional leading icon and clear button, and destructive invalid styling.",
  keywords: [
    "input",
    "text",
    "search",
    "clear",
    "form",
    "invalid",
    "Bach Bench"
  ],
  since: "0.25.0",
  origin: "Bach Bench",
  usage: `import { Search } from "lucide-react"
import { Input } from "@/components/wlkr/input"

<Input aria-label="Search recordings" placeholder="Search" icon={<Search />} clearable />
<Input aria-label="Title" aria-invalid="true" defaultValue="Untitled" />`,
  api: [
    {
      props: [
        {
          name: "size",
          type: "\"sm\" | \"md\"",
          default: "\"md\"",
          description: "28 or 32px high. Replaces the native size attribute."
        },
        {
          name: "icon",
          type: "ReactNode",
          description: "Decorative leading icon."
        },
        {
          name: "clearable",
          type: "boolean",
          default: "false",
          description: "Adds a clear action for text fields. It emits an input event and restores input focus."
        },
        {
          name: "clearLabel",
          type: "string",
          default: "\"Clear input\"",
          description: "Accessible name for the clear button."
        },
        {
          name: "aria-invalid",
          type: "boolean | \"true\" | \"false\"",
          description: "True uses a destructive border."
        },
        {
          name: "value / defaultValue",
          type: "string | number | readonly string[]",
          description: "Native controlled or uncontrolled value."
        },
        {
          name: "onChange",
          type: "ChangeEventHandler<HTMLInputElement>",
          description: "Receives typing and clear events."
        },
        {
          name: "Native props and ref",
          type: "React.ComponentProps<\"input\">",
          description: "Native input props and ref pass through. className styles the wrapper."
        }
      ]
    }
  ],
  notes: [
    "Supply a visible external label, aria-label or aria-labelledby. Placeholder text is not a label.",
    "Native props and ref target the input. The clear button is omitted for read-only fields and hidden for empty text fields.",
    "Disabled, invalid and focus states follow theme tokens. Reduced motion removes transitions."
  ],
  related: [
    "select",
    "combobox"
  ],
  dependencies: [
    "lucide-react"
  ]
}
