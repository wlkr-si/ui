import { createHash, randomUUID } from "node:crypto"
import { spawnSync } from "node:child_process"
import { open, readFile, unlink } from "node:fs/promises"
import { isDeepStrictEqual } from "node:util"
import { fileURLToPath, pathToFileURL } from "node:url"

export const HOSTS = ["https://ui.wlkr.si", "https://ui.wlkrlabs.com"]
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const sha = bytes => createHash("sha256").update(bytes).digest("hex")
export class ConflictError extends Error {}

export function processAdapter(command, args, spawn = spawnSync) {
  // Inherit the caller's Wrangler authentication/environment; never inspect tokens.
  try {
    const result = spawn(command, args, { env: process.env, encoding: "utf8", timeout: command === "pnpm" && args[0] === "release:check" ? 600_000 : 120_000, maxBuffer: 10 * 1024 * 1024 })
    return { status: result.status, stdout: result.stdout || "", stderr: result.error?.message || result.stderr || "" }
  } catch (error) { return { status: null, stdout: "", stderr: error.message } }
}
function required(result, label) {
  if (result.status !== 0) throw new Error(`${label} failed (${result.status ?? "interrupted"}): ${(result.stderr + "\n" + result.stdout).trim().slice(-4000)}`)
  return result.stdout
}
export function validateReceipt(receipt) {
  const hashes = receipt?.registrySha256
  if (!/^[0-9a-f]{40}$/.test(receipt?.sourceCommit || "") || !Number.isFinite(Date.parse(receipt?.builtAt)) || !hashes || Object.keys(hashes).length !== 15 || !hashes["/registry.json"] || !hashes["/r/registry.json"] || Object.entries(hashes).some(([path, hash]) => !/^\/(?:registry|r\/[a-z0-9-]+)\.json$/.test(path) || !/^[0-9a-f]{64}$/.test(hash))) {
    throw new Error("Invalid build receipt: expected a source commit, build time and all 15 registry hashes.")
  }
  if (receipt.pageSha256 !== undefined && (!isDeepStrictEqual(Object.keys(receipt.pageSha256).sort(), ["/contrast", "/pixels"]) && !isDeepStrictEqual(Object.keys(receipt.pageSha256).sort(), ["/pixels"]) || Object.values(receipt.pageSha256).some(hash => !/^[0-9a-f]{64}$/.test(hash)))) throw new Error("Invalid page receipt: expected /pixels and optional /contrast SHA-256 values.")
  return receipt
}
export function latestDeployment(raw) {
  const deployments = JSON.parse(raw)
  if (!Array.isArray(deployments) || !deployments.length || deployments.some(d => !UUID.test(d.id) || !Number.isFinite(Date.parse(d.created_on)) || !Array.isArray(d.versions))) throw new Error("Wrangler returned an invalid/empty deployment list; inspect deployments manually.")
  deployments.sort((a, b) => Date.parse(b.created_on) - Date.parse(a.created_on))
  if (deployments[1] && Date.parse(deployments[1].created_on) === Date.parse(deployments[0].created_on)) throw new Error("Latest deployment is ambiguous; inspect deployments manually.")
  return deployments[0]
}
function stableVersion(deployment) {
  if (deployment.versions.length !== 1 || deployment.versions[0].percentage !== 100 || !UUID.test(deployment.versions[0].version_id)) throw new Error("Release requires a single version at 100%; gradual/unknown deployments are not changed.")
  return deployment.versions[0].version_id
}
function owned(deployment, version, message) {
  return deployment.versions.length === 1 && deployment.versions[0].percentage === 100 && deployment.versions[0].version_id === version && deployment.annotations?.["workers/message"] === message
}

export async function localReceipt(run = processAdapter, read = readFile) {
  const receipt = validateReceipt(JSON.parse(await read("out/build-info.json", "utf8")))
  const revision = required(await run("git", ["rev-parse", "HEAD"]), "Read source revision").trim()
  if (receipt.sourceCommit !== revision) throw new Error("Build receipt does not match HEAD; rebuild before deployment.")
  const catalog = JSON.parse(await read("out/registry.json", "utf8"))
  const paths = ["/registry.json", "/r/registry.json", ...catalog.items.map(item => `/r/${item.name}.json`)].sort()
  if (!isDeepStrictEqual(paths, Object.keys(receipt.registrySha256).sort())) throw new Error("Build receipt does not match the complete registry catalog.")
  if (!isDeepStrictEqual(Object.keys(receipt.pageSha256 || {}).sort(), ["/contrast", "/pixels"])) throw new Error("Candidate receipt is missing /pixels or /contrast; rebuild before deployment.")
  for (const [path, hash] of Object.entries({ ...receipt.registrySha256, ...receipt.pageSha256 })) if (sha(await read(path === "/pixels" ? "out/pixels.html" : path === "/contrast" ? "out/contrast.html" : `out${path}`)) !== hash) throw new Error(`Local asset differs from receipt: ${path}`)
  return receipt
}

