import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Shortcut",
  category: "actions",
  description: "A hint and a hotkey in one. Keycaps press with the real keys and run your action when the combination lands.",
  summary: "Platform-aware keycaps that press with the real keys and run a handler when the combination lands.",
  keywords: ["keyboard", "shortcut", "hotkey", "kbd", "keys", "command"],
  since: "0.22.0",
  order: 40,
  usage: `import { Shortcut } from "@/components/wlkr/shortcut"

<button type="button" onClick={openSearch}>
  Search
  <Shortcut keys="mod+k" onTrigger={openSearch} />
</button>

// Without onTrigger it is a live hint only.
<Shortcut keys="shift+?" size="sm" />`,
  api: [{
    props: [
      { name: "keys", type: "string", description: "A combination such as \"mod+k\", \"shift+?\" or \"escape\". Mod is ⌘ on Apple platforms and Ctrl elsewhere. Up to eight keys." },
      { name: "onTrigger", type: "(event: KeyboardEvent) => void", description: "When set, listens on window and runs each time the combination lands." },
      { name: "preventDefault", type: "boolean", default: "true with onTrigger", description: "Cancels the browser’s own action for the combination." },
      { name: "allowInInputs", type: "boolean", default: "false", description: "Also fire while typing in a field. Combinations with mod, ctrl or alt always fire." },
      { name: "disabled", type: "boolean", default: "false", description: "Stops listening and pressing." },
      { name: "size", type: `"sm" | "md"`, default: `"md"`, description: "20 px or 24 px keycaps." },
      { name: "className", type: "string", description: "Merged onto the root." },
      { name: "...props", type: "React.ComponentProps<\"kbd\">", description: "Other kbd props are passed through." },
    ],
  }],
  notes: [
    "Server HTML shows the non-Apple labels; Apple symbols appear after hydration.",
    "Modifiers must match exactly. Key repeat and IME composition never trigger.",
    "Pressed state clears when ⌘ is released, on blur and on tab change. Other keys release after one second, because macOS sends no key-up while ⌘ is held.",
    "Symbol caps carry a hidden name, so ⌘K reads as “Command K”.",
    "The gallery’s own search hotkey uses this component.",
  ],
  related: ["hold-action", "filter-list"],
}
