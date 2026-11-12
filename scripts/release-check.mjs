import { execFileSync, spawnSync } from "node:child_process"
import { access, readFile } from "node:fs/promises"

function requireClean() {
  const status = execFileSync("git", ["status", "--porcelain"], { encoding: "utf8" })
  if (status.trim()) throw new Error("Release requires committed source and registry outputs. Commit or preserve outstanding changes before retrying.")
}
function run(...args) {
  const result = spawnSync("pnpm", args, { stdio: "inherit" })
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}

requireClean()
const revision = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim()
run("test:release")
run("test:mask")
run("test:pixels-cli")
run("test:contrast")
run("test:contrast-cli")
run("test:contrast-options")
run("build")
run("lint")
run("typecheck")
run("test:social-previews")
// Registry generation must reproduce the committed static artifacts exactly.
requireClean()
const catalog = JSON.parse(await readFile("out/registry.json", "utf8"))
for (const path of ["out/build-info.json", "out/llms.txt", "out/index.html", "out/pixels.html", "out/contrast.html", "out/opengraph-image", "out/pixels/opengraph-image", "out/contrast/opengraph-image", "out/404.html", "out/registry.json", "out/r/registry.json", ...catalog.items.map(item => `out/r/${item.name}.json`)]) await access(path)
console.log(`Static release verified from ${revision}.`)
