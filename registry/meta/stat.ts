import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Stat",
  category: "basics",
  order: 10,
  description: "A label, a number and a short note. Four tiles when there is room.",
  summary: "A Bach Bench stat tile with a mono tabular value and optional note, plus a responsive two-to-four-column Stats grid.",
  keywords: [
    "stat",
    "stats",
    "metric",
    "tile",
    "number",
    "dashboard",
    "Bach Bench"
  ],
  since: "0.25.0",
  origin: "Bach Bench",
  usage: `import { Stat, Stats } from "@/components/wlkr/stat"

<Stats>
  <Stat label="Recordings" value="128" note="This year" />
  <Stat label="Listening" value="42h" />
  <Stat label="Composers" value="24" />
  <Stat label="Saved" value="96" />
</Stats>`,
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
          description: "Required metric value."
        },
        {
          name: "note",
          type: "ReactNode",
          description: "Optional muted note under the value."
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
    "Values use the mono font, tabular figures and a 28px size. Text can wrap rather than overflowing narrow tiles.",
    "Stats uses two equal columns on phones and four at viewport widths of 900px or more, with an 8px gap.",
    "These are static containers. Set aria-live explicitly when a changing value needs announcements."
  ],
  related: [
    "card",
    "sparkline"
  ]
}
