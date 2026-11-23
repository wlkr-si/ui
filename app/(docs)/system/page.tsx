import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { SITE, getCatalog } from "@/lib/catalog"
import { colour, control, elevation, motion, radius, ramps, space, type, type Token } from "@/lib/tokens"
import { boards } from "@/lib/system-boards"
import { ScrollSpy } from "@/registry/wlkr/scroll-spy"

const description = "The WLKR design system: colour, type, space, radius, elevation, motion and the shared control scale, rendered from the tokens every component uses."
export const metadata: Metadata = {
  title: "System",
  description,
  alternates: { canonical: `${SITE}/system` },
  openGraph: { type: "article", url: `${SITE}/system`, siteName: "wlkr/ui", title: "System — wlkr/ui", description, images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "wlkr/ui component gallery" }] },
}

const sections = [
  { id: "palette", label: "Palette" },
  { id: "colour", label: "Colour roles" },
  { id: "type", label: "Type" },
  { id: "space", label: "Space" },
  { id: "radius", label: "Radius" },
  { id: "elevation", label: "Elevation" },
  { id: "motion", label: "Motion" },
  { id: "controls", label: "Controls" },
  { id: "coverage", label: "Coverage" },
]

const v = (name: string) => `var(--wlkr-${name})`
const valueOf = (token: Token, mode: "light" | "dark") => typeof token.value === "string" ? token.value : token.value[mode]
const short = (value: string) => value.replace(/var\(--wlkr-([a-z0-9-]+)\)/g, "$1").replace(/color-mix\(in srgb, (\S+) (\d+)%, transparent\)/, "$1 at $2%")
const sizes = ["xs", "sm", "md", "lg"] as const

