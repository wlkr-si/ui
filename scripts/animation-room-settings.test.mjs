import test from "node:test"
import assert from "node:assert/strict"
import { defaultAnimationSettings, validateAnimationSettings, animationSettingsHash, parseAnimationSettingsHash } from "../lib/animation-room-settings.ts"

test("a shared room preserves every visual and playback setting without changing defaults", () => {
  const custom = { ...defaultAnimationSettings, duration: 3210, size: 208, arcScale: .81, goo: 6.5, squish: .4, ripple: .9, tilt: 17, frame: 233.5, reverse: true, guides: true, easing: "smooth", background: "checkerboard", view: "wordmark", playback: "hover" }
  assert.deepEqual(parseAnimationSettingsHash(animationSettingsHash(custom)), custom)
  const received = parseAnimationSettingsHash(animationSettingsHash(custom)); received.size = 48
  assert.equal(custom.size, 208)
  assert.equal(defaultAnimationSettings.size, 200)
  assert.equal(defaultAnimationSettings.cutThrough, true)
})
test("invalid or unsupported links never reach component controls", () => {
  for (const hash of ["", "#pixels=other", "#motion=%", "#motion=null", "#motion=%5B%5D", "#motion=" + "x".repeat(8193)]) assert.equal(parseAnimationSettingsHash(hash), null)
  for (const patch of [{ version: 2 }, { version: 4 }, { duration: "1800" }, { size: 0 }, { arcScale: 8 }, { frame: 361 }, { tilt: -61 }, { goo: -1 }, { goo: 25 }, { squish: 1.1 }, { ripple: -.1 }, { openingDistance: 101 }, { splitRadius: 39 }, { cutGap: 0 }, { reverse: 1 }, { guides: "true" }, { easing: "url(javascript:x)" }, { background: "red" }, { view: "iframe" }, { playback: "auto" }, { unknown: "unexpected" }]) {
    const bad = { ...defaultAnimationSettings, ...patch }
    assert.equal(validateAnimationSettings(bad), null)
    assert.equal(parseAnimationSettingsHash(`#motion=${encodeURIComponent(JSON.stringify(bad))}`), null)
    assert.throws(() => animationSettingsHash(bad))
  }
  assert.equal(validateAnimationSettings({ ...defaultAnimationSettings, frame: NaN }), null)
  assert.equal(validateAnimationSettings({ ...defaultAnimationSettings, duration: Infinity }), null)
  assert.equal(validateAnimationSettings({ ...defaultAnimationSettings, goo: undefined }), null)
})
test("boundary settings remain usable and unknown prototype keys are rejected", () => {
  const boundaries = { ...defaultAnimationSettings, duration: 800, size: 48, arcScale: 1.2, goo: 24, squish: 0, ripple: 1, tilt: -60, frame: 360 }
  assert.deepEqual(parseAnimationSettingsHash(animationSettingsHash(boundaries)), boundaries)
  const unsafe = JSON.parse(JSON.stringify(defaultAnimationSettings).replace('"version":3', '"version":3,"__proto__":{"polluted":true}'))
  assert.equal(validateAnimationSettings(unsafe), null)
  assert.equal({}.polluted, undefined)
})

test("older rigid-motion links keep their look and playback but take the liquid defaults", () => {
  const base={duration:2400,size:204,arcScale:.9,tilt:10,reverse:true,cutThrough:true,guides:true,easing:"smooth",background:"dark",view:"wordmark",playback:"hover",frame:211}
  const v1={...base,version:1,cutGap:6}
  const v2={...base,version:2,cutGap:3,openingDistance:80,splitRadius:60,openingAngle:20,openAt:30,closeAt:300}
  for(const old of [v1,v2]){
    const result=parseAnimationSettingsHash(`#motion=${encodeURIComponent(JSON.stringify(old))}`)
    assert.deepEqual(result,{...defaultAnimationSettings,...base})
    assert.equal(parseAnimationSettingsHash(`#motion=${encodeURIComponent(JSON.stringify({...old,unexpected:true}))}`),null)
  }
  assert.equal(parseAnimationSettingsHash(`#motion=${encodeURIComponent(JSON.stringify({...v1,version:2}))}`),null)
  assert.equal(parseAnimationSettingsHash(`#motion=${encodeURIComponent(JSON.stringify({...v2,size:9999}))}`),null)
})
