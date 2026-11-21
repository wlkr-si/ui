"use client"

import { useState } from "react"
import { PixelCheckbox } from "@/registry/wlkr/pixel-checkbox"

const channels = ["Deploys", "Incidents"] as const

export function PixelCheckboxDemo() {
  const [on, setOn] = useState<boolean[]>([true, false])
  const all = on.every(Boolean)
  const some = on.some(Boolean)

  return (
    <div className="flex flex-col gap-3 text-sm">
      <PixelCheckbox
        checked={all}
        indeterminate={some && !all}
        onCheckedChange={() => setOn(on.map(() => !all))}
      >
        Select all
      </PixelCheckbox>
      <div className="flex flex-col gap-3 pl-7">
        {channels.map((name, index) => (
          <PixelCheckbox
            key={name}
            checked={on[index]}
            onCheckedChange={value => setOn(on.map((v, i) => (i === index ? value : v)))}
          >
            {name}
          </PixelCheckbox>
        ))}
      </div>
    </div>
  )
}
