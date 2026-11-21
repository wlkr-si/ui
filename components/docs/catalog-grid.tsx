import Link from "next/link"
import type { CatalogGroup } from "@/lib/catalog"
import { DecodeText } from "@/registry/wlkr/decode-text"

/** Every component, grouped, as plain links. Names decode on hover. */
export function CatalogGrid({ groups, fresh }: { groups: CatalogGroup[]; fresh: string }) {
  return <div className="catalog">
    {groups.map(group => <section key={group.id} id={group.id} className="catalog-group" aria-labelledby={`${group.id}-heading`}>
      <h2 id={`${group.id}-heading`}>{group.name}<span className="docs-count">{group.items.length}</span></h2>
      <ul className="catalog-grid">
        {group.items.map(entry => <li key={entry.slug}>
          <Link href={`/components/${entry.slug}`} prefetch={false} className="catalog-card">
            <span className="catalog-name"><DecodeText trigger="hover" duration={420} text={entry.name} />{entry.since === fresh && <span className="docs-new">New</span>}</span>
            <span className="catalog-copy">{entry.description}</span>
          </Link>
        </li>)}
      </ul>
    </section>)}
  </div>
}
