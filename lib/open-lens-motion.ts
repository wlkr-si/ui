/**
 * Liquid Open Lens motion. The bowl parts only where the arc passes through it,
 * pinches its inner material into a floating drop, then seals and ripples behind
 * the arc. All coordinates are in the tilted mark frame, origin at the view centre.
 */
export type LensMotionOptions = {
  /** How far the groove opens around the arc, 0–100 SVG units. */
  openingDistance?: number
  /** Radius of the split line around the arc centre, 40–100 SVG units. */
  splitRadius?: number
  /** Surface tension: blur radius that fuses nearby liquid, 0–24 SVG units. */
  goo?: number
  /** How much of the opening lifts the rim instead of thinning the drop, 0–1. */
  squish?: number
  /** Ripple left behind as the bowl seals, 0–1. */
  ripple?: number
  arcScale?: number
  reverse?: boolean
}
export type LiquidLensFrame = { angle: number; inner: string; outer: string; goo: number }

export const lensClamp = (value: number, min: number, max: number, fallback: number) => Math.max(min, Math.min(max, Number.isFinite(value) ? value : fallback))
export const normalizeLensAngle = (angle: number) => ((angle % 360) + 360) % 360
const smooth = (value: number) => { const t = Math.max(0, Math.min(1, value)); return t * t * (3 - 2 * t) }
const wrap = (angle: number) => Math.atan2(Math.sin(angle), Math.cos(angle))
export const liquidDefaults = { openingDistance: 40, splitRadius: 74, goo: 11, squish: .7, ripple: .22 }
const LEAD = 7, SEAL = 8, WAKE = 60

function cubic(p0: number[], p1: number[], p2: number[], p3: number[], steps: number, out: number[][]) {
  for (let i = 1; i <= steps; i++) {
    const t = i / steps, u = 1 - t
    out.push([0, 1].map(k => u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k]))
  }
}
/** The approved body path (translated 0,8) as a convex polygon. */
const BOWL = (() => {
  const points: number[][] = [], p = (x: number, y: number) => [x, y + 8]
  points.push(p(-92, 24))
  cubic(p(-92, 24), p(-94, 17), p(-89, 12), p(-82, 12), 6, points)
  for (let i = 1; i <= 20; i++) points.push(p(-82 + 7.5 * i, 12))
  cubic(p(68, 12), p(76, 12), p(81, 18), p(79, 25), 6, points)
  cubic(p(79, 25), p(70, 65), p(35, 91), p(-7, 91), 30, points)
  cubic(p(-7, 91), p(-48, 91), p(-82, 64), p(-92, 24), 30, points)
  points.pop()
  return points
})()

/** Near and far distances from c along a direction to the bowl, or null when the ray misses. */
function castRay(cx: number, cy: number, dx: number, dy: number): [number, number] | null {
  let near = Infinity, far = -Infinity
  for (let i = 0; i < BOWL.length; i++) {
    const a = BOWL[i], b = BOWL[(i + 1) % BOWL.length]
    const ex = b[0] - a[0], ey = b[1] - a[1], det = ex * dy - ey * dx
    if (Math.abs(det) < 1e-12) continue
    const ax = a[0] - cx, ay = a[1] - cy
    const t = (ex * ay - ey * ax) / det, s = (dx * ay - dy * ax) / det
    if (s >= 0 && s <= 1 && t > 0) { near = Math.min(near, t); far = Math.max(far, t) }
  }
  return near < far ? [near, far] : null
}

/**
 * Groove opening, 1 = fully open, at polar angle phi (radians, about the arc centre)
 * when the arc has turned theta degrees. Negative values are the sealing ripple.
 */
