import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile, readFile, readdir, rm, symlink, open, appendFile, chmod } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { main, parseArgs, parseGrid, flatSvg, MAX_GRID_BYTES } from './pixels.mjs';
import { encodeArtwork, decodeArtwork, maskShareUrl } from '../lib/pixel-mask-link.ts';
const cli = fileURLToPath(new URL('./pixels.mjs', import.meta.url));
function blank(size) { return Array(size).fill('.'.repeat(size)); }
function corners(size) {
  const rows = blank(size);
  rows[0] = '#' + '.'.repeat(size - 2) + '#';
  rows[size - 1] = '.'.repeat(size - 1) + '#';
  return rows;
}
async function fixture(t, contents = corners(8).join('\n')) {
  await mkdir('.task', { recursive: true });
  const directory = await mkdtemp(resolve('.task/pixels-cli-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const path = join(directory, 'a grid.txt');
  await writeFile(path, contents);
  return { directory, path };
}
async function run(args) {
  const out = [], err = [], fetch = globalThis.fetch;
  globalThis.fetch = () => assert.fail('Pixels CLI must never use the network.');
  try {
    const code = await main(args, { stdout: value => out.push(value), stderr: value => err.push(value) });
    return { code, output: out.join('\n'), error: err.join('\n') };
  } finally { globalThis.fetch = fetch; }
}
function processRun(args, cwd = process.cwd()) {
  return spawnSync(process.execPath, ['--import', 'data:text/javascript,globalThis.fetch=()=>{throw new Error("NETWORK_FORBIDDEN")}', cli, ...args], { encoding: 'utf8', cwd, timeout: 2000, killSignal: 'SIGKILL' });
}
test('help and invalid argv do not read input or fetch; diagnostics never echo hostile values', async () => {
  assert.equal((await run(['--help'])).code, 0);
  for (const args of [[], ['--grid'], ['--mask'], ['--grid', 'x', '--mask', 'y'], ['--mask', 'x', '--mask', 'y'], ['--help', '--grid', 'x'], ['--format', 'png', '--grid', 'x'], ['--grid', 'x', '--ink', '#fff'], ['--grid', 'x', '--ink', 'red'], ['--grid', 'x', '--ink', '#000000\"/><script>'], ['--SECRET\u001b', 'value'], ['--grid', 'x', '--unknown', 'SECRET']]) {
    const result = await run(args); assert.equal(result.code, 1); assert.equal(result.output, '');
    assert.doesNotMatch(result.error, /SECRET|\u001b|<script>|\bat .*\.mjs/);
  }
  assert.equal(parseArgs(['--grid', './--file', '--ink', 'ABCDEF']).ink, '#abcdef');
});
test('strict dots/hash grids accept 8/16/32 with LF, CRLF, BOM and one terminal newline', () => {
  for (const size of [8, 16, 32]) for (const ending of ['', '\n', '\r\n']) {
    const mask = corners(size), text = mask.join(ending === '\r\n' ? '\r\n' : '\n') + ending;
    assert.deepEqual(parseGrid(text), mask);
    assert.deepEqual(parseGrid('\uFEFF' + text), mask);
  }
  for (const value of ['', '#', blank(7).join('\n'), Array(8).fill('.........').join('\n'), blank(8).join('\n') + '\n\n', blank(8).join('\n').replace('.', ' '), blank(8).join('\n').replace('.', '＃'), blank(8).join('\r')]) assert.throws(() => parseGrid(value), /Grid/);
});
test('actual grid files produce exact canonical URL/JSON with null ink and no writes', async t => {
  const mask = corners(16), { directory, path } = await fixture(t, '\uFEFF' + mask.join('\r\n') + '\r\n');
  const before = await readFile(path);
  const result = await run(['--grid', path]); assert.equal(result.code, 0); assert.equal(result.output, maskShareUrl(mask, null));
  const json = await run(['--grid', path, '--format', 'json']);
  assert.deepEqual(JSON.parse(json.output), { size: 16, mask, ink: null, token: encodeArtwork(mask, null), url: maskShareUrl(mask, null) });
  assert.deepEqual(await readFile(path), before); assert.deepEqual(await readdir(directory), ['a grid.txt']);
});
test('token inputs round-trip every cell and preserve v1/theme/explicit canonical semantics', async () => {
  for (const size of [8, 16, 32]) for (const ink of [null, '#000000', '#ff3366']) for (const mask of [blank(size), Array(size).fill('#'.repeat(size)), corners(size)]) {
    const token = encodeArtwork(mask, ink), result = await run(['--mask', token, '--format', 'json']);
    assert.equal(result.code, 0);
    const value = JSON.parse(result.output); assert.deepEqual(decodeArtwork(value.token), { mask, ink }); assert.equal(value.token, token);
    const url = new URL(value.url); assert.equal(url.origin, 'https://ui.wlkr.si'); assert.equal(url.pathname, '/pixels'); assert.equal(url.hash, '#pixels'); assert.deepEqual([...url.searchParams.keys()], ['mask']);
    assert.deepEqual(decodeArtwork(url.searchParams.get('mask')), { mask, ink });
  }
});
test('explicit ink normalizes and overrides token colour without changing any cells', async () => {
  const mask = corners(8), token = encodeArtwork(mask, '#ff3366');
  const result = await run(['--mask', token, '--ink', '#ABCDEF', '--format', 'json']);
  assert.deepEqual(JSON.parse(result.output), { size: 8, mask, ink: '#abcdef', token: encodeArtwork(mask, '#abcdef'), url: maskShareUrl(mask, '#abcdef') });
});
test('malformed, oversized, noncanonical tokens and URLs never become network requests', async () => {
  for (const token of ['v1.0', 'v1.' + 'F'.repeat(16), 'v2.8.t.' + '0'.repeat(16), 'v2.64.ff3366.' + 'f'.repeat(16), 'v2.32.ff3366.' + 'f'.repeat(257), 'x'.repeat(100000), 'https://ui.wlkr.si/pixels?mask=v1.0000000000000000', 'SECRET\u001b]0;title\u0007']) {
    const result = await run(['--mask', token]); assert.equal(result.code, 1); assert.equal(result.output, ''); assert.match(result.error, /Invalid mask token/); assert.doesNotMatch(result.error, /SECRET|\u001b/);
  }
});
test('theme-relative SVG requires ink while URL and JSON retain theme-relative values', async t => {
  const { path } = await fixture(t);
  for (const source of [['--grid', path], ['--mask', encodeArtwork(corners(8), null)]]) {
    const result = await run([...source, '--format', 'svg']); assert.equal(result.code, 1); assert.match(result.error, /requires explicit ink/);
    assert.equal(JSON.parse((await run([...source, '--format', 'json'])).output).ink, null);
    assert.equal((await run([...source, '--ink', '33F282', '--format', 'svg'])).code, 0);
  }
});
test('flat SVG has exact regular-grid coordinates, dimensions, count and selected colour', async () => {
  for (const size of [8, 16, 32]) {
    const mask = corners(size), result = await run(['--mask', encodeArtwork(mask, '#ff3366'), '--format', 'svg']);
    assert.equal(result.code, 0);
    assert.match(result.output, new RegExp(`viewBox="0 0 ${size} ${size}" width="${size * 16}" height="${size * 16}"`));
    assert.match(result.output, /xmlns="http:\/\/www.w3.org\/2000\/svg"/); assert.match(result.output, /fill="#ff3366"/);
    const cells = [...result.output.matchAll(/<rect x="(\d+)" y="(\d+)" width="1" height="1"\/>/g)].map(match => [Number(match[1]), Number(match[2])]);
    assert.deepEqual(cells, [[0, 0], [size - 1, 0], [size - 1, size - 1]]);
    assert.equal((result.output.match(/<rect /g) || []).length, 3);
    assert.doesNotMatch(result.output, /opacity|background|href|script|animate|image|foreignObject/);
  }
  assert.equal((flatSvg(Array(32).fill('#'.repeat(32)), '#ffffff').match(/<rect /g) || []).length, 1024);
  assert.equal((flatSvg(blank(32), '#ffffff').match(/<rect /g) || []).length, 0);
  assert.throws(() => flatSvg(blank(8), '#000000" onclick="bad'), /Invalid/);
});
test('native CLI handles spaced paths and emits clean stdout URL/JSON/SVG without writes', async t => {
  const { directory, path } = await fixture(t);
  const before = await readFile(path);
  for (const format of ['url', 'json', 'svg']) {
    const result = processRun(['--grid', path, '--ink', '#33f282', '--format', format], directory);
    assert.equal(result.error, undefined, result.error?.message); assert.equal(result.status, 0, result.stderr);
    assert.doesNotMatch(result.stderr, /^pixels:/m);
    if (format === 'url') assert.equal(result.stdout.trim(), maskShareUrl(corners(8), '#33f282'));
    if (format === 'json') assert.equal(JSON.parse(result.stdout).ink, '#33f282');
    if (format === 'svg') assert.match(result.stdout, /^<svg[\s\S]*<\/svg>\n$/);
  }
  assert.deepEqual(await readdir(directory), ['a grid.txt']); assert.deepEqual(await readFile(path), before);
});
test('actual files reject invalid UTF-8 and bound bytes before parsing', async t => {
  const { path } = await fixture(t, Buffer.from([0xff, 0xfe]));
  assert.match((await run(['--grid', path])).error, /UTF-8/);
  await writeFile(path, '.'.repeat(MAX_GRID_BYTES));
  assert.match((await run(['--grid', path])).error, /exactly 8, 16 or 32/);
  await writeFile(path, '.'.repeat(MAX_GRID_BYTES + 1));
  assert.match((await run(['--grid', path])).error, /4 KiB/);
});
test('files that grow after stat remain bounded before decoding', async t => {
  const { path } = await fixture(t);
  const probe = await open(path, 'r'), prototype = Object.getPrototypeOf(probe), original = prototype.stat;
  await probe.close();
  prototype.stat = async function (...args) {
    const initial = await original.apply(this, args); prototype.stat = original;
    await appendFile(path, Buffer.alloc(MAX_GRID_BYTES + 1)); return initial;
  };
  try { assert.match((await run(['--grid', path])).error, /4 KiB/); }
  finally { prototype.stat = original; }
});
test('missing/unreadable files and terminal-control filenames yield concise safe errors', async t => {
  const { directory, path } = await fixture(t);
  const missing = await run(['--grid', join(directory, 'SECRET\u001b]0;title\u0007')]);
  assert.equal(missing.code, 1); assert.doesNotMatch(missing.error, /SECRET|\u001b|\u0007|\bat .*\.mjs/);
  if (process.getuid?.() !== 0) { await chmod(path, 0); assert.match((await run(['--grid', path])).error, /readable regular file/); }
});
test('native FIFO/device/directory inputs fail promptly and final symlinks are refused', async t => {
  const { directory, path } = await fixture(t), fifo = join(directory, 'pipe');
  const made = spawnSync('mkfifo', [fifo], { encoding: 'utf8' }); assert.equal(made.status, 0, made.stderr);
  for (const value of [directory, fifo, '/dev/null', '/dev/zero']) {
    const result = processRun(['--grid', value]);
    assert.equal(result.error, undefined, result.error?.message); assert.equal(result.status, 1, result.stderr); assert.equal(result.stdout, ''); assert.match(result.stderr, /pixels: .*regular file/);
  }
  const link = join(directory, 'link'); await symlink(path, link); assert.equal((await run(['--grid', link])).code, 1);
  const parent = join(directory, 'parent'); await symlink(directory, parent); assert.equal((await run(['--grid', join(parent, 'a grid.txt')])).code, 0);
});
