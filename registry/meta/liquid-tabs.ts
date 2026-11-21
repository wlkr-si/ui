import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Liquid tabs",
  category: "navigation",
  description: "A choice that moves like a drop. The selection stretches toward the next option, then snaps across.",
  summary: "A keyboard-accessible segmented control with a liquid selection that stretches and snaps.",
  keywords: ["tabs", "segmented", "control", "radio", "switch", "goo", "liquid", "indicator", "navigation"],
  since: "0.22.0",
  order: 10,
  usage: `import { LiquidTabs } from "@/components/wlkr/liquid-tabs"

const [view, setView] = React.useState("overview")

<LiquidTabs
  label="Project view"
  value={view}
  onValueChange={setView}
  items={[
    { value: "overview", label: "Overview" },
    { value: "activity", label: "Activity" },
    { value: "files", label: "Files" },
  ]}
/>`,
  api: [{
    props: [
      { name: "items", type: "{ value: string; label: React.ReactNode; disabled?: boolean }[]", description: "The options, in order." },
      { name: "label", type: "string", description: "Accessible name for the group." },
      { name: "value", type: "string", description: "Controlled selection. Pair with onValueChange." },
      { name: "onValueChange", type: "(value: string) => void", description: "Called with the newly selected value." },
      { name: "defaultValue", type: "string", default: "first enabled item", description: "Uncontrolled starting selection." },
      { name: "tone", type: `"ink" | "brand"`, default: `"ink"`, description: "Ink is a foreground drop with background text. Brand is a WLKR green drop with brand-foreground text." },
      { name: "size", type: `"sm" | "md"`, default: `"md"`, description: "Both keep a 44 px hit height." },
      { name: "className", type: "string", description: "Merged onto the root." },
      { name: "...props", type: "React.ComponentProps<\"div\">", description: "Other div props are passed through, except role, onChange and children." },
    ],
  }],
  notes: [
    "A radiogroup with roving focus. Arrow keys move and select, skip disabled options and wrap; Home and End jump to the ends.",
    "Arrow direction follows dir=\"rtl\".",
    "The selection is three shapes behind one blur-and-threshold filter, so it stretches, necks and snaps. Labels sit outside the filter and stay sharp.",
    "In a narrow container the row scrolls sideways and keeps the selection in view.",
    "Reduced motion moves the selection instantly.",
  ],
  related: ["filter-list", "theme-toggle"],
}