export function lensOpening(phi: number, theta: number, options: LensMotionOptions = {}): number {
  const reverse = !!options.reverse
  const radius = lensClamp(options.splitRadius ?? liquidDefaults.splitRadius, 40, 100, 74)
  const ripple = lensClamp(options.ripple ?? liquidDefaults.ripple, 0, 1, liquidDefaults.ripple)
  const rad = theta * Math.PI / 180, cap = 15 / radius
  // Distances past each round end; the end facing the direction of travel leads.
  const pastA = wrap(phi - rad), pastB = wrap(rad - Math.PI - phi)
  const ahead = reverse ? pastB : pastA, behind = reverse ? pastA : pastB
  // Turn progress, 0 at the closed rest pose.
  const turn = normalizeLensAngle(reverse ? -theta : theta)
  if (ahead <= cap && behind <= cap) return 1
  const lead = LEAD * Math.PI / 180
  if (ahead > cap && ahead < cap + lead) return (1 - smooth((ahead - cap) / lead)) * smooth(turn / 12)
  if (behind > cap) {
    const past = (behind - cap) * 180 / Math.PI
    if (past < SEAL) return 1 - smooth(past / SEAL)
    if (past > SEAL + WAKE || turn < 150) return 0
    const k = (past - SEAL) / WAKE
    return -ripple * smooth((360 - turn) / 30) * Math.sin(k * Math.PI * 2.5) * (1 - k) ** 2
  }
  return 0
}

const point = (x: number, y: number) => `${x.toFixed(2)} ${y.toFixed(2)}`
/** The two liquid body pieces and the surface-tension radius for one exact arc angle. */
export function liquidLensFrame(angle: number, options: LensMotionOptions = {}, rays = 160): LiquidLensFrame {
  const theta = Number.isFinite(angle) ? angle : 0
  const scale = lensClamp(options.arcScale ?? 1, .6, 1.2, 1)
  const distance = lensClamp(options.openingDistance ?? liquidDefaults.openingDistance, 0, 100, liquidDefaults.openingDistance)
  const radius = lensClamp(options.splitRadius ?? liquidDefaults.splitRadius, 40, 100, 74) * scale
  const squish = lensClamp(options.squish ?? liquidDefaults.squish, 0, 1, liquidDefaults.squish)
  const goo = lensClamp(options.goo ?? liquidDefaults.goo, 0, 24, liquidDefaults.goo)
  const count = Math.floor(lensClamp(rays, 24, 400, 160))
  // The arc ring centre orbits the view centre with the arc.
  const rad = theta * Math.PI / 180, ox = scale, oy = -12 * scale
  const cx = ox * Math.cos(rad) - oy * Math.sin(rad), cy = ox * Math.sin(rad) + oy * Math.cos(rad)
  const mid = Math.atan2(50 - cy, -5 - cx)
  let low = Infinity, high = -Infinity
  for (const [x, y] of BOWL) { const a = wrap(Math.atan2(y - cy, x - cx) - mid); low = Math.min(low, a); high = Math.max(high, a) }
  const innerNear: string[] = [], innerFar: string[] = [], outerNear: string[] = [], outerFar: string[] = []
  let widest = 0
  for (let i = 0; i <= count; i++) {
    // Cosine spacing keeps the rounded bowl corners crisp.
    const a = mid + low + (high - low) * (.5 - .5 * Math.cos(Math.PI * i / count))
    const dx = Math.cos(a), dy = Math.sin(a), hit = castRay(cx, cy, dx, dy)
    if (!hit) continue
    const [near, far] = hit, open = distance * lensOpening(a, theta, options)
    widest = Math.max(widest, Math.abs(open))
    if (near < radius) {
      const rim = Math.max(1, near - open * squish), edge = Math.max(rim, Math.min(far, radius) - open)
      innerNear.push(point(cx + dx * rim, cy + dy * rim)); innerFar.push(point(cx + dx * edge, cy + dy * edge))
    }
    if (far > radius) {
      const start = Math.max(near, radius)
      outerNear.push(point(cx + dx * start, cy + dy * start)); outerFar.push(point(cx + dx * far, cy + dy * far))
    }
  }
  const path = (near: string[], far: string[]) => near.length ? `M${[...near, ...far.reverse()].join("L")}Z` : ""
  return { angle: theta, inner: path(innerNear, innerFar), outer: path(outerNear, outerFar), goo: goo * (.3 + .7 * smooth(widest / 10)) }
}

