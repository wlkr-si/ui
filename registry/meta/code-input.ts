import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Code input",
  category: "inputs",
  description: "Six cells, one real input. Paste, autofill and the keyboard all just work.",
  summary: "A one-time-code field that draws a row of cells and a block caret over a single native input.",
  keywords: ["otp", "one-time code", "verification", "pin", "2fa", "input", "cells", "autofill", "caret"],
  since: "0.23.0",
  order: 30,
  usage: `import { CodeInput } from "@/components/wlkr/code-input"

const [code, setCode] = useState("")
const [status, setStatus] = useState<"idle" | "error" | "success">("idle")

<CodeInput
  label="Verification code"
  groups={[3, 3]}
  value={code}
  status={status}
  onValueChange={next => { setCode(next); setStatus("idle") }}
  onComplete={async next => setStatus((await verify(next)) ? "success" : "error")}
/>`,
  api: [{
    props: [
      { name: "label", type: "string", description: "Accessible name for the field." },
      { name: "length", type: "number", default: "6", description: "Number of cells, 3–12." },
      { name: "value", type: "string", description: "Controlled value." },
      { name: "defaultValue", type: "string", default: `""`, description: "Starting value when uncontrolled." },
      { name: "onValueChange", type: "(value: string) => void", description: "Called with the cleaned value on every change." },
      { name: "onComplete", type: "(value: string) => void", description: "Fires once when typing, paste or autofill fills the last cell." },
      { name: "mode", type: `"numeric" | "alphanumeric"`, default: `"numeric"`, description: "Digits only, or A–Z and 0–9 uppercased." },
      { name: "groups", type: "number[]", description: "Cells per group, e.g. [3, 3], with a dash between. Ignored unless it sums to length." },
      { name: "status", type: `"idle" | "error" | "success"`, default: `"idle"`, description: "Error shakes and turns red; success runs a green wave across the cells." },
      { name: "disabled", type: "boolean", default: "false", description: "Disables the input." },
      { name: "autoFocus", type: "boolean", description: "Focuses the input on mount." },
      { name: "name", type: "string", description: "Form field name for the real input." },
      { name: "className", type: "string", description: "Merged onto the root." },
    ],
  }],
  notes: [
    "One native input with autocomplete=\"one-time-code\" sits over the cells, so paste, SMS autofill, password managers and the keyboard all behave normally.",
    "Spaces and dashes are stripped and characters outside the mode are dropped, on typing and on paste. Backspace removes the last character.",
    "A value set by the parent does not fire onComplete; only input from the person does.",
    "A hidden status line says \"Code complete\", \"Incorrect code\" or \"Code accepted\". Error also sets aria-invalid.",
    "Under reduced motion the caret stays solid and there is no drop, shake or wave; colours still change.",
  ],
  related: ["scrub-input", "hold-action"],
}
