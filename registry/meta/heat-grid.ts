import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Heat grid",
  category: "data",
  description: "Half a year of days, one square each. The busy ones go green.",
  summary: "An activity grid of days by week, shaded in four ink steps with the busiest days in brand green.",
  keywords: ["heatmap", "calendar", "activity", "contributions", "grid", "streak", "data", "year"],
  since: "0.23.0",
  order: 50,
  usage: `import { HeatGrid } from "@/components/wlkr/heat-grid"

const days = [
  { date: "2026-11-16", count: 4 },
  { date: "2026-11-17", count: 9 },
  { date: "2026-11-19", count: 2 },
]

<HeatGrid
  label="Commits"
  data={days}
  end="2026-11-20"
  unit={["commit", "commits"]}
/>`,
  api: [{
    props: [
      { name: "data", type: "{ date: string; count: number }[]", description: "ISO YYYY-MM-DD dates. Missing days count as 0, repeated days add up, bad entries are skipped." },
      { name: "end", type: "string", description: "ISO date of the last day shown. Required so server and client render the same grid." },
      { name: "label", type: "string", description: "Accessible name of the grid." },
      { name: "weeks", type: "number", default: "26", description: "Columns, 4–53." },
      { name: "weekStart", type: "0 | 1", default: "0", description: "0 starts each column on Sunday, 1 on Monday." },
      { name: "levels", type: "number[]", default: "quantiles", description: "Ascending thresholds for intensity 1–4. By default they come from the visible busy days, so the top tenth goes green." },
      { name: "cell", type: "number", default: "11", description: "Cell size in px, 6–24." },
      { name: "gap", type: "number", default: "3", description: "Px between cells, 1–8." },
      { name: "unit", type: "[singular: string, plural: string]", default: `["contribution", "contributions"]`, description: "Words used in the readout and cell names." },
      { name: "formatDate", type: "(date: Date) => string", default: "Mar 14, 2026", description: "Formats a day. The Date is midnight UTC; read it with UTC getters." },
      { name: "showMonths", type: "boolean", default: "true", description: "Three-letter month labels above the first week of each month." },
      { name: "className", type: "string", description: "Merged onto the root." },
    ],
  }],
  notes: [
    "The grid is one tab stop. Arrow keys move by day and week, Home and End go to the ends of the row, Page Up and Page Down move four weeks, and Ctrl+Home or Ctrl+End jump to the first or last day.",
    "Each day is a grid cell named like “7 contributions on Mar 14, 2026”, announced as focus moves; the visible readout is hidden from screen readers.",
    "All date maths runs in UTC from the end date you pass, so there are no time zone or daylight saving shifts and server HTML matches the client.",
    "A grid wider than its container scrolls inside its own box and opens on the most recent weeks.",
    "Cells ripple in from the left the first time the grid scrolls into view. Reduced motion shows them at once.",
  ],
  related: ["pixel-bars", "dot-field"],
}
