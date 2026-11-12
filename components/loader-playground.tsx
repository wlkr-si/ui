"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodePanel } from "@/components/code-panel"
import { Disclosure } from "@/components/disclosure"
import { WlkrLoader } from "@/registry/wlkr/wlkr-loader"
import { ChoiceControl, RangeControl } from "@/components/playground-controls"

const defaults={variant:"orbit" as "orbit"|"breathe",size:64,duration:3200,stagger:120}
export function LoaderPlayground() {
  const [settings,setSettings]=React.useState({...defaults})
  const [paused,setPaused]=React.useState(false)
  const code=`import { WlkrLoader } from "@/components/wlkr/wlkr-loader"\n\n<WlkrLoader\n  variant="${settings.variant}"\n  size={${settings.size}}\n  duration={${settings.duration}}\n  stagger={${settings.stagger}}\n  label="Loading projects"${paused?"\n  paused":""}\n/>`
  return <Tabs defaultValue="preview" className="docs-tabs mt-6"><TabsList aria-label="WLKR loader view"><TabsTrigger value="preview">Preview</TabsTrigger><TabsTrigger value="usage">Usage</TabsTrigger></TabsList><TabsContent value="preview"><div className="preview"><div className="preview-content flex flex-col items-center gap-5"><div className="loader-stage"><button type="button" className="loader-canvas" aria-label={paused?"Resume loader animation":"Pause loader animation"} aria-pressed={paused} onClick={()=>setPaused(value=>!value)}><WlkrLoader {...settings} paused={paused} decorative/></button></div></div></div><Disclosure title="Customize" description="Shape, movement, and light" className="customize"><div className="customize-heading"><ChoiceControl label="Motion" value={settings.variant} onChange={value=>setSettings(current=>({...current,variant:value as "orbit"|"breathe"}))} options={[{value:"orbit",label:"Orbit"},{value:"breathe",label:"Breathe"}]}/><Button type="button" variant="ghost" onClick={()=>{setSettings({...defaults});setPaused(false)}}>Reset</Button></div><FieldGroup className="customize-grid">
    <RangeControl label="Loader size" min={24} max={160} step={4} unit="px" value={settings.size} onChange={size=>setSettings(current=>({...current,size}))}/>
    <RangeControl label="Cycle duration" min={800} max={5000} step={100} unit="ms" value={settings.duration} onChange={duration=>setSettings(current=>({...current,duration}))}/>
    <RangeControl label="Phase delay" min={0} max={800} step={20} unit="ms" value={settings.stagger} onChange={stagger=>setSettings(current=>({...current,stagger}))}/>
  </FieldGroup></Disclosure></TabsContent><TabsContent value="usage"><div className="playground-code"><CodePanel code={code} filename="loader-preview.tsx" language="tsx" /></div><p className="customize-note">Use decorative when a nearby control already announces loading. Otherwise the label is announced once, with no animation updates.</p></TabsContent></Tabs>
}
