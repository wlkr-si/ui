import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Dissolve",
  category: "effects",
  description: "Content that arrives pixel by pixel, and can leave the same way.",
  summary: "A wrapper that reveals or hides any content through a 4×4 ordered-dither mask, on view, on mount or on command.",
  keywords: ["dither", "reveal", "pixel", "mask", "scroll", "appear", "transition", "bayer"],
  since: "0.23.0",
  order: 40,
  usage: `import { Dissolve } from "@/components/wlkr/dissolve"

// Arrives when a quarter of it scrolls into view.
<Dissolve>
  <h2>Less, but better.</h2>
</Dissolve>

// Controlled, staggered, with a sweep from the left.
<Dissolve show={open} delay={120} direction="right" cell={6}>
  <img src="/work/brand-studio.png" alt="Brand Studio" />
</Dissolve>`,
  api: [{
    props: [
      { name: "children", type: "React.ReactNode", description: "Anything: a line, an image, a whole section." },
      { name: "show", type: "boolean", description: "Controlled visibility. Changes dissolve in or out; the first value is applied without animation. When omitted, trigger decides." },
      { name: "trigger", type: `"view" | "mount"`, default: `"view"`, description: "Play when about 25% is visible, or as soon as it mounts." },
      { name: "once", type: "boolean", default: "true", description: "With the view trigger, turning it off dissolves out on leaving the viewport and back in on return." },
      { name: "duration", type: "number", default: "700", description: "Milliseconds for a full dissolve, 150–4000." },
      { name: "delay", type: "number", default: "0", description: "Milliseconds before it starts. Stagger several Dissolves with it." },
      { name: "cell", type: "number", default: "4", description: "Size of one dither pixel in CSS pixels, 1–24." },
      { name: "direction", type: `"none" | "up" | "down" | "left" | "right"`, default: `"none"`, description: "Dissolve everywhere at once, or sweep a dithered front across in that direction." },
      { name: "as", type: `"div" | "span" | "section" | "li"`, default: `"div"`, description: "The root element." },
      { name: "className", type: "string", description: "Merged onto the root. Other native props are spread onto it." },
    ],
  }],
  notes: [
    "Server HTML and no-JS render the content fully visible. A Dissolve already on screen when the page hydrates stays visible instead of flashing; one mounted on the client or below the fold is hidden before paint and plays.",
    "The mask never changes size or layout. When the dissolve finishes the mask is removed, so content is crisp and selectable.",
    "It is visual only: content stays in the accessibility tree while hidden, and hidden content that receives keyboard focus shows at once.",
    "Reduced motion skips the dissolve: content is simply visible, and hiding through show happens immediately.",
    "Several Dissolves are staggered by giving each a larger delay.",
  ],
  related: ["pixel-image", "decode-text", "pixel-progress"],
}
