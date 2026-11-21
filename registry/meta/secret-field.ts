import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Secret field",
  category: "data",
  description: "A key that keeps to itself. Reveal it for a moment, or copy it without looking.",
  summary: "A masked API key or token field that decodes on reveal, re-masks on a timer and copies without showing the value.",
  keywords: ["secret", "api key", "token", "password", "mask", "reveal", "copy", "clipboard", "credentials"],
  since: "0.23.0",
  order: 70,
  usage: `import { SecretField } from "@/components/wlkr/secret-field"

<SecretField label="Publishable key" value="pk_live_51WLKR8sT2nQmVx4f2a" />

// Hides itself again after six seconds, and keeps no tail visible.
<SecretField
  label="Secret key"
  value="sk_test_wlkr_0000_example_do_not_use_9c1e"
  visibleEnd={0}
  revealFor={6000}
  onCopy={() => console.log("copied")}
/>`,
  api: [{
    props: [
      { name: "value", type: "string", description: "The secret. While masked, only its length and visible tail are in the page." },
      { name: "label", type: "string", description: "Small label above the value. Also names the region and the buttons." },
      { name: "visibleEnd", type: "number", default: "4", description: "Characters left readable at the end while masked, 0–8, never more than half the value." },
      { name: "revealFor", type: "number | null", default: "10000", description: "Milliseconds before it masks itself again, 1000–600000. null stays revealed until toggled." },
      { name: "onCopy", type: "() => void", description: "Runs after the value reaches the clipboard." },
      { name: "onReveal", type: "() => void", description: "Runs each time the value is revealed." },
      { name: "className", type: "string", description: "Merged onto the root." },
    ],
  }],
  notes: [
    "While masked, the hidden characters are not in the page at all, so they cannot be selected, searched or read from the DOM.",
    "Every character sits in a one-character cell, so revealing never changes the width. A long value scrolls inside its own box and is keyboard focusable when it overflows.",
    "Reveal is a toggle button with aria-pressed. A status region announces Revealed, Hidden, Copied to clipboard or Copy failed.",
    "The value masks itself again when its timer runs out or the tab is hidden. Copy works while masked and never reveals it.",
    "Reduced motion swaps the decode for an instant change; the timer line still shortens, in one linear pass.",
  ],
  dependencies: ["lucide-react"],
  related: ["copy-command", "decode-text"],
}
