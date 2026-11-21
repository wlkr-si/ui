import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Dock",
  category: "navigation",
  description: "A row of tools that leans toward the pointer. The nearest tiles grow and their neighbours follow.",
  summary: "A navigation row of square icon tiles that magnify around the pointer or keyboard focus from a fixed baseline.",
  keywords: ["dock", "toolbar", "magnify", "icons", "navigation", "launcher", "hover"],
  since: "0.23.0",
  order: 40,
  usage: `import { House, Search, Settings } from "lucide-react"
import { Dock } from "@/components/wlkr/dock"

<Dock
  label="Studio tools"
  items={[
    { label: "Home", icon: <House />, href: "/", active: true },
    { label: "Search", icon: <Search />, onSelect: () => openSearch() },
    { label: "Settings", icon: <Settings />, href: "/settings" },
  ]}
/>`,
  api: [{
    props: [
      { name: "items", type: "DockItem[]", description: "{ label, icon, href?, onSelect?, active?, disabled? }. With href an item is a link, otherwise a button. The label is its accessible name and its tooltip." },
      { name: "size", type: "number", default: "44", description: "Resting tile size in pixels, 32–72." },
      { name: "magnification", type: "number", default: "1.6", description: "Peak scale of the tile under the pointer, 1–2.5. 1 turns magnification off." },
      { name: "distance", type: "number", default: "120", description: "How far along the row the pointer's pull reaches, in pixels, 40–320." },
      { name: "label", type: "string", default: `"Dock"`, description: "Accessible name for the navigation landmark." },
      { name: "className", type: "string", description: "Merged onto the root nav." },
    ],
  }],
  notes: [
    "Tab reaches every item; ArrowLeft, ArrowRight, Home and End also move focus along the row. The focused tile magnifies as if the pointer were over it.",
    "Icons are hidden from assistive tech and the floating name is decorative; each item is announced by its label. An active link gets aria-current=\"page\".",
    "Space for the fully magnified tiles and the name is reserved above the row, so nothing on the page moves.",
    "Touch screens and coarse pointers get plain 44px tiles with no magnification, and the row scrolls sideways if it does not fit.",
    "Reduced motion turns magnification off and keeps hover and focus styling.",
  ],
  related: ["liquid-tabs", "scroll-spy"],
}
