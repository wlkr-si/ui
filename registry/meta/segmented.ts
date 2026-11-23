import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Segmented",
  category: "basics",
  order: 3,
  description: "Choose one option from a short list, such as a calendar view.",
  summary: "A single-choice control with an optional leading label and arrow-key navigation.",
  keywords: ["radio", "radiogroup", "segmented", "toggle", "choice"],
  since: "0.25.0",
  usage: `import { Segmented } from "@/components/wlkr/segmented"

<Segmented size="sm" label="View" defaultValue="week" options={[
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
]} />`,
  examples: [
    { id: "default", title: "Default", description: "Use the leading label to name a group of related choices, such as the time range on a calendar." },
    { id: "small", title: "Small", description: "Use `size=\"sm\"` in a compact toolbar beside small buttons and selects." },
    { id: "without-label", title: "Without a visible label", description: "When the surrounding interface makes the purpose clear, name the group with `aria-label` or `aria-labelledby`." },
    { id: "disabled-option", title: "Disabled option", description: "Disable an individual option when the other choices are still available." },
    { id: "disabled-group", title: "Disabled group", description: "Disable the group when the selection is temporarily read-only." },
  ],
  api: [
    {
      props: [
        {
          name: "options",
          type: "SegmentedOption[]",
          description: "Each choice has a unique string value, a React node label and an optional disabled flag."
        },
        {
          name: "value",
          type: "string",
          description: "Controlled selected value."
        },
        {
          name: "defaultValue",
          type: "string",
          default: "first enabled option",
          description: "Initial uncontrolled selection."
        },
        {
          name: "onValueChange",
          type: "(value: string) => void",
          description: "Called when the selection changes."
        },
        {
          name: "label",
          type: "string",
          description: "Visible leading label and accessible group name. An explicit aria-label or aria-labelledby takes precedence."
        },
        {
          name: "size",
          type: "\"sm\" | \"default\"",
          default: "\"default\"",
          description: "Small is 28px high and default is 32px high, matching Button."
        },
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description: "Disables every choice."
        },
        {
          name: "Native props and ref",
          type: "React.ComponentProps<\"div\">",
          description: "Native div props and ref pass through to the radiogroup. className is merged on the root."
        }
      ]
    }
  ],
  notes: [
    "Arrow keys wrap through enabled choices and select them. Horizontal arrows respect right-to-left direction.",
    "Home and End select the first and last enabled options. Tab enters at the selected enabled option or the first enabled option. Space selects the focused option.",
    "Supply label, aria-label or aria-labelledby to name the group.",
    "Reduced motion turns off transitions and press scaling."
  ],
  related: [
    "select",
    "chip"
  ],
  registryDependencies: ["https://ui.wlkr.si/r/theme.json"],
  system: true,
}
