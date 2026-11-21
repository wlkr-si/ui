import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Terminal",
  category: "text",
  description: "A terminal that types for itself. Commands in, output out, block caret throughout.",
  summary: "A self-playing terminal session that types commands behind a block caret and lands output a row at a time, at its final height from the first frame.",
  keywords: ["terminal", "shell", "cli", "typing", "caret", "command", "install", "docs", "landing"],
  since: "0.23.0",
  stage: "plain",
  order: 50,
  usage: `import { Terminal } from "@/components/wlkr/terminal"

<Terminal
  title="zsh — wlkr/ui"
  lines={[
    { type: "command", text: "pnpm dlx shadcn@latest add https://ui.wlkr.si/r/terminal.json" },
    { type: "output", text: "✔ Created 1 file:", tone: "success" },
    { type: "output", text: "  - components/wlkr/terminal.tsx", tone: "muted" },
    { type: "command", text: "pnpm dev" },
    { type: "output", text: "✓ Ready in 1.2s", tone: "success" },
  ]}
/>`,
  api: [{
    props: [
      { name: "lines", type: "TerminalLine[]", description: "The session, in order: { type: \"command\", text } or { type: \"output\", text, tone? } with tone \"default\", \"muted\", \"success\" or \"error\". Output text may contain \"\\n\" for several rows. Changing it restarts playback." },
      { name: "title", type: "string", description: "Small label in the top row." },
      { name: "prompt", type: "string", default: `"$"`, description: "Symbol before each command." },
      { name: "typeSpeed", type: "number", default: "38", description: "Milliseconds per typed character, 5–200, with a small steady variation." },
      { name: "lineDelay", type: "number", default: "110", description: "Milliseconds between output rows, 0–2000." },
      { name: "startDelay", type: "number", default: "300", description: "Milliseconds before the first keystroke, 0–10000." },
      { name: "loop", type: "boolean", default: "false", description: "Wait about 2.4 seconds at the end, clear and play again." },
      { name: "trigger", type: `"view" | "mount"`, default: `"view"`, description: "Start once 30% is visible, or straight away." },
      { name: "copyable", type: "boolean", default: "true", description: "Finished command rows get a button that copies just the command." },
      { name: "label", type: "string", default: `"Terminal session"`, description: "Accessible name for the terminal." },
      { name: "className", type: "string", description: "Merged onto the root." },
    ],
  }],
  notes: [
    "The full transcript is laid out invisibly underneath, so the box holds its final height while playing, and long lines wrap instead of scrolling.",
    "Click or tap the terminal, press Enter or Space while it has focus, or use the Skip button to jump to the end; the same action replays once it has finished.",
    "Screen readers get the whole transcript at once as static text; nothing is announced character by character.",
    "Playback pauses when the terminal leaves the screen or the tab is hidden, and resumes where it stopped.",
    "With reduced motion the finished session is shown straight away with a solid caret, and the Skip button is hidden.",
    "Copy buttons appear on hover or focus, and stay faintly visible on touch screens. If the clipboard is unavailable the text stays selectable.",
  ],
  related: ["typewriter", "copy-command", "decode-text"],
}
