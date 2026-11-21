import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Pixel burst",
  category: "effects",
  description: "A small celebration. Square pixels fly out from where you clicked.",
  summary: "A wrapper that throws a stepped burst of square ink and green pixels from the click point, or on demand through a ref.",
  keywords: ["confetti", "burst", "celebration", "particles", "click", "pixels", "effect"],
  since: "0.24.0",
  usage: `import { PixelBurst, type PixelBurstHandle } from "@/components/wlkr/pixel-burst"

<PixelBurst>
  <button>Ship it</button>
</PixelBurst>

// Fire it yourself, e.g. when a save succeeds.
const burst = React.useRef<PixelBurstHandle>(null)

<PixelBurst ref={burst} trigger="manual" count={24} spread={72}>
  <span>Saved</span>
</PixelBurst>

burst.current?.burst()`,
  api: [{
    props: [
      { name: "children", type: "React.ReactNode", description: "The element the burst sits over. Clicks inside it fire a burst." },
      { name: "count", type: "number", default: "18", description: "Pixels per burst." },
      { name: "spread", type: "number", default: "56", description: "Furthest distance a pixel travels, in px." },
      { name: "duration", type: "number", default: "520", description: "Length of one burst in ms." },
      { name: "trigger", type: `"click" | "manual"`, default: `"click"`, description: "Manual ignores clicks and only fires through the ref." },
      { name: "disabled", type: "boolean", default: "false", description: "No bursts at all." },
      { name: "ref", type: "React.Ref<{ burst(x?: number, y?: number): void }>", description: "Fire a burst at a point in px from the wrapper's top left. Centre when left out." },
      { name: "className", type: "string", description: "Merged onto the inline-block wrapper. Native span props pass through." },
    ],
  }],
  notes: [
    "With reduced motion on, no burst is made, and CSS hides the pixel layer as a second guard.",
    "Keyboard clicks (Enter or Space on a button) have no pointer position, so they burst from the centre.",
    "The pixel layer is aria-hidden and ignores the pointer, so it never gets in the way of the wrapped control.",
    "Each burst is removed once its pixels finish. Overlapping bursts are fine, but very large counts cost a span each.",
  ],
  related: ["pixel-trail", "dissolve", "hold-action"],
}
