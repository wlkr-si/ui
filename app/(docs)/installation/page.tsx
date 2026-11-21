import type { Metadata } from "next"
import Link from "next/link"
import { SITE, REPOSITORY } from "@/lib/catalog"
import { highlightCode } from "@/lib/highlight-code"
import { registryConfig } from "@/lib/code-samples"
import { CodePanel } from "@/components/code-panel"
import { InstallCommand } from "@/components/docs/install-command"
import { CopyCommand } from "@/registry/wlkr/copy-command"

const description = "Copy wlkr/ui components into a React project with the shadcn CLI. No runtime package, no account."
export const metadata: Metadata = {
  title: "Installation",
  description,
  alternates: { canonical: `${SITE}/installation` },
  openGraph: { type: "article", url: `${SITE}/installation`, siteName: "wlkr/ui", title: "Installation — wlkr/ui", description, images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "wlkr/ui component gallery" }] },
}

export default async function Installation() {
  const config = await highlightCode(registryConfig, "json")
  return <div className="doc">
    <article className="doc-article doc-prose">
      <header className="doc-head">
        <p className="doc-eyebrow"><span>Get started</span></p>
        <h1>Make it yours.</h1>
        <p className="doc-lede">Copy the source into your project with the shadcn CLI. Keep what you need. Change what you like.</p>
      </header>

      <section id="start" aria-labelledby="start-title">
        <h2 id="start-title">Start with shadcn</h2>
        <p>Use a React, TypeScript and Tailwind project. New project? Set it up first.</p>
        <CopyCommand command="pnpm dlx shadcn@latest init" />
      </section>

      <section id="add" aria-labelledby="add-title">
        <h2 id="add-title">Bring a component home</h2>
        <p>Every component page has this line. It works in any shadcn project, with nothing to configure.</p>
        <InstallCommand target={`${SITE}/r/copy-command.json`} />
        <p>Originals land in <code>components/wlkr</code>. Stock primitives they need come straight from shadcn.</p>
      </section>

      <section id="namespace" aria-labelledby="namespace-title">
        <h2 id="namespace-title">Shorter names</h2>
        <p>Add the registry to your project’s <code>components.json</code>, then install by name: <code>@wlkr/copy-command</code>.</p>
        <CodePanel code={registryConfig} highlightedCode={config} filename="components.json" language="json" />
      </section>

      <section id="theme" aria-labelledby="theme-title">
        <h2 id="theme-title">Theme</h2>
        <p>Components carry their own fallback colours, so the <Link className="text-link" href="/components/theme" prefetch={false}>theme</Link> is optional. Add it for the WLKR light and dark tokens.</p>
      </section>

      <section id="astro" aria-labelledby="astro-title">
        <h2 id="astro-title">Astro</h2>
        <p>Use the official <code>@astrojs/react</code> integration with a compatible Tailwind and shadcn setup, and load interactive components with <code>client:load</code>.</p>
      </section>

      <p className="doc-credits">Source on <a className="text-link" href={REPOSITORY}>GitHub</a>. Built with <a className="text-link" href="https://ui.shadcn.com">shadcn/ui</a>, <a className="text-link" href="https://www.radix-ui.com">Radix</a>, <a className="text-link" href="https://lucide.dev">Lucide</a> and <a className="text-link" href="https://vercel.com/font">Geist</a>. WLKR originals are MIT licensed.</p>
    </article>
  </div>
}
