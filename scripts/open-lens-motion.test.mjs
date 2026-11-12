import test from "node:test"
import assert from "node:assert/strict"
import { liquidLensFrame, lensOpening, lensEase, lensArcAngle, liquidDefaults, lensContactAngles, lensBounceCurve, lensBounceSample, lensSquashMatrix } from "../lib/open-lens-motion.ts"
const near = (a,b,t=1e-8) => assert.ok(Math.abs(a-b)<t, `${a} != ${b}`)
const points = d => d.slice(1,-1).split("L").map(p => p.split(" ").map(Number))
const deg = Math.PI / 180

test("the rest pose is the closed approved mark with relaxed surface tension", () => {
  for (const reverse of [false, true]) for (const angle of [0, 360, -360]) {
    const f = liquidLensFrame(angle, { reverse }), closed = liquidLensFrame(angle, { reverse, openingDistance: 0 })
    near(f.goo, liquidDefaults.goo * .3, 1e-9)
    assert.equal(f.inner, closed.inner); assert.equal(f.outer, closed.outer)
    assert.ok(points(f.inner).length > 20 && points(f.outer).length > 20)
  }
  // Nothing opens across the bowl at rest.
  for (let phi = 30; phi <= 150; phi += 3) assert.equal(lensOpening(phi * deg, 0), 0)
})
test("the groove is fully open along the arc and closed well ahead of its leading end", () => {
  for (const theta of [60, 180, 300]) {
    assert.equal(lensOpening((theta - 90) * deg, theta), 1)
    assert.equal(lensOpening((theta + 40) * deg, theta), 0)
  }
  // Reverse travel leads with the other end.
  assert.equal(lensOpening((-180 - 180 - 40) * deg, -180, { reverse: true }), 0)
  assert.equal(lensOpening((-180 - 90) * deg, -180, { reverse: true }), 1)
})
test("mid pass pinches the inner material into a floating drop and widens surface tension", () => {
  const rest = liquidLensFrame(0), mid = liquidLensFrame(180)
  assert.ok(mid.goo > rest.goo * 3)
  const radius = d => Math.max(...points(d).map(([x,y]) => Math.hypot(x + 1, y - 12)))
  // The drop sits well inside the arc's inner edge (radius 60 around the arc centre).
  assert.ok(radius(mid.inner) < 50, `drop radius ${radius(mid.inner)}`)
  assert.ok(radius(rest.inner) > 65)
})
test("the bowl seals behind the arc with a small damped ripple, then settles before rest", () => {
  const theta = 300, trailing = theta - 180
  const values = Array.from({ length: 80 }, (_, i) => lensOpening((trailing - 12 - i) * deg, theta))
  assert.ok(Math.min(...values) < 0 && Math.min(...values) > -.3)
  assert.equal(lensOpening((trailing - 100) * deg, theta), 0)
  for (let phi = 30; phi <= 150; phi += 2) assert.ok(Math.abs(lensOpening(phi * deg, 359.5)) < .02)
  assert.deepEqual(liquidLensFrame(0, { ripple: 0 }).inner, liquidLensFrame(0).inner)
})
test("frames are deterministic, finite and respect option bounds", () => {
  for (let angle = -360; angle <= 720; angle += 7) {
    const f = liquidLensFrame(angle, { openingDistance: 100, splitRadius: 40, goo: 24, squish: 1, ripple: 1, arcScale: 1.2 }, 48)
    for (const d of [f.inner, f.outer]) if (d) for (const [x,y] of points(d)) assert.ok(Number.isFinite(x) && Number.isFinite(y) && Math.hypot(x,y) < 260)
    assert.deepEqual(f, liquidLensFrame(angle, { openingDistance: 100, splitRadius: 40, goo: 24, squish: 1, ripple: 1, arcScale: 1.2 }, 48))
  }
  assert.deepEqual(liquidLensFrame(90, { goo: 999, openingDistance: -5 }), liquidLensFrame(90, { goo: 24, openingDistance: 0 }))
  assert.deepEqual(liquidLensFrame(NaN), liquidLensFrame(0))
})
test("smooth timing inverts the CSS Bezier x coordinate", () => {
  assert.equal(lensEase(0,"smooth"),0);assert.equal(lensEase(1,"smooth"),1)
  assert.ok(lensEase(.25,"smooth")<.1)
  assert.ok(lensEase(.75,"smooth")>.9)
  const t=.4,x=3*(1-t)**2*t*.77+3*(1-t)*t*t*.175+t**3,y=3*(1-t)*t*t+t**3
  near(lensEase(x,"smooth"),y)
  near(lensArcAngle(.25,20,true,"smooth"),20-360*lensEase(.25,"smooth"))
})

test("the second attempt meets the bowl at first contact, squashes slightly, rebounds and settles home", () => {
  for (const arcScale of [.6, 1, 1.2]) {
    const { forward, backward } = lensContactAngles({ arcScale })
    assert.ok(forward > 5 && forward < 40 && backward < -5 && backward > -40)
    const { angle, squash, normal } = lensBounceCurve({ arcScale }), peak = Math.max(...angle)
    assert.equal(angle[0], 0); near(angle.at(-1), 0, 1e-9); near(squash.at(-1), 0, 1e-9)
    assert.ok(peak > forward && peak < forward + 6, `peak ${peak} vs contact ${forward}`)
    assert.ok(Math.min(...angle) < 0 && Math.min(...angle) > backward, "small rebound overshoot without touching the other side")
    assert.ok(angle.slice(Math.round(angle.length * .7)).every(value => Math.abs(value) < .5), "settled well before the end")
    near(Math.max(...squash.map(Math.abs)), 1); near(Math.hypot(...normal), 1, 1e-9)
    assert.ok(Math.min(...squash) < 0, "the jelly wobbles back past rest")
  }
  const forward = lensBounceCurve(), reverse = lensBounceCurve({ reverse: true })
  assert.ok(Math.min(...reverse.angle) < lensContactAngles().backward)
  assert.ok(forward.normal[1] > 0, "the forward strike pushes down into the bowl")
  near(lensBounceSample(forward, 0).angle, 0); near(lensBounceSample(forward, 1).angle, 0, 1e-9)
  assert.equal(lensSquashMatrix(forward, 0), "matrix(1.00000 0.00000 0.00000 1.00000 0.000 0.000)")
  assert.deepEqual(lensBounceCurve(), forward)
})
