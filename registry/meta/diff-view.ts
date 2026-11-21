import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Diff view",
  category: "data",
  description: "Before and after, line by line. Added lines get a green bar.",
  summary: "A unified line-level text diff with old and new line numbers, a sign column, hatched removed lines and collapsible unchanged runs.",
  keywords: ["diff", "changes", "compare", "patch", "code", "review", "lcs"],
  since: "0.24.0",
  stage: "plain",
  usage: `import { DiffView, diffLines } from "@/components/wlkr/diff-view"

<DiffView
  title="src/config.ts"
  before={oldSource}
  after={newSource}
/>

// More context, no gutter, wrapped lines.
<DiffView before={a} after={b} context={5} lineNumbers={false} wrap />

// The diff on its own.
const rows = diffLines(a, b) // [{ type: "add", text: "...", newLine: 4 }, ...]`,
  api: [
    {
      title: "DiffView",
      props: [
        { name: "before", type: "string", description: "The original text. Required." },
        { name: "after", type: "string", description: "The changed text. Required." },
        { name: "title", type: "React.ReactNode", description: "Shown on the left of the header, usually a file name." },
        { name: "context", type: "number", default: "3", description: "Unchanged lines kept around each change. Longer runs than twice this collapse into a button." },
        { name: "lineNumbers", type: "boolean", default: "true", description: "Shows the old and new line number columns." },
        { name: "wrap", type: "boolean", default: "false", description: "Wraps long lines instead of scrolling sideways." },
        { name: "className", type: "string", description: "Merged onto the root. Native div props pass through." },
      ],
    },
    {
      title: "diffLines",
      columns: { name: "Argument", type: "Type" },
      props: [
        { name: "before", type: "string", description: "Original text, split on newlines. One trailing newline is ignored." },
        { name: "after", type: "string", description: "Changed text." },
        { name: "returns", type: `{ type: "same" | "add" | "remove"; text: string; oldLine?: number; newLine?: number }[]`, description: "Rows in display order, removals before additions within a change." },
      ],
    },
  ],
  notes: [
    "The diff is a plain longest-common-subsequence over lines, so it is quadratic in memory and meant for files of a few hundred lines.",
    "It renders a table with a hidden caption and column headers; each changed line carries a hidden \"added\" or \"removed\" word so the change is not told by colour alone.",
    "Collapsed runs are buttons that expand in place. Once opened they stay open until the inputs change.",
    "Long lines scroll inside the component, which is a focusable region so the keyboard can scroll it too.",
    "The expand fade is stepped and is turned off under reduced motion.",
  ],
  related: ["terminal", "file-tree", "compare"],
}
