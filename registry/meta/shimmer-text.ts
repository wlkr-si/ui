import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Shimmer text",
  category: "feedback",
  description: "For when it's thinking. The words stay put; the light moves through them.",
  summary: "Inline status text in a quiet grey with a stepped, dithered band of brighter text passing through it while work is in progress.",
  keywords: ["shimmer", "loading", "thinking", "status", "text", "pending", "pixel", "dither", "ai"],
  since: "0.23.0",
  order: 60,
  usage: `import { ShimmerText } from "@/components/wlkr/shimmer-text"

const [syncing, setSyncing] = useState(true)

<div role="status">
  <ShimmerText active={syncing} duration={1800}>
    {syncing ? "Syncing 3 files…" : "Synced"}
  </ShimmerText>
</div>`,
  api: [{
    props: [
      { name: "children", type: "string", description: "The text. Plain text only, so it can be drawn twice without repeating markup." },
      { name: "active", type: "boolean", default: "true", description: "False settles to the normal text colour with a short fade." },
      { name: "duration", type: "number", default: "1600", description: "Milliseconds per pass, 600–6000. Each pass is followed by a short rest." },
      { name: "spread", type: "number", default: "6", description: "Width of the light band in characters, 2–24." },
      { name: "as", type: `"span" | "p" | "div"`, default: `"span"`, description: "The root element." },
      { name: "className", type: "string", description: "Merged onto the root. Other native props are passed through." },
    ],
  }],
  notes: [
    "The text stays on one line (white-space: nowrap); keep it short, like a status.",
    "Screen readers read the text once. The light layer is a hidden duplicate. Wrap it in a role=\"status\" region if the change should be announced.",
    "The band advances about one character per step and has a dithered edge. It pauses off-screen and in hidden tabs.",
    "Reduced motion shows the grey text with no band, still distinct from finished text. Without CSS mask support it simply stays grey.",
  ],
  related: ["pixel-skeleton", "async-action", "decode-text"],
}
