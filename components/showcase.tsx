"use client"

import * as React from "react"
import { viewedSection } from "@/lib/gallery-section"
import { showcaseExamples, tokenReference, registryConfig } from "@/lib/code-samples"
import { CodePanel } from "@/components/code-panel"
import { Disclosure } from "@/components/disclosure"
import { Code2 } from "lucide-react"
import { SiteHeader, SiteFooter } from "@/components/site-chrome"
import { ArrowDown, ArrowUpRight, Check, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SoftCombobox } from "@/components/soft-combobox"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CopyCommand } from "@/registry/wlkr/copy-command"
import { AsyncAction } from "@/registry/wlkr/async-action"
import { FilterList } from "@/registry/wlkr/filter-list"
import { PixelPlayground } from "@/components/pixel-playground"
import { LoaderPlayground } from "@/components/loader-playground"
import { PageIntro } from "@/registry/wlkr/page-intro"
import { IndexRow } from "@/registry/wlkr/index-row"
import { TextLink } from "@/registry/wlkr/text-link"
import { ThemeToggle } from "@/registry/wlkr/theme-toggle"
import { GithubStar } from "@/registry/wlkr/github-star"
import { FooterControls } from "@/registry/wlkr/footer-controls"

const entries = [
  { id: "github-star", name: "GitHub star", description: "A small invitation to the source. Rolling digits, a green star, and one well-timed burst.", keywords: "github repository stars count up rolling number burst sparkles" },
  { id: "copy-command", name: "Copy command", description: "One command. One click. Clear feedback when it works, a useful fallback when it doesn’t.", keywords: "clipboard install terminal copy" },
  { id: "async-action", name: "Async action", description: "An action that follows through. Pending, success, and a second chance when something goes wrong.", keywords: "button save loading promise error retry" },
  { id: "filter-list", name: "Filter list", description: "Find the thing you came for. A small, accessible search for lists that don’t need a whole search engine.", keywords: "search input empty list filter" },
  { id: "pixel-object", name: "Pixel object", description: "Give a shape a little life. Project a point cloud or a simple mask into a quiet field of pixels.", keywords: "sphere disco rotating motion flicker grid shape object mask pixels" },
  { id: "wlkr-loader", name: "WLKR loader", description: "A liquid Open Lens mark that loops while loading and bounces on hover.", keywords: "loading logo loader symbol arc rotation motion liquid goo hover bounce" },
  { id: "page-intro", name: "Page intro", description: "A clear beginning. Final text holds its place while a quiet binary field resolves into the title.", keywords: "heading title binary reveal typography header intro" },
  { id: "index-row", name: "Index row", description: "An index with a little movement. Three digits roll on hover or focus, then settle where they belong.", keywords: "index list row number counting spin link navigation" },
  { id: "text-link", name: "Text link", description: "A link that stays a link. Add an optional preview when a little context helps someone choose.", keywords: "link hover card preview focus navigation" },
  { id: "theme-toggle", name: "Theme toggle", description: "Light or dark, with one quiet control. System preferences lead until you choose otherwise.", keywords: "theme toggle dark light system preference" },
  { id: "footer-controls", name: "Footer controls", description: "A quiet place for display preferences. Follow the system, choose light or dark, or read the page as plain text.", keywords: "footer display controls theme system light dark agent markdown" },
  { id: "typography", name: "Typography", description: "The same type, scale, and spacing you see here. Opt-in styles for a shared visual language.", keywords: "typography layout styles font geist display spacing" },
  { id: "primitives", name: "Primitives", description: "Good foundations, straight from shadcn/ui. We use the originals, with WLKR’s shared design tokens.", keywords: "button input switch shadcn stock" },
  { id: "foundations", name: "Foundations", description: "A common language for what comes next. Semantic color, considered type, and space to think.", keywords: "theme tokens color typography design dark light" },
]
const projects = [
  { id: "studio", label: "Brand Studio", description: "The source of truth for a considered identity.", keywords: ["design", "assets"] },
  { id: "weather", label: "WeatherGoblin", description: "A little character in your daily forecast.", keywords: ["weather", "app"] },
  { id: "bible", label: "PatriBible", description: "Scripture, thoughtfully within reach.", keywords: ["reader", "search"] },
]


