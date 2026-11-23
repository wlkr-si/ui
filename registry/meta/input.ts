import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Input",
  category: "basics",
  order: 5,
  description: "Collects a short line of text, with an optional leading icon and clear button.",
  summary: "A text field with four control sizes, an optional leading icon and clear action, and focus, invalid and disabled states.",
  keywords: ["input", "text", "search", "clear", "form", "invalid"],
  since: "0.25.0",
  usage: `import { Search } from "lucide-react"
import { Input } from "@/components/wlkr/input"

<Input aria-label="Track title" placeholder="Track title" />
<Input type="search" aria-label="Search tracks" placeholder="Search tracks" icon={<Search />} clearable />`,
  examples: [
    { id: "default", title: "Default", description: "Use the 32px field for most forms and toolbars." },
    { id: "xs", title: "Extra small", description: "Use the 24px field in dense table rows." },
    { id: "sm", title: "Small", description: "Use the 28px field beside other small toolbar controls." },
    { id: "lg", title: "Large", description: "Use the 36px field when the surrounding controls are large." },
    { id: "with-icon", title: "Leading icon", description: "Use a leading icon to make a familiar action such as search easier to recognize." },
    { id: "clearable", title: "Clearable", description: "Use a clear button for queries people often replace." },
    { id: "focus", title: "Focus", description: "Click or tab into the field to see where text will be entered." },
    { id: "invalid", title: "Invalid", description: "Use `aria-invalid` when the current value needs correction." },
    { id: "disabled", title: "Disabled", description: "Use `disabled` when the field is temporarily unavailable." },
    { id: "read-only", title: "Read-only", description: "Use `readOnly` for values people can select and copy." },
  ],
  api: [{
    props: [
      { name: "size", type: "\"xs\" | \"sm\" | \"default\" | \"lg\"", default: "\"default\"", description: "24, 28, 32 or 36px tall on the same scale as Button and Select. Replaces the native size attribute." },
      { name: "icon", type: "ReactNode", description: "Decorative leading icon sized to the field." },
      { name: "clearable", type: "boolean", default: "false", description: "Adds a clear button to populated, editable text fields." },
      { name: "clearLabel", type: "string", default: "\"Clear input\"", description: "Accessible name for the clear button." },
      { name: "aria-invalid", type: "boolean | \"true\" | \"false\" | \"grammar\" | \"spelling\"", description: "Invalid values use the danger border." },
      { name: "disabled", type: "boolean", default: "false", description: "Dims the field and prevents editing and clearing." },
      { name: "value / defaultValue", type: "string | number | readonly string[]", description: "Native controlled or uncontrolled value." },
      { name: "onChange", type: "ChangeEventHandler<HTMLInputElement>", description: "Receives typing and clear events." },
      { name: "...props", type: "React.ComponentProps<\"input\">", description: "Native input attributes and ref pass through. className styles the wrapper." },
    ],
  }],
  notes: [
    "Name the field with a visible label, `aria-label` or `aria-labelledby`.",
    "The focus ring surrounds the field while typing. Clearing the value returns focus to the field.",
    "The clear button is hidden when the field is empty or disabled and omitted when it is read-only.",
  ],
  related: ["select", "combobox"],
  dependencies: ["lucide-react"],
  registryDependencies: ["https://ui.wlkr.si/r/theme.json"],
  system: true,
}
