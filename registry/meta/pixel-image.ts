import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Pixel image",
  category: "media",
  description: "A picture that arrives in pixels. A few big blocks, then finer ones, then the real thing.",
  summary: "An image that resolves from coarse colour blocks to the real picture when it enters view.",
  keywords: ["image", "photo", "reveal", "pixelate", "blocks", "load", "mosaic", "media"],
  since: "0.22.0",
  order: 20,
  usage: `import { PixelImage } from "@/components/wlkr/pixel-image"

<PixelImage
  src="/work/weathergoblin.jpg"
  alt="WeatherGoblin forecast on a phone"
  width={1600}
  height={1000}
  trigger="both"
  className="w-full"
/>
// width and height reserve the space, so nothing shifts.`,
  api: [{
    props: [
      { name: "src", type: "string", description: "Passed to the real <img>, which is always in the document." },
      { name: "alt", type: "string", description: "Passed to the <img>." },
      { name: "width", type: "number", description: "Intrinsic width in CSS pixels. With height, sets the aspect ratio so nothing shifts." },
      { name: "height", type: "number", description: "Intrinsic height in CSS pixels." },
      { name: "steps", type: "number[]", default: "[64, 40, 24, 14, 8, 4]", description: "Block sizes in CSS pixels, coarse to fine. Each 2–256, at most 12." },
      { name: "stepDuration", type: "number", default: "90", description: "Milliseconds each step is held, 30–1000." },
      { name: "trigger", type: `"view" | "hover" | "both"`, default: `"view"`, description: "Play once at 25% visible, replay on pointer enter or focus, or both." },
      { name: "fit", type: `"cover" | "contain"`, default: `"cover"`, description: "How the image fills its frame; the blocks use the same maths." },
      { name: "tabIndex", type: "number", description: "Makes the frame focusable, so focus can replay the reveal. Not set by default." },
      { name: "className", type: "string", description: "Merged onto the root frame, along with style." },
      { name: "...props", type: "React.ComponentProps<\"img\">", description: "Other image props (loading, sizes, srcSet, crossOrigin) go to the <img>." },
    ],
  }],
  notes: [
    "Server HTML and pages without JavaScript show the plain image.",
    "Only drawImage is used, so cross-origin images without CORS headers still work.",
    "A failed load shows the browser’s normal alt text.",
    "Focus replays the reveal only when the frame is focusable, through tabIndex or a focusable child.",
    "Reduced motion shows the plain image with no effect.",
  ],
  related: ["dot-field", "pixel-object"],
}