function Demo({ id }: { id: string }) {
  const [starExample, setStarExample] = React.useState("4530")
  const [failure, setFailure] = React.useState(false)
  const [notifications, setNotifications] = React.useState(true)
  const [continued, setContinued] = React.useState(false)
  if (id === "github-star") return <div className="flex flex-col items-start gap-5"><GithubStar repository="shadcn-ui/ui" count={starExample === "unknown" ? null : Number(starExample)} /><label className="flex items-center gap-3 text-xs text-muted-foreground">Example count<SoftCombobox label="GitHub star example count" value={starExample} onChange={setStarExample} options={[{value:"4530",label:"4,530"},{value:"0",label:"Zero"},{value:"123456789",label:"123,456,789"},{value:"unknown",label:"Unavailable"}]}/></label><p className="text-xs text-muted-foreground">Example data, not live GitHub stars. Hover or focus the link to replay.</p></div>
  if (id === "copy-command") return <CopyCommand command="pnpm dlx shadcn@latest add @wlkr/copy-command" />
  if (id === "async-action") return <div><div className="demo-actions"><AsyncAction action={async () => { await new Promise(resolve => setTimeout(resolve, 1100)); if (failure) throw new Error("Demo failure") }} pendingLabel="Saving changes…" successLabel="Changes saved" errorLabel="Changes weren’t saved. Turn off the error simulation and try again.">Save changes</AsyncAction></div><label className="demo-option"><Switch checked={failure} onCheckedChange={setFailure} aria-label="Simulate a failed save" />Simulate a failed save</label></div>
  if (id === "page-intro") return <PageIntro as="h2" title={"Less.\nBetter."} description="A clear starting point. Nothing to move out of the way." />
  if (id === "index-row") return <div><IndexRow number={7} title="Brand Studio" description="Considered tools for a clear identity." href="https://wlkr.si" target="_blank" rel="noreferrer">In progress</IndexRow><IndexRow number={42} title="WeatherGoblin" href="https://wlkr.si" target="_blank" rel="noreferrer">In development</IndexRow></div>
  if (id === "text-link") return <p className="text-base leading-relaxed">Take a look around <TextLink href="https://wlkr.si" preview={{title:"WLKR.SI",description:"A small studio building useful things, with care for the details."}}>WLKR.SI</TextLink>, or <TextLink href="#installation">bring a component home</TextLink>.</p>
  if (id === "theme-toggle") return <ThemeToggle showLabel />
  if (id === "footer-controls") return <FooterControls agentHref="/llms.txt" />
  if (id === "typography") return <div className="wlkr-typography wlkr-stack"><p className="wlkr-display">Aa.</p><p className="wlkr-intro-copy">Geist. One scale. Room to breathe.</p><p className="wlkr-caption">Opt-in styles, with the same exact gallery values.</p></div>
  if (id === "filter-list") return <FilterList items={projects} label="Search projects" placeholder="Search projects…" />
  return <div className="flex flex-col gap-7"><div className="demo-actions"><Button variant="ghost" onClick={() => setContinued(!continued)}>{continued ? <Check data-icon="inline-start" /> : <ArrowUpRight data-icon="inline-start" />}{continued ? "You’re all set" : "Continue"}</Button><label className="flex min-h-11 items-center gap-3 text-sm"><Switch checked={notifications} onCheckedChange={setNotifications} />Notifications {notifications ? "on" : "off"}</label></div><div className="terminal-field"><label htmlFor="demo-name" className="sr-only">Your name</label><Input id="demo-name" placeholder="Your name" autoComplete="name" /></div></div>
}

