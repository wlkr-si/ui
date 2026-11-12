import test from "node:test"
import assert from "node:assert/strict"
import { defaultAnimationSettings, validateAnimationSettings, animationSettingsHash, parseAnimationSettingsHash } from "../lib/animation-room-settings.ts"

test("a shared room preserves every visual and playback setting without changing defaults", () => {
  const custom = { ...defaultAnimationSettings, duration: 3210, size: 208, arcScale: .81, cutGap: 12, tilt: 17, frame: 233.5, reverse: true, guides: true, easing: "smooth", background: "checkerboard", view: "wordmark", playback: "hover" }
  assert.deepEqual(parseAnimationSettingsHash(animationSettingsHash(custom)), custom)
  const received = parseAnimationSettingsHash(animationSettingsHash(custom)); received.size = 48
  assert.equal(custom.size, 208)
  assert.equal(defaultAnimationSettings.size, 200)
})
test("invalid or unsupported links never reach component controls", () => {
  for (const hash of ["", "#pixels=other", "#motion=%", "#motion=null", "#motion=%5B%5D", "#motion=" + "x".repeat(8193)]) assert.equal(parseAnimationSettingsHash(hash), null)
  for (const patch of [{ version: 3 }, { duration: "1800" }, { size: 0 }, { arcScale: 8 }, { frame: 361 }, { tilt: -61 }, { cutGap: -1 }, { openingDistance: 101 }, { splitRadius: 39 }, { openingAngle: 91 }, { openAt: 121 }, { closeAt: 239 }, { reverse: 1 }, { guides: "true" }, { easing: "url(javascript:x)" }, { background: "red" }, { view: "iframe" }, { playback: "auto" }, { unknown: "unexpected" }]) {
    const bad = { ...defaultAnimationSettings, ...patch }
    assert.equal(validateAnimationSettings(bad), null)
    assert.equal(parseAnimationSettingsHash(`#motion=${encodeURIComponent(JSON.stringify(bad))}`), null)
    assert.throws(() => animationSettingsHash(bad))
  }
  assert.equal(validateAnimationSettings({ ...defaultAnimationSettings, frame: NaN }), null)
  assert.equal(validateAnimationSettings({ ...defaultAnimationSettings, duration: Infinity }), null)
  assert.equal(validateAnimationSettings({ ...defaultAnimationSettings, cutGap: undefined }), null)
})
test("boundary settings remain usable and unknown prototype keys are rejected", () => {
  const boundaries = { ...defaultAnimationSettings, duration: 800, size: 48, arcScale: 1.2, cutGap: 24, tilt: -60, frame: 360 }
  assert.deepEqual(parseAnimationSettingsHash(animationSettingsHash(boundaries)), boundaries)
  const unsafe = JSON.parse(JSON.stringify(defaultAnimationSettings).replace('"version":2', '"version":2,"__proto__":{"polluted":true}'))
  assert.equal(validateAnimationSettings(unsafe), null)
  assert.equal({}.polluted, undefined)
})

test("version-one links migrate common fields into physical separation defaults", () => {
  const old={...defaultAnimationSettings,version:1,size:204,frame:211,cutGap:6,reverse:true,background:"dark"}
  for(const key of ["openingDistance","splitRadius","openingAngle","openAt","closeAt"])delete old[key]
  const result=parseAnimationSettingsHash(`#motion=${encodeURIComponent(JSON.stringify(old))}`)
  assert.equal(result.version,2);assert.equal(result.size,204);assert.equal(result.frame,211);assert.equal(result.reverse,true);assert.equal(result.cutGap,0)
  assert.equal(result.openingDistance,64);assert.equal(result.splitRadius,74)
  assert.equal(parseAnimationSettingsHash(`#motion=${encodeURIComponent(JSON.stringify({...old,unexpected:true}))}`),null)
})
