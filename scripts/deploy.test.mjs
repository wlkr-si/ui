import test from "node:test"
import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import { mkdir, mkdtemp, rm, access } from "node:fs/promises"
import { join } from "node:path"
import { HOSTS, release, verifyHosts, validateReceipt, latestDeployment, localReceipt, processAdapter, withReleaseLock } from "./deploy.mjs"

const OLD = "11111111-1111-4111-8111-111111111111"
const NEW = "22222222-2222-4222-8222-222222222222"
const OTHER = "33333333-3333-4333-8333-333333333333"
const digest = value => createHash("sha256").update(value).digest("hex")
const paths = ["/registry.json", "/r/registry.json", ...Array.from({ length: 13 }, (_, i) => `/r/item-${i}.json`)]
function artifact(letter) {
  const bodies = Object.fromEntries(paths.map(path => [path, JSON.stringify({ path, source: letter })]))
  bodies["/pixels"] = `<html><h1>Pixels ${letter}</h1></html>`
  bodies["/contrast"] = `<html><h1>Contrast ${letter}</h1></html>`
  return { bodies, receipt: { sourceCommit: letter.repeat(40), builtAt: "2026-11-11T00:00:00.000Z", pageSha256: { "/pixels": digest(bodies["/pixels"]), "/contrast": digest(bodies["/contrast"]) }, registrySha256: Object.fromEntries(paths.map(path => [path, digest(bodies[path])])) } }
}
const prior = artifact("a"), candidate = artifact("b")
function fixture(options = {}) {
  const state = { version: OLD, history: [], calls: [], requests: [], corrupted: false, restores: 0, deployments: 0, uploadCount: 0 }
  function activate(version, message) {
    state.version = version
    state.history.push({ id: `00000000-0000-4000-8000-${String(state.history.length + 1).padStart(12, "0")}`, created_on: new Date(Date.UTC(2026, 10, 11, 0, 0, state.history.length)).toISOString(), versions: [{ version_id: version, percentage: 100 }], annotations: { "workers/message": message } })
  }
  activate(OLD, "previous release")
  const run = async (command, args) => {
    state.calls.push([command, ...args])
    if (command === "pnpm" && args[0] === "release:check") return { status: options.checkFails ? 1 : 0, stdout: "", stderr: "check" }
    assert.equal(command, "pnpm")
    assert.deepEqual(args.slice(0, 2), ["exec", "wrangler"])
    assert.deepEqual(args.slice(-4), ["--config", "wrangler.jsonc", "--name", "wlkr-ui"])
    const [kind, operation, spec] = args.slice(2)
    if (kind === "deployments") {
      if (state.corrupted && options.foreignDuringFailure && state.version === NEW) activate(OTHER, "external publisher")
      if (state.corrupted && options.guardConflict && state.version === NEW) {
        state.recoveryReads = (state.recoveryReads || 0) + 1
        if (state.recoveryReads === 2) activate(OTHER, "external writer before restore")
      }
      if (state.conflictAfterVerification) { activate(NEW, "external reactivation of same version"); state.conflictAfterVerification = false }
      if (state.restores > 0 && options.readFailsAfterRestore) return { status: 1, stdout: "", stderr: "provider unavailable during restore" }
      if (state.corrupted && options.readFailsDuringRecovery) return { status: 1, stdout: "", stderr: "provider unavailable" }
      return { status: 0, stdout: JSON.stringify(state.history), stderr: "" }
    }
    if (operation === "upload") {
      state.uploadCount++
      if (options.foreignAfterUpload) activate(OTHER, "external publisher")
      return { status: options.uploadFails ? 1 : 0, stdout: options.badUploadId ? "no version identifier" : `Uploaded wlkr-ui\nWorker Version ID: ${NEW}\n`, stderr: "upload error" }
    }
    assert.equal(operation, "deploy")
    const message = args[args.indexOf("--message") + 1]
    const version = spec.split("@")[0]
    assert.equal(spec, `${version}@100`)
    assert.ok(args.includes("--yes"))
    if (version === NEW) {
      state.deployments++
      if (!options.deployFailsWithoutMutation) activate(NEW, options.wrongMarker ? "not our release" : message)
      return { status: options.deployFailsWithoutMutation || options.deployFailsAfterMutation ? 1 : 0, stdout: "", stderr: "activation error" }
    }
    assert.equal(version, OLD)
    state.restores++
    if (!options.restoreFails) activate(OLD, message)
    return { status: options.restoreFails || options.restoreFailsAfterMutation ? 1 : 0, stdout: "", stderr: "restore error" }
  }
  const fetchImpl = async (url, init) => {
    const parsed = new URL(url)
    state.requests.push(parsed.origin + parsed.pathname)
    assert.ok(HOSTS.includes(parsed.origin))
    assert.equal(init.credentials, "omit")
    assert.equal(init.redirect, "error")
    assert.equal(init.cache, "no-store")
    assert.ok(init.signal instanceof AbortSignal)
    assert.ok(parsed.searchParams.has("release"))
    const active = state.version === NEW ? candidate : prior
    if (parsed.pathname === "/build-info.json") {
      if (state.version === NEW) {
        state.candidateReceiptReads = (state.candidateReceiptReads || 0) + 1
        if (options.foreignAfterVerification && state.candidateReceiptReads === 4) state.conflictAfterVerification = true
      }
      return new Response(JSON.stringify(options.badBaseline && state.version === OLD ? {} : active.receipt))
    }
    if ((options.pageFails && parsed.pathname === "/pixels" || options.contrastFails && parsed.pathname === "/contrast" || options.verifyFails || options.legacyFails && parsed.origin === HOSTS[1]) && state.version === NEW || options.restoreVerificationFails && state.restores > 0) {
      state.corrupted = true
      return new Response("wrong registry bytes")
    }
    return new Response(active.bodies[parsed.pathname])
  }
  return { state, adapters: { run, readCandidate: async () => candidate.receipt, fetchImpl, sleep: async () => {}, id: "fixture-run", log: () => {}, verifyOptions: { attempts: 2, delayMs: 0 } } }
}

