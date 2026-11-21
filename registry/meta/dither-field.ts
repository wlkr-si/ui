import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Dither field",
  category: "effects",
  description: "A background in one-bit. Soft light, hard pixels.",
  summary: "A canvas background that renders a slow, soft light field through an ordered-dither matrix as crisp one-bit pixels, with children on top.",
  keywords: ["dither", "bayer", "one-bit", "pixel", "background", "canvas", "hero", "pattern", "retro"],
  since: "0.23.0",
  order: 20,
  usage: `import { DitherField } from "@/components/wlkr/dither-field"

<DitherField className="h-[360px] w-full" pattern="orbit" fade="bottom">
  <div className="grid h-full place-items-center">
    <h1>Brand Studio</h1>
  </div>
</DitherField>

// A still, denser texture with a little green in the brightest part.
<DitherField className="h-48" speed={0} density={0.5} matrix={8} accent />`,
  api: [{
    props: [
      { name: "children", type: "React.ReactNode", description: "Content drawn above the field." },
      { name: "pattern", type: `"waves" | "orbit" | "noise" | "linear"`, default: `"waves"`, description: "The soft field behind the dither: drifting waves, two orbiting glows, scrolling noise or a breathing angled gradient." },
      { name: "cell", type: "number", default: "4", description: "CSS pixels per dither pixel, 2–16. Grows on very large areas to stay under about 120,000 pixels." },
      { name: "speed", type: "number", default: "1", description: "Animation rate, 0–4. 0 holds a still frame." },
      { name: "density", type: "number", default: "0.35", description: "Overall amount of ink, 0–1." },
      { name: "contrast", type: "number", default: "0.6", description: "How hard the field separates into ink and paper, 0–1." },
      { name: "matrix", type: "2 | 4 | 8", default: "4", description: "Size of the Bayer matrix. Larger matrices give finer tones." },
      { name: "accent", type: "boolean", default: "false", description: "Tints a small share of pixels in the brightest region with --brand." },
      { name: "interactive", type: "boolean", default: "true", description: "The pointer adds a soft bright spot the pattern dithers around." },
      { name: "fade", type: `"none" | "bottom" | "edges"`, default: `"none"`, description: "Thins pixels out toward the bottom or all edges, through the dither rather than transparency." },
      { name: "opacity", type: "number", default: "0.5", description: "Strength of the ink, 0.05–1, so content on top stays readable." },
      { name: "className", type: "string", description: "Merged onto the root. Give the root its size." },
    ],
  }],
  notes: [
    "The canvas holds one pixel per dither cell and is scaled up with pixelated rendering, so each frame is cheap.",
    "Ink is --foreground and the accent is --brand, read at runtime and re-read when the theme changes; unlit pixels are transparent.",
    "Animation runs at about 20 frames a second, only while the field is on screen and the tab is visible.",
    "Reduced motion shows one still frame that still follows the pointer and redraws on resize or theme change.",
    "The canvas is decorative and hidden from assistive tech. Pointer handling never blocks page scrolling.",
  ],
  related: ["dot-field", "pixel-trail", "pixel-image"],
  stage: "fill",
}
