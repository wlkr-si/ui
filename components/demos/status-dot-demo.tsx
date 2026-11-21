"use client"

import { StatusDot } from "@/registry/wlkr/status-dot"

const projects = [
  { name: "Brand Studio", status: "live", word: "Live" },
  { name: "WeatherGoblin", status: "busy", word: "Building" },
  { name: "PatriBible", status: "warning", word: "Degraded" },
  { name: "Contrast", status: "error", word: "Down" },
  { name: "Pixels", status: "idle", word: "Idle" },
] as const

export function StatusDotDemo() {
  return (
    <div className="flex w-full flex-col items-start gap-5">
      <ul className="flex w-full max-w-80 flex-col gap-3 text-sm">
        {projects.map(project => (
          <li key={project.name} className="flex items-baseline justify-between gap-4">
            <span>{project.name}</span>
            <StatusDot status={project.status} className="text-muted-foreground">{project.word}</StatusDot>
          </li>
        ))}
      </ul>
      <p className="text-sm">All systems <StatusDot status="live">operational</StatusDot></p>
    </div>
  )
}