/** The same content in a forced light and a forced dark panel, so both themes are always reviewed together. */
function Both({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className="sys-both">
    <div className={`wlkr-light sys-panel ${className ?? ""}`}><span className="sys-panel-label">Light</span>{children}</div>
    <div className={`wlkr-dark sys-panel ${className ?? ""}`}><span className="sys-panel-label">Dark</span>{children}</div>
  </div>
}

function Rows({ tokens, render }: { tokens: Token[]; render: (token: Token) => React.ReactNode }) {
  return <div className="sys-rows">{tokens.map(token => <div key={token.name} className="sys-row">
    <div className="sys-row-name"><code>{token.name}</code>{token.role && <span>{token.role}</span>}</div>
    <div className="sys-row-sample">{render(token)}</div>
    <code className="sys-row-value">{short(valueOf(token, "light"))}</code>
  </div>)}</div>
}

export default async function SystemPage() {
  const catalog = await getCatalog()
  const basics = catalog.filter(entry => entry.category === "basics")
  const onSystem = catalog.filter(entry => entry.system)

  return <div className="doc">
    <article className="doc-article sys">
      <header className="doc-head">
        <p className="doc-eyebrow"><span>Foundations</span></p>
        <h1>System</h1>
        <p className="doc-lede">Every value a component may use. This page is drawn from the same tokens the components read, so it always shows the system as it really is.</p>
      </header>

      <section id="palette" aria-labelledby="palette-title">
        <h2 id="palette-title">Palette</h2>
        <p className="sys-note">Raw colours with no meaning. Components never use these directly; they use the roles below.</p>
        {ramps.map(ramp => <div key={ramp.name} className="sys-ramp">
          <h3>{ramp.name}</h3>
          <div className="sys-ramp-steps">{ramp.steps.map(([step, hex]) => <div key={step} className="sys-swatch">
            <span style={{ background: hex }} />
            <code>{step}</code>
            <code>{hex}</code>
          </div>)}</div>
        </div>)}
      </section>

      <section id="colour" aria-labelledby="colour-title">
        <h2 id="colour-title">Colour roles</h2>
        <p className="sys-note">What components use. Each role points at the palette per theme, so light and dark switch on their own.</p>
        {colour.map(group => <div key={group.id} className="sys-group">
          <h3>{group.title}</h3>
          <p className="sys-note">{group.description}</p>
          <div className="sys-roles">
            <div className="sys-roles-head"><span>Role</span><span>Light</span><span>Dark</span></div>
            {group.tokens.map(token => <div key={token.name} className="sys-role">
              <div className="sys-row-name"><code>{token.name}</code>{token.role && <span>{token.role}</span>}</div>
              {(["light", "dark"] as const).map(mode => <div key={mode} className={`sys-role-chip wlkr-${mode}`}>
                <span className="sys-role-well"><span style={{ background: v(token.name) }} /></span>
                <code>{short(valueOf(token, mode))}</code>
              </div>)}
            </div>)}
          </div>
        </div>)}
      </section>

      <section id="type" aria-labelledby="type-title">
        <h2 id="type-title">Type</h2>
        <p className="sys-note">Geist for everything, Geist Mono-style monospace for numbers and code. Headings use semibold; controls and labels use medium.</p>
        <Rows tokens={type.filter(token => token.name.startsWith("text-"))} render={token => <span className="sys-type" style={{ fontSize: v(token.name), fontWeight: Number.parseInt(valueOf(token, "light")) >= 20 ? 600 : 500 }}>The quick brown fox</span>} />
      </section>

      <section id="space" aria-labelledby="space-title">
        <h2 id="space-title">Space</h2>
        <p className="sys-note">A 4px grid with 2px and 6px half steps for tight controls.</p>
        <Rows tokens={space} render={token => <span className="sys-space" style={{ width: v(token.name) }} />} />
      </section>

      <section id="radius" aria-labelledby="radius-title">
        <h2 id="radius-title">Radius</h2>
        <p className="sys-note">Corners by role: controls share one radius, floating things a little more, containers the most.</p>
        <Rows tokens={radius} render={token => <span className="sys-radius" style={{ borderRadius: v(token.name) }} />} />
      </section>

      <section id="elevation" aria-labelledby="elevation-title">
        <h2 id="elevation-title">Elevation</h2>
        <p className="sys-note">Three heights. Dark mode leans on borders and deeper shadows because light shadows vanish on black.</p>
        <Both className="sys-elevation">
          {elevation.filter(token => token.name.startsWith("shadow-")).map(token => <div key={token.name} className="sys-lift" style={{ boxShadow: v(token.name) }}><code>{token.name}</code><span>{token.role}</span></div>)}
        </Both>
      </section>

      <section id="motion" aria-labelledby="motion-title">
        <h2 id="motion-title">Motion</h2>
        <p className="sys-note">Hover a row to play it. Durations pair with ease-out unless something travels.</p>
        <Rows tokens={motion} render={token => <span className="sys-motion" style={token.name.startsWith("duration") ? { ["--sys-duration" as string]: v(token.name) } : { ["--sys-ease" as string]: v(token.name) }}><span /></span>} />
      </section>

      <section id="controls" aria-labelledby="controls-title">
        <h2 id="controls-title">Controls</h2>
        <p className="sys-note">One scale for every control, so a button, an input and a select of the same size line up exactly.</p>
        <div className="sys-scale" role="table" aria-label="Control scale">
          <div role="row" className="sys-scale-head"><span role="columnheader">Size</span><span role="columnheader">Height</span><span role="columnheader">Padding</span><span role="columnheader">Text</span><span role="columnheader">Icon</span><span role="columnheader">Gap</span></div>
          {sizes.map(size => <div role="row" key={size}>{[size, `control-h-${size}`, `control-px-${size}`, `control-text-${size}`, `control-icon-${size}`, `control-gap-${size}`].map((cell, index) => <span role="cell" key={cell}>{index === 0 ? <strong>{cell}</strong> : <code>{control.find(token => token.name === cell)?.value as string}</code>}</span>)}</div>)}
        </div>
        {onSystem.filter(entry => boards[entry.slug]).map(entry => {
          const Board = boards[entry.slug]
          return <div key={entry.slug}>
            <h3 className="sys-sub"><Link href={`/components/${entry.slug}`} prefetch={false}>{entry.name}</Link></h3>
            <Both className="sys-board"><Board /></Both>
          </div>
        })}
      </section>

      <section id="coverage" aria-labelledby="coverage-title">
        <h2 id="coverage-title">Coverage</h2>
        <p className="sys-note">{onSystem.length} of {catalog.length} components are built on the tokens and checked by the token lint. The rest still carry their own values and move over one by one.</p>
        <ul className="sys-coverage">{basics.map(entry => <li key={entry.slug}>
          <Link href={`/components/${entry.slug}`} prefetch={false}>{entry.name}<ArrowUpRight aria-hidden="true" /></Link>
          <span data-on={entry.system ? "true" : undefined}>{entry.system ? "On the system" : "Not yet"}</span>
        </li>)}</ul>
      </section>
    </article>
    <aside className="doc-toc">
      <ScrollSpy items={sections} label="On this page" offset={48} />
    </aside>
  </div>
}
