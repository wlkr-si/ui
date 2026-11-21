import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Pixel skeleton",
  category: "feedback",
  description: "A placeholder that looks like it's still being drawn. Coarse pixels fill in, one band at a time.",
  summary: "A loading placeholder for text, blocks and avatars, drawn as a checker texture with a stepped pixel band sweeping across.",
  keywords: ["skeleton", "loading", "placeholder", "shimmer", "pixel", "dither", "pending"],
  since: "0.23.0",
  order: 50,
  usage: `import { PixelSkeleton } from "@/components/wlkr/pixel-skeleton"

<div className="flex items-center gap-3">
  <PixelSkeleton variant="circle" width={44} label="Loading projects" />
  <PixelSkeleton lines={2} />
</div>
<PixelSkeleton variant="block" height={140} />

// Inside a heading, the lines are heading-sized.
<h2><PixelSkeleton lines={1} width="12ch" /></h2>`,
  api: [{
    props: [
      { name: "variant", type: `"text" | "block" | "circle"`, default: `"text"`, description: "Lines sized by the parent's font, a rectangle, or a round avatar." },
      { name: "lines", type: "number", default: "3", description: "Text lines, 1–12. The last of several is 60% wide." },
      { name: "width", type: "number | string", default: `"100%" or 40`, description: "Pixels or any CSS length. Circles default to 40px." },
      { name: "height", type: "number | string", default: `120 or width`, description: "Pixels or any CSS length, for block and circle. Circles match their width." },
      { name: "cell", type: "number", default: "4", description: "Pixel pitch in px, 2–12." },
      { name: "active", type: "boolean", default: "true", description: "False holds the texture still." },
      { name: "label", type: "string", description: "Adds a visually hidden status with this text, e.g. \"Loading projects\". Without it the skeleton is decorative." },
      { name: "className", type: "string", description: "Merged onto the root. Other div props are passed through." },
    ],
  }],
  notes: [
    "The drawing is hidden from assistive technology. Give one skeleton in a group a label, or mark the loading region with aria-busy yourself.",
    "Text lines are 0.7em bars inside one line-height each, so swapping in real text at the same font size barely moves anything.",
    "The band is an ordered-dither ramp that fills the checker in solid at its middle. It advances two cells at a time and rests between passes; text lines start 90ms apart so it reads as one diagonal sweep.",
    "Reduced motion or active={false} shows the still checker only. The sweep also pauses off-screen and in hidden tabs.",
    "Pure CSS masks, no canvas. Browsers without CSS round() still sweep, just not snapped to the grid.",
  ],
  related: ["shimmer-text", "pixel-progress", "async-action"],
}
