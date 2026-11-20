import { readFile } from "node:fs/promises"
import { Showcase } from "@/components/showcase"
import { highlightCode } from "@/lib/highlight-code"
import { showcaseExamples, registryConfig } from "@/lib/code-samples"
export default async function Home() {
  const names = ["copy-command", "async-action", "filter-list", "pixel-object", "wlkr-loader", "page-intro", "index-row", "text-link", "theme-toggle", "typography", "footer-controls", "github-star", "decode-text", "dot-field", "dot-matrix", "hold-action", "liquid-tabs", "pixel-image", "pixel-progress", "rolling-number", "shortcut", "ticker"]
  const sources: Record<string, string> = Object.fromEntries(await Promise.all(names.map(async name => [name, await readFile(`${process.cwd()}/registry/wlkr/${name}.${name === "typography" ? "css" : "tsx"}`, "utf8")])))
  const highlights = Object.fromEntries(await Promise.all([
    Promise.resolve(["registryConfig", await highlightCode(registryConfig, "json")]),
    ...Object.entries(sources).map(async ([name, code]) => [`source:${name}`, await highlightCode(code, name === "typography" ? "css" : "tsx")]),
    ...Object.entries(showcaseExamples).map(async ([name, code]) => [`example:${name}`, await highlightCode(code, "tsx")]),
  ]))
  return <Showcase sources={sources} highlights={highlights} />
}
