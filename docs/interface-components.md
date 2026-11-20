# Interface components

Ten original components added in 0.22.0. Each is one self-contained file: styles travel with the source, tokens carry fallbacks so the WLKR theme is optional, and every component respects `prefers-reduced-motion`.

```sh
pnpm dlx shadcn@latest add @wlkr/dot-field @wlkr/pixel-image @wlkr/dot-matrix @wlkr/pixel-progress
pnpm dlx shadcn@latest add @wlkr/liquid-tabs @wlkr/ticker @wlkr/decode-text @wlkr/rolling-number
pnpm dlx shadcn@latest add @wlkr/hold-action @wlkr/shortcut
```

Only `hold-action` has a dependency (`lucide-react`). None of the ten needs a stock shadcn primitive.

## DotField

```tsx
<DotField className="h-[420px] w-full" radius={140}>
  <div className="flex h-full items-center justify-center"><h1>Brand Studio</h1></div>
</DotField>
```

| Prop | Default | Meaning and bounds |
| --- | --- | --- |
| `children` | — | Rendered above the field. The wrapper fills the root's height. |
| `gap` | 18 | Pixels between dot centres, 8–64. Widens on very large areas to stay at or under 6,000 dots. |
| `dotSize` | 2 | Dot size in pixels, 1–8. |
| `radius` | 110 | Pointer reach in pixels, 20–400. |
| `strength` | 0.5 | How far dots are pushed away, 0–1. At 0 they swell and tint without moving. |
| `shape` | `"square"` | `"square"` or `"round"`. |
| `ambient` | `true` | A slow wave of brightness and size, about seven seconds per cycle. |

The root has no height of its own; size it with a class or let content do it. Colours are read from `--muted-foreground`, `--foreground` and `--brand` and re-read when the root `class` or the system colour scheme changes. Touch scrolling still works (`touch-action: pan-y`). The loop runs only while dots are settling, or while the wave is on and the field is on screen in a visible tab. Reduced motion removes the wave and the springs; proximity still brightens and tints dots.

## PixelImage

```tsx
<PixelImage src="/work/weathergoblin.jpg" alt="WeatherGoblin forecast on a phone" width={1600} height={1000} trigger="both" className="w-full" />
```

| Prop | Default | Meaning and bounds |
| --- | --- | --- |
| `src`, `alt` | required | Passed to the real `<img>`, which is always in the document. |
| `width`, `height` | required | Intrinsic size. Sets `aspect-ratio`, so nothing shifts. |
| `steps` | `[64, 40, 24, 14, 8, 4]` | Block sizes in CSS pixels, coarse to fine. Each 2–256, at most 12. |
| `stepDuration` | 90 | Milliseconds per step, 30–1000. |
| `trigger` | `"view"` | `"view"` plays once at 25% visible. `"hover"` plays on pointer enter or focus. `"both"` does each. |
| `fit` | `"cover"` | `"cover"` or `"contain"`; the blocks use the same maths as the image. |

Other image props (`loading`, `sizes`, `srcSet`, `crossOrigin`, …) go to the `<img>`; `className` and `style` go to the root. Server HTML and pages without JavaScript show the plain image. Only `drawImage` is used, so cross-origin images without CORS headers work. A failed load shows the browser's normal alt text. Reduced motion shows the plain image with no effect.

## DotMatrix

```tsx
<DotMatrix text="NEXT: BRAND STUDIO 14:32  ·  ON TIME" columns={64} />
```

| Prop | Default | Meaning and bounds |
| --- | --- | --- |
| `text` | required | Uppercased, capped at 240 characters. |
| `columns` | width of the text | Visible dot columns, 5–240. |
| `dotSize` | 4 | Dot size in pixels at full scale, 1–24. |
| `gap` | 2 | Space between dots in pixels, 0–24. |
| `shape` | `"square"` | `"square"` or `"round"`. |
| `scroll` | `"auto"` | `"auto"` scrolls only when the text is wider than `columns`. |
| `speed` | 14 | Columns per second, 1–60. |
| `label` | `text` | Accessible name. |

