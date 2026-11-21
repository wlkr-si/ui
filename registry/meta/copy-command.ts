import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Copy command",
  category: "actions",
  description: "One command. One click. Clear feedback when it works, a useful fallback when it doesn’t.",
  summary: "A copyable command with honest clipboard feedback and a manual fallback.",
  keywords: ["clipboard", "install", "terminal", "copy"],
  since: "0.1.0",
  order: 10,
  usage: `import { CopyCommand } from "@/components/wlkr/copy-command"

<CopyCommand command="pnpm dlx shadcn@latest add @wlkr/copy-command" />

// Long commands scroll inside their own line.
<CopyCommand
  className="max-w-md"
  command="pnpm dlx shadcn@latest add @wlkr/copy-command @wlkr/async-action @wlkr/filter-list"
/>`,
  api: [{
    props: [
      { name: "command", type: "string", description: "The text shown and written to the clipboard." },
      { name: "className", type: "string", description: "Merged onto the root." },
    ],
  }],
  notes: [
    "Feedback stays in one 44 px icon slot: copy, then a green check for 2.2 seconds, or a red cross that stays until the next try.",
    "A status region announces “Copied to clipboard.” or, on failure, asks the reader to select and copy the command by hand.",
    "The command is a keyboard-focusable line that scrolls sideways and stays selectable, so a failed copy never hides it.",
    "The clipboard needs a secure context (HTTPS or localhost). One copy runs at a time; the button is disabled while it does.",
    "Reduced motion swaps the icon instantly instead of turning and scaling it.",
  ],
  dependencies: ["lucide-react"],
  registryDependencies: ["button"],
  related: ["async-action", "shortcut"],
}
