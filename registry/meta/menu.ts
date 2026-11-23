import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Menu",
  category: "basics",
  order: 8,
  description: "Open a list of actions from a button.",
  summary: "An accessible menu button with keyboard navigation, typeahead, icons, separators and disabled actions.",
  keywords: ["menu", "dropdown", "actions", "keyboard"],
  since: "0.25.0",
  usage: `import { Menu } from "@/components/wlkr/menu"

<Menu items={[
  { id: "export", label: "Export SVG", onSelect: () => console.log("export") },
  { id: "line", type: "separator" },
  { id: "copy", label: "Copy link", onSelect: () => console.log("copy") },
]} />`,
  examples: [
    { id: "default", title: "Default", description: "Use the default 32px menu for actions on a page or toolbar." },
    { id: "xs", title: "Extra small", description: "Use the 24px menu in dense rows." },
    { id: "sm", title: "Small", description: "Use the 28px menu beside small toolbar controls." },
    { id: "lg", title: "Large", description: "Use the 36px menu beside large controls." },
    { id: "align-start", title: "Start aligned", description: "Align the popup to the start of the trigger when it has room to extend toward the end." },
    { id: "custom-trigger", title: "Custom trigger", description: "Use a named icon button when space is limited." },
    { id: "icons", title: "Item icons", description: "Pair icons with labels to make common actions easier to scan." },
    { id: "separator", title: "Separator", description: "Use a separator to divide groups of related actions." },
    { id: "disabled-item", title: "Disabled item", description: "Disable an action when it should remain visible while it is unavailable." },
  ],
  api: [{
    props: [
      { name: "items", type: "readonly MenuItem[]", description: "Actions with a unique id, label and optional icon, disabled flag or onSelect callback, or separators with an id and type: \"separator\"." },
      { name: "trigger", type: "ReactElement", default: "Outline Actions button", description: "A single button that accepts props and forwards its ref." },
      { name: "size", type: "\"xs\" | \"sm\" | \"default\" | \"lg\"", default: "\"default\"", description: "Height of the default trigger and menu rows on the shared 24, 28, 32 and 36px control scale." },
      { name: "align", type: "\"start\" | \"end\"", default: "\"end\"", description: "Aligns the popup to the inline start or end of the trigger." },
      { name: "label", type: "string", description: "Accessible name for the menu. Defaults to the name of the trigger." },
      { name: "Native props and ref", type: "React.ComponentProps<\"span\">", description: "Native span props and ref pass through. className styles the wrapper." },
    ],
  }],
  notes: [
    "Click, Enter, Space and ArrowDown open the menu at the first item. ArrowUp opens it at the last item.",
    "Arrow keys wrap, Home and End move to the first and last items, and typing jumps to matching labels. Disabled items can receive focus and cannot be activated.",
    "Escape and selecting an action close the menu and return focus to the trigger. Tab continues navigation. Clicking or moving focus outside dismisses the menu.",
    "The popup follows the same overlay pattern as Combobox and respects reduced motion.",
  ],
  related: ["button", "icon-button", "combobox"],
  dependencies: ["radix-ui", "lucide-react"],
  registryDependencies: ["https://ui.wlkr.si/r/theme.json", "https://ui.wlkr.si/r/button.json"],
  system: true,
}
