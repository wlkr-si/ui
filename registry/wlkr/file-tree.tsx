"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type FileTreeNode = {
  name: string
  /** Present, even empty, makes the node a folder. */
  children?: FileTreeNode[]
  /** Defaults to the path of names joined by "/". */
  id?: string
}

export type FileTreeProps = Omit<React.ComponentPropsWithoutRef<"div">, "role" | "children" | "onSelect" | "aria-label"> & {
  items: FileTreeNode[]
  /** Controlled selected id. Pair with `onSelect`. */
  selected?: string
  onSelect?: (id: string, node: FileTreeNode) => void
  defaultSelected?: string
  /** Controlled open folder ids. Pair with `onExpandedChange`. */
  expanded?: string[]
  onExpandedChange?: (ids: string[]) => void
  /** Uncontrolled open folders. Defaults to the top-level folders. */
  defaultExpanded?: string[] | "all"
  /** Accessible name of the tree. */
  label: string
}

type Row = { id: string; node: FileTreeNode; level: number; parent: string | null; folder: boolean; size: number; index: number; visible: boolean }

const styles = `
.wlkr-file-tree{min-width:0;font-size:13px;line-height:1;color:var(--foreground,currentColor)}
.wlkr-file-tree-group,.wlkr-file-tree-list{margin:0;padding:0;list-style:none}
.wlkr-file-tree-item{outline:none}
.wlkr-file-tree-row{position:relative;display:flex;align-items:center;gap:8px;height:32px;padding:0 8px 0 calc(8px + var(--wlkr-file-tree-level) * 16px);border-radius:0;cursor:pointer;white-space:nowrap;-webkit-tap-highlight-color:transparent}
@media(pointer:coarse){.wlkr-file-tree-row{height:44px}}
@media(hover:hover){.wlkr-file-tree-row:hover{background:var(--muted,#f3f3f3)}}
.wlkr-file-tree-item:focus-visible>.wlkr-file-tree-row{outline:2px solid var(--ring,currentColor);outline-offset:3px}
.wlkr-file-tree-item[aria-selected=true]>.wlkr-file-tree-row{background:var(--foreground,#010101);color:var(--background,#fff)}
.wlkr-file-tree-guide{position:absolute;top:0;bottom:0;width:1px;background:var(--border,#dedede)}
.wlkr-file-tree-item[aria-selected=true]>.wlkr-file-tree-row .wlkr-file-tree-guide{opacity:0}
.wlkr-file-tree-icon{flex:none;display:block;width:12px;height:12px}
.wlkr-file-tree-chevron{transition:transform 180ms steps(3,end)}
.wlkr-file-tree-item[aria-expanded=true]>.wlkr-file-tree-row .wlkr-file-tree-chevron{transform:rotate(90deg)}
.wlkr-file-tree-dot{fill:var(--brand,#33f282);opacity:0}
.wlkr-file-tree-item[aria-selected=true]>.wlkr-file-tree-row .wlkr-file-tree-dot{opacity:1}
.wlkr-file-tree-name{min-width:0;overflow:hidden;text-overflow:ellipsis}
.wlkr-file-tree-item[aria-expanded] >.wlkr-file-tree-row .wlkr-file-tree-name{font-weight:500}
.wlkr-file-tree-group{display:grid;grid-template-columns:minmax(0,1fr);grid-template-rows:0fr;transition:grid-template-rows 200ms cubic-bezier(.2,.7,.2,1)}
.wlkr-file-tree-item[aria-expanded=true]>.wlkr-file-tree-group{grid-template-rows:1fr}
.wlkr-file-tree-group>div{min-height:0;overflow:hidden}
.wlkr-file-tree-item[aria-expanded=true]>.wlkr-file-tree-group>div{overflow:visible;animation:wlkr-file-tree-reveal 200ms}
@keyframes wlkr-file-tree-reveal{from,to{overflow:hidden}}
@media(prefers-reduced-motion:reduce){.wlkr-file-tree-chevron,.wlkr-file-tree-group{transition:none}.wlkr-file-tree-item[aria-expanded=true]>.wlkr-file-tree-group>div{animation:none}}
`

/** Flattens the tree into rows, in display order, with path ids and visibility. */
function flatten(items: FileTreeNode[], open: Set<string>) {
  const rows: Row[] = []
  const walk = (nodes: FileTreeNode[], level: number, parent: string | null, path: string, visible: boolean) => {
    nodes.forEach((node, index) => {
      const id = node.id ?? (path ? `${path}/${node.name}` : node.name)
      const folder = Array.isArray(node.children)
      rows.push({ id, node, level, parent, folder, size: nodes.length, index, visible })
      if (folder) walk(node.children ?? [], level + 1, id, path ? `${path}/${node.name}` : node.name, visible && open.has(id))
    })
  }
  walk(Array.isArray(items) ? items : [], 1, null, "", true)
  return rows
}

