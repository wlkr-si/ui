## Design system

Before building or changing a component, read `docs/design-system.md`. Token values live only in `lib/tokens.ts`; components use `--wlkr-*` roles and scales, never raw colours, sizes or timings, and `pnpm lint` enforces it for every component marked `system: true`. Button is the model to copy. Review new work against `/system`, the live rendering of the tokens.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
