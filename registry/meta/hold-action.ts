import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Hold action",
  category: "actions",
  description: "For the things you can’t take back. Press and hold to confirm; let go to change your mind.",
  summary: "A press-and-hold confirmation button with a pixel-stepped fill and a two-step fallback for assistive technology.",
  keywords: ["button", "confirm", "hold", "press", "delete", "publish", "destructive", "danger"],
  since: "0.22.0",
  order: 30,
  usage: `import { HoldAction } from "@/components/wlkr/hold-action"

<HoldAction
  tone="destructive"
  confirmedLabel="Deleted"
  onConfirm={async () => {
    await deleteProject(id)
  }}
>
  Hold to delete
</HoldAction>`,
  api: [{
    props: [
      { name: "onConfirm", type: "() => void | Promise<unknown>", description: "Runs once when the hold completes. A thrown error or rejected promise returns to rest and announces the failure." },
      { name: "children", type: "React.ReactNode", description: "The resting label, such as “Hold to delete”." },
      { name: "confirmedLabel", type: "string", default: `"Done"`, description: "Shown and announced after confirming." },
      { name: "duration", type: "number", default: "1100", description: "Milliseconds to hold, 400–5000." },
      { name: "resetAfter", type: "number | null", default: "2200", description: "Milliseconds before returning to rest, 0–60000. Null stays confirmed." },
      { name: "tone", type: `"ink" | "destructive"`, default: `"ink"`, description: "Destructive fills with the --destructive colour." },
      { name: "disabled", type: "boolean", default: "false", description: "Native disabled." },
      { name: "className", type: "string", description: "Merged onto the button." },
      { name: "...props", type: "React.ComponentProps<\"button\">", description: "Other button props are passed through, except onClick and type." },
    ],
  }],
  notes: [
    "Hold with a pointer, or with Space or Enter.",
    "Letting go early drains the fill at three times the fill speed; pressing again resumes from there.",
    "A touch drag cancels the hold so the page can still scroll.",
    "A bare activation with no hold, the kind screen readers and voice control send, arms a two-step confirm: “Press again to confirm”, then a second activation within four seconds.",
    "Reduced motion keeps the fill, because it is the feedback, with a straight edge and no settle.",
  ],
  dependencies: ["lucide-react"],
  related: ["async-action", "shortcut", "copy-command"],
}
