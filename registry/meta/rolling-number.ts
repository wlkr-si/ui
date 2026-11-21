import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Rolling number",
  category: "data",
  description: "Numbers on wheels. Each digit rolls to its new value, and new columns arrive without a jump.",
  summary: "A formatted number whose digits roll to each new value like an odometer.",
  keywords: ["counter", "odometer", "number", "digits", "stat", "price", "currency", "animate"],
  since: "0.22.0",
  order: 10,
  usage: `import { RollingNumber } from "@/components/wlkr/rolling-number"

<RollingNumber value={total} />

<RollingNumber
  value={revenue}
  format={{ style: "currency", currency: "USD" }}
/>
// Size, weight and colour come from the parent.`,
  api: [{
    props: [
      { name: "value", type: "number", description: "The number to show. Non-finite values show a static en dash." },
      { name: "format", type: "Intl.NumberFormatOptions", description: "Passed to Intl.NumberFormat. Invalid options fall back to plain formatting." },
      { name: "locale", type: "string", default: `"en-US"`, description: "Fixed by default so server and browser format the same way." },
      { name: "duration", type: "number", default: "700", description: "Milliseconds per roll, 150–3000." },
      { name: "className", type: "string", description: "Merged onto the root." },
      { name: "...props", type: "React.ComponentProps<\"span\">", description: "Other span props are passed through." },
    ],
  }],
  notes: [
    "Wheels roll up when the value rises and down when it falls, and continue from where they are when interrupted.",
    "Columns are keyed from the right, so 999 → 1,000 keeps the existing wheels in place while a new column grows in.",
    "The first render is at rest.",
    "Screen readers get the formatted value in one hidden span. There is no live region; add one in the parent when changes should be announced.",
    "Reduced motion switches digits instantly.",
  ],
  related: ["dot-matrix", "decode-text"],
}