The built-in 5×7 font covers A–Z, 0–9, space and `. , : ; ! ? - + / ' " % & ( ) # @ = * < > _ ·`. Zero is slashed. Unknown characters render as a small hollow box. Lit dots take the surrounding text colour. The display starts with the message on the board, moves one whole column at a time, and pauses off screen and in hidden tabs. It scales down to fit narrow containers. Reduced motion shows the start of the text, still. Screen readers get the text once as an image label.

## PixelProgress

```tsx
<PixelProgress label="Uploading assets" value={percent} showValue />
<PixelProgress label="Preparing upload" value={null} />
```

| Prop | Default | Meaning and bounds |
| --- | --- | --- |
| `value` | indeterminate | 0–100, clamped. `null`, `undefined` or `NaN` means unknown length. |
| `label` | required | Accessible name. |
| `columns` | 48 | Grid width in cells, 8–160. |
| `rows` | 4 | Grid height in cells, 1–8. |
| `showValue` | `false` | Fixed-width tabular percentage at the trailing edge. |

The root is a `progressbar` with `aria-valuenow` and `aria-valuetext` for the real target value; the drawing is hidden from assistive technology. Displayed progress eases toward the value. The leading four columns dissolve through a 4×4 ordered-dither matrix. Reaching 100 runs one green wave and leaves the last columns green. Unknown length shows a travelling dithered packet that pauses off screen. Reduced motion draws exact values with no easing or wave, and shows a still checker for unknown length.

## LiquidTabs

```tsx
<LiquidTabs label="Project view" value={view} onValueChange={setView} items={[
  { value: "overview", label: "Overview" },
  { value: "activity", label: "Activity" },
  { value: "files", label: "Files", disabled: true },
]} />
```

| Prop | Default | Meaning |
| --- | --- | --- |
| `items` | required | `{ value, label, disabled? }[]`, in order. |
| `label` | required | Accessible name for the group. |
| `value`, `onValueChange` | — | Controlled selection. |
| `defaultValue` | first enabled item | Uncontrolled starting selection. |
| `tone` | `"ink"` | `"ink"` uses foreground with background text; `"brand"` uses WLKR green. |
| `size` | `"md"` | `"sm"` or `"md"`. Both keep a 44 px hit height. |

A `radiogroup` with roving focus. Arrow keys move and select, skip disabled options and wrap; Home and End jump; arrow direction follows `dir="rtl"`. The selection is three shapes behind one blur-and-threshold filter, so it stretches, necks and snaps. Labels sit outside the filter and stay sharp. The row scrolls sideways in narrow containers and keeps the selection in view. Reduced motion moves the selection instantly.

## Ticker

```tsx
<Ticker label="Studio status" speed={40}>
  <span>Brand Studio — shipped</span>
  <a href="/work/weathergoblin">WeatherGoblin — in development</a>
</Ticker>
```

| Prop | Default | Meaning and bounds |
| --- | --- | --- |
| `children` | required | Items in one row. They are repeated to fill the loop, so avoid `id`s inside. |
| `speed` | 40 | Pixels per second, 5–400, whatever the content width. |
| `direction` | `"left"` | `"left"` or `"right"`. |
| `gap` | 40 | Pixels between items and repeats, 0–200. |
| `pauseOnHover` | `true` | Eases to a stop under a mouse or pen. |
| `draggable` | `true` | Grab and fling with momentum. |
| `fade` | `true` | Stepped edge bands instead of a smooth fade. |
| `label` | — | Accessible name; makes the root a labelled group. |

Repeats are `aria-hidden` and `inert`, so assistive technology and Tab meet each item once. Keyboard focus stops the row and brings the focused item fully into view. A drag starts after 6 px of mostly horizontal movement and suppresses the click that follows; vertical gestures still scroll the page. The loop stops off screen and in hidden tabs. Reduced motion turns it into a plain horizontally scrollable row with no repeats.

## DecodeText

```tsx
<DecodeText as="h2" trigger="view" text="Useful things, thoughtfully built." />
<a href="/work"><DecodeText trigger="hover" glyphs="▚▞░▒▓" text="Work" /></a>
```