test("success checks exact receipt and all 15 endpoint bytes on both hosts", async () => {
  const { state, adapters } = fixture()
  const result = await release(adapters)
  assert.equal(result.sourceCommit, candidate.receipt.sourceCommit)
  assert.equal(result.version, NEW)
  assert.equal(result.previousVersion, OLD)
  assert.equal(state.restores, 0)
  for (const host of HOSTS) for (const path of [...paths, "/pixels", "/contrast"]) assert.ok(state.requests.filter(url => url === host + path).length >= 2, host + path)
})
test("no provider access after release-check failure", async () => {
  const { state, adapters } = fixture({ checkFails: true })
  await assert.rejects(release(adapters), /Release check failed/)
  assert.equal(state.calls.length, 1)
})
test("invalid baseline stops before any upload or activation", async () => {
  const { state, adapters } = fixture({ badBaseline: true })
  await assert.rejects(release(adapters), /Invalid build receipt/)
  assert.equal(state.uploadCount, 0)
})
test("upload failure verifies unchanged prior release without traffic writes", async () => {
  const { state, adapters } = fixture({ uploadFails: true })
  await assert.rejects(release(adapters), /Prior release is still observed and verified/)
  assert.equal(state.deployments + state.restores, 0)
})
test("unparseable upload ID never activates or rolls back unknown version", async () => {
  const { state, adapters } = fixture({ badUploadId: true })
  await assert.rejects(release(adapters), /Candidate version ID could not be read/)
  assert.equal(state.deployments + state.restores, 0)
})
test("activation failure without mutation preserves verified previous release", async () => {
  const { state, adapters } = fixture({ deployFailsWithoutMutation: true })
  await assert.rejects(release(adapters), /Activation outcome may be delayed/)
  assert.equal(state.restores, 0)
})
test("activation error after provider mutation is reconciled and restored", async () => {
  const { state, adapters } = fixture({ deployFailsAfterMutation: true })
  await assert.rejects(release(adapters), /Previous version .* restored and verified/)
  assert.equal(state.restores, 1)
  assert.equal(state.version, OLD)
})
test("bad live bytes trigger one rollback and full two-host restoration checks", async () => {
  const { state, adapters } = fixture({ verifyFails: true })
  await assert.rejects(release(adapters), /Previous version .* restored and verified/)
  assert.equal(state.restores, 1)
  assert.equal(state.version, OLD)
  for (const host of HOSTS) for (const path of [...paths, "/pixels", "/contrast"]) assert.ok(state.requests.filter(url => url === host + path).length >= 2)
})
test("rollback CLI error after provider mutation still verifies restoration", async () => {
  const { state, adapters } = fixture({ verifyFails: true, restoreFailsAfterMutation: true })
  await assert.rejects(release(adapters), /restored and verified/)
  assert.equal(state.restores, 1)
})
test("unconfirmed rollback fails with IDs and does not blindly retry mutation", async () => {
  const { state, adapters } = fixture({ verifyFails: true, restoreFails: true })
  await assert.rejects(release(adapters), /Rollback was not confirmed.*prior version/s)
  assert.equal(state.restores, 1)
})
test("rollback public-check failure is not reported as restored", async () => {
  const { adapters } = fixture({ verifyFails: true, restoreVerificationFails: true })
  await assert.rejects(release(adapters), /restoration verification failed/)
})
test("foreign deployment after upload blocks activation", async () => {
  const { state, adapters } = fixture({ foreignAfterUpload: true })
  await assert.rejects(release(adapters), /Deployment changed/)
  assert.equal(state.deployments + state.restores, 0)
  assert.equal(state.version, OTHER)
})
test("foreign deployment during failed live checks is never rolled back", async () => {
  const { state, adapters } = fixture({ verifyFails: true, foreignDuringFailure: true })
  await assert.rejects(release(adapters), /not owned by this run.*No rollback/s)
  assert.equal(state.restores, 0)
  assert.equal(state.version, OTHER)
})
test("provider read failure during reconciliation refuses blind rollback", async () => {
  const { state, adapters } = fixture({ verifyFails: true, readFailsDuringRecovery: true })
  await assert.rejects(release(adapters), /Cannot reconcile.*No rollback attempted/s)
  assert.equal(state.restores, 0)
})
test("split traffic and malformed deployment JSON are rejected", async () => {
  assert.throws(() => latestDeployment("{}"), /invalid/)
  const { state, adapters } = fixture()
  state.history[0].versions[0].percentage = 50
  await assert.rejects(release(adapters), /single version at 100%/)
  assert.equal(state.uploadCount, 0)
})
test("hash-map omissions and non-registry URLs are rejected", () => {
  assert.throws(() => validateReceipt({ ...prior.receipt, registrySha256: {} }), /Invalid build receipt/)
  const hashes = { ...prior.receipt.registrySha256 }; delete hashes[paths[2]]; hashes["https://example.org/credential"] = "0".repeat(64)
  assert.throws(() => validateReceipt({ ...prior.receipt, registrySha256: hashes }), /Invalid build receipt/)
})
test("bounded network retries recover transient failure and reject stale exact receipt", async () => {
  const { adapters } = fixture()
  let requests = 0, waits = 0
  const response = await verifyHosts(prior.receipt, { ...adapters, attempts: 2, fetchImpl: async (...args) => { if (requests++ === 0) throw new Error("offline"); return adapters.fetchImpl(...args) }, sleep: async () => { waits++ } })
  assert.deepEqual(response, prior.receipt)
  assert.equal(waits, 1)
  await assert.rejects(verifyHosts({ ...prior.receipt, builtAt: "2026-11-11T00:00:01.000Z" }, { ...adapters, attempts: 1 }), /exact expected receipt/)
})
test("local receipt verifies HEAD, catalog, and actual file bytes", async () => {
  const catalog = JSON.stringify({ items: paths.slice(2).map(path => ({ name: path.slice(3, -5) })) })
  const bodies = { ...prior.bodies, "/registry.json": catalog }
  const receipt = { ...prior.receipt, registrySha256: { ...prior.receipt.registrySha256, "/registry.json": digest(catalog) } }
  const run = async () => ({ status: 0, stdout: receipt.sourceCommit, stderr: "" })
  const read = async path => path === "out/build-info.json" ? JSON.stringify(receipt) : bodies[path === "out/pixels.html" ? "/pixels" : path === "out/contrast.html" ? "/contrast" : path.slice(3)]
  assert.deepEqual(await localReceipt(run, read), receipt)
  await assert.rejects(localReceipt(async () => ({ status: 0, stdout: "0".repeat(40), stderr: "" }), read), /does not match HEAD/)
  await assert.rejects(localReceipt(run, async path => path === "out/r/item-0.json" ? "changed" : read(path)), /Local asset differs/)
  await assert.rejects(localReceipt(run, async path => path === "out/pixels.html" || path === "out/contrast.html" ? "changed" : read(path)), /Local asset differs/)
  const pixelOnly = { ...receipt, pageSha256: { "/pixels": receipt.pageSha256["/pixels"] } }
  await assert.rejects(localReceipt(run, async path => path === "out/build-info.json" ? JSON.stringify(pixelOnly) : read(path)), /missing \/pixels or \/contrast/)
  const missingPage = { ...receipt }; delete missingPage.pageSha256
  await assert.rejects(localReceipt(run, async path => path === "out/build-info.json" ? JSON.stringify(missingPage) : read(path)), /missing \/pixels/)
})
test("process adapter inherits environment and invokes argv without shell", () => {
  let observed
  const result = processAdapter("pnpm", ["exec", "wrangler", "deployments", "list"], (command, args, options) => { observed = { command, args, options }; return { status: 0, stdout: "[]", stderr: "" } })
  assert.equal(observed.options.env, process.env)
  assert.equal(observed.options.shell, undefined)
  assert.equal(observed.options.timeout, 120000)
  assert.equal(result.stdout, "[]")
})
test("exclusive lock rejects overlap, cleans failure, and permits later release", async () => {
  await mkdir(".task", { recursive: true })
  const directory = await mkdtemp(".task/release-test-")
  const path = join(directory, "release.lock")
  try {
    await withReleaseLock(path, async () => { await assert.rejects(withReleaseLock(path, () => assert.fail("overlap")), /Release lock exists/) })
    await assert.rejects(withReleaseLock(path, async () => { throw new Error("failed release") }), /failed release/)
    await assert.rejects(access(path))
    assert.equal(await withReleaseLock(path, async () => "next run"), "next run")
  } finally { await rm(directory, { recursive: true, force: true }) }
})

