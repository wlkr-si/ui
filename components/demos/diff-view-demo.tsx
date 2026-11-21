"use client"

import { DiffView } from "@/registry/wlkr/diff-view"

const before = `import type { Config } from "./types"

export function loadConfig(env: Record<string, string>): Config {
  const port = Number(env.PORT) || 3000
  const host = env.HOST ?? "localhost"
  const debug = env.DEBUG === "1"
  const region = env.REGION ?? "us-east"
  const timeout = 5000
  const retries = 2
  const cache = true
  const logLevel = debug ? "debug" : "info"

  return { port, host, debug, region, timeout, retries, cache, logLevel }
}
`

const after = `import type { Config } from "./types"

export function loadConfig(env: Record<string, string>): Config {
  const port = Number(env.PORT) || 8080
  const host = env.HOST ?? "localhost"
  const debug = env.DEBUG === "1"
  const region = env.REGION ?? "us-east"
  const timeout = 5000
  const retries = 2
  const cache = true
  const logLevel = env.LOG_LEVEL ?? (debug ? "debug" : "info")
  const tracing = env.TRACING === "on"

  return { port, host, debug, region, timeout, retries, cache, logLevel, tracing }
}
`

export function DiffViewDemo() {
  return (
    <div className="w-full max-w-2xl">
      <DiffView title="src/config.ts" before={before} after={after} context={2} />
    </div>
  )
}
