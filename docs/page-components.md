# Page components

Public source release `2935308d0e1a68df26bbba95a6cadcf38bf8719f` includes eleven original components plus typography and theme (13 items). Exact verification is tracked in [verification](verification.md).

## Install with the standard CLI

Configure `@wlkr` as `https://ui.wlkr.si/r/{name}.json`, then run:

```sh
pnpm dlx shadcn@latest add @wlkr/typography @wlkr/page-intro @wlkr/index-row @wlkr/text-link @wlkr/theme-toggle @wlkr/footer-controls @wlkr/pixel-object
```

The stock CLI rewrites imports to the consumer’s configured aliases and installs HoverCard, Toggle, ToggleGroup, and Tooltip directly from shadcn. Stock primitive source remains unchanged and is never republished as a WLKR item. For unpublished development only, direct local registry URLs may be used with a running local static preview.

## Typography and layout

`typography` is a registry style item containing `styles/wlkr-typography.css`. The CLI places it under the configured source tree (for example, `src/styles/wlkr-typography.css` in Astro). Import the actual printed path into the existing global stylesheet. If the two files share a directory:

```css
@import "./wlkr-typography.css";
```

The stylesheet adds opt-in classes, with the exact gallery font scale and layout values. It does not reset body styles, install another font, or replace theme tokens. The application supplies its existing licensed Geist font through its font variables.

| Class | Gallery contract |
| --- | --- |
| `wlkr-typography` | Existing Geist stack; legacy `--paper`, `--ink`, and `--line` bridge to background, foreground, and border. |
| `wlkr-layout` | 1512 px maximum, centered, 6.2% inline padding; 6% under 900 px. |
| `wlkr-display` | `clamp(64px, 8.3vw, 124px)`, .96 line height, weight 620, -.078em tracking; 68 px under 620 px. |
| `wlkr-intro-copy` | 16 px/1.6, supporting text token; 15 px under 900 px. |
| `wlkr-reading` | 14 px/1.75, maximum 70 characters wide. |
| `wlkr-caption` | 12 px/1.65, supporting text token. |
| `wlkr-stack` | Vertical flex stack with 24 px gap. |

For a legacy website, migrate text-color uses of `--muted` to `--muted-foreground`: shadcn’s `--muted` means a surface. Preserve existing sizes through component composition classes where a website’s established scale differs.

## APIs

### PageIntro

```tsx
<PageIntro
  title={"Useful things.\nThoughtfully built."}
  description="A clear starting point."
  as="h1"
  titleClassName="existing-site-title"
  duration={1100}
/>
```

Props: required `title: string`; optional React-node description, heading `as` (`h1`/`h2`), wrapper className, titleClassName, reveal (default true), and duration in ms (default 1100, clamped 400–3000).

The final heading is present in server HTML and accessibility APIs. Whole words preserve actual font shaping and measured width; a clipped binary overlay reveals into those fixed final positions. The screen reader receives only the final title. Reveal runs once when visible, ends immediately for reduced motion or a hidden document, and cleans up its observer/frame/listeners. `reveal={false}` restores final text immediately. Title styles have low specificity so titleClassName can preserve an established site scale.

### IndexRow

```tsx
<IndexRow number={7} title="Brand Studio" description="A clear identity." href="/projects/studio">
  In progress
</IndexRow>
```

A normal anchor accepts native anchor props plus required number/title and optional description/children/className. The number is normalized to exactly three digits. There is no trailing arrow. It occupies a fixed 3ch tabular slot and rolls through digit strips on hover **and keyboard focus**, landing on the real value. Reduced motion keeps the number static. The spoken number never changes. CSS animation has no timers or JavaScript frame loop; the title and native navigation remain available throughout.

### TextLink

```tsx
<TextLink href="/studio" preview={{ title: "Brand Studio", description: "Considered tools for a clear identity." }}>
  Explore the studio
</TextLink>
```

Native anchor props plus optional preview `{ title, description?, image?, imageAlt? }`. Without preview it remains a plain text link. With preview it composes the unchanged stock Radix HoverCard. The preview opens on hover or keyboard focus, Escape dismisses it, and Enter/click still navigate normally. Essential information stays in the link text/page; previews must be supplemental. The content has no outline or shadow, using a semantic popover surface only for legibility. Images remain native HTML to keep the source framework-independent.

### ThemeToggle

