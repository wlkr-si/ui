"use client"

import { Terminal, type TerminalLine } from "@/registry/wlkr/terminal"

const session: TerminalLine[] = [
  { type: "command", text: "pnpm dlx shadcn@latest add https://ui.wlkr.si/r/terminal.json" },
  { type: "output", text: "✔ Checking registry.", tone: "muted" },
  { type: "output", text: "✔ Created 1 file:", tone: "success" },
  { type: "output", text: "  - components/wlkr/terminal.tsx", tone: "muted" },
  { type: "command", text: "pnpm dev" },
  { type: "output", text: "▲ Next.js 16.4.6" },
  { type: "output", text: "- Local: http://localhost:3000", tone: "muted" },
  { type: "output", text: "✓ Ready in 1.2s", tone: "success" },
]

export function TerminalDemo() {
  return (
    <div className="flex w-full flex-col items-start gap-5">
      <Terminal title="zsh — brand-studio" lines={session} className="w-full" />
    </div>
  )
}
