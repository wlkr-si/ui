"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type CrumbItem = { label: string; href?: string }

export type CrumbLinkProps = { href: string; className: string; children: React.ReactNode }

export type CrumbsProps = Omit<React.ComponentPropsWithoutRef<"nav">, "children"> & {
  items: CrumbItem[]
  /** Most items shown before the middle collapses into `…`. Minimum 2. */
  max?: number
  separator?: React.ReactNode
  /** Blinking block caret after the current page. */
  caret?: boolean
  /** Render a router link instead of a plain anchor. */
  renderLink?: (item: CrumbItem, props: CrumbLinkProps) => React.ReactNode
}

const styles = `
.wlkr-crumbs{font-family:var(--font-mono,ui-monospace,monospace);font-size:.875rem;line-height:1.5;color:var(--muted-foreground,#6b6b6b);max-width:100%}
.wlkr-crumbs-list{display:flex;flex-wrap:wrap;align-items:baseline;gap:0 .5em;margin:0;padding:0;list-style:none;min-width:0}
.wlkr-crumbs-item{display:inline-flex;align-items:baseline;gap:.5em;min-width:0;overflow-wrap:anywhere}
.wlkr-crumbs-sep{color:var(--muted-foreground,#6b6b6b);opacity:.6;user-select:none}
.wlkr-crumbs-link{position:relative;color:inherit;text-decoration:none;border-radius:0;outline:none}
.wlkr-crumbs-link::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:1px;background:var(--foreground,currentColor);transform:scaleX(0);transform-origin:0 50%;transition:transform 240ms steps(6,end)}
.wlkr-crumbs-link:hover{color:var(--foreground,currentColor)}
.wlkr-crumbs-link:hover::after,.wlkr-crumbs-link:focus-visible::after{transform:scaleX(1)}
.wlkr-crumbs-link:focus-visible,.wlkr-crumbs-more:focus-visible{outline:2px solid var(--brand,#33f282);outline-offset:2px}
.wlkr-crumbs-text{color:inherit}
.wlkr-crumbs-current{display:inline-flex;align-items:baseline;color:var(--foreground,currentColor)}
.wlkr-crumbs-caret{display:inline-block;flex:none;width:.6em;height:1.05em;margin-left:.15em;align-self:center;background:var(--brand,#33f282)}
.wlkr-crumbs-more{font:inherit;color:inherit;background:none;border:0;border-radius:0;padding:0 .15em;cursor:pointer;line-height:inherit}
.wlkr-crumbs-more:hover{color:var(--foreground,currentColor);background:color-mix(in srgb,var(--foreground,currentColor) 8%,transparent)}
@keyframes wlkr-crumbs-blink{0%,49.9%{opacity:1}50%,100%{opacity:0}}
@keyframes wlkr-crumbs-in{0%{opacity:0}100%{opacity:1}}
@media(prefers-reduced-motion:no-preference){
.wlkr-crumbs-caret{animation:wlkr-crumbs-blink 1.06s steps(1,end) infinite}
.wlkr-crumbs-item[data-revealed]{animation:wlkr-crumbs-in 200ms steps(4,end) both}
}
@media(prefers-reduced-motion:reduce){
.wlkr-crumbs-link::after{transition:none}
}
`

/** A file-path breadcrumb. Earlier segments link back; the current page carries a block caret. */
export function Crumbs({ items, max = 4, separator = "/", caret = true, renderLink, className, "aria-label": ariaLabel = "Breadcrumb", ...props }: CrumbsProps) {
  const [expanded, setExpanded] = React.useState(false)
  const listRef = React.useRef<HTMLOListElement>(null)
  const frame = React.useRef<number | null>(null)
  const id = React.useId()

  React.useEffect(() => () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current)
  }, [])

  const limit = Math.max(2, Math.floor(max))
  const collapsible = items.length > limit
  const collapsed = collapsible && !expanded
  const tail = limit - 1
  const hiddenEnd = items.length - tail

  const expand = () => {
    setExpanded(true)
    frame.current = requestAnimationFrame(() => {
      frame.current = null
      const list = listRef.current
      const first = list?.querySelector<HTMLElement>("[data-revealed] a, [data-revealed] button") ?? list?.querySelector<HTMLElement>("a, button")
      first?.focus()
    })
  }

  const renderItem = (item: CrumbItem, index: number, revealed: boolean) => {
    const last = index === items.length - 1
    const linkProps: CrumbLinkProps | null = !last && item.href ? { href: item.href, className: "wlkr-crumbs-link", children: item.label } : null
    return (
      <li key={`${id}-${index}`} className="wlkr-crumbs-item" data-index={index} data-revealed={revealed || undefined}>
        {index > 0 && <span className="wlkr-crumbs-sep" aria-hidden="true">{separator}</span>}
        {last ? (
          <span className="wlkr-crumbs-current" aria-current="page">
            {item.label}
            {caret && <span className="wlkr-crumbs-caret" aria-hidden="true" />}
          </span>
        ) : linkProps ? (
          renderLink ? renderLink(item, linkProps) : <a href={linkProps.href} className={linkProps.className}>{linkProps.children}</a>
        ) : (
          <span className="wlkr-crumbs-text">{item.label}</span>
        )}
      </li>
    )
  }

  const hiddenCount = hiddenEnd - 1

  return (
    <nav {...props} aria-label={ariaLabel} className={cn("wlkr-crumbs", className)}>
      <style>{styles}</style>
      <ol ref={listRef} className="wlkr-crumbs-list">
        {collapsed ? (
          <>
            {renderItem(items[0], 0, false)}
            <li className="wlkr-crumbs-item">
              <span className="wlkr-crumbs-sep" aria-hidden="true">{separator}</span>
              <button
                type="button"
                className="wlkr-crumbs-more"
                aria-expanded={false}
                aria-label={`Show ${hiddenCount} more ${hiddenCount === 1 ? "level" : "levels"}`}
                onClick={expand}
              >
                …
              </button>
            </li>
            {items.slice(hiddenEnd).map((item, i) => renderItem(item, hiddenEnd + i, false))}
          </>
        ) : (
          items.map((item, i) => renderItem(item, i, expanded && i > 0 && i < hiddenEnd))
        )}
      </ol>
    </nav>
  )
}
