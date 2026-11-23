import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Menu",
  category: "basics",
  order: 8,
  description: "A small menu of actions, kept beside its trigger.",
  summary: "A menu button with a Bach Bench popover, arrow navigation, typeahead, separators, disabled actions and focus return.",
  keywords: [
    "menu",
    "popover",
    "dropdown",
    "export",
    "actions",
    "Bach Bench"
  ],
  since: "0.25.0",
  origin: "Bach Bench",
  usage: `import { Menu } from "@/components/wlkr/menu"

<Menu align="end" items={[
  { id: "export", label: "Export SVG", onSelect: () => console.log("export") },
  { id: "line", type: "separator" },
  { id: "copy", label: "Copy link", onSelect: () => console.log("copy") },
]} />`,
  api: [
    {
      props: [
        {
          name: "trigger",
          type: "ReactElement",
          default: "outlined Actions button",
          description: "A single focusable element that forwards props and ref."
        },
        {
          name: "items",
          type: "MenuItem[]",
          description: "Required items: { id, label, icon?, disabled?, onSelect? }, or { id, type: \"separator\" }."
        },
        {
          name: "align",
          type: "\"start\" | \"end\"",
          default: "\"end\"",
          description: "Aligns the popup to the trigger."
        },
        {
          name: "label",
          type: "string",
          description: "Optional accessible menu name; otherwise uses the trigger name."
        },
        {
          name: "Native props and ref",
          type: "React.ComponentProps<\"span\">",
          description: "Native span props and ref pass through. className is merged on the root."
        }
      ]
    }
  ],
  notes: [
    "Click, Enter or Space opens from a native trigger. ArrowDown opens at the first enabled item; ArrowUp opens at the last.",
    "Up and Down wrap; Home and End jump to the ends. Typing finds matching item labels. Disabled items are skipped.",
    "Escape and selecting an item close the menu and return focus to the trigger. Tab closes and continues navigation; outside clicks or focus close without stealing focus.",
    "Custom triggers must forward props and ref. Reduced motion removes the 150ms fade and scale."
  ],
  related: [
    "button",
    "icon-button"
  ],
  dependencies: [
    "radix-ui",
    "lucide-react"
  ],
  registryDependencies: [
    "https://ui.wlkr.si/r/button.json"
  ]
}