test("candidate version without unique ownership marker is never rolled back", async () => {
  const { state, adapters } = fixture({ wrongMarker: true })
  await assert.rejects(release(adapters), /ownership cannot be established.*No rollback/s)
  assert.equal(state.restores, 0)
})
test("same-version foreign deployment after public checks is a conflict", async () => {
  const { state, adapters } = fixture({ foreignAfterVerification: true })
  await assert.rejects(release(adapters), /Deployment changed/)
  assert.equal(state.restores, 0)
})
test("immediate pre-rollback ID guard catches a newly intervening deployment", async () => {
  const { state, adapters } = fixture({ verifyFails: true, guardConflict: true })
  await assert.rejects(release(adapters), /Deployment changed/)
  assert.equal(state.restores, 0)
  assert.equal(state.version, OTHER)
})
test("legacy-host-only registry corruption also triggers verified restoration", async () => {
  const { state, adapters } = fixture({ legacyFails: true })
  await assert.rejects(release(adapters), /restored and verified/)
  assert.equal(state.restores, 1)
})
test("stalled public requests abort and exhaust only the configured retries", async () => {
  const keepAlive = setTimeout(() => {}, 1000)
  let calls = 0
  try {
    await assert.rejects(verifyHosts(prior.receipt, { attempts: 2, timeoutMs: 5, sleep: async () => {}, fetchImpl: (_url, { signal }) => {
      calls++
      return new Promise((_, reject) => signal.addEventListener("abort", () => reject(signal.reason), { once: true }))
    } }), /after 2 attempts/)
    assert.equal(calls, 4)
  } finally { clearTimeout(keepAlive) }
})

