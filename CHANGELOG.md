# Changelog

## 0.26.2 — 2026-11-23

- Button spacing follows one scale: side padding grows 8, 12, 14 and 24px across xs, sm, default and lg, and large buttons and their icon twins round to 8px. Large keeps 14px text and 16px icons. A leading icon trims the padding on its side.

## 0.26.1 — 2026-11-23

- The basics now use the page's own font instead of falling back to Arial in projects that don't expose `--font-sans`.
- Icon-only buttons keep their square size inside example frames.
- A pressed button scales as one piece, so its label and icon no longer move at different rates.
- Large buttons use 15px text and 18px icons, completing the 12, 13, 14, 15px scale.
- The install line is a framed box with plain text tabs for pnpm, npm, yarn and bun.
- The Button "As child" example links within the page instead of leaving it.

## 0.26.0 — 2026-11-23

- Component pages are rebuilt around examples. The top preview and every example sit in a framed Preview / Code switch, and a component can list focused examples, each in its own section with a sentence on when to use it and the exact code shown. Previous and next arrows sit beside the title, and long union types in the API table wrap between options instead of running off the page.
- Button now has six variants (default, secondary, outline, ghost, destructive, link) and four sizes (xs, sm, default, lg), each with a square icon twin (icon-xs, icon-sm, icon, icon-lg). Destructive is a soft red tint, loading keeps the variant's own colour, and disabled fades the real button. `solid` is now `default`, `quiet` is now `ghost` and `md` is now `default`.

## 0.25.0 — 2026-11-23

- Ten everyday basics ported from Bach Bench, taking the collection to 79: Button, Icon button, Segmented, Select, Input, Combobox, Chip, Menu, Card and Stat. A new Basics category comes first in the sidebar.

## 0.24.0 — 2026-11-20

- 20 new original components, taking the collection to 69: Pixel button, Pixel checkbox, Tag input, Pixel rating, Dial, Pixel calendar, Pixel canvas, Command menu, Crumbs, Pop menu, Hint, Dither dialog, Pixel spinner, Sparkline, Ring meter, Diff view, Split flap, Segment display, Binary rain and Pixel burst.

## 0.23.0 — 2026-11-20

- 28 new original components, taking the collection to 49: Scrub input, Code input, Pixel slider, Liquid switch, Dock, Scroll spy, Steps, Pager, File tree, Scroll progress, Toaster, Status dot, Pixel skeleton, Shimmer text, Countdown, Pixel bars, Heat grid, Pixel avatar, Secret field, Typewriter, Marker, Terminal, Compare, Pixel wave, Dither field, Pixel trail, Dissolve and Magnetic.
- The gallery is now a component library site. A persistent sidebar groups every component (Actions, Inputs, Navigation, Feedback, Data, Text, Media, Effects, System) with a filter and ⌘K; each component has its own page at `/components/<name>` with a live preview and replay, an install line in pnpm, npm, yarn or bun, usage, an API table, behaviour notes, source, related components and previous/next links. The home page leads with featured live demos and the full catalog.
- Each component page has its own title, description and share image, and the site publishes a sitemap. Old `/#name` links and root Pixels share links redirect to their new homes.
- One file per component (`registry/meta/<name>.ts`) is now the single source for its page, its sidebar entry and its registry item. `pnpm registry:build` regenerates `registry.json` and the site index from those files.
- Install lines use the registry URL, so they work in any shadcn project without configuring a namespace. `@wlkr/<name>` still works once the namespace is added.
- The page-per-component API replaces the hand-written tables in `docs/interface-components.md`.

## 0.22.0 — 2026-11-20

- Ten new original components, each in the registry and the gallery: Dot field, Pixel image, Dot matrix, Pixel progress, Liquid tabs, Ticker, Decode text, Rolling number, Hold action and Shortcut. The collection is now 21 originals plus typography and the theme (23 items).
- Gallery: the component index is grouped (pixels, motion, text, actions, display, system) and scrolls on short screens. The search hotkey is the new Shortcut component, shown as a live ⌘K / Ctrl K hint.
- Release script: the build receipt accepts any catalog of 15 or more registry files, so the larger registry can replace the earlier 15-file release. The exact catalog match and per-file hash checks are unchanged.
- New [interface component API](docs/interface-components.md).
- Next.js moves to the patched 16.4.6 release.
- Automated test scripts are removed. The release gate still builds the registry and site, lints, type-checks and confirms that generated files match what is committed.

## 0.21.0 — 2026-11-12

