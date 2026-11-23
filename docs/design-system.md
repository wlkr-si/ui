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
| Radius | `radius-md` for controls, `radius-lg` for menus and popovers, `radius-xl` for cards and dialogs, `radius-full` for pills |
| Elevation | `shadow-raised`, `shadow-overlay`, `shadow-dialog` and `z-*` |
| Motion | `duration-{instant,fast,base,slow,slower}` and `ease-{out,in-out,spring}` |

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
8. Add the component to the System page's board when it belongs in the control family.

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
