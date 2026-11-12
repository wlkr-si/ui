"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { FieldGroup, FieldLabel } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodePanel } from "@/components/code-panel"
import { Disclosure } from "@/components/disclosure"
import { WlkrLoader } from "@/registry/wlkr/wlkr-loader"
import { ChoiceControl, RangeControl } from "@/components/playground-controls"

type Playback = "loop" | "bounce"
const durations: Record<Playback, number> = { loop: 1800, bounce: 350 }
const defaults = { size: 64, duration: durations.loop, playback: "loop" as Playback, liquid: true }
export function LoaderPlayground() {
  const [settings, setSettings] = React.useState({ ...defaults })
  const [paused, setPaused] = React.useState(false)
  const [bouncing, setBouncing] = React.useState(false)
  const [restart, setRestart] = React.useState(0)
  const switchId = React.useId()
  const bounce = settings.playback === "bounce"
  const play = () => { if (matchMedia("(prefers-reduced-motion: reduce)").matches || bouncing) return; setRestart(value => value + 1); setBouncing(true) }
  const hover = () => { if (bounce && matchMedia("(hover: hover) and (pointer: fine)").matches) play() }
  const code = bounce
    ? `import * as React from "react"\nimport { WlkrLoader } from "@/components/wlkr/wlkr-loader"\n\nexport function HomeMark() {\n  const [playing, setPlaying] = React.useState(false)\n  return (\n    <a href="/" aria-label="Home" onPointerEnter={() => setPlaying(true)}>\n      <WlkrLoader\n        size={${settings.size}}\n        duration={${settings.duration}}\n        cutThrough\n        loop={false}\n        bounce\n        frame={playing ? undefined : 0}\n        onCycleComplete={() => setPlaying(false)}\n        decorative\n      />\n    </a>\n  )\n}`
    : `import { WlkrLoader } from "@/components/wlkr/wlkr-loader"\n\n<WlkrLoader\n  ${[`size={${settings.size}}`, `duration={${settings.duration}}`, ...(settings.liquid ? ["cutThrough"] : []), `label="Loading projects"`, ...(paused ? ["paused"] : [])].join("\n  ")}\n/>`
  return <Tabs defaultValue="preview" className="docs-tabs mt-6"><TabsList aria-label="WLKR loader view"><TabsTrigger value="preview">Preview</TabsTrigger><TabsTrigger value="usage">Usage</TabsTrigger></TabsList><TabsContent value="preview"><div className="preview"><div className="preview-content flex flex-col items-center gap-5"><div className="loader-stage" onPointerEnter={hover}>
    <button type="button" className="loader-canvas" aria-label={bounce ? "Play loader bounce" : paused ? "Resume loader animation" : "Pause loader animation"} aria-pressed={bounce ? undefined : paused} onClick={() => bounce ? play() : setPaused(value => !value)}>
      {bounce ? <WlkrLoader size={settings.size} duration={settings.duration} cutThrough={settings.liquid} loop={false} bounce frame={bouncing ? undefined : 0} restartKey={restart} onCycleComplete={() => setBouncing(false)} decorative />
        : <WlkrLoader size={settings.size} duration={settings.duration} cutThrough={settings.liquid} paused={paused} decorative />}
    </button>
  </div></div></div><Disclosure title="Customize" className="customize"><div className="customize-heading"><a className="text-link" href="/animation">Animation room</a><Button type="button" variant="ghost" onClick={() => { setSettings({ ...defaults }); setPaused(false); setBouncing(false) }}>Reset</Button></div><FieldGroup className="customize-grid">
    <ChoiceControl label="Playback" value={settings.playback} onChange={value => { const playback = value as Playback; setSettings(current => ({ ...current, playback, duration: durations[playback], liquid: playback === "bounce" ? true : current.liquid })); setPaused(false); setBouncing(false) }} options={[{ value: "loop", label: "Loop" }, { value: "bounce", label: "Hover bounce" }]} />
    {!bounce && <div className="flex min-h-11 items-center justify-between gap-4"><FieldLabel htmlFor={switchId}>Liquid</FieldLabel><Switch id={switchId} checked={settings.liquid} onCheckedChange={liquid => setSettings(current => ({ ...current, liquid }))} /></div>}
    <RangeControl label="Loader size" min={24} max={160} step={4} unit="px" value={settings.size} onChange={size => setSettings(current => ({ ...current, size }))} />
    <RangeControl label="Cycle duration" min={300} max={5000} step={50} unit="ms" value={settings.duration} onChange={duration => setSettings(current => ({ ...current, duration }))} />
  </FieldGroup></Disclosure></TabsContent><TabsContent value="usage"><div className="playground-code"><CodePanel code={code} filename="loader-preview.tsx" language="tsx" /></div><p className="customize-note">{bounce ? "Hover bounce plays once from rest and is skipped with reduced motion. Also trigger it on click or focus for touch and keyboard users." : "Use decorative when a nearby control already announces loading. Otherwise the label is announced once, with no animation updates."}</p></TabsContent></Tabs>
}
