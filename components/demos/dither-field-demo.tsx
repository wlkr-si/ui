"use client"

import * as React from "react"
import { SoftCombobox } from "@/components/soft-combobox"
import { DitherField, type DitherFieldProps } from "@/registry/wlkr/dither-field"

type Pattern = NonNullable<DitherFieldProps["pattern"]>

const PATTERNS: { value: Pattern; label: string }[] = [
  { value: "waves", label: "Waves" },
  { value: "orbit", label: "Orbit" },
  { value: "noise", label: "Noise" },
  { value: "linear", label: "Linear" },
]

export function DitherFieldDemo() {
  const [pattern, setPattern] = React.useState<Pattern>("waves")
  return <div className="flex w-full flex-col items-start gap-5">
    <DitherField className="h-[300px] w-full" pattern={pattern} accent>
      <div className="flex h-full items-center justify-center px-6">
        <p className="m-0 text-center text-[34px] font-[640] leading-none tracking-[-0.05em] text-foreground [paint-order:stroke_fill] [-webkit-text-stroke:8px_var(--control-surface)] sm:text-[44px]">Soft light, hard pixels.</p>
      </div>
    </DitherField>
    <div className="flex items-center gap-3 px-4">
      <span className="text-xs text-muted-foreground">Pattern</span>
      <SoftCombobox label="Pattern" value={pattern} onChange={value => setPattern(value as Pattern)} options={PATTERNS} />
    </div>
  </div>
}
