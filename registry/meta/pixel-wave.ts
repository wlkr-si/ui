import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Pixel wave",
  category: "media",
  description: "A voice, in pixels. Calm when idle, lively when it's listening.",
  summary: "An audio meter of square-cell bars for listening, speaking and recording states, driven by a microphone stream, a supplied level or a simulation.",
  keywords: ["audio", "voice", "meter", "waveform", "microphone", "listening", "recording", "ai", "pixel"],
  since: "0.23.0",
  order: 40,
  usage: `import { PixelWave } from "@/components/wlkr/pixel-wave"

// Simulated speech while the assistant talks.
<PixelWave active={speaking} label="Speaking" />

// A real microphone you already have permission for.
const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
<PixelWave stream={stream} label="Listening" />

// A small recording indicator.
<PixelWave bars={12} rows={5} mirror={false} tone="brand" />`,
  api: [{
    props: [
      { name: "active", type: "boolean", default: "true", description: "When off, the wave idles: a low, slow breathing line." },
      { name: "stream", type: "MediaStream | null", default: "null", description: "Live audio to meter while active. The component never requests the microphone itself." },
      { name: "level", type: "number", description: "0–1. An overall level you compute yourself; it scales the simulated motion instead of the built-in phrasing." },
      { name: "bars", type: "number", default: "24", description: "Number of bars, 4–96." },
      { name: "rows", type: "number", default: "8", description: "Cells per bar, 3–24." },
      { name: "cell", type: "number", default: "5", description: "Cell size in CSS pixels, 2–16." },
      { name: "gap", type: "number", default: "2", description: "Space between cells in CSS pixels, 0–8." },
      { name: "mirror", type: "boolean", default: "true", description: "Bars grow up and down from a centre line; when off, they grow up from the bottom." },
      { name: "tone", type: `"ink" | "brand"`, default: `"ink"`, description: "Ink bars with the tallest bar's top cell in green, or every lit cell green." },
      { name: "label", type: "string", description: "Accessible name, e.g. \"Listening\". With it the wave is an image with that name; without it, decorative." },
      { name: "className", type: "string", description: "Merged onto the root. Other native span props are spread onto it." },
    ],
  }],
  notes: [
    "The size is fixed by bars, rows, cell and gap, and scales down to fit its container, so nothing moves as levels change.",
    "With a stream it reads frequency levels through an AnalyserNode that is never connected to the speakers. Everything is closed on stream change, when inactive, and on unmount; if the audio context stays suspended, it falls back to simulated motion.",
    "Simulated motion is deterministic, with no randomness, and is weighted so middle bars run taller.",
    "Drawing runs at about 30 frames a second without React re-renders, and pauses off-screen and in hidden tabs.",
    "Reduced motion shows a static shape: a flat line when idle and a fixed wave when active.",
  ],
  related: ["pixel-progress", "status-dot", "dot-matrix"],
}
