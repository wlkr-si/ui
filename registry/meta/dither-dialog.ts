import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Dither dialog",
  category: "feedback",
  description: "A modal that dithers the page away. Flat paper, one ink line.",
  summary: "A modal dialog on the native dialog element with an ordered-dither backdrop that steps in through three densities and a square panel that snaps into place.",
  keywords: ["dialog", "modal", "confirm", "alert", "overlay", "dither", "backdrop"],
  since: "0.24.0",
  usage: `import { DitherDialog } from "@/components/wlkr/dither-dialog"

const [open, setOpen] = React.useState(false)

<button onClick={() => setOpen(true)}>Delete project</button>

<DitherDialog
  open={open}
  onOpenChange={setOpen}
  size="sm"
  title="Delete project?"
  description="This cannot be undone."
  actions={
    <>
      <button onClick={() => setOpen(false)}>Cancel</button>
      <button onClick={remove}>Delete</button>
    </>
  }
/>`,
  api: [{
    props: [
      { name: "open", type: "boolean", description: "Whether the dialog is shown. Required; the dialog is always controlled." },
      { name: "onOpenChange", type: "(open: boolean) => void", description: "Called with false on Escape, the close button, or a backdrop click." },
      { name: "title", type: "React.ReactNode", description: "Heading in an h2, linked with aria-labelledby." },
      { name: "description", type: "React.ReactNode", description: "Muted line under the title, linked with aria-describedby." },
      { name: "children", type: "React.ReactNode", description: "Body content between the header and the actions." },
      { name: "actions", type: "React.ReactNode", description: "Footer slot, right-aligned. Usually buttons." },
      { name: "dismissible", type: "boolean", default: "true", description: "Close on a backdrop click. Escape and the close button always work." },
      { name: "size", type: `"sm" | "md"`, default: `"md"`, description: "Max width of 360px or 480px; always 32px narrower than the viewport." },
      { name: "className", type: "string", description: "Merged onto the dialog element. Native dialog props pass through." },
    ],
  }],
  notes: [
    "It uses showModal(), so focus is trapped, the page behind is inert, and focus returns to the trigger on close.",
    "Escape asks to close through onOpenChange; the dialog only closes when open becomes false.",
    "The dialog sits in the top layer, so it sets its own background and ink colours from the theme tokens.",
    "Reduced motion skips the dither steps and the snap; the backdrop and panel appear at once.",
    "There is no exit animation: the native element closes in a single frame.",
  ],
  related: ["toaster", "hold-action", "dither-field"],
}