const bezier = (t: number, a: number, b: number) => 3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t * t * b + t ** 3
/** CSS cubic-bezier(.77,0,.175,1): invert x before evaluating y. */
export function lensEase(progress: number, easing: "linear" | "smooth" = "linear"): number {
  const x = lensClamp(progress, 0, 1, 0)
  if (easing === "linear" || x === 0 || x === 1) return x
  let low = 0, high = 1
  for (let i = 0; i < 40; i++) { const t = (low + high) / 2; if (bezier(t, .77, .175) < x) low = t; else high = t }
  return bezier((low + high) / 2, 0, 1)
}
export function lensArcAngle(progress: number, startAngle = 0, reverse = false, easing: "linear" | "smooth" = "linear"): number {
  return lensClamp(startAngle, -36000, 36000, 0) + (reverse ? -360 : 360) * lensEase(progress, easing)
}

function insideBowl(x: number, y: number) {
  let inside = false
  for (let i = 0, j = BOWL.length - 1; i < BOWL.length; j = i++) {
    const [xi, yi] = BOWL[i], [xj, yj] = BOWL[j]
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside
  }
  return inside
}
function bowlDistance(x: number, y: number) {
  if (insideBowl(x, y)) return 0
  let best = Infinity
  for (let i = 0; i < BOWL.length; i++) {
    const [ax, ay] = BOWL[i], [bx, by] = BOWL[(i + 1) % BOWL.length]
    const ex = bx - ax, ey = by - ay, t = Math.max(0, Math.min(1, ((x - ax) * ex + (y - ay) * ey) / (ex * ex + ey * ey)))
    best = Math.min(best, Math.hypot(x - ax - t * ex, y - ay - t * ey))
  }
  return best
}
/** Arc angles (degrees) at which an end cap first touches the bowl turning forward (positive) and backward (negative). */
export function lensContactAngles(options: LensMotionOptions = {}): { forward: number; backward: number } {
  const scale = lensClamp(options.arcScale ?? 1, .6, 1.2, 1), cap = 14 * scale
  const touches = (theta: number, end: number) => {
    const r = theta * Math.PI / 180, x = end * scale, y = -12 * scale
    return bowlDistance(x * Math.cos(r) - y * Math.sin(r), x * Math.sin(r) + y * Math.cos(r)) <= cap
  }
  let forward = 0, backward = 0
  while (forward < 90 && !touches(forward, 75)) forward += .25
  while (backward > -90 && !touches(backward, -73)) backward -= .25
  return { forward, backward }
}

export type LensBounce = {
  /** Arc degrees from rest, sampled evenly across the whole bounce. */
  angle: number[]
  /** Body squash, 0 at rest; positive compresses away from the impact. */
  squash: number[]
  /** Unit impact direction into the bowl, in the tilted mark frame. */
  normal: [number, number]
  /** Body pivot for the squash, in the tilted mark frame. */
  pivot: [number, number]
}
/**
 * Hover bounce, in the bounce's own time (0–1 of its duration): the arc eases forward
 * from rest, reaches the bowl at first contact a quarter of the way in, squashes a few
 * degrees in, rebounds and settles home while the bowl jiggles like jelly.
 * Deterministic, so scrubbing and playback agree.
 */
