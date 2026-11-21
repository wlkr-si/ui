import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Steps",
  category: "navigation",
  description: "Where you are, and what's left. The line fills as you go.",
  summary: "A numbered step indicator whose connecting line fills in pixel increments, with numbers that roll over to a pixel check and optional jump-back navigation.",
  keywords: ["steps", "stepper", "progress", "wizard", "flow", "checkout", "onboarding", "timeline"],
  since: "0.23.0",
  order: 60,
  usage: `import { Steps } from "@/components/wlkr/steps"

const items = [
  { label: "Draft", description: "Words and images" },
  { label: "Review" },
  { label: "Publish" },
]

<Steps items={items} current={1} />

// Completed steps become buttons you can jump back to.
<Steps label="Publish flow" items={items} current={step} onStepSelect={setStep} />`,
  api: [{
    props: [
      { name: "items", type: "{ label: string; description?: string }[]", description: "The steps, in order." },
      { name: "current", type: "number", description: "Zero-based index of the active step. items.length or more marks every step complete. Clamped." },
      { name: "onStepSelect", type: "(index: number) => void", description: "Turns completed steps and the current one into buttons, and the root into a nav." },
      { name: "allowForward", type: "boolean", default: "false", description: "Lets upcoming steps be selected too." },
      { name: "orientation", type: `"horizontal" | "vertical"`, default: `"horizontal"`, description: "Horizontal stacks to vertical when its container is narrower than 420px." },
      { name: "label", type: "string", default: `"Progress"`, description: "Accessible name for the list, or for the nav when interactive." },
      { name: "className", type: "string", description: "Merged onto the root." },
    ],
  }],
  notes: [
    "The current step carries aria-current=\"step\", and each step starts with hidden text saying whether it is completed, current or not started.",
    "When interactive, steps are real buttons with a 44px hit area; arrow keys, Home and End move focus between the enabled ones.",
    "Moving forward fills each connector in eight steps over 450ms, one after another, and the marker ahead changes as the fill arrives. Moving back drains it the same way.",
    "Horizontal steps stack vertically below 420px of container width; browsers without container queries always stack.",
    "With reduced motion every state change is immediate.",
  ],
  related: ["pixel-progress", "liquid-tabs"],
}
