import type { Metadata } from "next"
import Link from "next/link"
import { highlightCode } from "@/lib/highlight-code"
import { prototypeCode } from "@/lib/code-samples"
import { DisclosureCodePrototype } from "@/components/disclosure-code-prototype"
import { FooterControls } from "@/registry/wlkr/footer-controls"
import { ComboboxPrototypes } from "@/components/combobox-prototypes"

export const metadata:Metadata={title:"Control studies — wlkr/ui",robots:{index:false,follow:false}}
export default async function ControlStudies(){return <main style={{maxWidth:1180,margin:"0 auto",padding:"40px clamp(24px,6vw,80px) 100px"}}><Link href="/" style={{fontSize:13,color:"var(--muted-foreground)",textDecoration:"none"}}>wlkr/ui <span aria-hidden="true">/</span> Control studies</Link><ComboboxPrototypes/><DisclosureCodePrototype highlightedCode={await highlightCode(prototypeCode,"tsx")}/><footer style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:24,paddingTop:40}}><p style={{fontSize:11,color:"var(--muted-foreground)"}}>WLKR.SI · Interface studies</p><FooterControls agentHref="/llms.txt"/></footer></main>}
