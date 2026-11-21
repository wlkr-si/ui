"use client"

import * as React from "react"
import { FileTree, type FileTreeNode } from "@/registry/wlkr/file-tree"

const project: FileTreeNode[] = [
  { name: "app", children: [
    { name: "(docs)", children: [{ name: "components", children: [{ name: "[slug]", children: [{ name: "page.tsx" }] }] }] },
    { name: "globals.css" },
    { name: "layout.tsx" },
    { name: "page.tsx" },
  ] },
  { name: "components", children: [{ name: "site-chrome.tsx" }, { name: "soft-combobox.tsx" }, { name: "theme-provider.tsx" }] },
  { name: "registry", children: [{ name: "wlkr", children: [
    { name: "dot-field.tsx" },
    { name: "liquid-tabs.tsx" },
    { name: "pixel-image.tsx" },
    { name: "pixel-progress.tsx" },
    { name: "rolling-number.tsx" },
  ] }] },
  { name: "package.json" },
  { name: "README.md" },
]

export function FileTreeDemo() {
  const [path, setPath] = React.useState("registry/wlkr/liquid-tabs.tsx")
  return (
    <div className="flex w-full flex-col items-start gap-5">
      <FileTree
        label="Project files"
        items={project}
        selected={path}
        onSelect={setPath}
        defaultExpanded={["app", "registry", "registry/wlkr"]}
        className="w-full max-w-[300px]"
      />
      <p className="max-w-full truncate font-mono text-xs text-muted-foreground" aria-live="polite">{path}</p>
    </div>
  )
}