test("provider read failure after restore reports unknown outcome and never retries writes", async () => {
  const { state, adapters } = fixture({ verifyFails: true, readFailsAfterRestore: true })
  await assert.rejects(release(adapters), /Rollback outcome unknown.*No further writes.*restore marker/s)
  assert.equal(state.restores, 1)
})
test("a thrown process-launch error becomes a failed result for reconciliation", () => {
  const result = processAdapter("pnpm", [], () => { throw new Error("launch failed") })
  assert.equal(result.status, null)
  assert.equal(result.stderr, "launch failed")
})

test("focused page corruption on either host fails verification while older receipts remain valid", async () => {
  const { adapters } = fixture()
  for (const host of HOSTS) await assert.rejects(verifyHosts(prior.receipt, { ...adapters, attempts: 1, fetchImpl: (url, init) => new URL(url).origin === host && new URL(url).pathname === "/pixels" ? Promise.resolve(new Response("wrong page")) : adapters.fetchImpl(url, init) }), /asset SHA-256 mismatch/)
  const { pageSha256, ...legacy } = prior.receipt
  assert.deepEqual(validateReceipt(legacy), legacy)
  await verifyHosts(legacy, { ...adapters, attempts: 1, fetchImpl: (url, init) => new URL(url).pathname === "/build-info.json" ? Promise.resolve(new Response(JSON.stringify(legacy))) : adapters.fetchImpl(url, init) })
  for (const pages of [{}, { "/pixels": "bad" }, { "/pixels": pageSha256["/pixels"], "/other": pageSha256["/pixels"] }]) assert.throws(() => validateReceipt({ ...prior.receipt, pageSha256: pages }), /Invalid page receipt/)
})

test("contrast bytes are independently checked on both hosts and trigger restoration when wrong", async () => {
  const { adapters } = fixture()
  for (const host of HOSTS) await assert.rejects(verifyHosts(prior.receipt, { ...adapters, attempts: 1, fetchImpl: (url, init) => new URL(url).origin === host && new URL(url).pathname === "/contrast" ? Promise.resolve(new Response("wrong contrast page")) : adapters.fetchImpl(url, init) }), /asset SHA-256 mismatch/)
  const { state, adapters: failing } = fixture({ contrastFails: true })
  await assert.rejects(release(failing), /Previous version .* restored and verified/)
  assert.equal(state.restores, 1)
  assert.equal(state.version, OLD)
  for (const host of HOSTS) assert.ok(state.requests.filter(url => url === host + "/contrast").length >= 2)
})

test("a focused-page-only failure rolls back and verifies the previous release", async () => {
  const { state, adapters } = fixture({ pageFails: true })
  await assert.rejects(release(adapters), /Previous version .* restored and verified/)
  assert.equal(state.restores, 1)
  assert.equal(state.version, OLD)
  for (const host of HOSTS) assert.ok(state.requests.filter(url => url === host + "/pixels").length >= 2)
})
