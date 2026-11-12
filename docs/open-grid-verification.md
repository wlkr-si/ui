# Open grid candidate — 2026-11-12

Base: `b4e5f27bd19d913846a32af0db98fc748f749648`. Package candidate: 0.11.0; no tag or deployment is made by this task.

Open grid uses a native single-file input activated by a keyboard-accessible 44px button. Only the user-selected File is read. Its declared size is checked before slicing; the Blob read is capped at 4097 bytes and rejected above 4096. Fatal UTF-8 decoding and the exact existing CLI parser enforce 8/16/32 square dot/hash rows, LF/CRLF, optional BOM and one optional final newline. No filename/content is interpolated into errors. There is no network, upload, storage, directory picker or File System Access API.

The CLI parser/4 KiB constant moved to a browser-safe module and are re-exported from the original CLI entry point. CLI arguments, file safety, diagnostics, output formats and codec behavior are unchanged. A valid import dispatches the existing replace action, keeps ink (including theme-relative null), and uses existing history for one-step undo/redo across grid sizes. The reducer/codec sources remain byte-identical.

A monotonic import session discards results after a newer file selection, picker activation, editor command, cell/tool selection or unmount. The UI also checks the original input remains connected before applying a completed read. Invalid/cancelled reads never dispatch an artwork change. Pending reads do not disable editing.

## Local evidence

- New grid-import tests cover all three sizes, exact CLI format reuse, explicit/theme ink, one-step history, pre-read size rejection, capped reads, invalid UTF-8/format/read errors, and delayed edit/selection/cancel/unmount boundaries.
- New import tests plus the unchanged 13 CLI tests passed on Linux Node 26.8.2 and 24.22.3 (16 total). The temporary official Node 24 archive matched SHA-256 `4f2b175a6d53a5c617a80dba2676238a0688cef28c6da4eba35c7d844e66fcfb` and is removed after checks.
- Lint, TypeScript and production build passed. Run `pnpm release:check` on the clean committed candidate for the complete release gate; its outcome is recorded at handoff. The new import suite is included in that existing gate.
- In an isolated headless Chromium at 320×760 with reduced motion, real local 8/16/32 text files were selected through the documented agent-browser native file-input upload support. Open was activated by keyboard under real user activation; the change events carried native File objects. Cells and chosen ink matched exactly, focus stayed on Open, and keyboard Undo/Redo restored each previous grid, size and grid focus.
- Actual Download grid files from all three imported sizes were retrieved through native browser download events and passed to the real zero-dependency CLI. Every row, ink and size matched; the browser Share URL exactly matched CLI output. Import interactions added zero resource/network requests. Malformed and 4097-byte actual selections preserved artwork; oversized selection invoked no Blob slice/read.
- Artificially delayed reads of real Files could not overwrite a newer keyboard paint or a later 16×16 file selection. Picker activation plus a synthetic input-cancel event discarded a pending read; helper unit tests also cover cancellation. The cancel-event boundary is not a claim of manually operating an OS picker dialog.
- The explicit DevTools chooser upload tool rejected owned temporary and authorized-workspace fixture paths under its configured root restrictions. No permissions or roots were broadened. Qualification used the documented agent-browser native file-input route instead; physical OS chooser selection/cancellation was not manually driven.
- The phone viewport had no document overflow, the Open target met 44px, and no page errors were reported. Existing registry JSON assets, dependency lock, mask reducer and canonical codec hashes match the base.

Source README and generated agent documentation describe the bounded local import without a helper paragraph in the app. No registry component/source contract, dependency or publisher configuration changed. Root reviews the file-permission boundary before publication. Owned browser pages/jobs, preview server/tunnel, fixtures, downloads, logs and temporary runtime are removed at handoff; source, dependencies and build output remain ready for release.
