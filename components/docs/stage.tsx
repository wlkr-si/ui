"use client"

import * as React from "react"
import { RotateCcw } from "lucide-react"

/** The preview surface. Replay remounts the demo, which is what entrance animations need. */
export function Stage({ children, variant = "center", label }: { children: React.ReactNode; variant?: "center" | "fill" | "plain"; label: string }) {
  const [run, setRun] = React.useState(0)
  return <div className="doc-stage" data-variant={variant}>
    <div className="doc-stage-content" key={run}>{children}</div>
    {variant !== "plain" && <button type="button" className="doc-stage-replay" aria-label={`Replay ${label} preview`} onClick={() => setRun(value => value + 1)}><RotateCcw aria-hidden="true" /></button>}
  </div>
}
