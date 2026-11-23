import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Segmented",
  category: "basics",
  order: 3,
  description: "A few choices, kept together. Step between them with the arrow keys.",
  summary: "A controlled or uncontrolled radiogroup with roving focus, optional prefix label and compact Bach Bench styling.",
  keywords: [
    "radio",
    "radiogroup",
    "segmented",
    "toggle",
    "choice",
    "Bach Bench"
  ],
  since: "0.25.0",
  usage: `import { Segmented } from "@/components/wlkr/segmented"

<Segmented label="View" defaultValue="week" options={[
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
]} />`,
  api: [
    {
      props: [
        {
          name: "options",
          type: "SegmentedOption[]",
          description: "Required choices: { value: string; label: ReactNode; disabled?: boolean }. Values must be unique."
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
          description: "Faint leading label; also names the group unless aria-label or aria-labelledby is supplied."
        },
        {
          name: "size",
          type: "\"sm\" | \"md\"",
          default: "\"md\"",
          description: "28 or 32px high."
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
          description: "Native div props and ref pass through. className is merged on the root."
        }
      ]
    }
  ],
  notes: [
    "Arrow keys wrap through enabled choices and select them; horizontal arrows respect right-to-left direction. Home and End select the ends.",
    "Tab enters at the selected enabled choice, then leaves the group. Space selects a focused radio.",
    "Give the group label, aria-label or aria-labelledby. Reduced motion removes transitions."
  ],
  related: [
    "select",
    "chip"
  ]
}
