import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Toaster",
  category: "feedback",
  description: "A quiet word at the edge of the screen. It waits while you read.",
  summary: "Ink-block toast notifications with a draining pixel timer, called from anywhere with toast().",
  keywords: ["toast", "notification", "snackbar", "alert", "message", "feedback", "undo", "timer"],
  since: "0.23.0",
  order: 30,
  usage: `import { Toaster, toast } from "@/components/wlkr/toaster"

// Once, near the root of your app.
<Toaster position="bottom-right" />

// Anywhere, even outside React.
toast.success("Changes saved")
toast.error("Couldn't publish", { description: "Check your connection and try again." })
const id = toast("Project archived", { action: { label: "Undo", onClick: restore } })
toast("Uploading…", { id: "upload", duration: Infinity })
toast.success("Uploaded", { id: "upload" })
toast.dismiss(id)`,
  api: [
    {
      title: "Toaster",
      props: [
        { name: "position", type: `"bottom-right" | "bottom-left" | "bottom-center" | "top-right" | "top-left" | "top-center"`, default: `"bottom-right"`, description: "Corner or edge of the viewport the stack grows from." },
        { name: "max", type: "number", default: "3", description: "Toasts visible at once, 1–6. When a new one arrives, the oldest leaves." },
        { name: "label", type: "string", default: `"Notifications"`, description: "Accessible name of the region." },
        { name: "className", type: "string", description: "Merged onto the region." },
      ],
    },
    {
      title: "toast(message, options)",
      props: [
        { name: "message", type: "string", description: "The main line. Returns the toast's id. Also toast.success(), toast.error() and toast.dismiss(id?), which clears all toasts without an id." },
        { name: "description", type: "string", description: "A second, quieter line." },
        { name: "tone", type: `"default" | "success" | "error"`, default: `"default"`, description: "Adds a leading square: green for success, red for error. Errors are announced as alerts." },
        { name: "duration", type: "number", default: "4000", description: "Milliseconds on screen, 1500–60000. Infinity stays until dismissed and hides the timer." },
        { name: "action", type: "{ label: string; onClick: () => void }", description: "An underlined button. Clicking it runs onClick and dismisses the toast." },
        { name: "id", type: "string", description: "Reusing an id updates that toast in place and restarts its timer." },
      ],
    },
  ],
  notes: [
    "State lives in a small module store, so there is no provider; toasts called before a Toaster mounts wait for it. Mount one Toaster per page.",
    "Timers pause while the pointer is over the stack, while a finger is down on it, while focus is inside it, and while the tab is hidden.",
    "Tab reaches each toast's buttons in order. Escape dismisses the focused toast and moves focus to the next one, or back to where it was.",
    "Drag a toast sideways past 40% of its width, or flick it, to dismiss it; vertical scrolling still works over the stack.",
    "Each toast is a status message, or an alert for errors. Reduced motion swaps the slides for fades; the pixel timer still counts down.",
  ],
  dependencies: ["lucide-react"],
  related: ["async-action", "status-dot", "pixel-progress"],
}
