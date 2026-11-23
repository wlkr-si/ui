import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Stat",
  category: "basics",
  order: 10,
  description: "Show a metric with a label and an optional note.",
  summary: "A metric tile with a monospaced value and an optional note, alongside a responsive Stats grid.",
  keywords: ["stat", "stats", "metric", "tile", "number", "dashboard"],
  since: "0.25.0",
  system: true,
  registryDependencies: ["https://ui.wlkr.si/r/theme.json"],
  usage: `import { Stat, Stats } from "@/components/wlkr/stat"

<Stats>
  <Stat label="Recordings" value="128" note="This year" />
  <Stat label="Listening" value="42h" note="This year" />
  <Stat label="Composers" value="24" />
  <Stat label="Saved" value="96" />
</Stats>`,
  examples: [
    { id: "default", title: "Single metric", description: "Show a single tile when the label already explains the value." },
    { id: "with-note", title: "With a note", description: "Add a note when the value needs context such as a time range." },
    { id: "grid", title: "Stats grid", description: "Group related metrics in a grid that switches from two to four columns on wider screens." }
  ],
  api: [
    {
      title: "Stat",
      props: [
        {
          name: "label",
          type: "ReactNode",
          description: "Required metric name."
        },
        {
          name: "value",
          type: "ReactNode",
          description: "Required metric value, shown in text-2xl with tabular figures."
        },
        {
          name: "note",
          type: "ReactNode",
          description: "Optional supporting text below the value, shown in text-xs."
        },
        {
          name: "Native props and ref",
          type: "React.ComponentProps<\"div\">",
          description: "Native div props and ref pass through. className is merged on the root."
        }
      ]
    },
    {
      title: "Stats",
      props: [
        {
          name: "children",
          type: "ReactNode",
          description: "Stat tiles to place in the responsive grid."
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
    "Values use font-mono and wrap in narrow tiles.",
    "Stats uses two equal columns by default and four at 56.25em and wider.",
    "Set aria-live when a changing value needs to be announced."
  ],
  related: [
    "card",
    "sparkline"
  ]
}
