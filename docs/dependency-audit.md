# Dependency maintenance — November 11, 2026

Targeted transitive updates retain Next 16.4.2, React 19.3.1, the existing shadcn CLI, component APIs, stock component files, and registry sources.

The production dependency audit now reports zero advisories (177 dependency/optional entries). `source-map-js` resolves to 1.2.2 and `@babel/core` to 7.29.13, which is within its existing compatible range and above the official patched 7.29.6 release. References: [source-map-js advisory](https://github.com/advisories/GHSA-68fv-2mgg-jv7q), [Babel advisory](https://github.com/advisories/GHSA-4x5r-pxfx-6jf8).

The full audit, including development and optional dependencies (824 entries), reports zero critical/high advisories, one moderate and one low. Compatible transitive updates address affected tar, brace expansion, glob matching, YAML, PostCSS, Nano ID, Zod, Flatted, AJV and related tooling packages. Two scoped overrides replace Miniflare's exact vulnerable pins with `sharp` 0.35.5 and `undici` 7.30.1. Next already accepts Sharp ^0.35.5; no Next range exception is needed.

The native Sharp instances resolved by both Next and Miniflare report Sharp 0.35.5 and librsvg 2.63.2. Both decoded the actual canonical badge SVG, resized it to 92×16, encoded an 882-byte PNG with the proper signature, and read its dimensions back. The gallery uses `images.unoptimized: true` and static export; there is no deployed Next image-optimization server. These audits concern source/build tooling and do not demonstrate a live exploit.

Remaining advisories:

- **Moderate:** [minimatch globparts amplification](https://github.com/advisories/GHSA-g3hv-75wg-m249), 10.2.6 through TypeScript ESLint's `typescript-estree` and shadcn's `ts-morph` tooling. The advisory's fixed version is 11.0.1, outside the current major constraints; a broad major override was deliberately not applied.
- **Low:** [deepmerge prototype poisoning](https://github.com/advisories/GHSA-gcqx-w48m-w2h4), 4.3.1 through shadcn and `@shadcn/registry`. The audit lists >=4.3.2 as patched, but the npm registry returned `ERR_PNPM_NO_MATCHING_VERSION` for 4.3.2 and identifies 4.3.1 as latest. The unavailable override was removed.

Checks: `pnpm install --frozen-lockfile`, `pnpm audit --prod --json`, `pnpm audit --json`, native Sharp SVG→PNG checks, and `pnpm release:check`. The full audit exits nonzero for the two remaining lower-severity findings; production audit is clean. Generated registry artifacts must remain unchanged after rebuilding. Audit results are dated observations of the installed checkout.
