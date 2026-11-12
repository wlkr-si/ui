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

The gallery is available at **ui.wlkr.si**. The existing **ui.wlkrlabs.com** host and installation namespace remain available. The current source is [wlkr-si/ui](https://github.com/wlkr-si/ui). Dated release and consumer-installation evidence is kept in [verification](docs/verification.md); a source or documentation commit does not itself deploy the gallery.

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