/** A file tree with stepped pixel chevrons, sliding folders and the full WAI-ARIA tree keyboard. */
export function FileTree({ items, selected, onSelect, defaultSelected, expanded, onExpandedChange, defaultExpanded, label, className, onKeyDown, ...props }: FileTreeProps) {
  const [internalOpen, setInternalOpen] = React.useState<string[]>(() => {
    const all = flatten(items, new Set()).filter(row => row.folder)
    return defaultExpanded === "all" ? all.map(row => row.id) : Array.isArray(defaultExpanded) ? defaultExpanded : all.filter(row => row.level === 1).map(row => row.id)
  })
  const [internalSelected, setInternalSelected] = React.useState(defaultSelected)
  const [focusId, setFocusId] = React.useState<string | null>(null)
  const typed = React.useRef({ text: "", at: 0 })
  const rowRefs = React.useRef(new Map<string, HTMLLIElement>())

  const openIds = Array.isArray(expanded) ? expanded : internalOpen
  const open = React.useMemo(() => new Set(openIds), [openIds])
  const rows = React.useMemo(() => flatten(items, open), [items, open])
  const visible = rows.filter(row => row.visible)
  const current = selected !== undefined ? selected : internalSelected
  const tabbable = visible.find(row => row.id === focusId) ?? visible.find(row => row.id === current) ?? visible[0]
  const children = new Map<string | null, Row[]>()
  rows.forEach(row => { const siblings = children.get(row.parent); if (siblings) siblings.push(row); else children.set(row.parent, [row]) })

  function setOpen(next: string[]) {
    if (!Array.isArray(expanded)) setInternalOpen(next)
    onExpandedChange?.(next)
  }
  const toggle = (row: Row, to = !open.has(row.id)) => { if (to !== open.has(row.id)) setOpen(to ? [...openIds, row.id] : openIds.filter(id => id !== row.id)) }
  function choose(row: Row) {
    if (selected === undefined) setInternalSelected(row.id)
    onSelect?.(row.id, row.node)
  }
  function focus(row: Row | undefined) {
    if (!row) return
    setFocusId(row.id)
    rowRefs.current.get(row.id)?.focus()
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event)
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return
    const at = visible.findIndex(row => row.id === focusId)
    const row = visible[at]
    if (!row) return
    const key = event.key
    if (key.length !== 1 || key === " " || key === "*") typed.current.text = ""
    if (key === "ArrowDown") focus(visible[at + 1])
    else if (key === "ArrowUp") focus(visible[at - 1])
    else if (key === "Home") focus(visible[0])
    else if (key === "End") focus(visible[visible.length - 1])
    else if (key === "ArrowRight") { if (row.folder) { if (!open.has(row.id)) toggle(row, true); else focus(children.get(row.id)?.[0]) } }
    else if (key === "ArrowLeft") { if (row.folder && open.has(row.id)) toggle(row, false); else focus(visible.find(item => item.id === row.parent)) }
    else if (key === "Enter" || key === " ") { if (row.folder) toggle(row); choose(row) }
    else if (key === "*") {
      const siblings = (children.get(row.parent) ?? []).filter(item => item.folder && !open.has(item.id)).map(item => item.id)
      if (siblings.length) setOpen([...openIds, ...siblings])
    } else if (key.length === 1 && key !== " ") {
      const now = event.timeStamp
      const text = (now - typed.current.at < 500 ? typed.current.text : "") + key.toLowerCase()
      typed.current = { text, at: now }
      const ordered = [...visible.slice(at + (text.length === 1 ? 1 : 0)), ...visible.slice(0, at + (text.length === 1 ? 1 : 0))]
      focus(ordered.find(item => item.node.name.toLowerCase().startsWith(text)))
    } else return
    event.preventDefault()
  }

  function renderLevel(parent: string | null): React.ReactNode {
    return (children.get(parent) ?? []).map(row => {
      const isOpen = row.folder && open.has(row.id)
      const kids = children.get(row.id) ?? []
      return (
        <li
          key={row.id}
          ref={node => { if (node) rowRefs.current.set(row.id, node); else rowRefs.current.delete(row.id) }}
          role="treeitem"
          className="wlkr-file-tree-item"
          aria-label={row.node.name}
          aria-level={row.level}
          aria-setsize={row.size}
          aria-posinset={row.index + 1}
          aria-selected={row.id === current}
          aria-expanded={row.folder ? isOpen : undefined}
          tabIndex={row.id === tabbable?.id ? 0 : -1}
          onFocus={event => { if (event.target === event.currentTarget) setFocusId(row.id) }}
        >
          <div className="wlkr-file-tree-row" style={{ "--wlkr-file-tree-level": row.level - 1 } as React.CSSProperties} title={row.node.name} onClick={() => { if (row.folder) toggle(row); choose(row) }}>
            {Array.from({ length: row.level - 1 }, (_, depth) => <span key={depth} className="wlkr-file-tree-guide" aria-hidden="true" style={{ left: 13 + depth * 16 }} />)}
            {row.folder ? (
              <svg className="wlkr-file-tree-icon wlkr-file-tree-chevron" viewBox="0 0 12 12" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
                <path d="M4 3h2v6H4zM6 5h2v2H6z" />
              </svg>
            ) : (
              <svg className="wlkr-file-tree-icon" viewBox="0 0 12 12" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
                <rect x="2.5" y="1.5" width="7" height="9" fill="none" stroke="currentColor" />
                <rect className="wlkr-file-tree-dot" x="4" y="4" width="4" height="4" />
              </svg>
            )}
            <span className="wlkr-file-tree-name">{row.node.name}</span>
          </div>
          {row.folder && (
            <div className="wlkr-file-tree-group" inert={!isOpen}>
              <div>{kids.length > 0 && <ul role="group" className="wlkr-file-tree-list">{renderLevel(row.id)}</ul>}</div>
            </div>
          )}
        </li>
      )
    })
  }

  return (
    <div {...props} role="tree" aria-label={label} className={cn("wlkr-file-tree", className)} onKeyDown={handleKeyDown}>
      <style>{styles}</style>
      <ul className="wlkr-file-tree-list" role="none">{renderLevel(null)}</ul>
    </div>
  )
}