- The header, browser icons and social previews use the WLKR.SI Open Lens mark instead of the old six-cell mark. The header mark plays the same quick liquid hover bounce as wlkr.si.

## 0.20.0 — 2026-11-12

- Gallery: the WLKR loader shows the liquid loop by default, with Loop/Hover bounce playback, a Liquid switch, and Usage code that is a complete hover example for Hover bounce.
- Loader: clearing `frame` replays a hover bounce without a restart key, and a held frame always redraws, so switching from a running loop to a held pose never leaves the arc where the loop left it.
- README component table lists the liquid and bounce props.
- The closed rest pose renders as the plain vector mark, so small loaders and logos stay crisp; liquid pieces and the surface-tension filter appear only while the mark moves or holds a turned frame.

## 0.19.0 — 2026-11-12

- Quicker hovers: Hover bounce no longer passes through first. The arc kicks forward, bounces off the bowl at first contact and settles in about 350 ms. Hover once defaults to a 650 ms pass; Loop keeps 1,800 ms. Cycle duration now goes down to 300 ms.

## 0.18.0 — 2026-11-12

- Hover bounce: with liquid mode and `bounce`, the arc makes one full pass, keeps its speed into a second attempt, strikes the bowl at first contact, squashes in while the bowl jiggles, rebounds and settles into the symbol. The animation room adds Hover bounce playback.

## 0.17.0 — 2026-11-12

- Liquid Open Lens: with `cutThrough`, the bowl parts only where the arc passes, pinches its inner material into a floating drop and seals behind it with a damped ripple. Surface tension fuses nearby shapes so pieces neck, snap and reconnect.
- Animation room: Goo, Squish and Ripple controls replace the rigid opening-angle, open/close and split-gap controls. Older settings links keep their look and playback and take the liquid defaults.

## 0.15.2

- Follow the viewed gallery section with the sidebar indicator and `aria-current`, including native anchors, manual scrolling, filters and layout changes. Navigation updates keep focus and URLs unchanged.

## 0.15.1

- Remove repeated gallery hero and idle sidebar taglines.
- Give the collection action a 44px touch target.

## 0.15.0 — 2026-11-12

- Added Flat SVG for exact transparent 8/16/32 bitmap downloads, with unit rectangles and 16-pixel cells matching the released CLI.
- Theme resolves the current rendered opaque foreground into the file; explicit ink is retained. Export captures click-time artwork without changing ink, history or sharing.

Source release; live deployment is qualified separately. Projected SVG/PNG snapshots, grid downloads, registry, dependencies and released CLI contracts are unchanged.

## 0.14.0 — 2026-11-12

- Added an optional CSS disclosure using the existing CopyCommand control. It exports the selected opaque pair as normalized --foreground/--background variables without applying or adjusting colours.
- Pair changes reset copy feedback; denied clipboard access retains exact keyboard-focusable, selectable output.

Source release; live deployment is qualified separately. Preview, AA choices, sharing, registry, dependencies and released CLI contracts are unchanged.

## 0.13.0 — 2026-11-12

- Added a compact Examples popover with original Spark 8, Robot 16 and Orbit 32 editable masks. Choosing an example retains ink, replaces artwork in one Undo/Redo step and invalidates pending grid imports.
- Robot preserves the exact original portable-pixels grid; no network request is made when choosing examples.

Source release; live deployment is qualified separately. Registry, codec, exports and CLI contracts are unchanged.

## 0.12.0 — 2026-11-12

- Added a compact Transform disclosure for horizontal/vertical flips and clockwise 90° rotation on 8/16/32 masks. Each exact cell permutation keeps ink and size, uses the existing one-step Undo/Redo history and invalidates pending grid imports.

The package remains private; the GitHub source tag follows live acceptance. Registry, codec and CLI contracts are unchanged.

## 0.11.0 — 2026-11-12

- Added native Open grid for bounded local 8/16/32 UTF-8 dot/hash files, sharing the unchanged CLI parser. Valid imports retain ink and replace artwork in one undo step.
- Discarded stale reads after newer editor intents, file selections or unmount; malformed, cancelled and oversized files preserve artwork. No uploads, persistence or dependencies.

The package remains private; the GitHub source tag follows live acceptance. Registry items and CLI behavior are unchanged.

## 0.10.0 — 2026-11-11

- Added a dependency-free Node 24+ Contrast CLI reusing the browser math and optional deterministic AA text choices. JSON retains exact ratios and explicit threshold booleans; human output rounds display only.
- Added focused Use CLI instructions and agent discovery, with native command, threshold, malformed-input and suggestion tests in the release gate.

