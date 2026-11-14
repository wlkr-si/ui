# Static UI gallery releases

**November 11 gallery update:** source `2dedd50f8f4b9d4cd48fd7507ea9340cd1f54982`, Worker version `d14f504d-7baa-4510-869e-53bc9d4e0846`. The canonical family badge and current studio/source links passed phone and manual-theme checks. Both `ui.wlkr.si` and the retained `ui.wlkrlabs.com` address serve the same build receipt and all 15 registry endpoints match its hashes. These are dated receipts; `/build-info.json` is authoritative for the exact live source commit after later releases.


**October 23 component release:** `5d31d9d4c70c20700ff08c3ac140b6496eae0d6d` (eleven original components, typography, and theme; 13 items), published on 2026-10-23. Cloudflare deployment `7e09fe49-e884-4c5c-a39f-82da926bb840` serves Worker version `08d0a08d-520d-4bb5-81ab-cf2b1e3c5208` at 100%, created `2026-10-23T22:38:17.188635Z`. The approved Soft combobox, source-panel, and disclosure changes are live. All 45 checked public files, including the 15 registry JSON URLs, match the export and build receipt. See [verification](verification.md) for public installation and browser acceptance.

Previous recovery release: source `2935308d0e1a68df26bbba95a6cadcf38bf8719f`, Worker `48754c13-30e6-42d4-8421-03c97810b48a`, deployment `69a3b1e9-256a-4b3b-8cd0-5bb3f8531aa4`. Earlier source `6c34da775eb20b62b4352a360586d100b62399df` and its receipts remain in the historical verification record. The commands below describe repeat releases; later publishing requires its own authorization.

The site is a Next.js static export. Server components read original source at build time; all browser interactions run in the exported client assets. No Next.js server, adapter, Worker script, secret, runtime binding, or component service is required.

## Deployment boundary

- Cloudflare account: `78085b86e0696bb88ab5c8d376402ea2`.
- New standalone Worker: `wlkr-ui`.
- Gallery addresses: `ui.wlkr.si` and retained `ui.wlkrlabs.com`.
- Domain mappings are managed separately from code deployment. `routes` is intentionally omitted from Wrangler configuration, so publishing code preserves those mappings. The studio project registry owns the new alias receipt; the legacy mapping is preserved.
- Asset directory: `out/`, produced by `pnpm build`.
- Unknown paths return the exported 404 page; HTML paths drop trailing slashes.
- `workers.dev` and version preview URLs are disabled.
- Compatibility date `2026-10-07` matches the runtime bundled with the pinned Wrangler version; assets require no later runtime behavior.

The existing `wlkrlabs-com` Worker, `wlkrlabs.com`, and `www.wlkrlabs.com` are separate. Do not change their routes or assets as part of this release. This checkout publishes source to `wlkr-si/ui` through `origin`; the official starter is preserved as `upstream`.

## Prepare

Use the authenticated Wrangler CLI in this checkout. The pinned dev dependency is Wrangler 4.145.0. Keep authentication in the existing process environment or normal CLI storage; never write credentials into source. The studio uses its existing API token at runtime.

```sh
pnpm install --frozen-lockfile
pnpm deploy:check
```

This rebuilds the current catalog and static website (13 entries), then runs `wrangler deploy --dry-run`. It does not publish. Preview the exported output locally with `pnpm start --port 3100`.

Before publishing, inspect the Cloudflare account, existing Worker custom domains, and DNS for `ui.wlkrlabs.com` to establish that the new domain does not displace another service. Review and commit source, configuration, lockfile, and generated registry JSON. Local `.wrangler/`, `out/`, `.next/`, and screenshots remain ignored.

## Publish

```sh
pnpm run deploy
```

The guarded release command inherits the caller's existing Wrangler environment and normal CLI authentication. It does not read, save, or print tokens, install tools, or change domain configuration. The pinned Wrangler is invoked through `pnpm exec`. The Worker name is fixed to `wlkr-ui`; both public hosts are fixed in the release script.

`pnpm run deploy` now performs this sequence:

1. Acquire an exclusive local Git lock, then run `release:check` (release automation tests, build, lint, TypeScript, clean generated registry, and exported-file checks).
2. Validate the local receipt against HEAD, the complete catalog, all local registry bytes, and the required `/pixels` HTML digest. Capture the current deployment ID and its single version serving 100% of traffic. Refuse split/unknown traffic.
3. Before any upload, verify the existing exact public receipt and all 15 SHA-256 registry hashes on **both** `ui.wlkr.si` and `ui.wlkrlabs.com`. Recheck that the captured deployment has not changed. This snapshot is the rollback baseline.
4. Upload the candidate without activating it. Read its version ID from pinned Wrangler's output, then recheck the original deployment ID immediately before activation. Activate only that candidate at 100%, using a unique `ui-release:<run ID>` deployment message.
5. Require the active deployment's version and unique message to match this run. Verify the entire exact candidate receipt (including source commit and build time), all 15 registry byte hashes and the declared `/pixels` HTML hash on both hosts, and receipt stability after the hash checks. Recheck the deployment ID before accepting success.
6. On upload/activation/verification failure, reconcile provider state first. If the original deployment remains, verify that baseline and leave traffic alone. If activation is delayed or its outcome uncertain, fail with IDs/marker for inspection; do not blindly retry.
7. If the current deployment is provably this run's candidate, recheck its exact deployment ID immediately before restoring the captured previous version to 100%. Use a unique `ui-restore:<run ID>` marker. Reconcile even a failed restore CLI response, then verify the restored exact receipt and all 15 registry hashes on both hosts and the final deployment ID. A release that needed restoration still exits unsuccessfully, with the verified restore IDs.

