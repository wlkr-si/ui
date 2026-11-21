import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Pixel object",
  category: "media",
  description: "Give a shape a little life. Project a point cloud or a simple mask into a quiet field of pixels.",
  summary: "A projected pixel sphere, custom point cloud or mask, with rotation, flicker patterns, shape morphing and considerate motion controls.",
  keywords: ["sphere", "disco", "rotating", "motion", "flicker", "grid", "shape", "object", "mask", "pixels", "morph", "cube", "torus", "svg"],
  since: "0.1.0",
  order: 10,
  stage: "plain",
  usage: `import { PixelObject, spherePoints } from "@/components/wlkr/pixel-object"

<PixelObject label="Pixel sphere" points={spherePoints(420)} />

// Morph between shapes, with a gentle wave.
<PixelObject
  pattern="wave"
  flickerAmount={0.62}
  morph={{ shapes: ["sphere", "cube", "torus"], duration: 8 }}
  label="An object, taking shape"
/>

// Or give it your own flat mask, with motion disabled.
<PixelObject
  mask={["  #  ", " ### ", "#####"]}
  rotating={false}
  label="Pixel triangle"
/>`,
  api: [
    {
      title: "PixelObject",
      props: [
        { name: "points", type: "{ x: number; y: number; z?: number }[]", default: "spherePoints(420)", description: "Normalized point cloud, up to 2,000 finite points. z defaults to 0." },
        { name: "mask", type: "string[]", description: "Rows of # and spaces, up to 80 × 80. Takes precedence over points." },
        { name: "resolution", type: "number", default: "36", description: "Raster cells per side, 8–80. Ignored once dotSize or gap is set." },
        { name: "size", type: "number", default: "260", description: "Nominal SVG size in px, 64–1,000. Scales down to fit narrow layouts." },
        { name: "label", type: "string", default: `"Rotating pixel sphere"`, description: "Accessible description of the object. Describe your own shape." },
        { name: "rotating", type: "boolean", default: "true", description: "Turns rotation on or off. Flicker can still run without it." },
        { name: "dotShape", type: `"square" | "rounded" | "circle"`, default: `"rounded"`, description: "The shape of each pixel." },
        { name: "dotSize", type: "number", description: "Dot width in SVG px, 0.5–40. Setting it or gap derives density from their pitch." },
        { name: "gap", type: "number", description: "Space between dots in SVG px, 0–40. Setting it or dotSize derives density from their pitch." },
        { name: "rotationSpeed", type: "number", default: "0.15", description: "Radians per second, 0–3. Independent of flicker speed." },
        { name: "flickerAmount", type: "number", default: "0", description: "Pattern depth, 0–1. Even full depth keeps cells at 35% of their shading." },
        { name: "flickerSpeed", type: "number", default: "0.5", description: "Pattern cycles per second, 0–2. Zero freezes the phase." },
        { name: "pattern", type: `"steady" | "scatter" | "wave" | "scan"`, default: `"steady"`, description: "Scatter varies seeded cells, wave moves a diagonal front, scan moves a row band. Steady never flickers." },
        { name: "delay", type: "number", default: "0", description: "Milliseconds of active time before motion starts, 0–30,000." },
        { name: "stagger", type: "number", default: "0", description: "Milliseconds of pattern phase spread across the object, 0–10,000." },
        { name: "seed", type: "number | string", default: "1", description: "Seeds the scatter phases. Stable on server and client." },
        { name: "randomness", type: "number", default: "1", description: "Seeded phase variation, 0–1. Zero synchronizes scatter." },
        { name: "opacity", type: "number", default: "1", description: "Overall opacity multiplier, 0–1." },
        { name: "restartKey", type: "number | string", default: "0", description: "Change it to restart rotation and timing without remounting." },
        { name: "morph", type: `{ shapes?: ("sphere" | "cube" | "torus")[]; duration?: number }`, description: "Continuous shape interpolation. Shapes default to all three; duration is seconds per transition, 2–60, default 8. Ignored with points or mask." },
        { name: "className", type: "string", description: "Merged onto the root. Colour comes from currentColor." },
      ],
    },
    {
      title: "Helpers",
      columns: { name: "Function", type: "Signature" },
      props: [
        { name: "spherePoints", type: "(count?: number) => PixelPoint[]", default: "count = 420", description: "Evenly spread points on a unit sphere, 12–2,000. Feed it to points." },
      ],
    },
  ],
  notes: [
    "An animated object is a native button: click, tap, Enter or Space pauses and resumes it, and its name says which.",
    "Motion stops while paused, off-screen, in a hidden tab or with reduced motion. Paused time does not advance.",
    "No frame loop runs for a still object. Moving frames are sampled at about 12 per second.",
    "Morph uses the same 420 points for every shape, so the loop flows back to the first without a swap.",
    "The object is plain SVG in currentColor, with depth shown by opacity.",
  ],
  related: ["pixel-image", "dot-field", "wlkr-loader"],
}
