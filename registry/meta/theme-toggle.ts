import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Theme toggle",
  category: "system",
  description: "Light or dark, with one quiet control. System preferences lead until you choose otherwise.",
  summary: "A basic shadcn Toggle that switches light and dark themes, follows the system until chosen and remembers the choice.",
  keywords: ["theme", "toggle", "dark", "light", "system", "preference", "mode", "color scheme"],
  since: "0.1.0",
  order: 10,
  usage: `import { ThemeToggle } from "@/components/wlkr/theme-toggle"

<ThemeToggle showLabel />

// Icon only, with your own storage key.
<ThemeToggle storageKey="studio-theme" />
// Follows the system until someone chooses.`,
  api: [{
    props: [
      { name: "showLabel", type: "boolean", default: "false", description: "Shows “Light mode” or “Dark mode” beside the icon." },
      { name: "storageKey", type: "string", default: `"wlkr-theme"`, description: "localStorage key for the stored choice. Share it with a prepaint script to avoid a flash." },
      { name: "className", type: "string", description: "Merged onto the Toggle." },
    ],
  }],
  notes: [
    "It applies .dark and color-scheme to the document root. There is no provider and no animated transition.",
    "It follows the system preference until someone chooses light or dark, then stores that choice.",
    "Choices stay in sync across Footer controls, other windows and system changes through a small shared hook.",
    "If storage is blocked, the choice still works in memory for the session.",
    "The accessible name says what pressing it will do, and the target is at least 44 px.",
  ],
  dependencies: ["lucide-react"],
  registryDependencies: ["toggle"],
  files: [{ path: "hooks/use-display-theme.ts", type: "registry:hook", target: "hooks/use-display-theme.ts" }],
  related: ["footer-controls", "theme"],
}
