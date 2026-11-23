# The WLKR design system

How components stay on brand. Read this before building or changing any component.

## Where things live

| What | Where |
| --- | --- |
| Every token value | `lib/tokens.ts`, the only place values are written |
| Generated CSS | `registry/wlkr/tokens.css`, from `node scripts/tokens-build.mjs` (runs in `pnpm dev` and `pnpm registry:build`) |
| Installable tokens | the `theme` registry item, filled by the same script |
| The living reference | `/system` on the site, rendered from `lib/tokens.ts` |
| The model component | `registry/wlkr/button.tsx` with `registry/meta/button.ts` and `components/examples/button/` |

## Two layers

- **Primitives** are raw values with no meaning: `--wlkr-gray-600` is `#696969`. Components never use them.
- **Semantic tokens** name a role and point at a primitive per theme: `--wlkr-content-secondary` is gray-600 in light and gray-400 in dark.

Components use roles, so the theme switches without a single `dark:` rule. `.dark` on the root switches everything; `.wlkr-light` or `.wlkr-dark` forces one theme inside a panel.

## The roles

- **Surface:** `surface-page`, `surface-sunken`, `surface-raised` and `surface-overlay`. Pick by depth.
- **Content:** `content-primary`, `content-secondary`, `content-tertiary` and `content-inverse`. Pick by importance.
- **Border:** `border-subtle` (dividers), `border-default` (outlines) and `border-strong` (hovered or pressed outlines).
- **Fill:** `fill-subtle`, `fill-hover`, `fill-active` and `fill-secondary`. The first three are translucent washes that work on any surface. Use them for hover, pressed and selected states instead of a solid grey.
- **Action:** `action-primary`, `action-primary-hover` and `action-primary-ink`.
- **Brand and status:**
  - `brand` and `brand-ink`.
  - `focus-ring`.
  - `success`, `danger`, `danger-subtle`, `danger-subtle-hover` and `warning`.

## The scales

| Scale | Tokens |
| --- | --- |
| Controls | `control-h-{xs,sm,md,lg}` (24, 28, 32, 36px), with `control-px-*`, `control-text-*`, `control-icon-*` and `control-gap-*`. Every control (button, input, select, segmented, chip, combobox) uses this one scale, so equal sizes line up. Also `control-border`, `focus-width`, `focus-offset`, `press-scale` and `disabled-opacity`. |
| Space | `space-{0_5,1,1_5,2,2_5,3,4,5,6,8,10,12,16,20}`, a 4px grid |
| Type | `text-{2xs…5xl}`, `weight-{regular,medium,semibold}` and `font-mono` |
| Radius | `radius-md` for controls, `radius-lg` for overlays, `radius-xl` for cards and inline panels, `radius-full` for pills |
| Elevation | `shadow-raised`, `shadow-overlay`, `shadow-dialog` and `z-*` |
| Motion | `duration-{instant,fast,base,slow,slower}` and `ease-{out,in-out,spring}` |

## Surface pattern

Use `surface-raised`, a `control-border` hairline in `border-default`, `radius-xl` and `shadow-raised` for cards, tiles and other raised containers. Pad compact tiles with `space-4` and roomier panels with `space-5`.

Set titles in `text-md` with `weight-semibold` and captions in `text-xs` with `content-secondary`. Stat uses the title style for its label and the caption style for its optional note. Use `text-2xl` and tabular figures in `font-mono` for the value.

## Overlay pattern

Combobox, Menu, Popover, Tooltip and Dialog share these rules for floating panels.

- Use `surface-overlay`, a `border-default` hairline at `control-border` width, `shadow-overlay` and `radius-lg`.
- Give the panel `space-1` inner padding. Where it has options, use the matching control height and `radius-md` for each row. Use `fill-hover` for the active row and `content-primary` for selected text.
- Layer the panel at `z-overlay`. On open and close, transition opacity and a small translate or scale with `duration-base` and `ease-out`. Remove the transition and transform when reduced motion is requested.

## Building a component

1. Copy the shape of Button: one file at `registry/wlkr/<slug>.tsx` with its CSS in `const styles = \`...\``, class names prefixed `wlkr-<slug>`, and `<style href="wlkr-<slug>" precedence="default">`.
2. Use only `--wlkr-*` semantic and scale tokens. There are no fallbacks: the tokens install with the component.
3. Effects unique to the component (a glow's blur, a spinner's speed) go in its own knobs, named `--wlkr-<slug>-*` and declared at the top of the root rule. Those are the only place a literal value may appear.
4. Shared behaviour comes from tokens, not reinvention:
   - Focus: `outline: var(--wlkr-focus-width) solid var(--wlkr-focus-ring); outline-offset: var(--wlkr-focus-offset)`.
   - Press: `transform: scale(var(--wlkr-press-scale))`.
   - Disabled: `opacity: var(--wlkr-disabled-opacity)`.
   - Hover: put it inside `@media (hover: hover) and (pointer: fine)`.
   - Reduced motion: turn off transitions and transforms.
5. Text inherits the page font (`font-family: inherit`).
6. Make wrong use a type error where you can. For example, Button requires `aria-label` when its size is an icon size.
7. In the meta file:
   - Set `system: true`.
   - List `https://ui.wlkr.si/r/theme.json` in `registryDependencies`.
   - Write examples, one per variant, size and state, each with a sentence on when to use it.
8. Give it a board on /system: `components/system-boards/<slug>.tsx`, a default export showing every variant and size with its states in rows of `<div className="sys-board-row"><code>label</code><div>…</div></div>`. `pnpm registry:build` picks it up; never edit the System page itself for this.

## What the build enforces

`pnpm lint` runs `scripts/tokens-lint.mjs` on every component marked `system: true` and fails on any of these:

- Raw colours (hex, `rgb()`, `hsl()`, `oklch()`).
- Non-WLKR variables (`var(--foreground)`).
- Palette primitives, where a role should be used instead.
- Token fallbacks.
- Raw durations and easing.
- Pixel values over 2px.
- Font sizes that don't come from a token.
- A meta file missing the theme dependency or examples.

## Reviewing a new component

Compare it with `/system`, not with another library. Its sizes must sit on the control scale, its colours must be roles, and it must look at home beside Button on the board, in both light and dark. Other libraries are a sanity check on proportions, never the target.
