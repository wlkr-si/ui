import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, writeFile, symlink, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { COMMIT, TAG, PREFIX, GRAPH, safePath, readBlob, checkGraph, makeKit, zip, writeNew, sha256 } from './build-cli-kit.mjs';

const repo = resolve(import.meta.dirname, '..');
async function scratch(t) {
  const path = await mkdtemp(join(tmpdir(), 'wlkr-cli-kit-'));
  t.after(() => rm(path, { recursive: true, force: true }));
  return path;
}
async function sourceFixture() {
  const sources = Object.fromEntries(await Promise.all(Object.keys(GRAPH).map(async path => {
    const bytes = await readFile(join(repo, path));
    const blob = createHash('sha1').update(Buffer.concat([Buffer.from('blob ' + bytes.length + '\0'), bytes])).digest('hex');
    return [path, { bytes, blob }];
  })));
  const bytes = await readFile(join(repo, 'LICENSE'));
  return { sources, license: { bytes, blob: createHash('sha1').update(Buffer.concat([Buffer.from('blob ' + bytes.length + '\0'), bytes])).digest('hex') } };
}
// Small independent stored-ZIP reader; Python zipfile/unzip qualify CRC and extraction separately.
function entries(bytes) {
  const files = new Map();
  let offset = 0;
  while (bytes.readUInt32LE(offset) === 0x04034b50) {
    assert.equal(bytes.readUInt16LE(offset + 8), 0);
    assert.equal(bytes.readUInt16LE(offset + 10), 0);
    assert.equal(bytes.readUInt16LE(offset + 12), 33);
    const size = bytes.readUInt32LE(offset + 18), nameSize = bytes.readUInt16LE(offset + 26);
    assert.equal(bytes.readUInt16LE(offset + 28), 0);
    const name = bytes.subarray(offset + 30, offset + 30 + nameSize).toString();
    assert.ok(!files.has(name));
    files.set(name, bytes.subarray(offset + 30 + nameSize, offset + 30 + nameSize + size));
    offset += 30 + nameSize + size;
  }
  assert.equal(bytes.readUInt32LE(offset), 0x02014b50);
  return files;
}

test('reproducible sorted kit preserves source bytes, license and complete manifest', async () => {
  const { sources, license } = await sourceFixture();
  const first = makeKit(sources, license), second = makeKit(Object.fromEntries(Object.entries(sources).reverse()), license);
  assert.deepEqual(first, second);
  const files = entries(first);
  assert.deepEqual([...files.keys()], [...Object.keys(GRAPH), 'LICENSE', 'README.md', 'SOURCE.json', 'package.json'].map(p => PREFIX + p).sort());
  for (const [path, source] of Object.entries({ ...sources, LICENSE: license })) assert.deepEqual(files.get(PREFIX + path), source.bytes);
  assert.deepEqual(JSON.parse(files.get(PREFIX + 'package.json')), { type: 'module' });
  const manifest = JSON.parse(files.get(PREFIX + 'SOURCE.json'));
  assert.equal(manifest.tag, TAG); assert.equal(manifest.commit, COMMIT);
  assert.equal(manifest.files.length, files.size - 1);
  for (const file of manifest.files) {
    const content = files.get(PREFIX + file.path);
    assert.equal(file.bytes, content.length);
    assert.equal(file.sha256, sha256(content));
    assert.equal(file.origin, file.path === 'README.md' || file.path === 'package.json' ? 'generated' : 'git-blob');
    if (file.origin === 'git-blob') assert.equal(file.git_blob, ({ ...sources, LICENSE: license })[file.path].blob);
  }
});

test('rejects unsafe paths, collisions, oversized entries and unexpected graph', async () => {
  for (const path of ['../secret', '/tmp/file', 'a/../b', 'a/./b', 'a//b', 'a\\b', 'a:b', 'a\0b']) assert.throws(() => safePath(path), /Unsafe/);
  assert.throws(() => zip({ A: 'a', a: 'b' }), /Duplicate/);
  assert.throws(() => zip({ a: Buffer.alloc(65537) }), /limit/);
  const { sources } = await sourceFixture();
  assert.throws(() => checkGraph({ ...sources, 'unexpected.mjs': { bytes: Buffer.from('') } }), /graph/);
  for (const extra of [
    '\nimport fs from "node:child_process";',
    '\nexport {x} from "an-npm-package";',
    '\nimport x from "../../outside.mjs";',
    '\nimport /* comment */ ("node:fs");',
    '\nrequire /* comment */ ("node:fs");',
    '\nimport "\\u006eode:child_process";',
    '\nimport { createRequire } from "node:module";',
  ]) {
    const changed = { ...sources, 'lib/contrast.ts': { bytes: Buffer.concat([sources['lib/contrast.ts'].bytes, Buffer.from(extra)]) } };
    assert.throws(() => checkGraph(changed), /imports|Unexpected/);
  }
});

