# Public release checks

`.github/workflows/release-check.yml` validates pull requests and pushes to `main` on the standard `ubuntu-24.04` GitHub-hosted runner, with a 15-minute job timeout and cancellation of superseded runs. The job starts only when the event explicitly reports `visibility: public` and `private: false`; private or missing visibility metadata skips it before runner allocation. This is an event-metadata gate, not a live visibility lookup.

GitHub documents [standard hosted compute for public repositories as free](https://docs.github.com/en/billing/concepts/product-billing/github-actions). This workflow uses no larger/self-hosted runners, schedules, Actions caches or artifact uploads. Dependency stores and build outputs exist only on the ephemeral runner. `setup-node` automatic package caching is explicitly disabled.

The workflow requests only `contents: read`; all other configurable token permissions are omitted. Checkout does not persist credentials or add global Git safe-directory settings. There are no project secrets, registry credentials, OIDC permissions, deployment environments, publishing steps, `pull_request_target`, repository settings changes or privileged follow-up workflows. Official actions use full commit pins verified against their v6 refs:

- [actions/checkout](https://github.com/actions/checkout/commit/d23441a48e516b6c34aea4fa41551a30e30af803): `d23441a48e516b6c34aea4fa41551a30e30af803`.
- [actions/setup-node](https://github.com/actions/setup-node/commit/249970729cb0ef3589644e2896645e5dc5ba9c38): `249970729cb0ef3589644e2896645e5dc5ba9c38`.

Node is exactly 26.8.2; pnpm is exactly 11.15.0, installed in the runner's temporary directory without a global installation. Versions are checked before `pnpm install --frozen-lockfile`. Workspace build-script allowances, overrides, the lockfile and the existing advisory policy are unchanged.

The final command is the existing `pnpm release:check`: committed-source checks; release/rollback, mask, Pixels CLI, contrast, Contrast CLI and AA-option tests; registry generation and static build; lint; typecheck; social-preview tests; generated-registry cleanliness and required export presence. It does not deploy, publish a package or tag a release. New or changed pull-request code runs in this restricted validation context, so keep this workflow free of credentials and privileged downstream consumers.

Local syntax/policy validation and release checks do not establish provider success. Observe the actual GitHub check for each candidate after reviewed publication. Workflow permission changes require the separate review before its first public execution; this document makes no claim that a hosted run has already passed.
