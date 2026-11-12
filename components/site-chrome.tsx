import Link from "next/link"
import Image from "next/image"
import { FooterControls } from "@/registry/wlkr/footer-controls"

export function SiteHeader() { return <header className="site-header">
      <Link href="/" className="identity" aria-label="wlkr/ui home" prefetch={false}><Image className="brand-mark" src="/wlkr-mark.svg" alt="" width={27} height={31} priority /><span>wlkr<span className="text-muted-foreground">/</span>ui</span></Link>
      <nav className="header-nav" aria-label="Main navigation"><Link href="/#collection" prefetch={false}>Components</Link><Link href="/pixels" prefetch={false}>Pixels</Link><Link href="/contrast" prefetch={false}>Contrast</Link><Link href="/animation" prefetch={false}>Animation</Link><Link className="desktop-link" href="/#installation" prefetch={false}>Get started</Link><a className="desktop-link" href="https://wlkr.si" target="_blank" rel="noreferrer">WLKR.SI</a></nav>
    </header> }

export function SiteFooter() { return <footer className="site-footer"><a className="studio-family-badge" href="https://wlkr.si" aria-label="Part of WLKR.SI"><Image className="studio-family-badge-light" src="/brand/part-of-wlkr-si-light.svg" alt="" width={184} height={32} /><Image className="studio-family-badge-dark" src="/brand/part-of-wlkr-si-dark.svg" alt="" width={184} height={32} /></a><div><a href="/registry.json">Registry</a><Link href="/#installation" prefetch={false}>Installation</Link><FooterControls agentHref="/llms.txt" /></div></footer> }
