import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Pixel avatar",
  category: "data",
  description: "A face for every name. The same string always draws the same pixels.",
  summary: "A deterministic, symmetric pixel identicon drawn from any string, with optional image and an overlapping group.",
  keywords: ["avatar", "identicon", "pixel", "profile", "user", "fallback", "group", "stack", "initials"],
  since: "0.23.0",
  order: 60,
  usage: `import { PixelAvatar, PixelAvatarGroup } from "@/components/wlkr/pixel-avatar"

<PixelAvatar seed="studio@wlkr.si" size={48} />

// The image covers the pixels once it loads; on error the pixels stay.
<PixelAvatar seed="WeatherGoblin" src="/avatars/goblin.png" alt="WeatherGoblin" shape="round" />

<PixelAvatarGroup label="Project members" max={3} size={32}>
  <PixelAvatar seed="Brand Studio" />
  <PixelAvatar seed="PatriBible" />
  <PixelAvatar seed="wlkr/ui" />
  <PixelAvatar seed="WLKR.SI" />
</PixelAvatarGroup>`,
  api: [
    {
      title: "PixelAvatar",
      props: [
        { name: "seed", type: "string", description: "Any string: a name, an email, an id. The same seed always draws the same face." },
        { name: "size", type: "number", default: "40", description: "Width and height in pixels, 16–256." },
        { name: "grid", type: "5 | 7", default: "5", description: "Cells across the face." },
        { name: "shape", type: `"square" | "round"`, default: `"square"`, description: "Square with a 2px radius, or clipped to a circle." },
        { name: "src", type: "string", description: "Optional image, faded in on top once it has loaded." },
        { name: "alt", type: "string", description: "Describes the image; used as the accessible name when label is not set." },
        { name: "label", type: "string", description: "Accessible name. Defaults to alt, then seed." },
        { name: "tone", type: `"auto" | "ink" | "brand"`, default: `"auto"`, description: "Ink cells, brand cells, or chosen from the seed between those and ink with one brand cell." },
        { name: "className", type: "string", description: "Merged onto the root." },
      ],
    },
    {
      title: "PixelAvatarGroup",
      props: [
        { name: "children", type: "ReactNode", description: "The avatars to stack." },
        { name: "max", type: "number", default: "4", description: "Avatars shown before the rest collapse into a +N tile, 1–99." },
        { name: "size", type: "number", description: "Size given to avatars that do not set their own. Also sizes the +N tile and the overlap." },
        { name: "label", type: "string", description: "Accessible name for the group." },
        { name: "className", type: "string", description: "Merged onto the root." },
      ],
    },
  ],
  notes: [
    "The face is a mirrored pattern from a small string hash, so server and client draw the same pixels and between 40 and 65 percent of the cells are filled.",
    "Each avatar is one image to assistive tech, named by label, alt or seed. The +N tile reads as, for example, 3 more.",
    "Cells switch on once in ordered-dither order when the avatar first appears; reduced motion shows the face at once.",
    "In a group, fine pointers spread the stack apart slightly on hover or focus within; touch and reduced motion keep it still.",
  ],
  related: ["pixel-image", "pixel-progress"],
}