export async function verifyHosts(expected, { fetchImpl = fetch, sleep = ms => new Promise(resolve => setTimeout(resolve, ms)), attempts = 4, delayMs = 2000, timeoutMs = 5000, nonce = randomUUID() } = {}) {
  let failure
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      async function get(host, path) {
        const response = await fetchImpl(`${host}${path}?release=${nonce}-${attempt}`, { credentials: "omit", redirect: "error", cache: "no-store", headers: { "Cache-Control": "no-cache" }, signal: AbortSignal.timeout(timeoutMs) })
        if (!response.ok) throw new Error(`${host}${path}: HTTP ${response.status}`)
        return Buffer.from(await response.arrayBuffer())
      }
      const received = await Promise.allSettled(HOSTS.map(async host => validateReceipt(JSON.parse((await get(host, "/build-info.json")).toString("utf8")))))
      const failed = received.find(result => result.status === "rejected")
      if (failed) throw failed.reason
      const receipts = received.map(result => result.value)
      const target = expected || receipts[0]
      if (receipts.some(receipt => !isDeepStrictEqual(receipt, target))) throw new Error("Public build receipt differs from the exact expected receipt on one or both hosts.")
      const checks = HOSTS.flatMap(host => Object.entries({ ...target.registrySha256, ...target.pageSha256 }).map(([path, hash]) => ({ host, path, hash })))
      for (let offset = 0; offset < checks.length; offset += 4) {
        const batch = await Promise.allSettled(checks.slice(offset, offset + 4).map(async ({ host, path, hash }) => {
          if (sha(await get(host, path)) !== hash) throw new Error(`${host}${path}: asset SHA-256 mismatch`)
        }))
        const rejected = batch.find(result => result.status === "rejected")
        if (rejected) throw rejected.reason
      }
      const finalReceipts = await Promise.allSettled(HOSTS.map(async host => JSON.parse((await get(host, "/build-info.json")).toString("utf8"))))
      if (finalReceipts.some(result => result.status !== "fulfilled" || !isDeepStrictEqual(result.value, target))) throw new Error("Public receipt changed during asset verification.")
      return target
    } catch (error) { failure = error }
    if (attempt + 1 < attempts) await sleep(delayMs)
  }
  throw new Error(`Public verification failed after ${attempts} attempts: ${failure?.message || "no attempts configured"}`)
}

