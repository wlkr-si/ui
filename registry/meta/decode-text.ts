import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Decode text",
  category: "text",
  description: "Words that resolve out of noise. Final text holds its width while glyphs settle, left to right.",
  summary: "Inline text that resolves out of glyph noise on view, hover or focus, with a stable width.",
  keywords: ["scramble", "text", "reveal", "glyph", "binary", "hover", "link", "label"],
  since: "0.22.0",
  order: 20,
  usage: `import { DecodeText } from "@/components/wlkr/decode-text"

<DecodeText as="h2" trigger="view" text="Useful things, thoughtfully built." />

// Inside a link, the whole link replays it on hover and focus.
<a href="/work">
  <DecodeText trigger="hover" glyphs="▚▞░▒▓" text="Work" />
</a>`,
  api: [{
    props: [
      { name: "text", type: "string", description: "The final text. Present in server HTML and read once by screen readers. Changing it decodes again." },
      { name: "trigger", type: `"view" | "hover" | "both"`, default: `"both"`, description: "Play once on entering view, replay on pointer enter or focus, or both." },
      { name: "duration", type: "number", default: "700", description: "Milliseconds for the sweep, 200–4000." },
      { name: "glyphs", type: "string", default: `"01"`, description: "Characters the noise is drawn from." },
      { name: "as", type: `"span" | "p" | "div" | "h1" | "h2" | "h3"`, default: `"span"`, description: "The root element." },
      { name: "className", type: "string", description: "Merged onto the root." },
    ],
  }],
  notes: [
    "Each character sits in a cell sized by the real character, so the width never changes and lines wrap between words.",
    "Inside a link or button, the whole control triggers the replay. Touch pointer-enter is ignored.",
    "Noise is deterministic, so server and client agree.",
    "Reduced motion, or a hidden tab, shows the final text immediately.",
  ],
  related: ["page-intro", "rolling-number"],
}
