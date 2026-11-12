# Production gallery previews

Unmodified Chrome for Testing captures of the live [Pixel object gallery section](https://ui.wlkr.si/#pixel-object). These show the real default component preview and controls, not a mock or a repository popularity claim.

- Production receipt: [build-info.json](https://ui.wlkr.si/build-info.json), `sourceCommit: 3f25f72b7a1aea813f96b5b46fb3323fe237a507`, verified before capture.
- Deployed source: [3f25f72b7a1aea813f96b5b46fb3323fe237a507](https://github.com/wlkr-si/ui/commit/3f25f72b7a1aea813f96b5b46fb3323fe237a507). This identifies a commit; no release tag is inferred.
- Worker version: `12fa6682-c464-4ecd-8e47-c199d803d8de`; deployment: `2f587277-c9c6-4e20-bebd-3e11a0fa790a`.
- Viewport and PNG dimensions: 1280 × 900 pixels. `document.fonts.ready` resolved with `loaded` before both captures.
- System light/dark appearance and reduced motion were requested. The search was empty, the native sidebar link opened `#pixel-object`, and the default Object preview, exports and closed Customize controls were retained.
- No crop, resize, composition, artificial layout, DOM content edit or image transformation was applied. Qualification covers this Chrome capture and these settings; it is not a promise about other browsers.

| File | Captured UTC | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| `gallery-light.png` | 2026-11-12T09:54:30Z | 64,405 | `351682de54ae4b4164d4874ab2d4a8368a06a5c40123e8f214742fba02b123d9` |
| `gallery-dark.png` | 2026-11-12T09:54:31Z | 64,636 | `443649dca9bbef8fd8738a1cf1a47dfb55196f12c0d980267d52634607b1fd58` |

The README links this theme-aware picture to the live section. The documentation commit does not deploy or change the gallery, registry, component APIs, CLI kit, licensing or existing screenshots elsewhere.
