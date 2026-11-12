# Reproduce the CLI kit

The maintainer generator packages the public **v0.12.0** source at
2653500df92e76ca3f7eb5ad8601daa1bf0e318a. It never reads CLI code from the
working tree, fetches, installs dependencies or uploads anything. This is
archive tooling; it does not change the gallery, registry or package version.

With Node 24+ and Git, from this checkout:

    node scripts/build-cli-kit.mjs --output /an/existing/directory/wlkr-cli-v0.12.0.zip

The output path must be new. The generator completes a temporary sibling file,
then hard-links it into place without overwriting an existing file or symlink.
It prints the archive SHA-256 and byte count. It removes its temporary file on
success or failure. A hard-link-capable local filesystem is required.

The pinned commit's Git objects must already be available. A shallow clone may
need this separate, explicit network preparation step:

    git fetch --no-tags origin 2653500df92e76ca3f7eb5ad8601daa1bf0e318a

That fetch is not part of the generator. The generator disables lazy Git
fetches and protocols, reads raw regular Git blobs, bounds their sizes, and
rejects unexpected imports or paths. V8 parses static module requests without
evaluating source; TypeScript is stripped with Node's built-in parser.
Dynamic/CommonJS imports are conservatively rejected. This contract is for
this fixed, reviewed source graph, not a general JavaScript sandbox.

The ZIP contains one wlkr-cli-v0.12.0/ directory:

- The five unchanged Pixels/Contrast CLI files and relative helpers.
- The exact release LICENSE.
- Generated README.md, SOURCE.json and a dependency-free package.json
  containing only "type": "module". This supplies the native TypeScript
  helpers' module context even inside an enclosing CommonJS project.

SOURCE.json records the public tag/commit, source Git blob IDs, byte counts
and SHA-256 hashes, including generated README/module-context files. It does
not hash itself; the external archive hash covers the whole ZIP. Entries use
sorted names, stored bytes (no compressor), regular 0644 modes and the fixed
1980-01-01 ZIP date, without extra fields, comments or machine timestamps.
Identical source produces identical bytes across the qualified Node versions.

## Consumer use

After unzipping, change into wlkr-cli-v0.12.0. Only Node 24+ is needed:
no Git, npm, package installation or account. The extracted README contains
these commands:

    node scripts/pixels.mjs --help
    node scripts/pixels.mjs --grid drawing.txt --format json
    node scripts/pixels.mjs --grid drawing.txt --format svg --ink '#171717' > drawing.svg
    node scripts/contrast.mjs 000000 ffffff --json --suggest

Pixels reads a local strict 8/16/32-square text grid; Contrast accepts two
opaque colours. They do not upload input or fetch resources. Pixels SVG is
flat transparent artwork, not the browser's projected preview. Its existing
nonblocking/no-follow file guard is qualified on Linux and macOS.

## Checks

    node --test scripts/cli-kit.test.mjs

These dependency-free tests also run in the existing release gate. They check
determinism, manifest/source bytes, import and path rejection, symlinks,
no-clobber behavior, and extracted CLI execution under a CommonJS parent with
Git/npm absent from PATH. They need Git for an isolated local blob fixture but
do not require the pinned commit in shallow CI. They use the current compatible
CLI files as test fixtures; the actual generator always reads the immutable pin.

Before publishing a kit, independently inspect and extract it with Python
stdlib zipfile and an unzip implementation, verify every manifest hash and
source blob, and run both commands from those extracted files on Node 24 and
26. Archive creation or local tests do not prove a public download exists.
No release asset is uploaded by this script.


### Candidate qualification

The v0.12.0 kit was independently checked with Python zipfile on Linux and
macOS unzip (all nine entries and CRCs), then run without Git/npm on PATH on
Linux Node 24.22.3 and 26.8.2 and macOS Node 26.5.0. All three grid sizes passed
JSON/mask/ink/SVG roundtrips; Contrast passed exact 21:1, failing-pair and
suggestion checks on Linux. Extraction inside a CommonJS parent also passed.
The Node 24 runtime archive was checked against the official Node distribution
SHA-256 list. Repeated Node 24/26 generation produced the same 21,402-byte ZIP:

    586a2d5cff8f9e5e84258204539aa5e1334e6ecb734e33d0c6ea9393fea09832

These are local archive/consumer checks, not public-download or hosted-CI proof.

### Public download qualification

The [v0.12.0 ZIP](https://github.com/wlkr-si/ui/releases/download/v0.12.0/wlkr-cli-v0.12.0.zip) is published as release asset 738573846 (21,402 bytes), with the SHA-256 above. The unauthenticated public download matched the candidate bytes. Independent extraction, CRC/manifest checks and actual 8/16/32 grid/ink/URL/token/SVG and Contrast checks passed on macOS Node 26.5.0 and Linux Node 26.8.2, with an empty PATH inside a CommonJS parent. Node 24.22.3 consumer qualification above used the identical local candidate. This asset publication did not deploy the gallery.
