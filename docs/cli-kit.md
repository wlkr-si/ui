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
