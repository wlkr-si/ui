import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "WLKR loader",
  category: "feedback",
  description: "A liquid Open Lens mark that loops while loading and bounces on hover.",
  summary: "A tunable Open Lens loader with optional liquid split-body motion, a hover bounce, pause and reduced-motion support.",
  keywords: ["loading", "logo", "loader", "symbol", "arc", "rotation", "motion", "liquid", "goo", "hover", "bounce", "spinner"],
  since: "0.1.0",
  order: 20,
  stage: "plain",
  usage: `import * as React from "react"
import { WlkrLoader } from "@/components/wlkr/wlkr-loader"

<WlkrLoader cutThrough label="Loading projects" />

// A home mark that bounces once on hover.
export function HomeMark() {
  const [playing, setPlaying] = React.useState(false)
  return (
    <a href="/" aria-label="Home" onPointerEnter={() => setPlaying(true)}>
      <WlkrLoader size={40} duration={350} cutThrough loop={false} bounce
        frame={playing ? undefined : 0}
        onCycleComplete={() => setPlaying(false)}
        decorative
      />
    </a>
  )
}`,
  api: [{
    props: [
      { name: "size", type: "number", default: "48", description: "Square size in px, 16–240." },
      { name: "duration", type: "number", default: "1800", description: "Cycle length in ms, 300–10,000. About 350 suits a hover bounce, 1,800 a loading loop." },
      { name: "label", type: "string", default: `"Loading"`, description: "The one loading announcement." },
      { name: "decorative", type: "boolean", default: "false", description: "Hides the mark from assistive tech when another control already announces loading." },
      { name: "paused", type: "boolean", default: "false", description: "Freezes the current phase." },
      { name: "cutThrough", type: "boolean", default: "false", description: "Liquid mode: the bowl parts around the arc, pinches off a drop and seals behind it." },
      { name: "openingDistance", type: "number", default: "40", description: "How far the groove opens around the arc, 0–100 SVG units." },
      { name: "splitRadius", type: "number", default: "74", description: "Radius of the split line around the arc centre, 40–100 SVG units." },
      { name: "goo", type: "number", default: "11", description: "Surface tension radius, 0–24 SVG units. Zero removes the filter." },
      { name: "squish", type: "number", default: "0.7", description: "Share of the opening that lifts the rim instead of thinning the drop, 0–1." },
      { name: "ripple", type: "number", default: "0.22", description: "Ripple as the bowl seals, 0–1." },
      { name: "arcScale", type: "number", default: "1", description: "Arc size relative to the approved path, 0.6–1.2." },
      { name: "tilt", type: "number", default: "-24", description: "Resting tilt of the mark in degrees, −60–60." },
      { name: "reverse", type: "boolean", default: "false", description: "Turns the other way, leading with the other end of the arc." },
      { name: "easing", type: `"linear" | "smooth"`, default: `"linear"`, description: "Constant speed, or an ease in and out per turn." },
      { name: "frame", type: "number", description: "An exact static turn, 0–1. Supplying it suspends the animation; clearing it starts a fresh turn." },
      { name: "startAngle", type: "number", default: "0", description: "Starting orientation in degrees for live playback." },
      { name: "loop", type: "boolean", default: "true", description: "False performs one turn and holds the final pose." },
      { name: "bounce", type: "boolean", default: "false", description: "With cutThrough and loop off: the arc kicks forward, strikes the bowl, rebounds and settles. duration is the whole bounce." },
      { name: "restartKey", type: "number", default: "0", description: "Change it to restart the turn." },
      { name: "onCycleComplete", type: "() => void", description: "Called after the final pose when loop is off." },
      { name: "className", type: "string", description: "Merged onto the root. Colour comes from currentColor." },
      { name: "variant", type: `"orbit" | "breathe" | "bars" | "dots"`, default: `"orbit"`, description: "Kept for compatibility. Every variant uses the same arc motion." },
      { name: "stagger", type: "number", default: "120", description: "Deprecated. No longer changes the motion." },
      { name: "cutGap, openingAngle, openAt, closeAt", type: "number", description: "Deprecated rigid-motion inputs. Ignored." },
    ],
  }],
  notes: [
    "Without cutThrough, a CSS transform turns the arc and no JavaScript frame loop runs.",
    "Liquid mode redraws two body paths, the blur radius and the arc each frame from the shared geometry in lib/open-lens-motion.ts, installed with it.",
    "At rest the mark is the plain vector logo, so small sizes stay crisp. The liquid filter only appears while it moves or holds a turned frame.",
    "Motion stops while paused, off-screen, in a hidden tab or with reduced motion, and resumes from the same phase.",
    "The loader itself is not interactive. It renders as a status with one label, or hidden when decorative.",
  ],
  files: [{ path: "lib/open-lens-motion.ts", type: "registry:lib", target: "lib/open-lens-motion.ts" }],
  related: ["pixel-object", "pixel-progress"],
}
