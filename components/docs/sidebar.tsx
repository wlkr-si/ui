"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ChevronDown, Search, X } from "lucide-react"
import { Shortcut } from "@/registry/wlkr/shortcut"

export type SidebarGroup = { id: string; name: string; items: { slug: string; name: string; search: string; fresh: boolean }[] }

const pages = [
  { href: "/", label: "Introduction" },
  { href: "/installation", label: "Installation" },
  { href: "/system", label: "System" },
  { href: "/components", label: "All components" },
]

/** The catalog, grouped. Filters as you type; Enter opens the first match. */
export function DocsSidebar({ groups, total }: { groups: SidebarGroup[]; total: number }) {
  const pathname = usePathname()
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [closed, setClosed] = React.useState<string[]>([])
  const [open, setOpen] = React.useState(false)
  const input = React.useRef<HTMLInputElement>(null)
  const nav = React.useRef<HTMLElement>(null)
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean)
  const visible = groups.map(group => ({ ...group, items: words.length ? group.items.filter(item => words.every(word => item.search.includes(word))) : group.items })).filter(group => group.items.length > 0)
  const matches = visible.reduce((count, group) => count + group.items.length, 0)
  const first = visible[0]?.items[0]

  React.useEffect(() => {
    nav.current?.querySelector("[aria-current=page]")?.scrollIntoView({ block: "nearest" })
  }, [pathname])

  const focusSearch = () => { setOpen(true); requestAnimationFrame(() => { input.current?.focus(); input.current?.select() }) }
  const leave = () => { setOpen(false); setQuery("") }

  return <aside className="docs-sidebar" data-open={open}>
    <button type="button" className="docs-sidebar-toggle" aria-expanded={open} aria-controls="docs-nav" onClick={() => setOpen(value => !value)}>
      Browse components<span className="docs-count">{total}</span><ChevronDown aria-hidden="true" />
    </button>
    <div className="docs-sidebar-body" id="docs-nav">
      <form className="search-row" role="search" onSubmit={event => { event.preventDefault(); if (words.length && first) { router.push(`/components/${first.slug}`); leave() } }}>
        <Search aria-hidden="true" />
        <label className="sr-only" htmlFor="component-search">Filter components</label>
        <input ref={input} id="component-search" type="search" placeholder="Filter components…" autoComplete="off" value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === "Escape" && query) { event.preventDefault(); setQuery("") } }} />
        <Shortcut className="search-hint" keys="mod+k" size="sm" hidden={query !== ""} onTrigger={focusSearch} />
        {query && <button type="button" className="icon-button" aria-label="Clear filter" onClick={() => { setQuery(""); input.current?.focus() }}><X /></button>}
      </form>
      <nav ref={nav} className="docs-nav" aria-label="Components">
        {!words.length && <ul className="docs-nav-pages">
          {pages.map(page => <li key={page.href}><Link href={page.href} prefetch={false} aria-current={pathname === page.href ? "page" : undefined} onClick={leave}>{page.label}{page.href === "/components" && <span className="docs-count">{total}</span>}</Link></li>)}
        </ul>}
        {visible.map(group => {
          const collapsed = !words.length && closed.includes(group.id)
          return <section key={group.id} className="docs-nav-group">
            <h2><button type="button" aria-expanded={!collapsed} onClick={() => setClosed(current => current.includes(group.id) ? current.filter(id => id !== group.id) : [...current, group.id])}>{group.name}<span className="docs-count">{group.items.length}</span></button></h2>
            {!collapsed && <ul>
              {group.items.map(item => <li key={item.slug}><Link href={`/components/${item.slug}`} prefetch={false} aria-current={pathname === `/components/${item.slug}` ? "page" : undefined} onClick={leave}>{item.name}{item.fresh && <span className="docs-new">New</span>}</Link></li>)}
            </ul>}
          </section>
        })}
        {words.length > 0 && matches === 0 && <p className="docs-nav-empty">Nothing by that name.</p>}
      </nav>
      <p className="sr-only" role="status">{words.length ? `${matches} matching ${matches === 1 ? "component" : "components"}` : ""}</p>
    </div>
  </aside>
}