```tsx
<ThemeToggle showLabel />
```

Optional showLabel (false), className, storageKey (`wlkr-theme`). Uses the unchanged basic shadcn Toggle; no animated theme transition, menu, or new provider. It shares a small `use-display-theme` hook with FooterControls and follows system preference until an explicit light/dark choice is stored, applies `.dark` and color-scheme at document root, and listens to system, cross-window storage, and same-window toggle changes. An in-memory choice works if storage is blocked. The server renders stable readable markup; a consumer can retain its existing theme prepaint script with the same storage key.

## Morphing object

```tsx
<PixelObject pattern="wave" flickerAmount={.62} flickerSpeed={.32}
  morph={{ shapes: ["sphere", "cube", "torus"], duration: 8 }} />
```

See [motion API](motion-components.md) for the same-point continuous interpolation and lifecycle guarantees. Existing props/defaults, custom point clouds, and masks remain compatible.

## Attribution

The binary reveal references [shadcn.io Binary Text](https://www.shadcn.io/text/binary-text); code is independently authored. The rolling number interaction follows the familiar counting-number pattern, implemented with original bounded CSS digit strips. HoverCard and Toggle are installed directly from [shadcn/ui](https://ui.shadcn.com) and use [Radix](https://www.radix-ui.com). Typography comes from the existing WLKR gallery and licensed Geist, with no replacement design system.

## FooterControls

```tsx
<FooterControls agentHref="/agent/current-page.md" />
```

Required `agentHref: string`; optional className and storageKey (default `wlkr-theme`). It composes the unchanged stock ToggleGroup and Tooltip with three contiguous 24×24 px options: System, Light, and Dark. The theme capsule is 72×24 px with a subtle one-pixel neutral outline; the separate 24 px agent target follows an 8 px gap, making the complete control 104×24 px. Icons stay exactly 16×16 px. The selected state uses a quiet semantic tonal surface. This compact reference-specific outline intentionally replaces the earlier border-free 44 px treatment. Keyboard navigation and focus remain available. Stock tooltips show “System theme”, “Light theme”, “Dark theme”, and “View as agent” on hover and keyboard focus, without native title duplicates or a tooltip arrow. Stable classes control sizing/focus, and aria-checked controls selection styling so Tooltip data-slot/data-state cannot overwrite the appearance. A separate native anchor opens the actual app-owned agentHref in a new tab with `rel="noopener noreferrer"` and the accessible label “View as agent”. Supply a real Markdown/plain-text page; this component does not invent or run an AI agent. The gallery’s destination is generated `/llms.txt`, containing installation guidance, the component catalog, source JSON links, and documentation anchors.

FooterControls replaces the gallery header theme control. The basic ThemeToggle example remains and synchronizes with footer controls. System removes the stored preference so the existing `wlkr-theme` prepaint script follows the OS. Explicit selection, same-window events, cross-window storage, and OS changes stay synchronized. Read-only/quota-blocked storage uses an authoritative in-memory selection rather than reverting to stale readable storage. External storage events can intentionally replace that in-memory choice.

Both FooterControls and ThemeToggle registry items include the same small `hooks/use-display-theme.ts` source file. The CLI can skip the identical hook when the second component is installed; there is no unpublished registry dependency, local URL embedded in dependencies, provider, runtime package, or new service.

## Direct animation interaction

Animated PixelObject canvases are native unstyled buttons with stateful accessible names and aria-pressed. Click/tap or Enter/Space toggles pause; only keyboard focus draws a quiet outline. No visible Pause/Resume words or separate transport is rendered. Static objects remain ordinary images. The loader playground uses an external native button around a decorative mark; the reusable WlkrLoader stays a normal status/decorative symbol by default. Reduced-motion, visibility, hidden-document, and cleanup behavior remain intact.

### Footer reference icons

The four filled 16 px SVG paths reproduce the exact [Vercel](https://vercel.com) footer reference supplied by the user: retro computer, sun, moon/star, and browser-panel agent view. Their viewBox, path data, and fill/clip rules are preserved; reference classes, inline styles, and data-slot attributes are removed. The wrapper, shared theme behavior, registry composition, and tooltip integration are WLKR code. The icon geometry is attributed to the reference and is not claimed as original WLKR geometry. All pointer types keep the requested compact 24 px targets; there are no overlapping invisible hit areas or enlarged touch-only boxes.
