import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Pop menu",
  category: "navigation",
  description: "A square button and a flat list. Rows step in from the top.",
  summary: "A dropdown menu button following the WAI-ARIA menu button pattern, with an outlined flat panel, stepped row reveal and an inverted active row.",
  keywords: ["menu", "dropdown", "menu button", "actions", "context", "popover", "overflow"],
  since: "0.24.0",
  usage: `import { PopMenu } from "@/components/wlkr/pop-menu"

<PopMenu
  label="File"
  items={[
    { id: "open", label: "Open", shortcut: "⌘O", onSelect: () => open() },
    { id: "rename", label: "Rename", onSelect: () => rename() },
    { id: "archive", label: "Archive", disabled: true },
    { separator: true },
    { id: "delete", label: "Delete", danger: true, onSelect: () => remove() },
  ]}
/>

// Line the menu up with the trigger's right edge.
<PopMenu label="More" align="end" items={items} />`,
  api: [{
    props: [
      { name: "label", type: "React.ReactNode", description: "Text on the trigger button. Required." },
      { name: "items", type: "({ id: string; label: string; shortcut?: string; disabled?: boolean; danger?: boolean; onSelect?: () => void } | { separator: true })[]", description: "Rows in order. A separator draws a thin rule. Required." },
      { name: "align", type: `"start" | "end"`, default: `"start"`, description: "Which edge of the trigger the menu lines up with." },
      { name: "open", type: "boolean", description: "Controlled open state." },
      { name: "defaultOpen", type: "boolean", default: "false", description: "Initial open state when uncontrolled." },
      { name: "onOpenChange", type: "(open: boolean) => void", description: "Called whenever the menu opens or closes." },
      { name: "className", type: "string", description: "Merged onto the root div. Native div props pass through." },
    ],
  }],
  notes: [
    "Enter, Space or Down Arrow opens the menu on the first row; Up Arrow opens it on the last.",
    "Inside, arrows wrap, Home and End jump, and a letter moves to the next row starting with it. Disabled rows are skipped.",
    "Escape closes and returns focus to the trigger; Tab or a click outside closes it.",
    "The menu sits below the trigger and does not flip at the viewport edge, so leave room under it.",
    "Reduced motion shows the rows at once.",
  ],
  related: ["shortcut", "dock", "filter-list"],
}
