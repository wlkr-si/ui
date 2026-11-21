import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Theme",
  category: "system",
  description: "A common language for what comes next. Semantic color, considered type, and space to think.",
  summary: "Semantic light and dark colour tokens for shadcn/ui projects, with the WLKR green brand accent. Typography stays with your app.",
  keywords: ["theme", "foundations", "tokens", "colors", "colours", "dark", "light", "css variables", "brand", "design"],
  since: "0.1.0",
  order: 40,
  registry: false,
  install: "https://ui.wlkr.si/r/theme.json",
  source: null,
  origin: "WLKR system",
  usage: `// Dark mode is one class on the document root.
document.documentElement.classList.toggle("dark")

// Use tokens through Tailwind…
<p className="bg-background text-muted-foreground">Supporting text</p>
<span className="text-success">Saved</span>

// …or directly as CSS variables.
<i style={{ background: "var(--brand)", color: "var(--brand-foreground)" }} />`,
  api: [{
    title: "Tokens",
    columns: { name: "Token", type: "Light → dark" },
    props: [
      { name: "--background", type: "#ffffff → #010101", description: "The page canvas." },
      { name: "--foreground", type: "#010101 → #f7f7f7", description: "Primary text and icons." },
      { name: "--card", type: "#ffffff → #010101", description: "Card surfaces." },
      { name: "--card-foreground", type: "#010101 → #f7f7f7", description: "Text on cards." },
      { name: "--popover", type: "#ffffff → #161616", description: "Popovers, menus and hover cards." },
      { name: "--popover-foreground", type: "#010101 → #f7f7f7", description: "Text on popovers." },
      { name: "--primary", type: "#010101 → #f7f7f7", description: "The primary action." },
      { name: "--primary-foreground", type: "#ffffff → #010101", description: "Text on the primary action." },
      { name: "--secondary", type: "#f3f3f3 → #191919", description: "Secondary actions." },
      { name: "--secondary-foreground", type: "#010101 → #f7f7f7", description: "Text on secondary actions." },
      { name: "--muted", type: "#f3f3f3 → #191919", description: "A quiet surface. Not a text colour." },
      { name: "--muted-foreground", type: "#696969 → #a0a0a0", description: "Supporting text." },
      { name: "--accent", type: "#f3f3f3 → #191919", description: "Hover and selected surfaces." },
      { name: "--accent-foreground", type: "#010101 → #f7f7f7", description: "Text on accent surfaces." },
      { name: "--border", type: "#dedede → #343434", description: "Hairlines and outlines." },
      { name: "--input", type: "#dedede → #343434", description: "Input outlines." },
      { name: "--ring", type: "#087d3d → #33f282", description: "Keyboard focus." },
      { name: "--success", type: "#087d3d → #33f282", description: "Successful completion." },
      { name: "--destructive", type: "#b42318 → #ff938a", description: "Failure and destructive actions." },
      { name: "--brand", type: "#33f282 → #33f282", description: "WLKR green, for a useful moment." },
      { name: "--brand-foreground", type: "#010101 → #010101", description: "Text on WLKR green." },
      { name: "--radius", type: ".375rem", description: "Base corner radius. The same in both themes." },
    ],
  }],
  notes: [
    "Apply .dark to the document root for dark mode; Theme toggle and Footer controls do this for you.",
    "The theme sets colour only and leaves your app's typography alone.",
    "Installing merges these variables into your stylesheet. Review and merge your existing tokens before applying it.",
    "Green marks a useful moment. It never carries the message alone, so pair it with words or an icon.",
    "It also maps brand, brand-foreground and success into Tailwind, so classes like text-success work.",
  ],
  related: ["typography", "theme-toggle", "primitives"],
}
