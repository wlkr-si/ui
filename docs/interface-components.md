# Interface components

The API for every component now lives on its own page, generated from the same file that builds the registry entry, so it cannot drift from the source:

- [All components](https://ui.wlkr.si/components)
- A single component: `https://ui.wlkr.si/components/<name>`, for example [Liquid tabs](https://ui.wlkr.si/components/liquid-tabs).

In the repository, each component is described in `registry/meta/<name>.ts` (name, group, description, usage, props, behaviour notes and dependencies). Run `pnpm registry:build` after changing one.

## Adding a component

1. `registry/wlkr/<name>.tsx` — the component. One self-contained file: styles inside it, token fallbacks, keyboard support, reduced motion.
2. `components/demos/<name>-demo.tsx` — the gallery demo, exporting `<PascalName>Demo`.
3. `registry/meta/<name>.ts` — the catalog entry (`ComponentMeta` in `lib/component-meta.ts`).
4. `pnpm registry:build` — regenerates `registry.json`, the site index (`lib/catalog-metas.ts`, `lib/catalog-demos.ts`) and the public registry files.

The page, sidebar entry, search, share image, sitemap entry and registry item all follow from those three files.
