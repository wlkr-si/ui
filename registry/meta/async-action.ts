import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Async action",
  category: "actions",
  description: "An action that follows through. Pending, success, and a second chance when something goes wrong.",
  summary: "Promise-aware action with pending, success, failure and retry states.",
  keywords: ["button", "save", "loading", "promise", "error", "retry"],
  since: "0.1.0",
  order: 20,
  usage: `import { AsyncAction } from "@/components/wlkr/async-action"

<AsyncAction
  action={async () => {
    const response = await fetch("/api/settings", { method: "POST" })
    if (!response.ok) throw new Error("Save failed")
  }}
  pendingLabel="Saving changes…"
  successLabel="Changes saved"
  failureLabel="Try again"
  errorLabel="Changes were not saved. Try again."
>
  Save changes
</AsyncAction>`,
  api: [{
    props: [
      { name: "action", type: "() => Promise<unknown>", description: "Runs on click. Resolve for success; reject or throw for failure." },
      { name: "children", type: "React.ReactNode", description: "The idle label, shown after an arrow icon." },
      { name: "pendingLabel", type: "string", default: `"Saving…"`, description: "Shown and announced while the promise is pending." },
      { name: "successLabel", type: "string", default: `"Saved"`, description: "Shown with a green check and announced on success." },
      { name: "failureLabel", type: "string", default: `"Try again"`, description: "The short visible label after a failure." },
      { name: "errorLabel", type: "string", default: `"Could not save. Try again."`, description: "Announced to screen readers after a failure. Not shown." },
      { name: "disabled", type: "boolean", default: "false", description: "Disables the button." },
    ],
  }],
  notes: [
    "One promise at a time: clicks while pending are ignored and the button is disabled with aria-busy.",
    "Every label shares one grid slot sized to the widest state, so the button never changes size.",
    "Failures need a rejected promise. A fetch does not reject on an error status, so throw when the response is not OK.",
    "After success or failure the next click runs the action again.",
    "The pending label stays readable under a slow pixel mask; reduced motion removes the mask.",
  ],
  dependencies: ["lucide-react"],
  registryDependencies: ["button"],
  related: ["hold-action", "copy-command"],
}
