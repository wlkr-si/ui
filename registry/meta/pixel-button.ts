import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Pixel button",
  category: "actions",
  description: "A flat button that fills in pixel by pixel. Pressing it snaps.",
  summary: "A button whose fill sweeps across as an ordered-dither grid of square pixels on hover and focus, with solid, outline and brand variants and a three-pixel loading state.",
  keywords: ["button", "pixel", "dither", "hover", "loading", "action", "cta"],
  since: "0.24.0",
  usage: `import { PixelButton } from "@/components/wlkr/pixel-button"

<PixelButton>Deploy</PixelButton>
<PixelButton variant="outline" size="sm">Preview</PixelButton>
<PixelButton variant="brand" size="lg">Ship it</PixelButton>

<PixelButton variant="brand" loading={saving} onClick={save}>Save</PixelButton>`,
  api: [{
    props: [
      { name: "variant", type: `"solid" | "outline" | "brand"`, default: `"solid"`, description: "Solid fills with green, outline fills with the text colour, brand fills with the text colour over green." },
      { name: "size", type: `"sm" | "md" | "lg"`, default: `"md"`, description: "Heights of 32, 40 and 48px." },
      { name: "loading", type: "boolean", default: "false", description: "Hides the label behind three marching pixels, sets aria-busy and ignores clicks while keeping focus." },
      { name: "type", type: `"button" | "submit" | "reset"`, default: `"button"`, description: "Native button type. Defaults to button so it never submits a form by accident." },
      { name: "ref", type: "React.Ref<HTMLButtonElement>", description: "Forwarded to the native button." },
      { name: "className", type: "string", description: "Merged onto the button. All native button props pass through." },
    ],
  }],
  notes: [
    "It is a native button, so Enter and Space work and keyboard focus plays the same pixel sweep as hover.",
    "While loading the button stays focusable and announces \"Loading\"; the label keeps its width so the layout does not jump.",
    "The sweep is pure CSS: each pixel snaps on after a delay set by its column and a 4x4 Bayer threshold.",
    "Reduced motion fills all pixels at once, drops the press nudge and shows the loading pixels still.",
  ],
  related: ["hold-action", "pixel-progress", "shortcut"],
}
