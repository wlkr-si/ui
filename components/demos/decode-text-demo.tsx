"use client"

import { DecodeText } from "@/registry/wlkr/decode-text"

const links = [
  { text: "Work", glyphs: "01" },
  { text: "Notes", glyphs: "▚▞░▒▓" },
  { text: "Studio", glyphs: "ABCDEFGHIJKLMNOPQRSTUVWXYZ" },
  { text: "Contact", glyphs: "·:•+×" },
]

export function DecodeTextDemo() {
  return <div className="flex flex-col items-start gap-5">
    <DecodeText as="p" trigger="view" duration={900} text="Useful things, thoughtfully built." className="text-[30px] font-[620] leading-[1.1] tracking-[-0.045em]" />
    <nav aria-label="Example navigation" className="flex flex-wrap gap-x-6">
      {links.map(link => <a key={link.text} href="#decode-text" className="inline-flex min-h-11 items-center text-sm text-foreground no-underline outline-offset-[5px] focus-visible:outline-2 focus-visible:outline-ring"><DecodeText trigger="hover" text={link.text} glyphs={link.glyphs} /></a>)}
    </nav>
  </div>
}
