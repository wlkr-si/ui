import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Tag input",
  category: "inputs",
  description: "Type, press Enter, get a tag. Square, quiet, uppercase.",
  summary: "A token field on a single underline: Enter or comma adds a square mono tag, Backspace removes, paste splits on commas and newlines, and duplicates shake.",
  keywords: ["tag", "token", "chips", "multi value", "input", "keywords", "labels"],
  since: "0.24.0",
  usage: `import { TagInput } from "@/components/wlkr/tag-input"

// Uncontrolled
<TagInput defaultValue={["Design", "Pixels"]} placeholder="Add a tag" aria-label="Topics" />

// Controlled, with a limit
const [tags, setTags] = React.useState<string[]>([])
<TagInput value={tags} onValueChange={setTags} max={5} aria-label="Labels" />`,
  api: [{
    props: [
      { name: "value", type: "string[]", description: "Controlled tags." },
      { name: "defaultValue", type: "string[]", default: "[]", description: "Starting tags when uncontrolled." },
      { name: "onValueChange", type: "(value: string[]) => void", description: "Called with the new list after every add or remove." },
      { name: "placeholder", type: "string", description: "Shown in the empty field. Hidden once the limit is reached." },
      { name: "max", type: "number", description: "Most tags allowed. Extra adds, including pasted ones, are dropped." },
      { name: "disabled", type: "boolean", default: "false", description: "Dims the field and blocks adding and removing." },
      { name: "aria-label", type: "string", default: `"Tags"`, description: "Names the group, the list and the field." },
      { name: "className", type: "string", description: "Merged onto the root. Native div props pass through." },
    ],
  }],
  notes: [
    "Enter or comma adds a tag. Backspace or Left arrow at the start of the field selects the last tag, and Backspace again removes it.",
    "Arrow keys, Home and End move between tags; Delete or Backspace removes the selected one and Escape returns to the field. Only the field sits in the Tab order.",
    "Duplicates are matched without case. The existing tag shakes in five steps and the refusal is announced; reduced motion skips the shake.",
    "Pasting text with commas or newlines splits it into several tags. Adds, removals and refusals are read out through a polite live region.",
  ],
  related: ["shortcut", "pixel-slider", "liquid-switch"],
}