export function lensBounceCurve(options: LensMotionOptions = {}, samples = 360): LensBounce {
  const { forward, backward } = lensContactAngles(options)
  const scale = lensClamp(options.arcScale ?? 1, .6, 1.2, 1)
  const dir = options.reverse ? -1 : 1
  const reach = .25, push = 2 * (dir > 0 ? forward : -backward) / (reach * reach)
  const home = 2 * Math.PI / .3, damping = 2 * .6 * home
  const wall = 2 * Math.PI / .2, wallDamping = 2 * .3 * wall
  const jelly = 2 * Math.PI / .2, jellyDamping = 2 * .22 * jelly
  const steps = 8, dt = 1 / (samples * steps)
  let angle = 0, speed = 0, hit = false, squash = 0, squashSpeed = 0
  const angles = [0], squashes = [0]
  for (let i = 1; i <= samples; i++) {
    for (let s = 0; s < steps; s++) {
      // Push toward the bowl until first contact; afterwards the mark is pulled home.
      hit ||= angle > forward || angle < backward
      const press = Math.max(0, angle - forward, backward - angle)
      let force = hit ? -home * home * angle - damping * speed : push * dir
      if (angle > forward) force += -wall * wall * (angle - forward) - wallDamping * speed
      if (angle < backward) force += -wall * wall * (angle - backward) - wallDamping * speed
      speed += force * dt; angle += speed * dt
      // The body is a damped jelly driven by how far the arc presses into it.
      squashSpeed += (jelly * jelly * (press - squash) - jellyDamping * squashSpeed) * dt; squash += squashSpeed * dt
    }
    // Land exactly on the rest pose at the end.
    const land = 1 - smooth((i / samples - .8) / .2)
    angles.push(angle * land); squashes.push(squash * land)
  }
  const peak = Math.max(...squashes.map(Math.abs)) || 1
  // Impact direction: from the striking cap centre toward the nearest bowl point.
  const contact = dir > 0 ? forward : backward, end = dir > 0 ? 75 : -73, r = contact * Math.PI / 180
  const cx = end * scale * Math.cos(r) + 12 * scale * Math.sin(r), cy = end * scale * Math.sin(r) - 12 * scale * Math.cos(r)
  let best = Infinity, nx = 0, ny = 1
  for (let i = 0; i < BOWL.length; i++) {
    const [ax, ay] = BOWL[i], [bx, by] = BOWL[(i + 1) % BOWL.length]
    const ex = bx - ax, ey = by - ay, t = Math.max(0, Math.min(1, ((cx - ax) * ex + (cy - ay) * ey) / (ex * ex + ey * ey)))
    const px = ax + t * ex, py = ay + t * ey, d = Math.hypot(px - cx, py - cy)
    if (d < best) { best = d; nx = (px - cx) / (d || 1); ny = (py - cy) / (d || 1) }
  }
  return { angle: angles, squash: squashes.map(value => value / peak), normal: [nx, ny], pivot: [-6, 58] }
}
export function lensBounceSample(curve: LensBounce, progress: number): { angle: number; squash: number } {
  const at = lensClamp(progress, 0, 1, 1) * (curve.angle.length - 1), i = Math.min(curve.angle.length - 2, Math.floor(at)), k = at - i
  return { angle: curve.angle[i] + (curve.angle[i + 1] - curve.angle[i]) * k, squash: curve.squash[i] + (curve.squash[i + 1] - curve.squash[i]) * k }
}
/** SVG matrix squashing the body along the impact direction (strength 0–1 of the peak, about 14%). */
export function lensSquashMatrix(curve: LensBounce, squash: number): string {
  const j = squash * .14, [nx, ny] = curve.normal, [px, py] = curve.pivot
  // Compress along the impact, bulge across it, and give a little push away from the arc.
  const a = 1 - j * nx * nx + j / 2 * ny * ny, b = -j * nx * ny - j / 2 * nx * ny, d = 1 - j * ny * ny + j / 2 * nx * nx
  const tx = px - (a * px + b * py) + nx * j * 40, ty = py - (b * px + d * py) + ny * j * 40
  return `matrix(${a.toFixed(5)} ${b.toFixed(5)} ${b.toFixed(5)} ${d.toFixed(5)} ${tx.toFixed(3)} ${ty.toFixed(3)})`
}
