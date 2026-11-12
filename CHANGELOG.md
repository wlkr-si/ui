# Changelog

## 0.2.0 — 2026-11-11

- Added an 8×8 pixel mask editor with pointer/keyboard drawing, erasing, bounded undo/redo, and reversible Clear/Reset.
- Added explicit sharing through compact validated canonical mask URLs, clean recipient undo history, invalid-link feedback, and a selectable clipboard fallback.
- Added real transparent SVG/PNG snapshots of the rendered pixel frame and React examples containing the actual edited mask.
- Made command scrollers keyboard accessible and updated gallery family/navigation links to WLKR.SI.
- Added guarded static releases: exact source receipts and all 15 registry hashes checked on both gallery hosts, owned-failure rollback verification, local locking, and observed-conflict protection. The runbook documents Wrangler's non-atomic concurrency limitation.
- Patched vulnerable build-tool dependencies; the dated dependency audit documents remaining lower-severity findings.

Existing registry contracts, legacy installation namespace, attribution, and licenses are preserved. This private package version identifies a GitHub source/gallery release; it does not publish an npm package. Tags and deployment receipts are recorded only after live acceptance.
