# Motion components

The customizer and WLKR loader are available at [ui.wlkr.si](https://ui.wlkr.si). Configure `@wlkr` as `https://ui.wlkr.si/r/{name}.json`, then install `@wlkr/pixel-object` and `@wlkr/wlkr-loader` with the standard shadcn CLI. For local development, run `pnpm dev --port 3100`.

## PixelObject

The original props and appearance are preserved. With no new props, the component uses the original 36-cell rounded-square grid, 260 px size, sphere, .15 rad/s rotation, and no extra flicker.

| Prop | Default | Meaning and bounds |
| --- | --- | --- |
| `points` | `spherePoints(420)` | Up to 2,000 finite normalized x/y/z points. z defaults to 0. |
| `mask` | unset | `#`/space rows; takes precedence over points. Maximum 80 rows and 80 columns. |
| `resolution` | 36 | Legacy raster cells per side, clamped 8–80. |
| `size` | 260 | Nominal SVG size in px, clamped 64–1,000; scales down responsively. |
| `dotShape` | `rounded` | `square`, `rounded`, or `circle`. |
| `dotSize` | unset | Nominal dot width/height in SVG px, clamped .5–40 when provided. |
| `gap` | unset | Nominal empty spacing between dots in SVG px, clamped 0–40 when provided. |
| `rotating` | true | Enables rotation; flicker can still run when rotation is disabled. |
| `rotationSpeed` | .15 | Radians per second, clamped 0–3. Independent of flicker speed. |
| `flickerAmount` | 0 | Pattern depth from 0–1; even full depth dims cells to at least 35% of their depth shading. |
| `flickerSpeed` | .5 | Smooth cycles per second, clamped 0–2. Zero freezes the pattern phase. |
| `pattern` | `steady` | `steady`, `scatter`, `wave`, or `scan`. Steady never flickers. |
| `delay` | 0 | Active milliseconds before motion starts, clamped 0–30,000. |
| `stagger` | 0 | Milliseconds of pattern phase spread across the object, clamped 0–10,000. Does not multiply by point count. |
| `seed` | 1 | Number or string for deterministic scatter phases. Stable on server and client. |
| `randomness` | 1 | Seeded phase variation, clamped 0–1. Zero synchronizes scatter. |
| `opacity` | 1 | Overall opacity multiplier, clamped 0–1. |
| `restartKey` | 0 | Change the number/string to restart rotation and timing without remounting. |
| `label` | “Rotating pixel sphere” | Accessible SVG description; use a label that describes your object. |
| `className` | unset | Application layout/color composition. |

### Size and gap precedence

When **neither** dotSize nor gap is supplied, resolution controls the legacy grid and each cell retains its original .72 fill ratio. Setting **either** opts into physical pitch: `pitch = dotSize + gap`, and the number of raster cells comes from size and pitch. Thus dotSize changes the dots themselves and gap changes spacing/density; these are not two names for the same fill ratio.

When one value is omitted in physical mode, its fallback comes from the legacy size/resolution ratio: dot size `size / resolution × .72`, gap `size / resolution × .28`. Resolution supplies that omitted default, then no longer determines density. The projected cloud is centered; an extreme pitch that fits only one cell produces one centered dot, with no bounds overflow. The nominal px measurements scale with the SVG on narrow layouts.

### Patterns and controls

Scatter varies seeded cell phases; wave moves a diagonal phase front; scan moves a row-aligned brightness band. All use smooth sinusoidal changes rather than hard flashing, with a 500 ms onset ramp after delay/stagger. Rotation has its own clock rate. The gallery’s Pixel sphere, Disco, Wave, and Still presets update every control together; later edits show Custom. Reset restores the original sphere, clears user pause, and restarts the timeline using restartKey. Editing Delay also restarts the preview timeline so the selected delay can be observed. Its Usage tab generates a copyable example from the current settings.

Motion stops on explicit pause, off-screen intersection, hidden document, or reduced-motion preference. Observers, media listeners, and animation frames clean up on unmount. Paused time does not advance; resuming continues without a wall-clock jump. No animation frame loop runs for a still preset or a zero-speed, non-flickering object. Pattern and rotation updates are sampled around 12 fps; opacity and geometry remain ordinary native SVG.

## WlkrLoader

The approved Open Lens paths remain fixed in proportion at the defaults. Existing copied usages retain the previous behind-body motion because `cutThrough` defaults to false. The animation room enables liquid motion while the owner tunes it; it does not publish choices to the homepage.

With `cutThrough`, the body behaves like liquid. A split line follows the arc's own centre, dividing the bowl into an inner cap and an outer rim. The groove opens only where the arc is inside the bowl, so the arc dips in with a meniscus, pinches the inner material into a floating drop, then the two sides flow back together behind it with a small damped ripple. An SVG surface-tension filter (blur, alpha threshold, clipped back to the source) fuses anything closer than the goo radius, so pieces neck, snap and reconnect instead of sliding rigidly. Surface tension relaxes at rest, where the frame is exactly the closed mark. Reverse leads with the other end of the arc.

| Prop | Default | Meaning and bounds |
| --- | --- | --- |
| `variant` | `orbit` | Compatibility input; previous variant names use the same arc motion. |
| `size` | 48 | Square size, clamped 16–240 px. |
| `duration` | 1,800 | Cycle duration, clamped 800–10,000 ms. |
| `cutThrough` | false | Liquid mode: the bowl parts around the arc and seals behind it. |
| `openingDistance` | 40 | How far the groove opens around the arc, clamped 0–100 SVG units. |
| `splitRadius` | 74 | Split line radius around the arc centre, clamped 40–100 SVG units. |
| `goo` | 11 | Surface tension radius, clamped 0–24 SVG units; 0 removes the filter. |
| `squish` | .7 | Share of the opening that lifts the rim instead of thinning the drop, 0–1. |
| `ripple` | .22 | Ripple as the bowl seals, 0–1. |
| `arcScale` | 1 | Arc size relative to the approved path, clamped .6–1.2. |
| `tilt` | -24 | Symbol resting tilt, clamped -60–60 degrees. |
| `reverse` | false | Reverse the cycle direction. |
| `easing` | `linear` | `linear` or `smooth`. |
| `frame` | unset | Exact static turn from 0–1; supplying it suspends animation. Frame is an angle, independent of easing/direction. |
| `startAngle` | 0 | Starting orientation in degrees for live playback. |
| `loop` | true | False performs one turn and keeps its final pose. |
| `bounce` | false | Liquid mode with `loop` off: after the full pass the arc keeps its speed, strikes the bowl at first contact, squashes a few degrees in while the bowl jiggles, rebounds and settles home. Starts from rest. |
| `restartKey` | 0 | Change to restart the turn. |
| `onCycleComplete` | unset | Once-mode callback after the final pose. |
| `paused` | false | Freeze the current phase. |
| `label` | “Loading” | One accessible loading announcement. |
| `decorative` | false | Hide when another control already announces loading. |
| `cutGap`, `openingAngle`, `openAt`, `closeAt` | unset | Deprecated rigid-motion inputs; ignored. |
| `stagger` | 120 | Deprecated compatibility input; no longer changes motion. |
| `className` | unset | Inherited color/layout composition. |

Without `cutThrough`, a CSS transform rotates the arc with no JavaScript frame loop. Liquid mode draws each frame from `lib/open-lens-motion.ts`, the shared pure geometry that ships with the registry component: rays cast from the arc centre rebuild both pieces (72 rays below 96 px, 160 above), and only the two body paths, the blur radius and the arc rotation change per frame. Explicit frame inspection renders the same function, so scrubbing and playback match. The bounce is a deterministic simulation: the arc coasts until its end cap meets the bowl (contact angles are measured from the approved paths), a stiff wall rebounds it, a home spring then settles it, and a damped jelly spring driven by the press squashes the body along the impact direction. Both curves land exactly on the rest pose. Smooth timing inverts the CSS cubic Bezier x coordinate. Explicit pause, off-screen intersection, hidden documents and reduced motion stop the frame loop; resuming continues from the paused phase. An explicitly selected static frame remains inspectable with reduced motion. Observers, listeners and frames clean up on unmount; animation never rewrites live-region text.

### Animation room

[Animation room](https://ui.wlkr.si/animation) renders the real `WlkrLoader` in loader and approved-wordmark layouts. It provides cycle duration, size, arc scale, opening, split radius, goo, squish, ripple, tilt, direction, easing, a Liquid comparison toggle, center guides, light/dark/checkerboard backgrounds, Loop/Hover once/Hover bounce, play/pause and exact angle scrubbing. Hover once and Hover bounce complete after pointer exit, and Hover bounce always starts from the rest pose; touch and keyboard users can use Play once. Pausing samples the visible arc angle; resuming starts from that angle. Reset restores the room defaults.

Copy settings link serializes the whitelisted, versioned visual settings and current angle to the URL fragment. Version 3 holds the liquid settings. Valid version-1 and version-2 links keep their shared look and playback settings and take the liquid defaults, since their rigid separation values no longer apply. Opening a settings link restores a paused exact frame for review. The room does not write browser storage or send settings to a backend, and does not apply them to the homepage. Clipboard denial reveals a selectable link. Unknown keys, unsupported versions, invalid types, out-of-range values, malformed encoding and oversized fragments are rejected. Ordinary page anchors are not treated as settings links.

## Provenance

All motion/projection code is authored for WLKR. Pixel geometry comes from the original local brand master `public/wlkr-mark.svg`; loader geometry comes from the approved WLKR.SI Open Lens master in `wlkr-si/website/brand/open-lens.svg`. Motion references are [Loading UI Bars](https://www.loading-ui.com/docs/components/bars) for staggered vertical pulses and [Loading UI Dots](https://www.loading-ui.com/docs/components/dots) for soft scale/opacity beats. Those reference implementations were not copied. The earlier pixel-field interaction reference is [Magic UI’s Flickering Grid](https://magicui.design/docs/components/flickering-grid). The gallery controls use CLI-installed, unchanged shadcn Slider, NativeSelect, and Field primitives; none are republished as WLKR registry entries.

## Optional continuous shape morph

PixelObject supports `morph?: { shapes?: ("sphere" | "cube" | "torus")[]; duration?: number }`. Omission preserves the original sphere behavior. When enabled, shapes default to sphere/cube/torus and duration defaults to 8 seconds per transition (clamped 2–60). All targets use the same 420 corresponding points, interpolated with a cosine ease; the loop morphs back to the first shape without swapping point clouds. Custom points or mask take precedence and disable generated morphing.

Morphing uses the existing active timeline and pause/visibility/reduced-motion guards, independently of rotation and flicker. It stops the animation frame loop while paused, hidden, off-screen, or reduced-motion. The gallery provides one opt-in morph switch; Reset/presets clear it, and Usage includes the actual morph configuration. This API is published in source release `2935308d0e1a68df26bbba95a6cadcf38bf8719f`.

The component removes separate visible animation transports. PixelObject uses an unstyled native button for an animated canvas; its accessible state is announced without visible Pause/Resume text. The WlkrLoader component itself remains noninteractive; only the gallery wraps a decorative loader in a native click/keyboard toggle.
