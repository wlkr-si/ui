"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/registry/wlkr/input"

export function InputDemo() {
  const [query, setQuery] = useState("Ambient")

  return <Input
    type="search"
    aria-label="Search tracks"
    placeholder="Search tracks"
    icon={<Search />}
    clearable
    clearLabel="Clear search"
    value={query}
    onChange={event => setQuery(event.target.value)}
  />
}
