import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Combobox",
  category: "basics",
  order: 6,
  description: "Search a short list and choose a match. Accents do not get in the way.",
  summary: "An editable WAI-ARIA combobox with accent-insensitive filtering, a listbox popup, keyboard selection and a clear action.",
  keywords: [
    "combobox",
    "autocomplete",
    "search",
    "listbox",
    "filter",
    "Bach Bench"
  ],
  since: "0.25.0",
  origin: "Bach Bench",
  usage: `import { Combobox } from "@/components/wlkr/combobox"

<Combobox aria-label="Composer" placeholder="Find a composer" options={[
  { value: "bach", label: "Johann Sebastian Bach" },
  { value: "faure", label: "Gabriel Fauré" },
]} onValueChange={value => console.log(value)} />`,
  api: [
    {
      props: [
        {
          name: "options",
          type: "ComboboxOption[]",
          description: "Required choices: { value: string; label: string; disabled?: boolean }. Use unique, nonempty values."
        },
        {
          name: "value",
          type: "string",
          description: "Controlled selected option value; an empty string clears selection."
        },
        {
          name: "defaultValue",
          type: "string",
          default: "\"\"",
          description: "Initial uncontrolled selected value."
        },
        {
          name: "onValueChange",
          type: "(value: string) => void",
          description: "Called when an option is selected or cleared; typing only filters."
        },
        {
          name: "size",
          type: "\"sm\" | \"md\"",
          default: "\"md\"",
          description: "28 or 32px high."
        },
        {
          name: "emptyMessage",
          type: "string",
          default: "\"No results\"",
          description: "Text shown when there are no matches."
        },
        {
          name: "clearLabel",
          type: "string",
          default: "\"Clear selection\"",
          description: "Accessible name for the clear action."
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
    "Supply aria-label, aria-labelledby or an external label. role=combobox exposes aria-expanded, aria-controls and aria-activedescendant while focus stays in the input.",
    "Up and Down open and move through enabled matches; Home and End move to the ends while open. Enter selects, Escape discards the search, and Tab closes.",
    "Filtering ignores case and combining accents. Leaving the field restores the selected label; unmatched text is not committed as a new option.",
    "The popup fades and scales over 140ms; reduced motion removes that transition. Native name and form props target the search input, whose submitted value is the displayed label."
  ],
  related: [
    "input",
    "select"
  ],
  dependencies: [
    "lucide-react"
  ]
}