export async function release({ run = processAdapter, readCandidate = () => localReceipt(run), fetchImpl = fetch, sleep = ms => new Promise(resolve => setTimeout(resolve, ms)), id = randomUUID(), log = console.log, verifyOptions = {} } = {}) {
  const wrangler = async args => run("pnpm", ["exec", "wrangler", ...args, "--config", "wrangler.jsonc", "--name", "wlkr-ui"])
  const current = async () => latestDeployment(required(await wrangler(["deployments", "list", "--json"]), "Read current deployment"))
  const assertCurrent = async deployment => {
    const observed = await current()
    if (observed.id !== deployment.id) throw new ConflictError(`Deployment changed from ${deployment.id} to ${observed.id}. No further writes: inspect wlkr-ui deployments before retrying.`)
    return observed
  }
  const verify = receipt => verifyHosts(receipt, { fetchImpl, sleep, ...verifyOptions })
  log("Checking committed source and static assets…")
  required(await run("pnpm", ["release:check"]), "Release check")
  const candidate = validateReceipt(await readCandidate())
  const previous = await current()
  const priorVersion = stableVersion(previous)
  log(`Captured deployment ${previous.id}; prior version ${priorVersion}.`)
  const baseline = await verify(null)
  await assertCurrent(previous)
  const message = `ui-release:${id}`
  const rollbackMessage = `ui-restore:${id}`
  let version
  let activationAttempted = false
  log(`Previous deployment ${previous.id}; version ${priorVersion}; source ${baseline.sourceCommit}.`)
  try {
    const upload = required(await wrangler(["versions", "upload", "--message", message]), "Upload candidate version")
    const matches = [...upload.matchAll(/Worker Version ID:\s*([0-9a-f-]{36})/gi)]
    if (matches.length !== 1 || !UUID.test(matches[0][1])) throw new Error("Candidate version ID could not be read from pinned Wrangler output. Upload does not activate traffic; inspect versions manually.")
    version = matches[0][1]
    log(`Uploaded candidate ${version}; activation marker ${message}.`)
    await assertCurrent(previous)
    activationAttempted = true
    required(await wrangler(["versions", "deploy", `${version}@100`, "--yes", "--message", message]), "Activate candidate")
    const active = await current()
    if (!owned(active, version, message)) throw new ConflictError(`Candidate ownership cannot be established at deployment ${active.id}. No rollback: inspect wlkr-ui deployments.`)
    await verify(candidate)
    await assertCurrent(active)
    log(`Verified source ${candidate.sourceCommit}, all 15 registry hashes, and receipt-covered pages on both hosts.`)
    return { sourceCommit: candidate.sourceCommit, version, deployment: active.id, previousVersion: priorVersion, previousDeployment: previous.id, hosts: HOSTS }
  } catch (failure) {
    if (failure instanceof ConflictError) throw failure
    // Reconcile even a failed CLI command: the provider may have activated it.
    let active
    for (let attempt = 0; attempt < (activationAttempted ? 3 : 1); attempt++) {
      try { active = await current() }
      catch (error) { throw new Error(`${failure.message}\nCannot reconcile deployment state: ${error.message}. No rollback attempted; inspect prior ${priorVersion}, candidate ${version || "unknown"}, marker ${message}.`) }
      if (active.id !== previous.id) break
      if (activationAttempted && attempt < 2) await sleep(2000)
    }
    if (active.id === previous.id) {
      await verify(baseline)
      await assertCurrent(previous)
      throw new Error(`${failure.message}\nPrior release is still observed and verified (${priorVersion}). ${activationAttempted ? `Activation outcome may be delayed; inspect marker ${message} before retrying.` : "No traffic activation occurred."}`)
    }
    if (!version || !owned(active, version, message)) throw new ConflictError(`${failure.message}\nCurrent deployment ${active.id} is not owned by this run. No rollback; inspect candidate ${version || "unknown"} and prior version ${priorVersion}.`)
    await assertCurrent(active) // Immediate ownership/ID guard before the unconditional provider write.
    let rollback
    try { rollback = await wrangler(["versions", "deploy", `${priorVersion}@100`, "--yes", "--message", rollbackMessage]) }
    catch (error) { rollback = { status: null, stderr: error.message } }
    let restored
    for (let attempt = 0; attempt < 3; attempt++) {
      try { restored = await current() }
      catch (error) { throw new Error(`${failure.message}\nRollback outcome unknown: ${error.message}. No further writes; inspect prior ${priorVersion}, candidate ${version}, restore marker ${rollbackMessage}.`) }
      if (owned(restored, priorVersion, rollbackMessage)) break
      if (restored.id !== active.id) throw new ConflictError(`Rollback encountered deployment ${restored.id}, not this run's restore. No further writes; inspect wlkr-ui.`)
      if (attempt < 2) await sleep(2000)
    }
    if (!owned(restored, priorVersion, rollbackMessage)) throw new Error(`${failure.message}\nRollback was not confirmed (CLI status ${rollback.status}). Inspect active deployment ${restored.id}; prior version ${priorVersion}, candidate ${version}. Do not redeploy blindly.`)
    try {
      await verify(baseline)
      await assertCurrent(restored)
    } catch (error) { throw new Error(`${failure.message}\nRollback deployment ${restored.id} exists but restoration verification failed: ${error.message}. Inspect both hosts and deployment before retrying.`) }
    throw new Error(`${failure.message}\nPrevious version ${priorVersion} restored and verified on both hosts (deployment ${restored.id}). Release failed; candidate was not accepted.`)
  }
}

export async function withReleaseLock(path, action) {
  let handle
  try { handle = await open(path, "wx", 0o600) }
  catch (error) {
    if (error.code === "EEXIST") throw new Error(`Release lock exists at ${path}. Another release may be running. Inspect its process; remove only a confirmed stale lock.`)
    throw error
  }
  try { await handle.writeFile(JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() })); return await action() }
  finally { await handle.close(); await unlink(path) }
}

async function main() {
  if (process.argv.length > 2) throw new Error("Usage: pnpm run deploy (uses existing Wrangler environment; no command arguments).")
  process.chdir(fileURLToPath(new URL("../", import.meta.url)))
  const path = required(processAdapter("git", ["rev-parse", "--git-path", "wlkr-ui-release.lock"]), "Resolve release lock").trim()
  const result = await withReleaseLock(path, () => release())
  console.log(JSON.stringify(result, null, 2))
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { await main() } catch (error) { console.error(error.message); process.exitCode = 1 }
}
