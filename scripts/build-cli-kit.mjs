#!/usr/bin/env node
// Offline maintainer tooling. Source modules are parsed, never evaluated.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { link, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { dirname, basename, join, posix, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const TAG = 'v0.12.0';
export const COMMIT = '2653500df92e76ca3f7eb5ad8601daa1bf0e318a';
export const PREFIX = 'wlkr-cli-' + TAG + '/';
export const GRAPH = Object.freeze({
  'scripts/pixels.mjs': ['node:fs', 'node:fs/promises', 'node:url', '../lib/pixel-mask-link.ts', '../lib/pixel-grid-text.mjs'],
  'scripts/contrast.mjs': ['node:url', '../lib/contrast.ts'],
  'lib/pixel-mask-link.ts': [],
  'lib/pixel-grid-text.mjs': ['./pixel-mask-link.ts'],
  'lib/contrast.ts': [],
});
const MAX_BLOB = 65536;
const gitEnv = { ...process.env, GIT_NO_LAZY_FETCH: '1', GIT_NO_REPLACE_OBJECTS: '1', GIT_ALLOW_PROTOCOL: '', GIT_TERMINAL_PROMPT: '0' };
function git(repo, args, encoding) {
  return execFileSync('git', ['--no-optional-locks', '-C', repo, ...args], { env: gitEnv, encoding, maxBuffer: MAX_BLOB * 2, stdio: ['ignore', 'pipe', 'pipe'] });
}
export function safePath(path) {
  if (typeof path !== 'string' || !/^[A-Za-z0-9._/-]+$/.test(path) || path.startsWith('/') || path.split('/').some(part => !part || part === '.' || part === '..')) throw new Error('Unsafe archive/source path');
  return path;
}
export function readBlob(repo, commit, path) {
  safePath(path);
  if (!/^[a-f0-9]{40}$/.test(commit)) throw new Error('Expected full immutable commit');
  const entry = git(repo, ['ls-tree', commit, '--', path], 'utf8').trim();
  const match = /^(100644|100755) blob ([a-f0-9]{40})\t(.+)$/.exec(entry);
  if (!match || match[3] !== path) throw new Error('Expected regular Git blob: ' + path);
  const size = Number(git(repo, ['cat-file', '-s', match[2]], 'utf8').trim());
  if (!Number.isSafeInteger(size) || size < 0 || size > MAX_BLOB) throw new Error('Source blob exceeds limit');
  const bytes = git(repo, ['cat-file', 'blob', match[2]]);
  if (bytes.length !== size) throw new Error('Source size mismatch');
  return { bytes, blob: match[2] };
}
const parser = [
  "import vm from 'node:vm'; import {stripTypeScriptTypes} from 'node:module';",
  "let input=''; for await (const chunk of process.stdin) input+=chunk;",
  "const {source,typescript}=JSON.parse(input);",
  "const text=typescript?stripTypeScriptTypes(source):source;",
  "const module=new vm.SourceTextModule(text);",
  "process.stdout.write(JSON.stringify(module.dependencySpecifiers));",
].join('\n');
export function checkGraph(sources) {
  if (Object.keys(sources).sort().join('\n') !== Object.keys(GRAPH).sort().join('\n')) throw new Error('Unexpected source graph');
  for (const [path, permitted] of Object.entries(GRAPH)) {
    const source = sources[path].bytes.toString('utf8');
    // Conservative rejection also catches commented examples; the fixed release has none.
    if (/\b(?:require|createRequire)\s*(?:(?:\/\*[\s\S]*?\*\/|\/\/[^\n]*\n)\s*)*\(/.test(source) || /\bimport\s*(?:(?:\/\*[\s\S]*?\*\/|\/\/[^\n]*\n)\s*)*\(/.test(source)) throw new Error('Dynamic/CommonJS imports prohibited: ' + path);
    const imports = JSON.parse(execFileSync(process.execPath, ['--disable-warning=ExperimentalWarning', '--experimental-vm-modules', '--input-type=module', '-e', parser], { input: JSON.stringify({ source, typescript: path.endsWith('.ts') }), encoding: 'utf8', maxBuffer: MAX_BLOB * 2 }));
    if ([...new Set(imports)].sort().join('\n') !== [...permitted].sort().join('\n')) throw new Error('Unexpected imports: ' + path);
    for (const specifier of imports) {
      if (specifier.startsWith('node:')) continue;
      if (!specifier.startsWith('./') && !specifier.startsWith('../')) throw new Error('Non-relative dependency');
      const target = posix.normalize(posix.join(posix.dirname(path), specifier));
      safePath(target);
      if (!Object.hasOwn(GRAPH, target)) throw new Error('Dependency outside CLI graph');
    }
  }
}
export function sha256(bytes) { return createHash('sha256').update(bytes).digest('hex'); }
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
export function zip(entries) {
  const local = [], central = [], names = new Set();
  let offset = 0;
  for (const path of Object.keys(entries).sort()) {
    safePath(path);
    if (names.has(path.toLowerCase())) throw new Error('Duplicate archive path');
    names.add(path.toLowerCase());
    const name = Buffer.from(path), bytes = Buffer.from(entries[path]), crc = crc32(bytes);
    if (bytes.length > MAX_BLOB || name.length > 65535) throw new Error('Archive entry exceeds limit');
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50); header.writeUInt16LE(20, 4); header.writeUInt16LE(0x800, 6);
    header.writeUInt16LE(33, 12); header.writeUInt32LE(crc, 14); header.writeUInt32LE(bytes.length, 18); header.writeUInt32LE(bytes.length, 22); header.writeUInt16LE(name.length, 26);
    local.push(header, name, bytes);
    const record = Buffer.alloc(46);
    record.writeUInt32LE(0x02014b50); record.writeUInt16LE(0x314, 4); record.writeUInt16LE(20, 6); record.writeUInt16LE(0x800, 8); record.writeUInt16LE(33, 14);
    record.writeUInt32LE(crc, 16); record.writeUInt32LE(bytes.length, 20); record.writeUInt32LE(bytes.length, 24); record.writeUInt16LE(name.length, 28); record.writeUInt32LE((0o100644 * 65536) >>> 0, 38); record.writeUInt32LE(offset, 42);
    central.push(record, name); offset += header.length + name.length + bytes.length;
  }
  if (names.size > 65535 || offset > 0xffffffff) throw new Error('ZIP64 unsupported');
  const directory = Buffer.concat(central), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50); end.writeUInt16LE(names.size, 8); end.writeUInt16LE(names.size, 10); end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, directory, end]);
}
export function makeKit(sources, license) {
  checkGraph(sources);
  const entries = Object.fromEntries(Object.entries(sources).map(([path, source]) => [path, source.bytes]));
  entries.LICENSE = license.bytes;
  entries['package.json'] = Buffer.from('{\n  "type": "module"\n}\n');
  entries['README.md'] = Buffer.from([
    '# WLKR CLI kit ' + TAG, '',
    'Pixels and Contrast, unchanged from https://github.com/wlkr-si/ui/tree/' + COMMIT + '.',
    'MIT; see LICENSE. Source and generated-file hashes are in SOURCE.json.', '',
    'Requires Node.js 24 or newer. Unzip, then open a terminal in this folder.',
    'No Git, npm, dependency installation, account or network access is needed to run:', '',
    '    node scripts/pixels.mjs --help',
    '    node scripts/pixels.mjs --grid drawing.txt --format json',
    "    node scripts/pixels.mjs --grid drawing.txt --format svg --ink '#171717' > drawing.svg",
    '    node scripts/contrast.mjs 000000 ffffff --json --suggest', '',
    'Pixels accepts strict 8x8, 16x16 or 32x32 grids: . for empty, # for filled.',
    'Use equal-width rows, LF or CRLF, optionally a final newline; maximum 4096 bytes.',
    'It reads one local regular file; its symlink/nonblocking file guard is qualified',
    'on Linux and macOS. SVG is flat, transparent artwork, unlike the browser preview.',
    'Contrast accepts opaque six-digit colours and reports unrounded WCAG text checks.',
    'Suggestions keep the background fixed. Neither command uploads input.', '',
    'package.json supplies only the ES-module context required by the unchanged .ts',
    'helpers, including inside a CommonJS parent project. There is no install step.', '',
  ].join('\n'));
  const blobs = { ...sources, LICENSE: license };
  const manifest = {
    schema_version: 1, repository: 'https://github.com/wlkr-si/ui', tag: TAG, commit: COMMIT,
    files: Object.keys(entries).sort().map(path => ({ path, bytes: entries[path].length, sha256: sha256(entries[path]), ...(blobs[path] ? { origin: 'git-blob', git_blob: blobs[path].blob } : { origin: 'generated' }) })),
    note: 'SOURCE.json does not hash itself. The external ZIP SHA-256 covers the entire archive.',
  };
  entries['SOURCE.json'] = Buffer.from(JSON.stringify(manifest, null, 2) + '\n');
  return zip(Object.fromEntries(Object.entries(entries).map(([path, bytes]) => [PREFIX + path, bytes])));
}
export async function writeNew(output, bytes) {
  const target = resolve(output);
  // Hard linking a completed sibling file is atomic and never overwrites any target.
  const temporary = await mkdtemp(join(dirname(target), '.wlkr-cli-kit-'));
  try {
    const file = join(temporary, 'archive.zip');
    await writeFile(file, bytes, { flag: 'wx', mode: 0o644 });
    await link(file, target);
  } finally { await rm(temporary, { recursive: true, force: true }); }
}
export async function main(args) {
  if (args.length === 1 && args[0] === '--help') {
    console.log('Usage: node scripts/build-cli-kit.mjs --output <new.zip>\nOffline source: ' + TAG + ' (' + COMMIT + '). Requires local Git blobs and Node 24+. Never fetches or overwrites.'); return;
  }
  if (args.length !== 2 || args[0] !== '--output' || !args[1] || args[1].startsWith('-')) throw new Error('Use --output <new.zip> or --help');
  const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  if (git(repo, ['rev-parse', COMMIT + '^{commit}'], 'utf8').trim() !== COMMIT) throw new Error('Pinned public commit unavailable locally; prepare its Git objects separately');
  const sources = Object.fromEntries(Object.keys(GRAPH).map(path => [path, readBlob(repo, COMMIT, path)]));
  const bytes = makeKit(sources, readBlob(repo, COMMIT, 'LICENSE'));
  await writeNew(args[1], bytes);
  console.log(sha256(bytes) + '  ' + basename(args[1]) + ' (' + bytes.length + ' bytes; ' + TAG + ' ' + COMMIT + ')');
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main(process.argv.slice(2)).catch(error => { console.error('CLI kit: ' + error.message); process.exitCode = 1; });
