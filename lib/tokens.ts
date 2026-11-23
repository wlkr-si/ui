/** The WLKR design tokens: the single source for every colour, size, space, shadow and motion value.
 *
 *  Two layers:
 *  - Primitives are raw values with no meaning (`gray-600` is #696969). Components never use them directly.
 *  - Semantic tokens name a role (`content-secondary`) and point at a primitive per theme.
 *
 *  `scripts/tokens-build.mjs` turns this file into `registry/wlkr/tokens.css` (used by the site) and the `theme`
 *  registry item (installed into other projects). The /system page renders it. Change values here, nowhere else. */

export type Themed = { light: string; dark: string }
export type Token = { name: string; value: string | Themed; role?: string }
export type Ramp = { name: string; steps: [step: string, hex: string][] }

/* ---------- Primitives ---------- */

export const ramps: Ramp[] = [
  { name: "gray", steps: [
    ["0", "#ffffff"], ["25", "#f7f7f7"], ["50", "#fafafa"], ["100", "#f3f3f3"], ["150", "#ebebeb"], ["200", "#dedede"], ["300", "#c4c4c4"],
    ["400", "#a0a0a0"], ["500", "#8a8a8a"], ["600", "#696969"], ["700", "#4d4d4d"], ["800", "#343434"], ["850", "#262626"],
    ["900", "#191919"], ["925", "#141414"], ["950", "#0a0a0a"], ["1000", "#010101"],
  ] },
  { name: "green", steps: [
    ["50", "#ecfdf3"], ["100", "#d1fadf"], ["200", "#a6f4c5"], ["300", "#83dba7"], ["400", "#33f282"], ["500", "#12c464"],
    ["600", "#0a9e4e"], ["700", "#087d3d"], ["800", "#075e2f"], ["900", "#053f20"],
  ] },
  { name: "red", steps: [
    ["50", "#fef3f2"], ["100", "#fee4e2"], ["200", "#fecdca"], ["300", "#ff938a"], ["400", "#f97066"], ["500", "#f04438"],
    ["600", "#d92d20"], ["700", "#b42318"], ["800", "#912018"], ["900", "#7a271a"],
  ] },
  { name: "amber", steps: [
    ["50", "#fffaeb"], ["100", "#fef0c7"], ["200", "#fedf89"], ["300", "#fec84b"], ["400", "#fdb022"], ["500", "#f79009"],
    ["600", "#dc6803"], ["700", "#b54708"], ["800", "#93370d"], ["900", "#7a2e0e"],
  ] },
]

/** The moving rim on glow buttons and other once-per-screen accents. */
export const spectrum = "linear-gradient(90deg,#ff6d1b,#ffee55,#5bff89,#4d8aff,#6b5fff,#ff64f9,#ff6565,#ff6d1b)"

const c = (ramp: string, step: string) => `var(--wlkr-${ramp}-${step})`
const mix = (token: string, percent: number) => `color-mix(in srgb, var(--wlkr-${token}) ${percent}%, transparent)`

export type Group = { id: string; title: string; description: string; tokens: Token[] }

/* ---------- Semantic colour ---------- */

