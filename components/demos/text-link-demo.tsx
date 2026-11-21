"use client"

import { TextLink } from "@/registry/wlkr/text-link"

export function TextLinkDemo() {
  return (
    <p className="text-base leading-relaxed">
      Take a look around <TextLink href="https://wlkr.si" preview={{ title: "WLKR.SI", description: "A small studio building useful things, with care for the details." }}>WLKR.SI</TextLink>, or <TextLink href="/installation">bring a component home</TextLink>.
    </p>
  )
}