export function Showcase({ sources, highlights = {} }: { sources: Record<string, string>; highlights?: Record<string, string> }) {
  const [query, setQuery] = React.useState("")
  const searchRef = React.useRef<HTMLInputElement>(null)
  const [currentSection, setCurrentSection] = React.useState<string | null>(null)
  React.useEffect(() => {
    const keydown = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key === "k") { event.preventDefault(); searchRef.current?.focus(); searchRef.current?.scrollIntoView({ block: "center" }) } }
    window.addEventListener("keydown", keydown)
    return () => window.removeEventListener("keydown", keydown)
  }, [])
  const filtered = React.useMemo(() => entries.filter(entry => `${entry.name} ${entry.description} ${entry.keywords}`.toLowerCase().includes(query.toLowerCase().trim())), [query])
  React.useEffect(() => {
    const sections = filtered.map(entry => document.getElementById(entry.id)).filter((section): section is HTMLElement => section !== null)
    let frame = 0, disposed = false
    const measure = () => {
      frame = 0
      if (disposed) return
      // Match the native anchor landing position, including the existing CSS insets.
      const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
      const margin = sections[0] ? parseFloat(getComputedStyle(sections[0]).scrollMarginTop) || 0 : 0
      const bounds = sections.map(section => { const rect = section.getBoundingClientRect(); return { id: section.id, top: rect.top, bottom: rect.bottom } })
      const current = viewedSection(bounds, window.innerHeight, padding + margin + 1)
      setCurrentSection(previous => previous === current ? previous : current)
    }
    const schedule = () => { if (!disposed && !frame) frame = requestAnimationFrame(measure) }
    const observer = new ResizeObserver(schedule)
    sections.forEach(section => observer.observe(section))
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    window.addEventListener("hashchange", schedule)
    schedule()
    return () => {
      disposed = true
      observer.disconnect()
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
      window.removeEventListener("hashchange", schedule)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [filtered])
  return <div className="site shell">
    <a href="#collection" className="sr-only focus:not-sr-only">Skip to components</a>
    <SiteHeader />
    <main>
      <div className="hero"><h1>Interfaces,<br />reduced.</h1><div className="hero-note"><a href="#collection">Explore the collection <ArrowDown aria-hidden="true" /></a></div></div>
      <div className="workbench" id="collection">
        <aside className="index" aria-label="Component index"><p className="index-label">The collection</p><div className="search-row"><Search aria-hidden="true" /><label className="sr-only" htmlFor="component-search">Search components</label><input ref={searchRef} id="component-search" type="search" placeholder="Search components…" value={query} onChange={event => setQuery(event.target.value)} />{query && <button className="icon-button" aria-label="Clear component search" onClick={() => { setQuery(""); searchRef.current?.focus() }}><X /></button>}</div><nav className="index-links" aria-label="Components">{filtered.map(entry => <a className={entry.id === currentSection ? "active" : ""} aria-current={entry.id === currentSection ? "location" : undefined} key={entry.id} href={`#${entry.id}`}>{entry.name}</a>)}</nav><p className="index-foot" role="status">{query ? `${filtered.length} matching sections` : ""}</p></aside>
        <div className="min-w-0">{filtered.length === 0 && <div className="component-section"><h2 className="text-2xl tracking-tight">Nothing here by that name.</h2><p className="mt-3 text-sm text-muted-foreground">Try “copy”, “search”, or “theme”.</p><Button variant="ghost" onClick={() => setQuery("")}>Clear search</Button></div>}
        {filtered.map(entry => <section className="component-section" id={entry.id} key={entry.id} aria-labelledby={`${entry.id}-title`}><div className="component-heading"><div><h2 id={`${entry.id}-title`}>{entry.name}</h2><p>{entry.description}</p></div><span className="component-origin">{entry.id === "primitives" ? "shadcn/ui" : entry.id === "foundations" ? "WLKR system" : "WLKR original"}</span></div>
        {entry.id === "foundations" ? <div className="foundation"><div className="swatches">{[["Canvas", "var(--background)"], ["Ink", "var(--foreground)"], ["Quiet", "var(--muted-foreground)"], ["WLKR green", "var(--brand)"]].map(([name, color]) => <div className="swatch" key={name}><i style={{background:color}} /><span>{name}</span></div>)}</div><h3>Meaning before appearance.</h3><p>Canvas, foreground, muted, and accent describe a purpose. Their values change with the light. Green marks a useful moment; it never has to carry the message alone.</p><h3 className="mt-8">One typeface. Room to breathe.</h3><p>Geist. A compact scale. Tight display typography and comfortable reading lengths. Focus stays visible. Motion follows interaction and respects reduced-motion preferences.</p><div className="install-line mt-5"><CopyCommand command="pnpm dlx shadcn@latest add @wlkr/theme" /></div><Disclosure title="Token reference" icon={Code2}><CodePanel code={tokenReference} filename="tokens.txt" language="text" /></Disclosure></div> : <>
        {entry.id === "pixel-object" ? <PixelPlayground /> : entry.id === "wlkr-loader" ? <LoaderPlayground /> : <Tabs defaultValue="preview" className="docs-tabs mt-6"><TabsList aria-label={`${entry.name} view`}><TabsTrigger value="preview">Preview</TabsTrigger><TabsTrigger value="usage">Usage</TabsTrigger></TabsList><TabsContent value="preview"><div className="preview"><div className="preview-content"><Demo id={entry.id} /></div></div></TabsContent><TabsContent value="usage"><div className="mt-6"><CodePanel code={showcaseExamples[entry.id]} highlightedCode={highlights[`example:${entry.id}`]} filename={entry.id === "typography" ? "foundations.tsx" : `${entry.id}-example.tsx`} language="tsx" /></div></TabsContent></Tabs>}
        <div className="install-line"><CopyCommand command={entry.id === "primitives" ? "pnpm dlx shadcn@latest add button input switch" : `pnpm dlx shadcn@latest add @wlkr/${entry.id}`} /></div>
        {entry.id === "typography" && <p className="mt-3 text-xs text-muted-foreground">Import the stylesheet from the path printed by the CLI (usually src/styles/wlkr-typography.css). The font stays owned by your app.</p>}
        {sources[entry.id] ? <Disclosure title="View source" icon={Code2}><CodePanel code={sources[entry.id]} highlightedCode={highlights[`source:${entry.id}`]} filename={`${entry.id}.${entry.id === "typography" ? "css" : "tsx"}`} language={entry.id === "typography" ? "css" : "tsx"} /><a className="text-link mt-4 inline-block text-xs text-muted-foreground" href={`/r/${entry.id}.json`}>Registry JSON</a></Disclosure> : <p className="mt-4 text-xs text-muted-foreground">Installed directly from <a className="text-link" href="https://ui.shadcn.com/docs/components">shadcn/ui</a>. Upstream source is unchanged.</p>}
        </>}
        </section>)}
        <section className="get-started" id="installation" aria-labelledby="installation-title"><h2 id="installation-title">Make it yours.</h2><p>Copy the source into your project with the shadcn CLI. Keep what you need. Change what you like. No component runtime to subscribe to.</p><h3>1. Start with shadcn</h3><CopyCommand command="pnpm dlx shadcn@latest init" /><p>Use an existing React, TypeScript, and Tailwind project. Already configured? Continue below.</p><h3>2. Add the namespace</h3><p>Merge this entry into the registries field of your project’s components.json.</p><CodePanel code={registryConfig} highlightedCode={highlights.registryConfig} filename="components.json" language="json" /><h3>3. Bring a component home</h3><CopyCommand command="pnpm dlx shadcn@latest add @wlkr/copy-command" /><p>Originals install to components/wlkr. Their stock primitives come directly from shadcn. The optional theme adds light and dark color tokens.</p><h3>Using it with Astro</h3><p>The website uses Astro. Adopt these components with the official @astrojs/react integration and compatible Tailwind/shadcn setup. Import these React components into an Astro page with a client:load directive for interactive islands. Review generated source and token conflicts in the website checkout before publishing.</p><p className="mt-6">Source on <a className="text-link" href="https://github.com/wlkr-si/ui">GitHub</a>. Built with <a className="text-link" href="https://ui.shadcn.com">shadcn/ui</a>, <a className="text-link" href="https://www.radix-ui.com">Radix</a>, <a className="text-link" href="https://lucide.dev">Lucide</a>, and <a className="text-link" href="https://vercel.com/font">Geist</a>. Based on the official <a className="text-link" href="https://github.com/shadcn-ui/registry-template">registry starter</a>. WLKR originals are MIT licensed.</p></section>
        </div>
      </div>
    </main>
    <SiteFooter />
  </div>
}
