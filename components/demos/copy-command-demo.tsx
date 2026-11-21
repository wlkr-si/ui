"use client"

import { CopyCommand } from "@/registry/wlkr/copy-command"

export function CopyCommandDemo() {
  return <CopyCommand command="pnpm dlx shadcn@latest add @wlkr/copy-command" />
}
