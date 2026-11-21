import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Typewriter",
  category: "text",
  description: "A line that rewrites itself, one keystroke at a time.",
  summary: "Inline text that types a phrase, holds, deletes back to the beginning it shares with the next and types that, behind a block caret.",
  keywords: ["typewriter", "typing", "rotate", "headline", "caret", "cursor", "text", "hero"],
  since: "0.23.0",
  order: 30,
  usage: `import { Typewriter } from "@/components/wlkr/typewriter"

<h1>
  Components for people who ship{" "}
  <Typewriter phrases={["dashboards.", "docs.", "launch pages."]} />
</h1>

// A quieter command line with a thin caret.
<Typewriter caret="line" smart={false} phrases={["pnpm dev", "pnpm build"]} />`,
  api: [{
    props: [
      { name: "phrases", type: "string[]", description: "Phrases to cycle through. The first is in server HTML; a single phrase simply stays." },
      { name: "typeSpeed", type: "number", default: "55", description: "Milliseconds per character typed, 10–300." },
      { name: "deleteSpeed", type: "number", default: "28", description: "Milliseconds per character deleted, 5–300." },
      { name: "hold", type: "number", default: "1600", description: "Milliseconds a finished phrase stays, 200–20000." },
      { name: "loop", type: "boolean", default: "true", description: "Cycle forever. False stops on the last phrase." },
      { name: "smart", type: "boolean", default: "true", description: "Delete only back to the beginning shared with the next phrase, so \"docs\" after \"dashboards\" keeps the \"d\"." },
      { name: "caret", type: `"block" | "line" | "none"`, default: `"block"`, description: "A solid block, a 2px line, or nothing." },
      { name: "reserve", type: "boolean", default: "true", description: "Always take the width and height of the longest phrase so nothing around it moves. False lets it grow and shrink inline." },
      { name: "trigger", type: `"view" | "mount"`, default: `"view"`, description: "Start once 30% is visible, or straight away." },
      { name: "as", type: `"span" | "p" | "div" | "h1" | "h2" | "h3"`, default: `"span"`, description: "The root element." },
      { name: "label", type: "string", description: "What assistive tech reads. Defaults to the first phrase." },
      { name: "className", type: "string", description: "Merged onto the root." },
    ],
  }],
  notes: [
    "Server HTML shows the first phrase in full; after hydration it holds, then deletes, so the page is never blank.",
    "Assistive tech reads the label once; the moving text is hidden from it and nothing is announced while it types.",
    "Characters are split by grapheme, so emoji and accented letters are never cut in half.",
    "With reserve on, every phrase is laid out invisibly in the same box, so wrapping phrases keep their height too.",
    "Playback pauses off-screen and in a hidden tab. With reduced motion it stays on the first phrase with a solid caret.",
  ],
  related: ["terminal", "decode-text"],
}
