# Production gallery previews

Unmodified Chrome for Testing captures of the live [Pixel object gallery section](https://ui.wlkr.si/#pixel-object). These show the real default component preview and controls, not a mock or a repository popularity claim.

- Public source release: [v0.15.2](https://github.com/wlkr-si/ui/releases/tag/v0.15.2), commit [4abfbea7972613545295d38e64c5af0b0dea84a7](https://github.com/wlkr-si/ui/commit/4abfbea7972613545295d38e64c5af0b0dea84a7).
- Production receipt: [build-info.json](https://ui.wlkr.si/build-info.json), `sourceCommit: 4abfbea7972613545295d38e64c5af0b0dea84a7`, verified before capture.
- Worker version: `33693850-15ae-4860-bcd6-345865db7d00`; deployment: `5687fd61-2123-442a-bd01-b17de2cdc482`.
- Viewport and PNG dimensions: 1280 × 900 pixels. `document.fonts.ready` resolved with `loaded` before both captures.
- System light/dark appearance and reduced motion were requested. The search was empty; the native sidebar link opened `#pixel-object`. Its green indicator and `aria-current="location"` correctly identify Pixel object in both captures.
- The default Object preview, exports and closed Customize controls were retained. No crop, resize, composition, artificial layout, DOM content edit or image transformation was applied. Qualification covers this Chrome capture and these settings; it is not a promise about other browsers.

| File | Captured UTC | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| `gallery-light.png` | 2026-11-12T10:13:24Z | 64,358 | `2d04eab35069857e1da3e38f0f2a5f27c34912ad7944084366f773a66aef5863` |
| `gallery-dark.png` | 2026-11-12T10:13:27Z | 64,602 | `ead2e1e05430aecca98b300e64dab1c9a85f0d2050ec0f1da1ca71513c2da029` |

The README links this theme-aware picture to the live section. The documentation commit does not deploy or change the gallery, registry, component APIs, CLI kit, licensing or existing screenshots elsewhere.
