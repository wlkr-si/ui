# wlkr/ui

React components for interfaces with a little more character: pixel objects, animated text, accessible actions and a public shadcn-compatible registry.

[Explore the components](https://ui.wlkr.si) · [Component API](docs/page-components.md) · [Motion API](docs/motion-components.md) · [Contribute](https://github.com/wlkr-si/.github/blob/main/CONTRIBUTING.md)

<a href="https://wlkr.si"><picture><source media="(prefers-color-scheme: dark)" srcset="https://wlkr.si/brand/part-of-wlkr-si-dark.svg"><img src="https://wlkr.si/brand/part-of-wlkr-si-light.svg" alt="Part of WLKR.SI" width="184" height="32"></picture></a>

## Try a component

In a React/TypeScript project configured for Tailwind and shadcn:

```sh
pnpm dlx shadcn@latest add https://ui.wlkrlabs.com/r/pixel-object.json
```

```tsx
import { PixelObject } from "@/components/wlkr/pixel-object"

<PixelObject label="A rotating pixel sphere" />
```

Use your project's configured import alias. Components are copied into your source; there is no WLKR runtime service or account. The collection contains eleven original components, optional typography and a light/dark theme. Original component code is MIT; brand assets and fonts have separate terms.

The gallery and focused tools use primary-domain canonical and social metadata with static, page-specific 1200×630 previews. Next.js renders these previews during the static build from the approved local mark and Geist font; no image service is called. The existing **ui.wlkrlabs.com** host remains available.

The gallery is available at **ui.wlkr.si**. The focused [contrast checker](https://ui.wlkr.si/contrast) previews opaque colour pairs, checks WCAG text thresholds, and shares pairs by URL. Optional AA text mixes never change the selected colour until applied. The existing **ui.wlkrlabs.com** host and installation namespace remain available. The current source is [wlkr-si/ui](https://github.com/wlkr-si/ui). Dated release and consumer-installation evidence is kept in [verification](docs/verification.md); a source or documentation commit does not itself deploy the gallery.

The private package is version 0.15.0. See [the changelog](CHANGELOG.md) for the gallery milestone; distribution remains GitHub source and the public registry, not an npm package.

## Pixels CLI

Pixels offers Flat SVG for the exact editable bitmap: transparent unit rectangles at 16 pixels per cell. Explicit ink stays exact; Theme freezes the current rendered opaque foreground in the file without changing the editor ink or share link. The existing SVG and PNG buttons still download projected preview snapshots; Download grid remains the strict editable text format. Source releases and live deployment receipts are qualified separately.

In the Pixels editor, Examples starts an editable Spark 8, Robot 16 or Orbit 32 mask. Selection keeps the ink and replaces the grid in one Undo/Redo step. The robot reproduces the [original portable-pixels grid](https://wlkr.si/media/portable-pixels/robot-16.txt); the other two masks are original geometric artwork. The live [release receipt](https://ui.wlkr.si/build-info.json) identifies the deployed source.

[Download the v0.12.0 CLI kit](https://github.com/wlkr-si/ui/releases/download/v0.12.0/wlkr-cli-v0.12.0.zip) for Node 24+ without Git or npm. Maintainers can [reproduce the minimal offline CLI kit](docs/cli-kit.md) from the pinned public release without packaging the gallery or installing dependencies.

Use Node 24 or newer from this source checkout; no dependency installation is needed:

```sh
node scripts/pixels.mjs --grid ./mask.txt
node scripts/pixels.mjs --grid ./mask.txt --ink '#33f282' --format svg
node scripts/pixels.mjs --mask v1.0000000000000000 --format json
node scripts/pixels.mjs --help
```

In the browser, **Transform** offers horizontal/vertical flips and clockwise 90° rotation for every supported size. Each operation keeps ink and size and is reversible with Undo/Redo.

In the browser, **Open grid** reads a user-selected UTF-8 text grid locally (at most 4 KiB), using the same format below. It replaces the grid in one undo step and keeps the chosen ink. Invalid or cancelled selections leave artwork unchanged; newer editor actions or file selections discard pending reads. Nothing is uploaded or stored.

In the browser, **Download grid** saves the current mask as `pixels-8x8.txt`, `pixels-16x16.txt` or `pixels-32x32.txt`. The file contains only exact dot/hash rows and one final LF newline. Pass it directly to `--grid`; ink stays in share links or an explicit `--ink` flag. Browser SVG/PNG actions continue to capture the projected preview.

Choose exactly one `--grid <file>` or `--mask <canonical-v1/v2-token>`. A grid has exactly 8, 16 or 32 square rows of `.`/`#`, with LF/CRLF, an optional UTF-8 BOM and one optional final newline. Spaces, comments and blank rows are rejected. `--ink` accepts six hex digits with optional `#`, normalizes case and overrides token ink.

`--format url` is the default and uses the same canonical Pixels URL as the browser. JSON contains `size`, exact `mask` rows, `ink`, `token` and `url`; URL/JSON preserve theme-relative `null` ink without an override. SVG requires explicit ink from the token or `--ink`. It is a **flat regular grid** of unit rectangles, with 16 display pixels per cell and a transparent background, separate from the gallery's projected/animated snapshot exports. CLI formats are URL, JSON and SVG; PNG remains a browser snapshot action.

The CLI makes no network requests, reads no credentials and writes no files; it prints to stdout for callers to use or redirect. Errors go to stderr without input paths or contents. Exit 0 means success; exit 1 means invalid arguments/input or a read failure. Grid files are bounded to 4 KiB before decoding and during reading. Directories, FIFOs, devices and final-component symlinks are refused; symlinked parent directories resolve normally. The file guard needs native nonblocking/no-follow flags and fails closed when unavailable. A stalled network filesystem has no promised deadline; keep inputs unchanged while converting. Dash-leading filenames can be prefixed with `./`.

With project dependencies already installed, `pnpm pixels --grid ./mask.txt` is a shortcut. `pnpm test:pixels-cli` runs temporary-file, native-process, malformed-input, no-network/no-write and SVG geometry/colour/codec checks. The same tests run in `pnpm release:check`. The registry/component API is unchanged.

The 13 CLI checks passed on Linux Node 24.22.3 and Node 26.8.2, and on macOS Node 26.5.0. A minimal fixture without installed dependencies also passed URL, JSON and SVG output checks with networking denied.

## Contrast CLI

The Contrast tool’s optional CSS disclosure exports the selected opaque pair as normalized six-digit --foreground and --background variables in a :root block. It copies the selected colours without adjusting them or claiming they pass a contrast threshold. Output stays keyboard-focusable and selectable if clipboard access fails. Source releases and live deployment receipts are qualified separately.

Use Node 24 or newer from this source checkout, without dependency installation. Foreground comes first, then background; hashes are optional:

```sh
node scripts/contrast.mjs 000000 ffffff
node scripts/contrast.mjs '#81737a' '#ffffff' --json
node scripts/contrast.mjs 777777 767676 --suggest --json
node scripts/contrast.mjs --help
```

Supply exactly two opaque six-digit sRGB hex colours. The CLI uses the unchanged browser math and AA text-option helper. JSON contains normalized `foreground`/`background`, the exact unrounded `ratio`, and explicit `normalText.AA`, `normalText.AAA`, `largeText.AA`, `largeText.AAA` booleans. Thresholds are 4.5/7 for normal text and 3/4.5 for large text. Human output rounds only displayed ratios to two decimals; pass decisions use the unrounded number, so a displayed 4.50 can still fail AA.

`--suggest` adds `aaTextOptions`, keeping the background fixed and returning the same deterministic options as the browser: 5% RGB mixes toward black or white, up to two passing choices per direction, plus current text once when it already passes. Options retain exact ratios and direction labels; duplicates are removed by the shared helper and every option meets unrounded 4.5:1 normal-text AA. Suggestions never change the selected input pair.

There are no network requests, credentials, file inputs or output files; output goes to stdout. Invalid, duplicate or unknown arguments produce a generic error without echoing input. Exit 0 means a valid result, including failing pairs; exit 1 means invalid arguments. With existing project dependencies installed, `pnpm contrast 000000 ffffff` is a shortcut. `pnpm test:contrast-cli` runs native no-network commands and exact shared-helper/threshold/suggestion checks, also included in `pnpm release:check`.

The seven CLI checks passed on Linux Node 24.22.3 and 26.8.2, and macOS Node 26.5.0, including real native commands with networking forbidden and no installed dependencies.

## AA text options

The optional chooser keeps the background fixed and evaluates text mixed toward black or white in 5% RGB steps, up to 20 steps per direction. It lists up to two distinct passing choices per direction, plus the current text when it already passes. Every listed choice meets the unrounded 4.5:1 normal-text threshold. Selecting a choice leaves the current pair unchanged until **Apply**.

## Develop and verify

```sh
pnpm install --frozen-lockfile
pnpm registry:build
pnpm lint
pnpm typecheck
pnpm build
pnpm start --port 3100
```

`pnpm build` rebuilds the registry before Next.js and exports the entire site to `out/`. `pnpm dev --port 3100` runs Next.js development mode. `pnpm start --port 3100` previews the exported assets through the local Cloudflare runtime; build first. The `public/r/` files and `public/registry.json` are generated and committed for static hosting. Rebuild whenever registry sources change. Source preview reads the same original files at build time; there is no component renderer or installer service.

Public pull requests and `main` pushes use the [public release-check workflow](docs/ci.md), with read-only contents permission, exact tool versions and an explicit public-repository gate. It runs the existing checks without deployment, Actions caches or artifact uploads. Local validation does not establish a hosted GitHub result.

## Install into another React project

Use a React/TypeScript app configured for Tailwind and shadcn. For a new consumer, run `pnpm dlx shadcn@latest init` in that app first. Merge this into **that app’s** `components.json`:

```json
{
  "registries": {
    "@wlkr": "https://ui.wlkrlabs.com/r/{name}.json"
  }
}
```

Install from the public registry:

```sh
pnpm dlx shadcn@latest add @wlkr/copy-command
pnpm dlx shadcn@latest add @wlkr/async-action
pnpm dlx shadcn@latest add @wlkr/filter-list
pnpm dlx shadcn@latest add @wlkr/pixel-object
pnpm dlx shadcn@latest add @wlkr/wlkr-loader
pnpm dlx shadcn@latest add @wlkr/page-intro @wlkr/index-row @wlkr/text-link
pnpm dlx shadcn@latest add @wlkr/theme-toggle @wlkr/footer-controls @wlkr/github-star
pnpm dlx shadcn@latest add @wlkr/typography
# Optional; review and merge any existing theme tokens before applying.
pnpm dlx shadcn@latest add @wlkr/theme
```

For local acceptance use `http://localhost:3100/r/{name}.json` instead. Direct URLs also work: `pnpm dlx shadcn@latest add http://localhost:3100/r/copy-command.json`.

Original source lands in your configured components directory under `wlkr/`. The CLI resolves your aliases and installs npm and official shadcn dependencies. Import using your own alias:

```tsx
import { CopyCommand } from "@/components/wlkr/copy-command"
import { AsyncAction } from "@/components/wlkr/async-action"
import { FilterList } from "@/components/wlkr/filter-list"
import { PixelObject } from "@/components/wlkr/pixel-object"

<CopyCommand command="pnpm build" />
<AsyncAction action={async () => {
  const response = await fetch("/api/settings", { method: "POST" })
  if (!response.ok) throw new Error("Save failed")
}}>Save changes</AsyncAction>
<FilterList label="Search projects" items={[
  { id: "studio", label: "Brand Studio", description: "Design assets", keywords: ["identity"] },
]} />
<PixelObject label="Pixel sphere" />
```

The [WLKR.SI website](https://wlkr.si) uses Astro and this registry. Other Astro projects can use the official `@astrojs/react` integration, compatible Tailwind/shadcn setup, and interactive React islands (for example `<CopyCommand client:load command="pnpm build" />` in an `.astro` page). Apply the registry setup in the separate website checkout and verify its React islands before publishing. Review generated files, existing token conflicts, and imports before committing. No runtime component package, custom installer, renderer, or additional MCP server is required.

## Collection and behavior

| Item | Purpose | API |
| --- | --- | --- |
| `copy-command` | Fixed copy icon slot with animated green check/red X and hidden announcements | `command: string`, optional `className` |
| `async-action` | One promise at a time, accessible pending/success/error, retry on next click | `action: () => Promise<unknown>`, `children`, optional `pendingLabel`, `successLabel`, `failureLabel` (visible), `errorLabel` (announcement), `disabled` |
| `filter-list` | Search labels, descriptions and keywords; case/accent insensitive multiword match, live count, clear and empty feedback | `items: { id, label, description?, keywords? }[]`, optional `label`, `placeholder` |
| `pixel-object` | Project a rotating sphere, normalized 3D point cloud, or #/space mask into an SVG pixel grid | optional `points: PixelPoint[]`, `mask: string[]`, `resolution`, `size`, `label`, `rotating`, `className`; exported `spherePoints(count?)` |
| `wlkr-loader` | Original six-cell WLKR mark with bars/dots beats, fixed SVG bounds, and a single loading announcement | `variant`, `size`, `duration`, `stagger`, `label`, `decorative`, `paused`, `className` |
| `theme` | Semantic light/dark tokens; app-controlled typography | Apply `.dark` to document root for dark mode |

The public collection has eleven original components, typography styles, and the theme (13 items). See [page component contracts](docs/page-components.md) for page additions and the morph API. See [the motion component API](docs/motion-components.md) for controls, presets, timing, and input precedence. Their interaction styles travel with their source; no site-only stylesheet is required.

Clipboard requires a secure context (HTTPS or localhost). On failure the selectable command remains available. Async actions require rejected promises for failures: throw when a fetch response is not OK. The preview’s “Simulate a failed save” switch exercises retry. Filter item IDs must be unique; results preserve input ordering.

Animation pause controls live directly on the pixel canvas and loader playground mark: click, tap, Enter, or Space toggles pause without a separate transport. Real WlkrLoader status/decorative usage stays noninteractive by default. FooterControls uses the compact 104×24 px reference layout, exact reference SVG paths, stock hover/focus tooltips, system/light/dark, and a real app-owned plain-text destination; the gallery generates `/llms.txt`.

Copy feedback stays in the same 44 px icon slot; screen-reader status remains off-screen. Failure leaves the command selectable. Async labels share one grid slot sized to the widest concise state, so the control does not resize. Its pending label remains fully readable under a slowly moving pixel mask. The failure label stays concise while `errorLabel` announces the reason without another visible line. Success uses `--success` (`#087d3d` on white, `#33f282` in dark mode), with local fallbacks when the optional theme is absent.

Filter inputs use the browser’s native text editing and a short focus marker by the search icon. Native `caret-shape: block` is enabled where supported; other browsers retain their native caret. Selection, IME, touch editing, and browser caret behavior remain native.

`PixelObject` accepts `points` with x/y/z coordinates normalized to [-1, 1], or a flat `mask` array where `#` means filled and spaces/dots mean empty. `mask` takes precedence over `points`. Set `rotating={false}` for static logos, symbols, or masks. The default sphere uses `spherePoints(420)`; you can supply another point cloud. Point clouds are capped at 2,000 points; mask rows and columns at 80, legacy resolution at 8–80, and display size at 64–1,000 px. Explicit `dotSize`/`gap` derive density from their pixel pitch instead of resolution; see the motion API for details. Give every object a meaningful `label`.

Rotation pauses off-screen and in hidden browser tabs. Click/tap or Enter/Space on the animation toggles pause without a separate transport. Reduced-motion preferences keep the object static and disable copy/text animation. Pending pixel motion is a 2.8-second, low-amplitude reconstruction; it has no hard flashing. The object rotates slowly (about 42 seconds per revolution), sampled around 12 fps. Effects clean up animation frames and observers on unmount. The interaction reference is [Magic UI’s flickering grid](https://magicui.design/docs/components/flickering-grid); the text mask and object projection here are original WLKR implementations.

The site uses installed, unchanged stock `Button`, `Input`, `Switch`, `Tabs`, `Slider`, `Command`, `Popover`, `Collapsible`, `Field`, `HoverCard`, `Toggle`, `ToggleGroup`, and `Tooltip` (plus their upstream helper components). Those files are **not** registry entries. Original components declare stock dependencies by official shadcn item name; consumers receive them directly from upstream. The site presentation layer removes visual chrome without altering upstream source. Installed components inherit the consumer’s stock primitives and local styling, so appearance can differ from this showcase. WLKR theme changes tokens, not stock source or font imports.

## Gallery controls and source panels

[Pixels](https://ui.wlkr.si/pixels) is the focused drawing page, with the same editor, state, codec and export implementation as the gallery. React code opens only when requested; studio navigation and display controls remain available. New Share links point to `/pixels`; existing root v1/v2 links still restore the same artwork. The static release receipt hashes `/pixels` and checks it on both hosts, with a scoped no-transform response directive; older baseline/rollback receipts remain explicitly registry-only.

The Pixel object playground offers 8×8, 16×16 and 32×32 masks with theme-relative or explicit six-digit hex ink. Grid changes centre the artwork; shrinking crops it. Undo/redo tracks 32 strokes or artwork edits and restores cropped pixels, size and ink together. Clear keeps the current size and ink; Reset returns to the original 8×8 theme-relative starter and is undoable. Switching to Object preserves mask state and the existing object settings.

Large grids use a scrollable detail view with at least 24px cells. Draw, Erase and Pan work with pointers; arrow keys reveal focused cells, Home/End move within a row, and Control/Command Home/End reach the grid ends. There is one grid tab stop even for 1,024 cells. Keyboard Undo preserves grid focus across size changes. Anchor navigation and focus reveal are immediate, including on first load.

Ink controls remain in the page theme. Only the editable artwork and rendered preview receive chosen ink, with a contrasting view backdrop. SVG/PNG exports retain transparency and the exact rendered colour; the backdrop is excluded. The Usage panel copies a React example with the actual mask, adequate projection resolution and a typed colour/backdrop wrapper when needed. Larger masks use resolution 19 or 38 so the unchanged PixelObject projection does not merge distinct edited cells.

Share explicitly copies a canonical URL. Legacy `v1` links remain unchanged: 8×8 and theme-relative. Bounded `v2` links carry size, explicit RGB ink (or Theme), and exact bitmap data. Explicit colours survive recipient display-theme changes; Theme intentionally follows the recipient. Tokens are at most 269 characters and query parsing is capped at 2,048 characters. Invalid or ambiguous links show feedback and valid recipients start with clean undo history. Clipboard failure leaves a selectable URL; unrelated query parameters are excluded and edits never copy or update a URL automatically. Artwork is not saved through a backend or browser storage. The public `PixelObject.mask` contract and registry item are unchanged.

All gallery choice controls use the approved Soft combobox, composed from unchanged stock Command and Radix Popover. Its rounded rectangular popup shares `--control-surface` with the code panels: `#fafafa` in light mode and `#090909` in dark mode. Search, keyboard selection, empty states, and focus return stay accessible. These gallery controls are not additional registry items.

Source panels provide line numbers, exact raw-text copy, and wrapping. Static syntax highlighting runs at build time with Shiki; the client receives highlighted markup without a highlighter engine. Dynamic examples remain readable plain code as their values change. Stock Collapsible powers quiet disclosure motion and respects reduced motion. The archived `/prototypes/controls` comparison route is marked `noindex, nofollow`.

## Design

Paper white `#ffffff`, ink `#010101`, neutral secondary text, and WLKR green `#33f282`. Oversized Geist typography anchors a quiet editorial layout. Open specimens replace bordered cards. Focus indicators remain explicit; motion respects reduced-motion preferences. Theme is selected from system preferences on first load, then persists an explicit selection when storage is available. Light and dark semantic values live in `app/globals.css`; registry theme tokens must stay synchronized.

## Attribution and licenses

- Official starter and stock component source: [shadcn/ui](https://ui.shadcn.com), MIT. Stock files were installed with CLI 4.22.1 and remain unchanged.
- Accessible primitives: [Radix UI](https://www.radix-ui.com), MIT.
- Icons: [Lucide](https://lucide.dev), ISC.
- Typeface: [Geist](https://vercel.com/font), SIL Open Font License, bundled with `public/fonts/OFL.txt`.
- WLKR’s existing mark, favicon, and licensed Geist font are reused from the WLKR Labs brand masters. Branding remains WLKR Labs property; no rights to its marks are granted by the source license.
- Original component code: MIT, see `LICENSE`.

The public site runs on its own Cloudflare static Worker, `wlkr-ui`, at `ui.wlkrlabs.com`. The main website and its Worker remain unchanged. See [release verification](docs/verification.md) for the exact published source revision and acceptance evidence. Source is published in the public [wlkr-si/ui repository](https://github.com/wlkr-si/ui).

## Static Cloudflare release

See [the deployment runbook](docs/deployment.md). `pnpm deploy:check` builds and validates the upload without publishing. `pnpm run deploy` requires a clean committed checkout, rebuilds and checks it, then activates the separate `wlkr-ui` static Worker and verifies the exact receipt plus all registry hashes on both gallery hosts. Failed releases restore and verify the previous version when deployment ownership is certain; observed conflicts stop further writes. See the runbook for the local lock and non-atomic provider concurrency limitation. `pnpm test:release` tests the release flow without network or authentication. The main `wlkrlabs-com` Worker and apex/`www` routes are outside this configuration.

## GitHub star

`GithubStar` links to a repository with a count supplied by the application. It does not fetch or mutate GitHub stars. Rolling tabular digits, a bottom-up WLKR-green fill, and twelve bounded particles replay on hover/focus after the initial visible reveal; reduced motion renders the final count and star. Pass `count={null}` when the count is unavailable. See [API and attribution](docs/github-star.md). Published source: `5d31d9d4c70c20700ff08c3ac140b6496eae0d6d`.

## Upstream provenance

Created from the official [shadcn registry starter](https://github.com/shadcn-ui/registry-template) at commit `906f859db0125965cba71c51da1707c0a4c6d045`. The full upstream history and attribution remain in Git. Project-specific licensing and the terms above apply.
