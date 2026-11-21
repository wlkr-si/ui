import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Marker",
  category: "text",
  description: "Emphasis that draws itself, a few pixels at a time.",
  summary: "Inline emphasis that draws a highlight, underline or strike through its words in discrete steps, across line breaks, on view, mount or hover.",
  keywords: ["highlight", "underline", "strike", "mark", "emphasis", "text", "reveal", "scroll"],
  since: "0.23.0",
  order: 40,
  usage: `import { Marker } from "@/components/wlkr/marker"

<p>
  We make <Marker>fewer components</Marker>, and we make them{" "}
  <Marker variant="underline" delay={300}>properly</Marker>.
</p>

// Redraws while the link is hovered or focused.
<a href="/notes">
  <Marker trigger="hover" tone="ink">Read the notes</Marker>
</a>`,
  api: [{
    props: [
      { name: "children", type: "React.ReactNode", description: "Inline content, usually a few words." },
      { name: "variant", type: `"highlight" | "underline" | "strike"`, default: `"highlight"`, description: "A block behind the text, a thick line under it, or a line through it." },
      { name: "tone", type: `"brand" | "ink"`, default: `"brand"`, description: "Green, or the text colour. An ink highlight inverts the text like a selection." },
      { name: "duration", type: "number", default: "520", description: "Milliseconds for the draw, 120–3000." },
      { name: "delay", type: "number", default: "0", description: "Milliseconds before the draw starts, 0–10000. Useful for staggering several marks." },
      { name: "steps", type: "number", default: "12", description: "Discrete steps in the draw, 2–60. Fewer looks chunkier." },
      { name: "trigger", type: `"view" | "mount" | "hover"`, default: `"view"`, description: "Draw once at 60% visible, right after mount, or while the nearest link or button (or the mark) is hovered or focused." },
      { name: "drawn", type: "boolean", description: "Controlled state. When set, it overrides the trigger." },
      { name: "className", type: "string", description: "Merged onto the root." },
    ],
  }],
  notes: [
    "Highlight renders a mark element; underline and strike render a span. Strike is visual only, so use a real del or s element around it when the words are deleted content.",
    "Screen readers read the words normally and nothing else is announced. Before it draws, and in server HTML, the text looks completely ordinary.",
    "Text on a highlight switches to a contrasting colour halfway through the draw, so it stays readable in light and dark.",
    "Across a line break each line draws its own mark at the same time.",
    "With reduced motion the mark appears at once, fully drawn, when triggered.",
  ],
  related: ["decode-text", "text-link"],
}
