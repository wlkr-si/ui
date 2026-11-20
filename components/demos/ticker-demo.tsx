"use client"

import { Ticker } from "@/registry/wlkr/ticker"

const status = [
  { name: "Brand Studio", note: "shipped", brand: true },
  { name: "WeatherGoblin", note: "in development" },
  { name: "PatriBible", note: "reading plan live", href: "#ticker" },
  { name: "wlkr/ui", note: "21 components", href: "#ticker", brand: true },
  { name: "Pixels", note: "new exports" },
  { name: "Contrast", note: "AA options" },
  { name: "WLKR.SI", note: "studio open" },
]
const words = ["Less", "Better", "Useful", "Considered", "Quiet", "Built"]
const item = "inline-flex min-h-11 items-center gap-2 whitespace-nowrap text-[13px] text-foreground no-underline"

export function TickerDemo() {
  return <div className="flex w-full flex-col items-start gap-5">
    <Ticker label="Studio status" className="w-full">
      {status.map(entry => {
        const content = <><span aria-hidden="true" className={`size-[5px] rounded-full ${entry.brand ? "bg-brand" : "bg-muted-foreground"}`} />{entry.name}<span className="text-muted-foreground">— {entry.note}</span></>
        return entry.href
          ? <a key={entry.name} href={entry.href} className={`${item} outline-offset-[5px] focus-visible:outline-2 focus-visible:outline-ring`}>{content}</a>
          : <span key={entry.name} className={item}>{content}</span>
      })}
    </Ticker>
    <Ticker label="Studio values" direction="right" speed={22} gap={28} className="w-full">
      {words.map(word => <span key={word} className="inline-flex items-center gap-7 whitespace-nowrap text-[40px] font-semibold leading-none tracking-[-0.045em]">{word}<span aria-hidden="true" className="size-2 bg-brand" /></span>)}
    </Ticker>
  </div>
}
