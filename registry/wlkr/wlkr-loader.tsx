"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type WlkrLoaderProps = {
  variant?: "orbit" | "breathe" | "bars" | "dots"
  size?: number
  /** Milliseconds per beat, clamped to 800–10000. */
  duration?: number
  /** Phase delay between the two halves, clamped to 0–2000. */
  stagger?: number
  label?: string
  decorative?: boolean
  paused?: boolean
  className?: string
}
const clamp=(value:number,min:number,max:number,fallback:number)=>Math.max(min,Math.min(max,Number.isFinite(value)?value:fallback))
// Exact two paths and resting angle from WLKR.SI's approved Open Lens master.
const styles=`
.wlkr-loader{display:inline-flex;position:relative;flex-shrink:0;vertical-align:middle;line-height:0}
.wlkr-loader>svg{display:block;width:100%;height:100%;overflow:hidden}
.wlkr-loader-orbit{transform-box:view-box;transform-origin:center;animation:wlkr-lens-orbit var(--wlkr-duration) linear infinite;animation-play-state:paused}
.wlkr-loader-half{animation-duration:var(--wlkr-duration);animation-timing-function:cubic-bezier(.77,0,.175,1);animation-iteration-count:infinite;animation-play-state:paused}
.wlkr-loader-top{animation-name:wlkr-lens-open-top}
.wlkr-loader-bottom{animation-name:wlkr-lens-open-bottom;animation-delay:var(--wlkr-delay)}
.wlkr-loader[data-motion=running] :is(.wlkr-loader-orbit,.wlkr-loader-half){animation-play-state:running}
.wlkr-loader[data-variant=breathe] .wlkr-loader-orbit{animation-name:wlkr-lens-rock;animation-timing-function:cubic-bezier(.77,0,.175,1)}
@keyframes wlkr-lens-orbit{to{transform:rotate(360deg)}}
@keyframes wlkr-lens-rock{0%,100%{transform:rotate(0deg)}50%{transform:rotate(24deg)}}
@keyframes wlkr-lens-open-top{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes wlkr-lens-open-bottom{0%,100%{transform:translateY(0)}50%{transform:translateY(6px)}}
@media(prefers-reduced-motion:reduce){.wlkr-loader :is(.wlkr-loader-orbit,.wlkr-loader-half){animation:none;transform:none}}
`

/** One loading announcement with the current WLKR.SI Open Lens mark. */
export function WlkrLoader({variant="orbit",size=48,duration=3200,stagger=120,label="Loading",decorative=false,paused=false,className}:WlkrLoaderProps) {
  const root=React.useRef<HTMLSpanElement>(null)
  const [motion,setMotion]=React.useState(false)
  const dimension=clamp(size,16,240,48)
  const beat=clamp(duration,800,10000,3200)
  const offset=clamp(stagger,0,2000,120)
  // Keep existing copied usages working while retiring the old six-cell artwork.
  const mode=variant==="breathe"||variant==="dots"?"breathe":"orbit"
  React.useEffect(()=>{
    const preference=window.matchMedia("(prefers-reduced-motion: reduce)")
    let intersecting=false
    function sync(){setMotion(!paused&&!preference.matches&&intersecting&&!document.hidden)}
    const observer=new IntersectionObserver(entries=>{intersecting=entries[0]?.isIntersecting??false;sync()},{threshold:.05})
    if(root.current)observer.observe(root.current)
    preference.addEventListener("change",sync)
    document.addEventListener("visibilitychange",sync)
    sync()
    return()=>{observer.disconnect();preference.removeEventListener("change",sync);document.removeEventListener("visibilitychange",sync)}
  },[paused])
  return <span ref={root} className={cn("wlkr-loader",className)} style={{width:dimension,height:dimension,"--wlkr-duration":`${beat}ms`,"--wlkr-delay":`${offset}ms`} as React.CSSProperties} role={decorative?undefined:"status"} aria-hidden={decorative?true:undefined} data-motion={motion?"running":"paused"} data-variant={mode}>
    <style>{styles}</style>
    <svg viewBox="0 0 256 256" aria-hidden="true" focusable="false" fill="currentColor">
      <g className="wlkr-loader-orbit"><g transform="translate(128 128) rotate(-24)">
        <g className="wlkr-loader-half wlkr-loader-top"><path transform="translate(0 -7)" d="M-87,-5 C-87,-53 -47,-92 1,-92 C49,-92 89,-53 89,-5 C89,3 83,9 75,9 C67,9 61,3 61,-5 C61,-38 34,-64 1,-64 C-32,-64 -59,-38 -59,-5 C-59,3 -65,9 -73,9 C-81,9 -87,3 -87,-5 Z"/></g>
        <g className="wlkr-loader-half wlkr-loader-bottom"><path transform="translate(0 8)" d="M-92,24 C-94,17 -89,12 -82,12 H68 C76,12 81,18 79,25 C70,65 35,91 -7,91 C-48,91 -82,64 -92,24 Z"/></g>
      </g></g>
    </svg>
    {!decorative&&<span style={{position:"absolute",width:1,height:1,padding:0,margin:-1,overflow:"hidden",clipPath:"inset(50%)",whiteSpace:"nowrap",border:0}}>{label}</span>}
  </span>
}
