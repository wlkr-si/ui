"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { FieldLabel } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { ChoiceControl, RangeControl } from "@/components/playground-controls"
import { WlkrLoader } from "@/registry/wlkr/wlkr-loader"
import { animationSettingsHash, defaultAnimationSettings, parseAnimationSettingsHash, type AnimationRoomSettings } from "@/lib/animation-room-settings"
import styles from "./animation-room.module.css"

function createMotionHashStore() {
  let current = ""
  return {
    subscribe(listener: () => void) { window.addEventListener("hashchange", listener); return () => window.removeEventListener("hashchange", listener) },
    read() { const hash = window.location.hash; if (hash.startsWith("#motion=")) current = hash.slice(0, 8193); return current },
    server() { return "" },
  }
}
const normalized = (angle: number) => ((angle % 360) + 360) % 360

export function AnimationRoom() {
  const [hashStore] = React.useState(createMotionHashStore)
  const hash = React.useSyncExternalStore(hashStore.subscribe, hashStore.read, hashStore.server)
  const motionHash = hash.startsWith("#motion=") ? hash : ""
  const shared = parseAnimationSettingsHash(motionHash)
  return <RoomContent key={motionHash || "default"} initial={shared ?? defaultAnimationSettings} shared={!!shared} invalid={!!motionHash && !shared} />
}
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  const id = React.useId()
  return <div className={styles.toggle}><FieldLabel htmlFor={id}>{label}</FieldLabel><Switch id={id} checked={checked} onCheckedChange={onChange} /></div>
}
function RoomContent({ initial, shared, invalid }: { initial: AnimationRoomSettings; shared: boolean; invalid: boolean }) {
  const [settings, setSettings] = React.useState<AnimationRoomSettings>({ ...initial })
  const [playing, setPlaying] = React.useState(!shared && initial.playback === "loop")
  const [startAngle, setStartAngle] = React.useState(initial.frame)
  const [restart, setRestart] = React.useState(0)
  const [shareLink, setShareLink] = React.useState("")
  const [copyState, setCopyState] = React.useState<"idle" | "copied" | "manual">("idle")
  const stage = React.useRef<HTMLDivElement>(null)
  const linkInput = React.useRef<HTMLInputElement>(null)
  const shareGeneration = React.useRef(0)
  const clearShare = () => { shareGeneration.current++; setCopyState("idle"); setShareLink("") }
  const update = <K extends keyof AnimationRoomSettings>(key: K, value: AnimationRoomSettings[K]) => { clearShare(); setSettings(current => ({ ...current, [key]: value })) }
  const currentAngle = () => {
    const arc = stage.current?.querySelector<SVGGElement>('[data-visible-arc="true"]')
    if (!arc) return settings.frame
    try { const matrix = new DOMMatrixReadOnly(getComputedStyle(arc).transform); return normalized(Math.atan2(matrix.b, matrix.a) * 180 / Math.PI) } catch { return settings.frame }
  }
  const stop = () => { const angle = currentAngle(); update("frame", angle); setStartAngle(angle); setPlaying(false) }
  const play = () => { clearShare(); if (matchMedia("(prefers-reduced-motion: reduce)").matches) { setPlaying(false); return } setStartAngle(settings.frame); setRestart(value => value + 1); setPlaying(true) }
  const scrub = (angle: number) => { update("frame", angle); setStartAngle(angle); setPlaying(false) }
  const reset = () => { setSettings({ ...defaultAnimationSettings }); setStartAngle(0); setPlaying(true); setRestart(value => value + 1); clearShare() }
  const finish = () => { setPlaying(false); update("frame", normalized(startAngle)) }
  const hover = () => { if (settings.playback === "hover" && !playing && !matchMedia("(prefers-reduced-motion: reduce)").matches && matchMedia("(hover: hover) and (pointer: fine)").matches) play() }
  const share = async () => {
    const generation = ++shareGeneration.current
    const frame = playing ? currentAngle() : settings.frame
    const url = new URL(window.location.pathname, window.location.origin)
    url.hash = animationSettingsHash({ ...settings, frame })
    setShareLink(url.href)
    try { await navigator.clipboard.writeText(url.href); if (generation === shareGeneration.current) setCopyState("copied") } catch { if (generation === shareGeneration.current) setCopyState("manual") }
  }
  React.useEffect(() => { if (copyState === "manual") { linkInput.current?.focus(); linkInput.current?.select() } }, [copyState])
  const mark = <div className={styles.mark} style={{ width: settings.size }}>
    {settings.guides && <svg className={styles.guides} viewBox="0 0 256 256" aria-hidden="true"><circle cx="128" cy="128" r={settings.splitRadius} /><path d="M128 12V244M12 128H244" /><circle cx="128" cy="128" r="3" /></svg>}
    <WlkrLoader size={settings.size} duration={settings.duration} cutThrough={settings.cutThrough} cutGap={settings.cutGap} openingDistance={settings.openingDistance} splitRadius={settings.splitRadius} openingAngle={settings.openingAngle} openAt={settings.openAt} closeAt={settings.closeAt} arcScale={settings.arcScale} tilt={settings.tilt} reverse={settings.reverse} easing={settings.easing} frame={playing ? undefined : settings.frame / 360} startAngle={startAngle} loop={settings.playback === "loop"} restartKey={restart} paused={!playing} onCycleComplete={finish} decorative />
  </div>
  return <div className={styles.room}>
    {invalid && <p role="alert" className={styles.notice}>That settings link is invalid.</p>}
    <div className={styles.workspace}>
      <section className={styles.preview} aria-label="Animation preview">
        <div className={styles.previewTabs} role="group" aria-label="Preview shape"><Button variant="ghost" aria-pressed={settings.view === "loader"} onClick={() => update("view", "loader")}>Loader</Button><Button variant="ghost" aria-pressed={settings.view === "wordmark"} onClick={() => update("view", "wordmark")}>Wordmark</Button></div>
        <div ref={stage} className={`${styles.stage} ${styles[settings.background]}`} onPointerEnter={hover} data-animation-stage data-playback={settings.playback}>
          {settings.view === "loader" ? mark : <div className={styles.wordmark} style={{ width: settings.size * 2.493 }}><div className={styles.wordmarkMark}>{mark}</div><svg viewBox="0 0 513 105" aria-hidden="true" focusable="false" fill="currentColor"><g>
  <g fill="none" stroke="currentColor" strokeWidth="19.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 18 C15 40 18 65 23 76 Q26 84 32 84 Q39 84 43 76 L55 49 L67 76 Q71 84 78 84 Q84 84 88 76 C94 62 98 39 102 18"/>
    <path transform="translate(120 0)" d="M13 18 V67 Q13 83 30 83 H55"/>
    <path transform="translate(188 0)" d="M13 18 V83 M15 58 C33 56 47 42 60 19 M35 52 C47 60 54 71 64 83"/>
    <path transform="translate(271 0)" d="M13 83 V28 Q13 17 24 17 H38 C54 17 64 25 64 37 C64 50 54 57 38 57 H15 M38 57 C50 63 57 73 65 83"/>
    <path transform="translate(392 0)" d="M58 24 C48 17 37 15 27 17 C16 19 9 26 9 35 C9 45 18 49 32 52 C49 56 60 61 60 71 C60 81 49 86 35 86 C24 86 13 83 5 77"/>
    <path transform="translate(470 0)" d="M13 18 V83"/>
  </g>
  <circle cx="365" cy="84" r="9.75" fill="currentColor"/>
</g></svg></div>}
        </div>
        <div className={styles.transport}><Button variant="outline" onClick={playing ? stop : play}>{playing ? "Pause" : settings.playback === "hover" ? "Play once" : "Play"}</Button><Button variant="ghost" onClick={() => scrub(0)}>Start frame</Button><Button variant="ghost" onClick={reset}>Reset</Button></div>
        <div className={styles.scrubber}><RangeControl label="Frame" value={settings.frame} onChange={scrub} min={0} max={360} step={1} unit="°" /></div>
      </section>
      <section className={styles.controls} aria-label="Animation controls">
        <ChoiceControl label="Playback" value={settings.playback} onChange={value => { clearShare(); const playback = value as AnimationRoomSettings["playback"]; setSettings(current => ({ ...current, playback, frame: 0 })); setStartAngle(0); setPlaying(playback === "loop"); setRestart(value => value + 1) }} options={[{ value: "loop", label: "Loop" }, { value: "hover", label: "Hover once" }]} />
        <ChoiceControl label="Background" value={settings.background} onChange={value => update("background", value as AnimationRoomSettings["background"])} options={[{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }, { value: "checkerboard", label: "Checkerboard" }]} />
        <div className={styles.switches}><Toggle label="Separate pieces" checked={settings.cutThrough} onChange={value => { update("cutThrough", value); setStartAngle(playing ? currentAngle() : settings.frame); setRestart(value => value + 1) }} /><Toggle label="Reverse" checked={settings.reverse} onChange={value => { clearShare(); const frame = currentAngle(); setSettings(current => ({ ...current, reverse: value, frame })); setStartAngle(frame); setRestart(value => value + 1) }} /><Toggle label="Center guides" checked={settings.guides} onChange={value => update("guides", value)} /></div>
        <RangeControl label="Cycle duration" value={settings.duration} onChange={value => update("duration", value)} min={800} max={10000} step={100} unit="ms" />
        <RangeControl label="Size" value={settings.size} onChange={value => update("size", value)} min={48} max={240} step={4} unit="px" />
        <RangeControl label="Arc size" value={settings.arcScale * 100} onChange={value => update("arcScale", value / 100)} min={60} max={120} step={1} unit="%" />
        {settings.cutThrough && <>
          <RangeControl label="Opening distance" value={settings.openingDistance} onChange={value => update("openingDistance", value)} min={0} max={100} step={1} />
          <RangeControl label="Split radius" value={settings.splitRadius} onChange={value => update("splitRadius", value)} min={40} max={100} step={1} />
          <RangeControl label="Opening angle" value={settings.openingAngle} onChange={value => update("openingAngle", value)} min={-90} max={90} step={1} unit="°" />
          <RangeControl label="Open at" value={settings.openAt} onChange={value => update("openAt", value)} min={0} max={120} step={1} unit="°" />
          <RangeControl label="Close at" value={settings.closeAt} onChange={value => update("closeAt", value)} min={240} max={360} step={1} unit="°" />
          <RangeControl label="Split gap" value={settings.cutGap} onChange={value => update("cutGap", value)} min={0} max={24} step={1} />
        </>}
        <RangeControl label="Tilt" value={settings.tilt} onChange={value => update("tilt", value)} min={-60} max={60} step={1} unit="°" />
        <ChoiceControl label="Easing" value={settings.easing} onChange={value => update("easing", value as AnimationRoomSettings["easing"])} options={[{ value: "linear", label: "Linear" }, { value: "smooth", label: "Smooth" }]} />
        <div className={styles.share}><Button variant="outline" onClick={share}>Copy settings link</Button><span role="status" aria-live="polite">{copyState === "copied" ? "Link copied" : copyState === "manual" ? "Copy this link" : ""}</span>{copyState === "manual" && <input ref={linkInput} aria-label="Animation settings link" readOnly value={shareLink} onFocus={event => event.currentTarget.select()} />}</div>
      </section>
    </div>
  </div>
}