The package remains private; the GitHub source tag follows live acceptance. Browser behaviour and registry items are unchanged.

## 0.9.0 — 2026-11-11

- Added Download grid for the current Pixels mask, with exact dot/hash rows, one final newline and a size-based text filename accepted by the existing CLI. Ink remains separate in links and CLI flags.
- Linked Use CLI to usage instructions.
- Kept projected browser SVG/PNG snapshots and the canonical codec unchanged, with serialization and browser-download-to-CLI verification.

The package remains private; the GitHub source tag follows live acceptance. Registry items are unchanged.

## 0.8.0 — 2026-11-11

- Added a dependency-free Node 24+ Pixels CLI using the existing canonical mask codec, with bounded grid-file or token inputs and URL, JSON and flat-grid SVG output. Theme-relative URL/JSON ink remains null; SVG requires explicit ink.
- Added CLI source discovery on Pixels and in agent documentation, with file/process safety and geometry/colour tests included in the release gate.

The package remains private; the GitHub source tag follows live acceptance. Browser snapshot exports and registry items are unchanged.

## 0.7.0 — 2026-11-11

- Added primary-domain canonical, Open Graph and Twitter metadata for the gallery, Pixels and Contrast, with distinct static Geist previews.
- Extended release receipts to verify the gallery and all three preview images on both hosts while retaining compatibility with existing receipts.

The package remains private; the GitHub source tag follows live acceptance. Registry items are unchanged.


## 0.6.0 — 2026-11-11

- Added optional normal-text AA colour choices generated by bounded 5% RGB mixes toward black and white; the selected text colour changes only after Apply.

The package remains private; the GitHub source tag follows live acceptance. Registry items are unchanged.


## 0.5.0 — 2026-11-11

- Added /contrast, a focused opaque sRGB text/background pair checker with WCAG 2.2 AA/AAA outcomes, canonical colour-pair links, and copyable CSS.
- Added exact byte receipts for /contrast alongside /pixels on both hosts, without changing the 15 registry hashes; older receipts remain valid.

The package remains private; the GitHub source tag follows live acceptance. Registry items are unchanged.


## 0.4.0 — 2026-11-11

- Added `/pixels`, a focused drawing page reusing the gallery editor, artwork state, code and image exports. React code is available on request.
- Added gallery navigation and agent documentation for Pixels; new canonical links open the focused page while existing root v1/v2 links remain supported.
- Added exact focused-page verification on both release hosts with backward-compatible baseline and rollback receipts.

The package remains private; the GitHub source tag follows live acceptance. Registry items are unchanged.

## 0.3.0 — 2026-11-11

- Added practical 8×8, 16×16 and 32×32 masks with centred resize/crop, reversible size and ink changes, and a scrollable 1,024-cell detail editor with pointer Pan and one keyboard tab stop.
- Added approved ink choices and validated custom hex colour, isolated from editor controls, with a contrasting artwork backdrop and transparent image exports.
- Added bounded versioned links preserving size and explicit colour across display themes while keeping legacy v1 links unchanged.
- Generated React examples now reproduce the artwork and colour wrapper and are type-checked against the unchanged component API.
- Preserved immediate first-load anchor navigation and keyboard focus when undoing across grid sizes.

The package remains private; a GitHub source tag follows live acceptance. Registry contracts and the legacy installation namespace are unchanged.

## 0.2.0 — 2026-11-11

- Added an 8×8 pixel mask editor with pointer/keyboard drawing, erasing, bounded undo/redo, and reversible Clear/Reset.
- Kept anchor navigation immediate so shared artwork is stable before editing.
- Added explicit sharing through compact validated canonical mask URLs, clean recipient undo history, invalid-link feedback, and a selectable clipboard fallback.
- Added real transparent SVG/PNG snapshots of the rendered pixel frame and React examples containing the actual edited mask.
- Made command scrollers keyboard accessible and updated gallery family/navigation links to WLKR.SI.
- Added guarded static releases: exact source receipts and all 15 registry hashes checked on both gallery hosts, owned-failure rollback verification, local locking, and observed-conflict protection. The runbook documents Wrangler's non-atomic concurrency limitation.
- Patched vulnerable build-tool dependencies; the dated dependency audit documents remaining lower-severity findings.

Existing registry contracts, legacy installation namespace, attribution, and licenses are preserved. This private package version identifies a GitHub source/gallery release; it does not publish an npm package. Tags and deployment receipts are recorded only after live acceptance.
