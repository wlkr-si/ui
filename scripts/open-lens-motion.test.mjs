import test from "node:test"
import assert from "node:assert/strict"
import { openLensPose, lensEase, lensArcAngle, sampleLensMotion } from "../lib/open-lens-motion.ts"
const near = (a,b,t=1e-8) => assert.ok(Math.abs(a-b)<t, `${a} != ${b}`)

test("closed endpoints and start/end contact preserve the joined rigid body", () => {
  for(const angle of [0,360,720,-360,10,350]) {
    const p=openLensPose(angle)
    near(p.openness,0); near(p.inner.x,0); near(p.inner.y,0); near(p.outer.x,0); near(p.outer.y,0)
  }
  const p=openLensPose(0,{splitGap:12});near(p.inner.y,-6);near(p.outer.y,6)
})
test("the two complete pieces pop apart with opposite rigid translations at midpass", () => {
  const p=openLensPose(180,{openingDistance:48})
  near(p.openness,1);near(p.inner.x,0);near(p.outer.x,0);near(p.inner.y,-24);near(p.outer.y,24)
  for(let angle=0;angle<=360;angle+=3) {
    const p=openLensPose(angle,{openingDistance:64,splitGap:7,openingAngle:23})
    near(p.inner.x,-p.outer.x);near(p.inner.y,-p.outer.y)
    assert.ok(p.openness>=0&&p.openness<=1)
  }
})
test("contact tracks right entry, downward middle and left exit; reverse mirrors contact", () => {
  const right=openLensPose(90),left=openLensPose(-90)
  assert.ok(right.outer.x>0&&right.outer.y>0)
  assert.ok(left.outer.x<0&&left.outer.y>0)
  near(right.outer.x,-left.outer.x);near(right.outer.y,left.outer.y)
  const angled=openLensPose(180,{openingAngle:90});near(angled.outer.y,0);assert.ok(angled.outer.x<0)
  assert.equal(openLensPose(80,{openAt:90}).openness,0)
  assert.equal(openLensPose(300,{closeAt:280}).openness,0)
})
test("smooth timing inverts the CSS Bezier x coordinate rather than easing each piece segment", () => {
  assert.equal(lensEase(0,"smooth"),0);assert.equal(lensEase(1,"smooth"),1)
  assert.ok(lensEase(.25,"smooth")<.1)
  assert.ok(lensEase(.75,"smooth")>.9)
  const t=.4,x=3*(1-t)**2*t*.77+3*(1-t)*t*t*.175+t**3,y=3*(1-t)*t*t+t**3
  near(lensEase(x,"smooth"),y)
  near(lensArcAngle(.25,20,true,"smooth"),20-360*lensEase(.25,"smooth"))
})
test("sampled continuous poses and exact scrubbed poses use the same actual eased angle", () => {
  const options={openingDistance:55,openingAngle:17,openAt:30,closeAt:320,splitGap:3}
  for(const easing of ["linear","smooth"])for(const reverse of [false,true]) {
    const frames=sampleLensMotion(options,123,reverse,easing,360)
    for(const i of [0,37,90,180,270,360]) {
      const f=frames[i];near(f.angle,lensArcAngle(i/360,123,reverse,easing))
      assert.deepEqual(f.pose,openLensPose(f.angle,options))
    }
    assert.deepEqual(frames[0].pose,openLensPose(frames[360].angle,options))
  }
})

test("continuous interpolation stays within a subpixel of exact scrubbing even at the tightest contact window", () => {
  const options={openingDistance:100,openAt:120,closeAt:240,openingAngle:90}
  for(const reverse of [false,true])for(const start of [0,123,359]) {
    const frames=sampleLensMotion(options,start,reverse,"smooth")
    const count=frames.length-1
    for(let i=0;i<count;i++) {
      const exact=openLensPose(lensArcAngle((i+.5)/count,start,reverse,"smooth"),options)
      for(const axis of ["x","y"]) {
        const interpolated=(frames[i].pose.inner[axis]+frames[i+1].pose.inner[axis])/2
        assert.ok(Math.abs(interpolated-exact.inner[axis])<.3)
      }
    }
  }
})
