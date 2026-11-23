import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Theme",
  category: "system",
  description: "The design tokens every WLKR component reads: a neutral and brand palette, colour roles for light and dark, and one scale for type, space, radius, elevation, motion and controls.",
  summary: "Two-layer design tokens for shadcn/ui projects: raw palette primitives, semantic light and dark roles, and shared control, type, space, radius, elevation and motion scales, with shadcn aliases.",
  keywords: ["theme", "tokens", "design tokens", "foundations", "colors", "colours", "dark", "light", "css variables", "brand", "semantic", "scale"],
  since: "0.1.0",
  order: 40,
  registry: false,
  install: "https://ui.wlkr.si/r/theme.json",
  source: "registry/wlkr/tokens.css",
  origin: "WLKR system",
  usage: `/* Components and your own CSS use the roles, never raw values. */
.panel {
  background: var(--wlkr-surface-raised);
  color: var(--wlkr-content-primary);
  border: var(--wlkr-control-border) solid var(--wlkr-border-default);
  border-radius: var(--wlkr-radius-xl);
  padding: var(--wlkr-space-4);
}

// Tailwind classes map to the same roles.
<p className="bg-surface-raised text-content-secondary">Supporting text</p>

// Dark mode is one class on the document root.
document.documentElement.classList.toggle("dark")`,
  api: [{
    title: "Colour roles",
    columns: { name: "Token", type: "Light → dark" },
    props: [
      { name: "--wlkr-surface-page", type: "gray-0 → gray-1000", description: "The page canvas. Also raised, sunken and overlay surfaces." },
      { name: "--wlkr-content-primary", type: "gray-1000 → gray-25", description: "Text and icons. Also secondary, tertiary and inverse." },
      { name: "--wlkr-border-default", type: "gray-200 → gray-800", description: "Outlines. Also subtle and strong." },
      { name: "--wlkr-fill-hover", type: "content-primary at 7%", description: "Washes that tint any surface. Also subtle, active and secondary." },
      { name: "--wlkr-action-primary", type: "gray-1000 → gray-25", description: "The primary action, with hover and ink." },
      { name: "--wlkr-brand", type: "green-400", description: "WLKR green, for the one accent." },
      { name: "--wlkr-focus-ring", type: "green-700 → green-400", description: "Keyboard focus." },
      { name: "--wlkr-danger", type: "red-700 → red-300", description: "Errors and destructive actions, with subtle washes." },
    ],
  }, {
    title: "Scales",
    columns: { name: "Token", type: "Values" },
    props: [
      { name: "--wlkr-control-h-*", type: "24 · 28 · 32 · 36px", description: "Control heights for xs, sm, md and lg, with matching padding, text, icon and gap tokens." },
      { name: "--wlkr-space-*", type: "2 to 80px", description: "A 4px grid with half steps." },
      { name: "--wlkr-text-*", type: "11 to 64px", description: "The type scale." },
      { name: "--wlkr-radius-*", type: "4 · 5 · 6 · 8 · 12 · full", description: "Corners by role." },
      { name: "--wlkr-shadow-*", type: "raised · overlay · dialog", description: "Elevation, per theme." },
      { name: "--wlkr-duration-* / --wlkr-ease-*", type: "90 to 460ms", description: "Motion." },
    ],
  }],
  notes: [
    "The full set, rendered live in both themes, is on the System page at /system.",
    "Apply .dark to the document root for dark mode. A .wlkr-light or .wlkr-dark class forces one theme inside a panel.",
    "shadcn/ui's own names (background, foreground, muted, border, ring…) stay as aliases of these roles, so stock shadcn components match.",
    "Every WLKR component built on the system installs this theme with it.",
    "Green marks a useful moment. It never carries the message alone, so pair it with words or an icon.",
  ],
  related: ["typography", "theme-toggle", "primitives"],
}