export const colour: Group[] = [
  { id: "surface", title: "Surface", description: "What things sit on. Pick by depth, never by colour.", tokens: [
    { name: "surface-page", value: { light: c("gray", "0"), dark: c("gray", "1000") }, role: "The page canvas." },
    { name: "surface-sunken", value: { light: c("gray", "50"), dark: c("gray", "950") }, role: "Wells, code blocks and preview stages set into the page." },
    { name: "surface-raised", value: { light: c("gray", "0"), dark: c("gray", "950") }, role: "Cards and panels that sit on the page." },
    { name: "surface-overlay", value: { light: c("gray", "0"), dark: c("gray", "925") }, role: "Menus, popovers and dialogs floating above everything." },
  ] },
  { id: "content", title: "Content", description: "Text and icons, by importance.", tokens: [
    { name: "content-primary", value: { light: c("gray", "1000"), dark: c("gray", "25") }, role: "Headings, body text, labels and icons." },
    { name: "content-secondary", value: { light: c("gray", "600"), dark: c("gray", "400") }, role: "Descriptions and supporting text." },
    { name: "content-tertiary", value: { light: c("gray", "500"), dark: c("gray", "600") }, role: "Placeholders, hints and the least important metadata." },
    { name: "content-inverse", value: { light: c("gray", "0"), dark: c("gray", "1000") }, role: "Text on a primary action fill." },
  ] },
  { id: "border", title: "Border", description: "Hairlines that separate and outline.", tokens: [
    { name: "border-subtle", value: { light: c("gray", "150"), dark: c("gray", "900") }, role: "Dividers inside a surface." },
    { name: "border-default", value: { light: c("gray", "200"), dark: c("gray", "800") }, role: "Control and card outlines." },
    { name: "border-strong", value: { light: c("gray", "300"), dark: c("gray", "700") }, role: "Hovered or pressed outlines." },
  ] },
  { id: "fill", title: "Fill", description: "Washes over any surface. They tint whatever is underneath, so they work on the page, a card or a menu alike.", tokens: [
    { name: "fill-subtle", value: mix("content-primary", 4), role: "The quietest wash, for resting toggles and striped rows." },
    { name: "fill-hover", value: mix("content-primary", 7), role: "Hover on ghost and outline controls, menu rows and list items." },
    { name: "fill-active", value: mix("content-primary", 11), role: "Pressed and selected rows." },
    { name: "fill-secondary", value: { light: c("gray", "100"), dark: c("gray", "900") }, role: "Solid soft fill for secondary actions." },
  ] },
  { id: "action", title: "Action", description: "The one thing to do.", tokens: [
    { name: "action-primary", value: { light: c("gray", "1000"), dark: c("gray", "25") }, role: "Fill of the primary action." },
    { name: "action-primary-hover", value: { light: c("gray", "800"), dark: c("gray", "200") }, role: "Primary action under the pointer." },
    { name: "action-primary-ink", value: { light: c("gray", "0"), dark: c("gray", "1000") }, role: "Text and icons on the primary action." },
  ] },
  { id: "status", title: "Brand and status", description: "Meaningful colour. Use it for what it says, not for decoration.", tokens: [
    { name: "brand", value: c("green", "400"), role: "The WLKR green: selection, live dots, the one accent." },
    { name: "brand-ink", value: c("gray", "1000"), role: "Text on the brand green." },
    { name: "focus-ring", value: { light: c("green", "700"), dark: c("green", "400") }, role: "Keyboard focus outlines. Dark green in light mode to keep 3:1 contrast." },
    { name: "success", value: { light: c("green", "700"), dark: c("green", "400") }, role: "Saved, copied, passed." },
    { name: "danger", value: { light: c("red", "700"), dark: c("red", "300") }, role: "Delete, errors and invalid input." },
    { name: "danger-subtle", value: mix("danger", 12), role: "The soft red wash behind destructive actions." },
    { name: "danger-subtle-hover", value: mix("danger", 18), role: "That wash under the pointer." },
    { name: "warning", value: { light: c("amber", "700"), dark: c("amber", "300") }, role: "Needs attention, but nothing is broken." },
  ] },
]

/* ---------- Scales ---------- */

export const space: Token[] = [
  ["0.5", "2px"], ["1", "4px"], ["1.5", "6px"], ["2", "8px"], ["2.5", "10px"], ["3", "12px"], ["4", "16px"],
  ["5", "20px"], ["6", "24px"], ["8", "32px"], ["10", "40px"], ["12", "48px"], ["16", "64px"], ["20", "80px"],
].map(([step, value]) => ({ name: `space-${step.replace(".", "_")}`, value }))

export const radius: Token[] = [
  { name: "radius-xs", value: "4px", role: "Tags and tiny marks." },
  { name: "radius-sm", value: "5px", role: "Extra small controls." },
  { name: "radius-md", value: "6px", role: "Every control: buttons, inputs, selects, tabs." },
  { name: "radius-lg", value: "8px", role: "Menus, popovers and tooltips." },
  { name: "radius-xl", value: "12px", role: "Cards, panels, dialogs and preview frames." },
  { name: "radius-full", value: "999px", role: "Pills, chips, avatars and round icon buttons." },
]

export const type: Token[] = [
  { name: "text-2xs", value: "11px", role: "Eyebrows and dense metadata." },
  { name: "text-xs", value: "12px", role: "Captions, table headers, extra small controls." },
  { name: "text-sm", value: "13px", role: "Small controls and compact UI." },
  { name: "text-md", value: "14px", role: "Default UI text and controls." },
  { name: "text-lg", value: "16px", role: "Reading text and section intros." },
  { name: "text-xl", value: "20px", role: "Card and dialog titles." },
  { name: "text-2xl", value: "24px", role: "Section headings." },
  { name: "text-3xl", value: "32px", role: "Page titles on dense screens." },
  { name: "text-4xl", value: "48px", role: "Page titles." },
  { name: "text-5xl", value: "64px", role: "Display." },
  { name: "weight-regular", value: "400" },
  { name: "weight-medium", value: "500", role: "Controls and labels." },
  { name: "weight-semibold", value: "600", role: "Headings." },
  { name: "font-mono", value: "ui-monospace, SFMono-Regular, Menlo, monospace", role: "Numbers, code and readouts." },
]