test('dependency checking parses without evaluating module bodies', async () => {
  const { sources } = await sourceFixture();
  sources['lib/contrast.ts'].bytes = Buffer.concat([sources['lib/contrast.ts'].bytes, Buffer.from('\nthrow new Error("must never execute while packaging");\n')]);
  assert.doesNotThrow(() => checkGraph(sources));
});

test('Git reader uses committed blobs, rejects symlinks and source limits', async t => {
  const dir = await scratch(t);
  const git = (...args) => execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  git('init', '-q'); git('config', 'user.name', 'Fixture'); git('config', 'user.email', 'fixture@invalid.test');
  await writeFile(join(dir, 'source.mjs'), 'export const original = true;\n');
  await writeFile(join(dir, 'large.mjs'), Buffer.alloc(65537));
  await symlink('source.mjs', join(dir, 'alias.mjs'));
  git('add', '.'); git('commit', '-qm', 'Fixture');
  const commit = git('rev-parse', 'HEAD');
  await writeFile(join(dir, 'source.mjs'), 'working tree must not enter archive');
  assert.equal(readBlob(dir, commit, 'source.mjs').bytes.toString(), 'export const original = true;\n');
  assert.throws(() => readBlob(dir, commit, 'alias.mjs'), /regular Git blob/);
  assert.throws(() => readBlob(dir, commit, 'large.mjs'), /limit/);
  assert.throws(() => readBlob(dir, commit, '../source.mjs'), /Unsafe/);
  assert.throws(() => readBlob(dir, 'HEAD', 'source.mjs'), /immutable/);
});

test('completed output never clobbers files or symlinks; no temporary residue', async t => {
  const dir = await scratch(t), file = join(dir, 'kit.zip');
  await writeNew(file, Buffer.from('first'));
  await assert.rejects(writeNew(file, Buffer.from('second')), { code: 'EEXIST' });
  assert.equal(await readFile(file, 'utf8'), 'first');
  await symlink('kit.zip', join(dir, 'alias.zip'));
  await assert.rejects(writeNew(join(dir, 'alias.zip'), Buffer.from('third')), { code: 'EEXIST' });
  assert.equal(await readFile(file, 'utf8'), 'first');
  assert.deepEqual((await readdir(dir)).sort(), ['alias.zip', 'kit.zip']);
  const race = await Promise.allSettled([writeNew(join(dir, 'race.zip'), Buffer.from('one')), writeNew(join(dir, 'race.zip'), Buffer.from('two'))]);
  assert.equal(race.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal(race.find(r => r.status === 'rejected').reason.code, 'EEXIST');
  assert.ok(['one', 'two'].includes(await readFile(join(dir, 'race.zip'), 'utf8')));
  assert.ok(!(await readdir(dir)).some(name => name.startsWith('.wlkr-cli-kit-')));
});

test('extracted exact CLI graph runs without npm/Git under CommonJS parent', async t => {
  const dir = await scratch(t);
  await writeFile(join(dir, 'package.json'), '{"type":"commonjs"}\n');
  const { sources, license } = await sourceFixture();
  const archive = entries(makeKit(sources, license));
  const { mkdir } = await import('node:fs/promises');
  for (const [path, bytes] of archive) { const target = join(dir, path); await mkdir(resolve(target, '..'), { recursive: true }); await writeFile(target, bytes); }
  const cwd = join(dir, PREFIX);
  const run = (...args) => {
    const result = spawnSync(process.execPath, args, { cwd, encoding: 'utf8', env: { PATH: '', HOME: dir } });
    assert.equal(result.status, 0, result.stderr);
    return result.stdout;
  };
  for (const size of [8, 16, 32]) {
    const grid = Array.from({ length: size }, (_, y) => Array.from({ length: size }, (_, x) => x === y ? '#' : '.').join('')).join('\n') + '\n';
    await writeFile(join(cwd, 'drawing.txt'), grid);
    const json = JSON.parse(run('scripts/pixels.mjs', '--grid', 'drawing.txt', '--format', 'json'));
    assert.equal(json.size, size);
    assert.match(run('scripts/pixels.mjs', '--grid', 'drawing.txt', '--format', 'svg', '--ink', '#171717'), /<svg/);
    assert.match(run('scripts/pixels.mjs', '--grid', 'drawing.txt'), /https:\/\/ui.wlkr.si\/pixels/);
  }
  const contrast = JSON.parse(run('scripts/contrast.mjs', '000000', 'ffffff', '--json', '--suggest'));
  assert.equal(contrast.ratio, 21);
});
