import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Command menu",
  category: "navigation",
  description: "A prompt, a list, a solid block on the row you mean. Press Enter and it is done.",
  summary: "A command palette in a native modal dialog with a mono prompt, subsequence filtering, grouped commands, shortcuts and combobox ARIA.",
  keywords: ["command", "palette", "cmdk", "search", "launcher", "spotlight", "dialog", "combobox"],
  since: "0.24.0",
  usage: `import { CommandMenu } from "@/components/wlkr/command-menu"

const items = [
  { id: "new", label: "New project", group: "Projects", shortcut: "⌘N", onSelect: () => createProject() },
  { id: "deploy", label: "Deploy", group: "Projects", keywords: ["ship"], onSelect: () => deploy() },
  { id: "theme", label: "Toggle theme", group: "System", onSelect: () => toggleTheme() },
]

// Opens on Cmd/Ctrl+K by default.
<CommandMenu items={items} />

// Controlled, with its own trigger and no global shortcut.
<CommandMenu items={items} open={open} onOpenChange={setOpen} hotkey={false} />`,
  api: [{
    props: [
      { name: "items", type: "{ id: string; label: string; group?: string; shortcut?: string; keywords?: string[]; onSelect?: () => void }[]", description: "Commands in display order. Items sharing a group sit under one heading, in order of first appearance." },
      { name: "open", type: "boolean", description: "Controlled open state." },
      { name: "defaultOpen", type: "boolean", default: "false", description: "Initial open state when uncontrolled." },
      { name: "onOpenChange", type: "(open: boolean) => void", description: "Called when the menu opens or closes, by hotkey, Escape, backdrop click or running a command." },
      { name: "placeholder", type: "string", default: `"Type a command"`, description: "Placeholder in the prompt input." },
      { name: "hotkey", type: "string | false", default: `"k"`, description: "Letter that opens the menu with Cmd or Ctrl. Pass false to turn the global listener off." },
      { name: "label", type: "string", default: `"Command menu"`, description: "Accessible name for the dialog and the list." },
      { name: "className", type: "string", description: "Added to the dialog element." },
    ],
  }],
  notes: [
    "It uses a native dialog opened with showModal, so focus stays inside and Escape closes it without extra code.",
    "Up and Down wrap around the list, Home and End jump to the ends, and Enter runs the active command and closes the menu.",
    "Filtering is a case-insensitive subsequence match over the label and keywords, so \"dpl\" finds \"Deploy\".",
    "The open motion is a four-step reveal; reduced motion opens it instantly.",
    "Only one menu should own a given hotkey on a page; pass hotkey={false} when something else already uses it.",
  ],
  related: ["shortcut", "dock", "filter-list"],
}
