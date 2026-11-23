import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Combobox",
  category: "basics",
  order: 6,
  description: "Search a list of options and choose a match.",
  summary: "An editable combobox with accent-insensitive filtering, a listbox, keyboard navigation and a clear action.",
  keywords: ["combobox", "autocomplete", "search", "listbox", "filter"],
  since: "0.25.0",
  usage: `import { Combobox } from "@/components/wlkr/combobox"

<Combobox aria-label="City" placeholder="Find a city" options={[
  { value: "bogota", label: "Bogotá" },
  { value: "montreal", label: "Montréal" },
]} onValueChange={value => console.log(value)} />`,
  examples: [
    { id: "default", title: "Default", description: "Use the 32px field for most searchable lists." },
    { id: "xs", title: "Extra small", description: "Use the 24px field in dense rows." },
    { id: "sm", title: "Small", description: "Use the 28px field beside small toolbar controls." },
    { id: "lg", title: "Large", description: "Use the 36px field beside large controls." },
    { id: "selected", title: "Selected", description: "Set a default when a likely choice is known and users can change or clear it." },
    { id: "disabled", title: "Disabled", description: "Disable the field when the choice is unavailable." },
    { id: "disabled-option", title: "Disabled option", description: "Disable an individual option when it should remain visible but cannot be selected." },
    { id: "read-only", title: "Read-only", description: "Use a read-only field to show an existing choice while allowing its text to be copied." },
    { id: "invalid", title: "Invalid", description: "Set `aria-invalid` when a required choice is missing or the selection needs correction." },
    { id: "empty", title: "Empty results", description: "Provide an empty message that names what users were looking for when there are no matches." },
  ],
  api: [{
    props: [
      { name: "options", type: "readonly ComboboxOption[]", description: "Choices with a unique, nonempty string value, a label and an optional disabled flag." },
      { name: "value", type: "string", description: "Controlled selected option value. An empty string clears the selection." },
      { name: "defaultValue", type: "string", default: "\"\"", description: "Initial uncontrolled selected option value." },
      { name: "onValueChange", type: "(value: string) => void", description: "Called when the selection changes or is cleared. Typing filters the options." },
      { name: "size", type: "\"xs\" | \"sm\" | \"default\" | \"lg\"", default: "\"default\"", description: "Field and option row height on the shared 24, 28, 32 and 36px control scale." },
      { name: "emptyMessage", type: "string", default: "\"No results\"", description: "Message shown when there are no matches." },
      { name: "clearLabel", type: "string", default: "\"Clear selection\"", description: "Accessible name for the clear action." },
      { name: "Native props and ref", type: "React.ComponentProps<\"input\">", description: "Native input props and ref pass through. className styles the wrapper." },
    ],
  }],
  notes: [
    "Name the field with an external label, aria-label or aria-labelledby. Focus stays on the input while navigating options.",
    "Up and Down open the list and move through enabled matches. Home and End move to the ends while open. Enter selects, Escape drops the search, and Tab closes the list.",
    "Filtering ignores case and accents. Leaving the field restores the selected label.",
    "The listbox follows the WLKR overlay pattern and respects reduced motion. Native form props target the input, which submits the displayed label.",
  ],
  related: ["input", "select"],
  dependencies: ["lucide-react"],
  registryDependencies: ["https://ui.wlkr.si/r/theme.json"],
  system: true,
}
