import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Typography",
  category: "system",
  description: "The same type, scale, and spacing you see here. Opt-in styles for a shared visual language.",
  summary: "An opt-in stylesheet with the gallery's exact type scale and layout classes, bridged to semantic theme tokens.",
  keywords: ["typography", "layout", "styles", "font", "geist", "display", "spacing", "css", "type scale"],
  since: "0.1.0",
  order: 30,
  registry: false,
  install: "https://ui.wlkr.si/r/typography.json",
  source: "registry/wlkr/typography.css",
  origin: "WLKR style",
  usage: `// Use the stylesheet path printed by the CLI.
import "@/styles/wlkr-typography.css"

export function Foundations() {
  return (
    <div className="wlkr-typography wlkr-layout">
      <h1 className="wlkr-display">Well set.</h1>
      <p className="wlkr-intro-copy">A little space to think.</p>
    </div>
  )
}`,
  api: [{
    title: "Classes",
    columns: { name: "Class", type: "Kind" },
    props: [
      { name: "wlkr-typography", type: "class", description: "The app's Geist stack. Bridges legacy --paper, --ink and --line to background, foreground and border." },
      { name: "wlkr-layout", type: "class", description: "1512 px maximum, centred, 6.2% inline padding; 6% under 900 px." },
      { name: "wlkr-display", type: "class", description: "clamp(64px, 8.3vw, 124px), 0.96 line height, weight 620, −0.078em tracking; 68 px under 620 px." },
      { name: "wlkr-intro-copy", type: "class", description: "16 px / 1.6 in the supporting text colour; 15 px under 900 px." },
      { name: "wlkr-reading", type: "class", description: "14 px / 1.75, at most 70 characters wide." },
      { name: "wlkr-caption", type: "class", description: "12 px / 1.65 in the supporting text colour." },
      { name: "wlkr-stack", type: "class", description: "A vertical flex stack with a 24 px gap." },
    ],
  }],
  notes: [
    "The CLI places the stylesheet under your source tree, usually src/styles/wlkr-typography.css. Import the path it prints.",
    "The font stays owned by your app. Load your licensed Geist first; the stylesheet reads it from your font variables.",
    "It does not reset body styles or replace theme tokens. Nothing changes until you add a class.",
    "Supporting text uses --muted-foreground. On older sites, move text uses of --muted to it, since --muted is a surface.",
  ],
  related: ["theme", "page-intro"],
}