| Prop | Default | Meaning and bounds |
| --- | --- | --- |
| `text` | required | The final text. Present in server HTML; read once by screen readers. |
| `trigger` | `"both"` | `"view"` plays once on entering view; `"hover"` replays on pointer enter or focus; `"both"` does each. |
| `duration` | 700 | Milliseconds for the sweep, 200–4000. |
| `glyphs` | `"01"` | Characters the noise is drawn from. |
| `as` | `"span"` | `span`, `p`, `div`, `h1`, `h2` or `h3`. |

Each character sits in a cell sized by the real character, so width never changes and lines wrap between words. Inside an `a` or `button`, the whole control triggers the replay. Touch pointer-enter is ignored. Noise is deterministic. Reduced motion, or a hidden tab, shows the final text immediately.

## RollingNumber

```tsx
<RollingNumber value={total} />
<RollingNumber value={revenue} format={{ style: "currency", currency: "USD" }} />
```

| Prop | Default | Meaning and bounds |
| --- | --- | --- |
| `value` | required | Non-finite values show a static en dash. |
| `format` | — | `Intl.NumberFormatOptions`. Invalid options fall back to plain formatting. |
| `locale` | `"en-US"` | Fixed by default so server and browser agree. |
| `duration` | 700 | Milliseconds per roll, 150–3000. |

Size, weight and colour come from the parent. Wheels roll up when the value rises and down when it falls, and continue from their current position when interrupted. Columns are keyed from the right, so 999 → 1,000 keeps existing wheels in place while a new column grows in. The first render is at rest. Screen readers get the formatted value in one hidden span and there is no live region; add one in the parent when changes should be announced. Reduced motion switches digits instantly.

## HoldAction

```tsx
<HoldAction tone="destructive" confirmedLabel="Deleted" onConfirm={async () => { await deleteProject(id) }}>
  Hold to delete
</HoldAction>
```

| Prop | Default | Meaning and bounds |
| --- | --- | --- |
| `onConfirm` | required | Runs once when the hold completes. A thrown error or rejected promise returns to rest and announces the failure. |
| `children` | required | Resting label. |
| `confirmedLabel` | `"Done"` | Shown and announced after confirming. |
| `duration` | 1100 | Milliseconds to hold, 400–5000. |
| `resetAfter` | 2200 | Milliseconds before returning to rest; `null` stays confirmed. |
| `tone` | `"ink"` | `"ink"` or `"destructive"`. |
| `disabled` | `false` | Native disabled. |

Hold with a pointer, or with Space or Enter. Letting go early drains the fill at three times the fill speed; pressing again resumes. A touch drag cancels the hold so the page can scroll. A bare activation with no hold — the kind screen readers and voice control send — arms a two-step confirm instead: "Press again to confirm", then a second activation within four seconds. Reduced motion keeps the fill, as it is the feedback, with a straight edge and no settle.

## Shortcut

```tsx
<button type="button" onClick={openSearch}>
  Search <Shortcut keys="mod+k" onTrigger={openSearch} />
</button>
```

| Prop | Default | Meaning |
| --- | --- | --- |
| `keys` | required | A combination such as `"mod+k"`, `"ctrl+shift+p"` or `"escape"`. `mod` is ⌘ on Apple platforms and Ctrl elsewhere. Up to eight keys. |
| `onTrigger` | — | When set, listens on `window` and runs when the combination lands. |
| `preventDefault` | `true` with `onTrigger` | Blocks the browser's own action for the combination. |
| `allowInInputs` | `false` | Also fire while typing. Combinations with mod, ctrl or alt always fire. |
| `disabled` | `false` | Stops listening. |
| `size` | `"md"` | `"sm"` (20 px) or `"md"` (24 px). |

Server HTML shows the non-Apple labels; Apple symbols appear after hydration. Modifiers must match exactly. Key repeat and IME composition never trigger. Pressed state clears when ⌘ is released, on blur and on tab change, and non-modifier keys release after one second, because macOS sends no key-up for other keys while ⌘ is held. Symbol caps carry a hidden name, so ⌘K reads as "Command K". The gallery's own search hotkey uses this component.
