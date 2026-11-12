import { createHash } from "node:crypto"
import { execFileSync } from "node:child_process"
import { readFile, writeFile } from "node:fs/promises"

const catalog = JSON.parse(await readFile("out/registry.json", "utf8"))
const paths = ["registry.json", "r/registry.json", ...catalog.items.map(item => `r/${item.name}.json`)]
const registrySha256 = Object.fromEntries(await Promise.all(paths.map(async path => [`/${path}`, createHash("sha256").update(await readFile(`out/${path}`)).digest("hex")])))
const info = {
  sourceCommit: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
  builtAt: new Date().toISOString(),
  registrySha256,
  pageSha256: {
    "/": createHash("sha256").update(await readFile("out/index.html")).digest("hex"),
    "/pixels": createHash("sha256").update(await readFile("out/pixels.html")).digest("hex"),
    "/contrast": createHash("sha256").update(await readFile("out/contrast.html")).digest("hex"),
  },
  imageSha256: Object.fromEntries(await Promise.all([
    "/opengraph-image", "/pixels/opengraph-image", "/contrast/opengraph-image",
  ].map(async path => [path, createHash("sha256").update(await readFile(`out${path}`)).digest("hex")]))),

}
await writeFile("out/build-info.json", JSON.stringify(info, null, 2) + "\n")
