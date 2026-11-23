"use client"

import * as React from "react"
import { CopyCommand } from "@/registry/wlkr/copy-command"

const managers = [
  { value: "pnpm", label: "pnpm", run: "pnpm dlx shadcn@latest add" },
  { value: "npm", label: "npm", run: "npx shadcn@latest add" },
  { value: "yarn", label: "yarn", run: "yarn dlx shadcn@latest add" },
  { value: "bun", label: "bun", run: "bunx --bun shadcn@latest add" },
]
const KEY = "wlkr-package-manager"
const EVENT = "wlkr-package-manager-change"

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange)
  window.addEventListener(EVENT, onChange)
  return () => { window.removeEventListener("storage", onChange); window.removeEventListener(EVENT, onChange) }
}
function read() {
  try { const stored = localStorage.getItem(KEY); return managers.some(manager => manager.value === stored) ? stored as string : "pnpm" } catch { return "pnpm" }
}

/** One install line, in the package manager you last chose anywhere on the site. */
export function InstallCommand({ target, label = "Package manager" }: { target: string; label?: string }) {
  const selected = React.useSyncExternalStore(subscribe, read, () => "pnpm")
  const manager = managers.find(item => item.value === selected) ?? managers[0]
  const choose = (value: string) => {
    try { localStorage.setItem(KEY, value) } catch { /* The choice still applies to this page view. */ }
    window.dispatchEvent(new Event(EVENT))
  }
  return <div className="doc-install">
    <div role="radiogroup" aria-label={label} className="doc-install-tabs" onKeyDown={event => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return
      event.preventDefault()
      const index = managers.indexOf(manager) + (event.key === "ArrowRight" ? 1 : -1)
      const nextManager = managers[(index + managers.length) % managers.length]
      choose(nextManager.value)
      event.currentTarget.querySelector<HTMLElement>(`[data-value="${nextManager.value}"]`)?.focus()
    }}>
      {managers.map(item => <button key={item.value} type="button" role="radio" data-value={item.value} aria-checked={item.value === manager.value} tabIndex={item.value === manager.value ? 0 : -1} onClick={() => choose(item.value)}>{item.label}</button>)}
    </div>
    <CopyCommand command={`${manager.run} ${target}`} />
  </div>
}
