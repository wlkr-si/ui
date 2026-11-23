import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Select",
  category: "basics",
  order: 4,
  description: "Choose one option from a browser dropdown.",
  summary: "A native select with four control sizes, an optional prefix label and a chevron.",
  keywords: ["select", "native", "dropdown", "sort", "choice"],
  since: "0.25.0",
  usage: `import { Select } from "@/components/wlkr/select"

<Select label="Sort" aria-label="Sort recordings" defaultValue="recent">
  <option value="recent">Recent</option>
  <option value="name">Name</option>
</Select>`,
  examples: [
    { id: "default", title: "Default", description: "Use the default size next to standard form fields." },
    { id: "xs", title: "Extra small", description: "Use `xs` in dense areas such as a table toolbar." },
    { id: "sm", title: "Small", description: "Use `sm` next to compact buttons and inputs." },
    { id: "lg", title: "Large", description: "Use `lg` when the surrounding form uses taller controls." },
    { id: "prefix", title: "Prefix", description: "Use `label` to name the choice within the control." },
    { id: "invalid", title: "Invalid", description: "Set `aria-invalid` when the current selection needs to change." },
    { id: "disabled", title: "Disabled", description: "Use `disabled` when the selection is temporarily unavailable." },
  ],
  api: [{
    props: [
      { name: "size", type: "\"xs\" | \"sm\" | \"default\" | \"lg\"", default: "\"default\"", description: "The shared control sizes are 24, 28, 32 and 36px high." },
      { name: "label", type: "string", description: "A faint prefix that also names the select. Use `aria-label` for a fuller name when the prefix is abbreviated." },
      { name: "children", type: "ReactNode", description: "Native `option` or `optgroup` elements." },
      { name: "value / defaultValue", type: "string | number", description: "The current value for a controlled select or the starting value for an uncontrolled select." },
      { name: "onChange", type: "ChangeEventHandler<HTMLSelectElement>", description: "Receives the native change event." },
      { name: "aria-invalid", type: "React.AriaAttributes[\"aria-invalid\"]", description: "Marks the value invalid and applies the danger border." },
      { name: "disabled", type: "boolean", description: "Dims the control and disables native selection." },
      { name: "...props", type: "Native select props and ref", description: "Props such as `name`, `id`, `required` and `ref` pass to the native select. `className` styles the wrapper." },
    ],
  }],
  notes: [
    "The browser provides keyboard navigation, the option popup and the touch picker. The popup follows the theme’s color scheme and its appearance varies by platform.",
    "When you omit the prefix, give the select an associated label, `aria-label` or `aria-labelledby`.",
    "Connect any validation message to the select with `aria-describedby`.",
  ],
  related: ["input", "segmented", "combobox"],
  dependencies: ["lucide-react"],
  registryDependencies: ["https://ui.wlkr.si/r/theme.json"],
  system: true,
}