/** One scale shared by every control (button, input, select, segmented, chip, combobox) so they line up. */
export const control: Token[] = [
  { name: "control-h-xs", value: "24px" }, { name: "control-h-sm", value: "28px" }, { name: "control-h-md", value: "32px" }, { name: "control-h-lg", value: "36px" },
  { name: "control-px-xs", value: "8px" }, { name: "control-px-sm", value: "10px" }, { name: "control-px-md", value: "12px" }, { name: "control-px-lg", value: "12px" },
  { name: "control-text-xs", value: "12px" }, { name: "control-text-sm", value: "13px" }, { name: "control-text-md", value: "14px" }, { name: "control-text-lg", value: "14px" },
  { name: "control-icon-xs", value: "12px" }, { name: "control-icon-sm", value: "14px" }, { name: "control-icon-md", value: "16px" }, { name: "control-icon-lg", value: "16px" },
  { name: "control-gap-xs", value: "4px" }, { name: "control-gap-sm", value: "5px" }, { name: "control-gap-md", value: "6px" }, { name: "control-gap-lg", value: "8px" },
  { name: "control-border", value: "1px", role: "Hairline width on every outlined control and surface." },
  { name: "focus-width", value: "2px" }, { name: "focus-offset", value: "2px" },
  { name: "press-scale", value: ".97", role: "How far a control shrinks while pressed." },
  { name: "disabled-opacity", value: ".5" },
]

export const elevation: Token[] = [
  { name: "shadow-raised", value: { light: "0 1px 2px rgb(0 0 0 / 5%)", dark: "0 1px 2px rgb(0 0 0 / 40%)" }, role: "Cards that lift slightly off the page." },
  { name: "shadow-overlay", value: { light: "0 8px 24px rgb(0 0 0 / 8%), 0 2px 6px rgb(0 0 0 / 4%)", dark: "0 16px 40px rgb(0 0 0 / 55%)" }, role: "Menus, popovers and tooltips." },
  { name: "shadow-dialog", value: { light: "0 24px 64px rgb(0 0 0 / 14%)", dark: "0 24px 64px rgb(0 0 0 / 65%)" }, role: "Dialogs and sheets." },
  { name: "z-raised", value: "10" }, { name: "z-sticky", value: "20" }, { name: "z-overlay", value: "30" }, { name: "z-modal", value: "40" }, { name: "z-toast", value: "50" },
]

export const motion: Token[] = [
  { name: "duration-instant", value: "90ms", role: "Colour changes and stepped ticks." },
  { name: "duration-fast", value: "120ms", role: "Hover, press and focus." },
  { name: "duration-base", value: "180ms", role: "Menus, popovers and small reveals." },
  { name: "duration-slow", value: "260ms", role: "Panels, dialogs and the leading edge of liquid motion." },
  { name: "duration-slower", value: "460ms", role: "The trailing edge of liquid motion." },
  { name: "ease-out", value: "cubic-bezier(.23, 1, .32, 1)", role: "Things arriving or responding: the default." },
  { name: "ease-in-out", value: "cubic-bezier(.5, 0, .2, 1)", role: "Things moving from one place to another." },
  { name: "ease-spring", value: "cubic-bezier(.3, 1.3, .5, 1)", role: "A small overshoot, for playful snaps." },
]

/** Everything with a single value, for the generator. */
export const flat: Token[] = [
  ...space, ...radius, ...type, ...control, ...elevation, ...motion,
  { name: "spectrum", value: spectrum },
  { name: "color-scheme", value: { light: "light", dark: "dark" }, role: "The browser theme for native controls and pickers." },
]

/** shadcn/ui's own names, kept so stock shadcn components installed beside WLKR ones theme with them. */
export const shadcnAliases: Record<string, string> = {
  background: "surface-page", foreground: "content-primary",
  card: "surface-raised", "card-foreground": "content-primary",
  popover: "surface-overlay", "popover-foreground": "content-primary",
  primary: "action-primary", "primary-foreground": "action-primary-ink",
  secondary: "fill-secondary", "secondary-foreground": "content-primary",
  muted: "fill-secondary", "muted-foreground": "content-secondary",
  accent: "fill-secondary", "accent-foreground": "content-primary",
  destructive: "danger", border: "border-default", input: "border-default", ring: "focus-ring",
  brand: "brand", "brand-foreground": "brand-ink", success: "success", warning: "warning",
  "control-surface": "surface-sunken",
}
