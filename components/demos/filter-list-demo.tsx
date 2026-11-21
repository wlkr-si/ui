"use client"

import { FilterList } from "@/registry/wlkr/filter-list"

const projects = [
  { id: "studio", label: "Brand Studio", description: "The source of truth for a considered identity.", keywords: ["design", "assets"] },
  { id: "weather", label: "WeatherGoblin", description: "A little character in your daily forecast.", keywords: ["weather", "app"] },
  { id: "bible", label: "PatriBible", description: "Scripture, thoughtfully within reach.", keywords: ["reader", "search"] },
]

export function FilterListDemo() {
  return <FilterList items={projects} label="Search projects" placeholder="Search projects…" />
}
