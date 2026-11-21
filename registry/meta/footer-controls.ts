import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Footer controls",
  category: "system",
  description: "A quiet place for display preferences. Follow the system, choose light or dark, or read the page as plain text.",
  summary: "Compact system, light and dark theme controls with a link to a real app-owned plain-text page for agents.",
  keywords: ["footer", "display", "controls", "theme", "system", "light", "dark", "agent", "markdown", "llms.txt"],
  since: "0.1.0",
  order: 20,
  usage: `import { FooterControls } from "@/components/wlkr/footer-controls"

<footer>
  <FooterControls agentHref="/llms.txt" />
</footer>

// Point it at a real Markdown or plain-text page your app serves.
<FooterControls agentHref="/agent/current-page.md" storageKey="studio-theme" />`,
  api: [{
    props: [
      { name: "agentHref", type: "string", description: "A real Markdown or plain-text page owned by your app. Opens in a new tab." },
      { name: "storageKey", type: "string", default: `"wlkr-theme"`, description: "localStorage key for the stored choice, shared with Theme toggle." },
      { name: "className", type: "string", description: "Merged onto the root." },
    ],
  }],
  notes: [
    "System, Light and Dark form one stock ToggleGroup; arrow keys move between them and the choice stays in sync with Theme toggle.",
    "Choosing System removes the stored preference, so the page follows the operating system again.",
    "Tooltips name each option on hover and keyboard focus.",
    "The agent link is a plain anchor with rel=\"noopener noreferrer\". It does not run or invent an agent.",
    "Targets are a compact 24 px to match the footer reference, so the whole control is 104 × 24 px.",
  ],
  registryDependencies: ["toggle-group", "tooltip"],
  files: [{ path: "hooks/use-display-theme.ts", type: "registry:hook", target: "hooks/use-display-theme.ts" }],
  related: ["theme-toggle", "theme"],
}
