"use client"

import { useState } from "react"
import { Combobox } from "@/registry/wlkr/combobox"

const options = [{ value: "bach", label: "Johann Sebastian Bach" }, { value: "faure", label: "Gabriel Fauré" }, { value: "bartok", label: "Béla Bartók" }, { value: "chopin", label: "Frédéric Chopin" }, { value: "ravel", label: "Maurice Ravel", disabled: true }]
export function ComboboxDemo() {
  const [value, setValue] = useState("")
  return <div className="flex flex-wrap items-center justify-center gap-4">
    <Combobox aria-label="Composer" placeholder="Find a composer" options={options} value={value} onValueChange={setValue} />
    <Combobox size="sm" aria-label="Favourite composer" options={options} defaultValue="faure" />
    <Combobox aria-label="Unavailable composer" options={options} placeholder="Unavailable" disabled />
  </div>
}
