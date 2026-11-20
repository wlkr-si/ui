"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { PixelImage } from "@/registry/wlkr/pixel-image"

const scene = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="600" viewBox="0 0 960 600">
<defs>
<radialGradient id="field" cx="50%" cy="42%" r="75%"><stop offset="0" stop-color="#16181a"/><stop offset=".55" stop-color="#070808"/><stop offset="1" stop-color="#010101"/></radialGradient>
<linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#010101" stop-opacity="0"/><stop offset="1" stop-color="#0b1a12"/></linearGradient>
<radialGradient id="body" cx="40%" cy="34%" r="70%"><stop offset="0" stop-color="#5d6164"/><stop offset=".35" stop-color="#25282a"/><stop offset=".8" stop-color="#0a0b0b"/><stop offset="1" stop-color="#030303"/></radialGradient>
<radialGradient id="rim" cx="44%" cy="40%" r="62%"><stop offset=".78" stop-color="#33f282" stop-opacity="0"/><stop offset=".93" stop-color="#33f282" stop-opacity=".35"/><stop offset="1" stop-color="#33f282" stop-opacity=".95"/></radialGradient>
<radialGradient id="glint" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffffff" stop-opacity=".55"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
<radialGradient id="pool" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#33f282" stop-opacity=".42"/><stop offset=".6" stop-color="#33f282" stop-opacity=".08"/><stop offset="1" stop-color="#33f282" stop-opacity="0"/></radialGradient>
<radialGradient id="shadow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#000000" stop-opacity=".9"/><stop offset="1" stop-color="#000000" stop-opacity="0"/></radialGradient>
</defs>
<rect width="960" height="600" fill="url(#field)"/>
<rect y="380" width="960" height="220" fill="url(#floor)"/>
<ellipse cx="520" cy="492" rx="300" ry="44" fill="url(#pool)"/>
<ellipse cx="480" cy="488" rx="190" ry="22" fill="url(#shadow)"/>
<circle cx="480" cy="290" r="180" fill="url(#body)"/>
<circle cx="480" cy="290" r="180" fill="url(#rim)"/>
<ellipse cx="420" cy="215" rx="70" ry="48" fill="url(#glint)"/>
</svg>`
const picture = `data:image/svg+xml,${encodeURIComponent(scene)}`

export function PixelImageDemo() {
  const [run, setRun] = React.useState(0)
  return <div className="flex w-full flex-col items-start gap-5">
    <PixelImage key={run} src={picture} alt="A dark sphere on a black field, lit from behind by a green rim light" width={960} height={600} trigger="both" className="w-full" />
    <Button variant="ghost" onClick={() => setRun(value => value + 1)}>Replay</Button>
  </div>
}
