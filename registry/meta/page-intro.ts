import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Page intro",
  category: "text",
  description: "A clear beginning. Final text holds its place while a quiet binary field resolves into the title.",
  summary: "Gallery typography with a width-stable binary heading reveal.",
  keywords: ["heading", "title", "binary", "reveal", "typography", "header", "intro"],
  since: "0.1.0",
  order: 10,
  usage: `import { PageIntro } from "@/components/wlkr/page-intro"

<PageIntro title={"Less.\\nBetter."} description="A clear starting point." />

// Keep your site's own title scale, slow the reveal a little.
<PageIntro
  as="h2"
  title="Useful things, thoughtfully built."
  titleClassName="text-5xl"
  duration={1600}
/>`,
  api: [{
    props: [
      { name: "title", type: "string", description: "The heading text. Line breaks (\\n) are kept." },
      { name: "description", type: "React.ReactNode", description: "Muted supporting copy under the title." },
      { name: "as", type: `"h1" | "h2"`, default: `"h1"`, description: "The heading element." },
      { name: "reveal", type: "boolean", default: "true", description: "Play the binary reveal. false shows the final title immediately." },
      { name: "duration", type: "number", default: "1100", description: "Milliseconds for the reveal, 400–3000." },
      { name: "className", type: "string", description: "Merged onto the header wrapper." },
      { name: "titleClassName", type: "string", description: "Merged onto the heading. Title styles have low specificity, so this can set your own scale." },
    ],
  }],
  notes: [
    "The final title is in server HTML and is read once by screen readers; the binary glyphs are hidden from them.",
    "Each word keeps its real width while 0s and 1s are clipped away left to right, so the layout never shifts.",
    "The reveal plays once, when the heading first comes into view.",
    "Reduced motion, or a hidden tab, ends the reveal and shows the final title.",
  ],
  related: ["decode-text", "rolling-number"],
}
