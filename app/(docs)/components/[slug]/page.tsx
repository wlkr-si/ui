import { readFile } from "node:fs/promises"
import * as React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { getCatalog, installTarget, latestVersion, REPOSITORY, SITE } from "@/lib/catalog"
import { demos } from "@/lib/catalog-demos"
import { examples } from "@/lib/catalog-examples"
import { categories } from "@/lib/component-meta"
import { highlightCode } from "@/lib/highlight-code"
import { CodePanel } from "@/components/code-panel"
import { SourcePanel } from "@/components/docs/source-panel"
import { InstallCommand } from "@/components/docs/install-command"
import { Preview } from "@/components/docs/preview"
import { ScrollSpy } from "@/registry/wlkr/scroll-spy"

type Props = { params: Promise<{ slug: string }> }

/** Shows a repo file the way it reads once installed: registry imports point at the installed components. */
async function exampleSource(path: string) {
  const code = (await readFile(`${process.cwd()}/${path}`, "utf8")).replaceAll("@/registry/wlkr/", "@/components/wlkr/").trimEnd()
  return { code, markup: await highlightCode(code, "tsx") }
}

/** Union types wrap between options, never inside one. */
function typeLabel(type: string) {
  const parts = type.split(" | ")
  return parts.map((part, index) => <React.Fragment key={index}><span className="doc-type-part">{part}{index < parts.length - 1 && " |"}</span>{index < parts.length - 1 && " "}</React.Fragment>)
}

/** Catalog prose may mark code with backticks. */
function rich(text: string) {
  return text.split("`").map((part, index) => index % 2 ? <code key={index}>{part}</code> : part)
}

export const dynamicParams = false