No rollback is attempted when ownership is uncertain, provider state cannot be read, or another deployment is observed. An unchanged version with a **different deployment ID** counts as a conflict too. Failed or unverified rollback is explicitly reported with candidate/prior IDs and a request to inspect current state. The command never blindly retries a traffic mutation.

Each public GET times out after five seconds. Verification uses at most four concurrent requests, twenty full sweeps, and three seconds between sweeps. It bypasses browser caches and adds a per-run query string. Each provider CLI operation is bounded to two minutes; the local release check has a ten-minute process timeout. Network checks compare bytes rather than browser screenshots. They do not replace interaction or consumer-installation acceptance after component changes.

The local lock is resolved using `git rev-parse --git-path wlkr-ui-release.lock` and records its PID/start time without credentials. It is removed on ordinary success or failure. After a killed process or machine failure, inspect the recorded process and provider deployment before removing a confirmed stale lock. Do not remove a lock held by a running release. Locks serialize cooperating releases in this checkout; separate clones and dashboard/CLI publishers are not locked.

**Concurrency limitation:** Wrangler 4.145.0 provides no conditional/compare-and-swap deployment or rollback operation. The script checks immediately before and after writes, stops on observed conflicts, and refuses uncertain recovery. An external publisher can still race between the final read and Cloudflare's unconditional write. This is not atomic protection across publishers: coordinate external writers during a release. A hard process termination can also prevent automatic recovery; use the printed prior/candidate version and unique marker to reconcile before acting.

On success the command prints the source commit, candidate version/deployment, previous version/deployment, and verified hosts. `out/build-info.json` records the source, build time, and hashes. New candidates require `pageSha256` containing only `/pixels`, computed from `out/pixels.html` in the same export uploaded by Wrangler. The canonical `/pixels` response and its `/pixels/` and `/pixels.html` aliases receive a scoped `Cache-Control: no-transform` directive to preserve exact HTML bytes; other asset cache rules are unchanged. Older baseline receipts have no page digest and are intentionally checked against their exact receipt and registry only. Baseline and restoration verify the focused page whenever its receipt declares that digest. An upload that never activates can leave an unused version at Cloudflare; the script does not delete versions. This script manages code versions only; routes, DNS, aliases, billing, permissions, secrets and bound data are outside its scope.

Run the controlled adapter tests without publishing or authenticating:

```sh
pnpm test:release
pnpm release:check
```

The tests simulate process and network success, partial provider writes, failed verification and recovery, missing ownership, concurrent deployments, local receipt drift, bounded retries, and lock conflicts. They make no Cloudflare or public-host requests.

## Verify the public release

1. Open `https://ui.wlkrlabs.com` over HTTPS and confirm the gallery and interactive previews render.
2. Confirm `/registry.json`, `/r/registry.json`, and every `/r/{name}.json` endpoint listed in that catalog return valid JSON. Compare their bytes with the generated files in this committed checkout and the SHA-256 values at `/build-info.json`. Registry and build-info responses use revalidation headers.
3. In a fresh React/Tailwind/shadcn consumer, configure `"@wlkr": "https://ui.wlkr.si/r/{name}.json"`. Install all eleven originals and both style items using `pnpm dlx shadcn@latest add @wlkr/copy-command @wlkr/async-action @wlkr/filter-list @wlkr/pixel-object @wlkr/wlkr-loader @wlkr/page-intro @wlkr/index-row @wlkr/text-link @wlkr/theme-toggle @wlkr/footer-controls @wlkr/github-star @wlkr/typography @wlkr/theme`.
4. Mount the installed components, build the consumer, and inspect browser rendering. Check both the registry and the existing apex website; no website migration is part of this release.
5. Only after successful public verification, update README release status and append exact release evidence to `docs/verification.md`.

## Recovery

For a later release, use Cloudflare's previous deployment/version to roll back **only** `wlkr-ui`, then verify the public registry artifacts again. The first release has no earlier Worker version to restore. If its custom domain must be withdrawn, remove only the `ui.wlkrlabs.com` association; preserve the main website and its DNS. Never use the starter Git remote as a deployment destination.

References: [Next.js static exports](https://nextjs.org/docs/app/guides/static-exports), [Cloudflare static assets](https://developers.cloudflare.com/workers/static-assets/), and [Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/).

## Source repository

The public source repository is [wlkr-si/ui](https://github.com/wlkr-si/ui). `origin` points to that repository; `upstream` preserves the official registry starter. Pushing reviewed source is separate from deployment and does not authorize a Worker or website release.

## Managed studio alias

The `ui.wlkr.si` alias was attached with the studio website's `wlkr app add ui --target worker:wlkr-ui --project ui --public` command. Its ownership receipt is maintained in the studio app registry. The legacy `ui.wlkrlabs.com` mapping and installation namespace stay available. Do not remove either address during a code release.

To withdraw the new alias, use `wlkr app remove ui` from the authoritative studio registry and publish that registry change. This removes only its owned mapping; keep the legacy mapping and Worker source. A Worker-version rollback restores code, not DNS or domain mappings.

Cloudflare [documents](https://developers.cloudflare.com/workers/wrangler/configuration/#routes-and-domains) that omitting both `route` and `routes` leaves route management outside Wrangler. The source config deliberately follows that model so separately managed aliases survive code releases.

## Animation room release receipts

New candidates require hashes for `/`, `/animation`, `/pixels` and `/contrast`, plus the existing registry and three social previews. The room uses the same no-transform response policy as the other tool pages. Historical one-, two- and three-page receipts remain valid for baseline and rollback verification; a new candidate missing the room is rejected. Verification still compares exact source, build time and bytes on both hosts, with up to twenty reads separated by three seconds to allow propagation. Receipt mismatch errors identify both observed host revisions/times. No write or rollback ownership guard is relaxed.
