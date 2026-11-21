import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "File tree",
  category: "navigation",
  description: "Folders, files, and all the keys you'd expect.",
  summary: "An accessible file tree with stepped pixel chevrons, animated folders, guide lines and full tree keyboard support.",
  keywords: ["tree", "files", "folders", "explorer", "navigation", "treeview", "directory", "sidebar"],
  since: "0.23.0",
  order: 80,
  usage: `import { FileTree } from "@/components/wlkr/file-tree"

const items = [
  { name: "app", children: [{ name: "layout.tsx" }, { name: "page.tsx" }] },
  { name: "public", children: [] },
  { name: "package.json" },
]

<FileTree
  label="Project files"
  items={items}
  defaultSelected="app/page.tsx"
  onSelect={(id, node) => console.log(id, node.name)}
/>`,
  api: [{
    props: [
      { name: "items", type: "FileTreeNode[]", description: "{ name, children?, id? }. A node with children, even empty, is a folder. Ids default to the path of names joined by slashes." },
      { name: "label", type: "string", description: "Accessible name of the tree." },
      { name: "selected", type: "string", description: "Controlled selected id. Pair with onSelect." },
      { name: "onSelect", type: "(id: string, node: FileTreeNode) => void", description: "Called when a row is clicked, or chosen with Enter or Space." },
      { name: "defaultSelected", type: "string", description: "Uncontrolled starting selection." },
      { name: "expanded", type: "string[]", description: "Controlled open folder ids. Pair with onExpandedChange." },
      { name: "onExpandedChange", type: "(ids: string[]) => void", description: "Called with the new list of open folder ids." },
      { name: "defaultExpanded", type: `string[] | "all"`, default: "top-level folders", description: "Uncontrolled open folders." },
      { name: "className", type: "string", description: "Merged onto the root." },
    ],
  }],
  notes: [
    "It follows the WAI-ARIA tree pattern: one row is tabbable, Up and Down move through visible rows, Right opens or steps in, Left closes or steps out, Home and End jump to the ends.",
    "Enter or Space selects a file or toggles a folder, * opens every sibling folder, and typing jumps to the next row whose name starts with what you typed.",
    "Closed folders are inert, so their rows cannot take focus. Under reduced motion they open and close instantly.",
    "Long names truncate with an ellipsis and keep the full name in a tooltip. Rows grow to 44px on touch screens.",
    "Ids are path-based, so the same name can appear in different folders.",
  ],
  related: ["filter-list", "liquid-tabs"],
}