export async function generateStaticParams() {
  return (await getCatalog()).map(entry => ({ slug: entry.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const entry = (await getCatalog()).find(item => item.slug === slug)
  if (!entry) return {}
  const url = `${SITE}/components/${slug}`
  const image = { url: `/og/${slug}.png`, width: 1200, height: 630, type: "image/png", alt: `${entry.name}, a wlkr/ui component` }
  return {
    title: entry.name,
    description: entry.summary,
    keywords: entry.keywords,
    alternates: { canonical: url },
    openGraph: { type: "article", url, siteName: "wlkr/ui", title: `${entry.name} — wlkr/ui`, description: entry.summary, images: [image] },
    twitter: { card: "summary_large_image", title: `${entry.name} — wlkr/ui`, description: entry.summary, images: [image] },
  }
}

export default async function ComponentPage({ params }: Props) {
  const { slug } = await params
  const catalog = await getCatalog()
  const index = catalog.findIndex(item => item.slug === slug)
  if (index < 0) notFound()
  const entry = catalog[index]
  const previous = catalog[index - 1], next = catalog[index + 1]
  const category = categories.find(item => item.id === entry.category)
  const sourcePath = entry.source === null ? null : entry.source ?? `registry/wlkr/${slug}.tsx`
  const language = sourcePath?.endsWith(".css") ? "css" : "tsx"
  const source = sourcePath ? await readFile(`${process.cwd()}/${sourcePath}`, "utf8") : null
  const [usageMarkup, sourceMarkup, fresh] = await Promise.all([highlightCode(entry.usage, "tsx"), source ? highlightCode(source, language) : null, latestVersion()])
  const Demo = demos[slug]
  const hero = await exampleSource(`components/demos/${slug}-demo.tsx`)
  const exampleList = await Promise.all((entry.examples ?? []).map(async example => ({ ...example, Component: examples[slug][example.id], ...(await exampleSource(`components/examples/${slug}/${example.id}.tsx`)) })))
  const target = installTarget(entry)
  const related = (entry.related ?? []).map(name => catalog.find(item => item.slug === name)).filter(item => item !== undefined)
  const sections = [
    { id: "installation", label: "Installation" },
    { id: "usage", label: "Usage" },
    ...(exampleList.length ? [{ id: "examples", label: "Examples" }] : []),
    ...(entry.api.some(table => table.props.length) ? [{ id: "api", label: "API" }] : []),
    ...(entry.notes.length ? [{ id: "behaviour", label: "Behaviour" }] : []),
    ...(source ? [{ id: "source", label: "Source" }] : []),
  ]

  return <div className="doc">
    <article className="doc-article">
      <header className="doc-head">
        <div className="doc-head-row">
          <p className="doc-eyebrow"><Link href={`/components#${entry.category}`} prefetch={false}>{category?.name}</Link>{entry.origin && <span>{entry.origin}</span>}{entry.since === fresh && <span className="docs-new">New</span>}</p>
          <nav className="doc-head-pager" aria-label="Previous and next component">
            {previous ? <Link href={`/components/${previous.slug}`} prefetch={false} aria-label={`Previous: ${previous.name}`}><ArrowLeft aria-hidden="true" /></Link> : <span />}
            {next ? <Link href={`/components/${next.slug}`} prefetch={false} aria-label={`Next: ${next.name}`}><ArrowRight aria-hidden="true" /></Link> : <span />}
          </nav>
        </div>
        <h1>{entry.name}</h1>
        <p className="doc-lede">{entry.description}</p>
      </header>

      <div className="doc-hero"><Preview variant={entry.stage} label={entry.name} code={hero.code} highlightedCode={hero.markup}><Demo /></Preview></div>

      <section id="installation" aria-labelledby="installation-title">
        <h2 id="installation-title">Installation</h2>
        <InstallCommand target={target} />
      </section>

      <section id="usage" aria-labelledby="usage-title">
        <h2 id="usage-title">Usage</h2>
        <CodePanel code={entry.usage} highlightedCode={usageMarkup} filename={`${slug}-example.tsx`} language="tsx" />
      </section>

      {exampleList.length > 0 && <section id="examples" aria-labelledby="examples-title">
        <h2 id="examples-title">Examples</h2>
        {exampleList.map(({ id, title, description, stage, Component, code, markup }) => <div key={id} id={`example-${id}`} className="doc-example">
          <h3>{title}</h3>
          <p>{rich(description)}</p>
          <Preview fit variant={stage} label={`${entry.name}: ${title}`} code={code} highlightedCode={markup}><Component /></Preview>
        </div>)}
      </section>}

      {sections.some(section => section.id === "api") && <section id="api" aria-labelledby="api-title">
        <h2 id="api-title">API</h2>
        {entry.api.map((table, tableIndex) => <div key={tableIndex} className="doc-api">
          {table.title && <h3>{table.title}</h3>}
          <div className="doc-table" role="region" aria-label={`${table.title ?? entry.name} reference`} tabIndex={0}>
            <table>
              <thead><tr><th scope="col">{table.columns?.name ?? "Prop"}</th><th scope="col">{table.columns?.type ?? "Type"}</th>{table.props.some(prop => prop.default) && <th scope="col">Default</th>}<th scope="col">Description</th></tr></thead>
              <tbody>{table.props.map(prop => <tr key={prop.name}>
                <th scope="row"><code>{prop.name}</code></th>
                <td><code>{typeLabel(prop.type)}</code></td>
                {table.props.some(row => row.default) && <td>{prop.default && <code>{prop.default}</code>}</td>}
                <td>{rich(prop.description)}</td>
              </tr>)}</tbody>
            </table>
          </div>
        </div>)}
      </section>}

      {entry.notes.length > 0 && <section id="behaviour" aria-labelledby="behaviour-title">
        <h2 id="behaviour-title">Behaviour</h2>
        <ul className="doc-notes">{entry.notes.map((note, noteIndex) => <li key={noteIndex}>{rich(note)}</li>)}</ul>
      </section>}

      {source && sourcePath && <section id="source" aria-labelledby="source-title">
        <h2 id="source-title">Source</h2>
        <SourcePanel code={source} highlightedCode={sourceMarkup ?? undefined} filename={sourcePath.split("/").at(-1)} language={language} />
        <p className="doc-links">{target.startsWith(SITE) && <a className="text-link" href={target.slice(SITE.length)}>Registry JSON</a>}<a className="text-link" href={`${REPOSITORY}/blob/main/${sourcePath}`}>GitHub</a></p>
      </section>}

      {related.length > 0 && <section aria-labelledby="related-title">
        <h2 id="related-title">Related</h2>
        <ul className="doc-related">{related.map(item => <li key={item.slug}><Link href={`/components/${item.slug}`} prefetch={false}><span>{item.name}</span><span>{item.description}</span></Link></li>)}</ul>
      </section>}

      <nav className="doc-pager" aria-label="More components">
        {previous ? <Link href={`/components/${previous.slug}`} prefetch={false} rel="prev"><ArrowLeft aria-hidden="true" /><span>{previous.name}</span></Link> : <span />}
        {next ? <Link href={`/components/${next.slug}`} prefetch={false} rel="next"><span>{next.name}</span><ArrowRight aria-hidden="true" /></Link> : <span />}
      </nav>
    </article>
    <aside className="doc-toc">
      <ScrollSpy items={sections} label="On this page" offset={48} />
    </aside>
  </div>
}
