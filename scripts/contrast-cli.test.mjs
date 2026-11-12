import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { main, parseArgs, contrastReport } from './contrast.mjs';
import { contrastRatio, generateAAOptions, meets, parseOpaqueHex } from '../lib/contrast.ts';
const cli = fileURLToPath(new URL('./contrast.mjs', import.meta.url));
async function run(args) {
  const out = [], err = [], fetch = globalThis.fetch;
  globalThis.fetch = () => assert.fail('Contrast CLI must never fetch.');
  try {
    const code = await main(args, { stdout: value => out.push(value), stderr: value => err.push(value) });
    return { code, output: out.join('\n'), error: err.join('\n') };
  } finally { globalThis.fetch = fetch; }
}
function processRun(args, cwd = process.cwd()) {
  return spawnSync(process.execPath, ['--import', 'data:text/javascript,globalThis.fetch=()=>{throw new Error("NETWORK_FORBIDDEN")}', cli, ...args], { encoding: 'utf8', cwd, timeout: 2000, killSignal: 'SIGKILL' });
}
test('normalizes exactly two six-digit colours with optional hashes and flag order', () => {
  assert.deepEqual(parseArgs(['aBcD09', '--suggest', '#ffffff', '--json']), { foreground: '#ABCD09', background: '#FFFFFF', suggest: true, json: true });
  assert.equal(parseArgs(['--help']).help, true);
});
test('help and malformed/duplicate/unknown arguments fail generically without echo or fetch', async () => {
  assert.equal((await run(['--help'])).code, 0);
  for (const args of [[], ['000000'], ['000000', 'ffffff', '123456'], ['000000', 'ffffff', '--json', '--json'], ['000000', 'ffffff', '--suggest', '--suggest'], ['000000', 'ffffff', '--unknown'], ['--help', '000000'], ['#fff', 'ffffff'], ['#ffffffff', 'ffffff'], ['rgba(0,0,0,1)', 'ffffff'], ['transparent', 'ffffff'], [' 000000', 'ffffff'], ['#00000g', 'ffffff'], ['＃000000', 'ffffff'], ['SECRET\u001b]0;title\u0007\u009b', 'ffffff'], ['https://example.org', 'ffffff'], ['/etc/passwd', 'ffffff'], ['x'.repeat(100000), 'ffffff']]) {
    const result = await run(args);
    assert.equal(result.code, 1); assert.equal(result.output, ''); assert.match(result.error, /^contrast: Supply exactly two/);
    assert.doesNotMatch(result.error, /SECRET|\u001b|\u0007|\u009b|example.org|passwd|\bat .*\.mjs/);
  }
});
test('black/white is exactly 21:1 and equal colours are exactly 1:1 with explicit decisions', async () => {
  for (const [fg, bg, ratio, pass] of [['000000', 'ffffff', 21, true], ['abcdef', '#ABCDEF', 1, false]]) {
    const result = await run([fg, bg, '--json']); assert.equal(result.code, 0); assert.equal(result.error, '');
    const value = JSON.parse(result.output); assert.equal(value.ratio, ratio);
    assert.deepEqual(value.normalText, { AA: pass, AAA: pass }); assert.deepEqual(value.largeText, { AA: pass, AAA: pass });
    assert.equal(Object.hasOwn(value, 'aaTextOptions'), false);
  }
});
test('JSON retains the exact shared ratio and near-threshold failure despite rounded human display', async () => {
  const result = await run(['81737a', 'ffffff', '--json']);
  const value = JSON.parse(result.output), exact = contrastRatio(parseOpaqueHex('#81737A'), parseOpaqueHex('#FFFFFF'));
  assert.equal(value.ratio, exact); assert.equal(value.ratio.toFixed(2), '4.50'); assert.ok(value.ratio < 4.5);
  assert.equal(value.normalText.AA, false); assert.equal(value.largeText.AAA, false); assert.equal(value.largeText.AA, true);
  const human = await run(['81737a', 'ffffff']); assert.match(human.output, /Contrast: 4\.50:1/); assert.match(human.output, /Normal text: AA Fail/);
});
test('all four decisions match shared unrounded helpers across varied pairs and symmetry', () => {
  for (const [fg, bg] of [['#777777', '#FFFFFF'], ['#595959', '#FFFFFF'], ['#999999', '#FFFFFF'], ['#00FF00', '#FF0000'], ['#123456', '#ABCDEF'], ['#FFFFFF', '#000000']]) {
    const result = contrastReport(fg, bg), ratio = contrastRatio(parseOpaqueHex(fg), parseOpaqueHex(bg));
    assert.equal(result.ratio, ratio); assert.equal(contrastReport(bg, fg).ratio, ratio);
    assert.deepEqual(result.normalText, { AA: meets(ratio, 4.5), AAA: meets(ratio, 7) });
    assert.deepEqual(result.largeText, { AA: meets(ratio, 3), AAA: meets(ratio, 4.5) });
    for (const value of [...Object.values(result.normalText), ...Object.values(result.largeText)]) assert.equal(typeof value, 'boolean');
  }
});
test('suggestions are the unchanged deterministic shared options on a fixed background', async () => {
  for (const [fg, bg] of [['#777777', '#767676'], ['#010101', '#FFFFFF'], ['#81737A', '#FFFFFF'], ['#FFFFFF', '#000000'], ['#ABCDEF', '#123456']]) {
    const value = JSON.parse((await run([fg, bg, '--suggest', '--json'])).output);
    assert.deepEqual(value.aaTextOptions, generateAAOptions(bg, fg));
    assert.equal(value.background, bg);
    assert.equal(new Set(value.aaTextOptions.map(option => option.color)).size, value.aaTextOptions.length);
    assert.ok(value.aaTextOptions.every(option => option.ratio === contrastRatio(parseOpaqueHex(bg), parseOpaqueHex(option.color)) && option.ratio >= 4.5));
    assert.ok(value.aaTextOptions.filter(option => option.direction === 'Toward black').length <= 2);
    assert.ok(value.aaTextOptions.filter(option => option.direction === 'Toward white').length <= 2);
  }
  const passing = contrastReport('#010101', '#FFFFFF', true).aaTextOptions;
  assert.equal(passing.filter(option => option.direction === 'Current').length, 1);
  assert.equal(passing.filter(option => option.color === '#010101').length, 1);
  assert.equal(contrastReport('#81737A', '#FFFFFF', true).aaTextOptions.some(option => option.color === '#81737A'), false);
});
test('native commands run with fetch forbidden, empty stderr and no files written', async t => {
  await mkdir('.task', { recursive: true }); const directory = await mkdtemp(resolve('.task/contrast-cli-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  for (const args of [['000000', 'ffffff', '--json'], ['777777', '777777'], ['81737a', 'ffffff', '--json'], ['777777', '767676', '--suggest', '--json'], ['--help']]) {
    const result = processRun(args, directory); assert.equal(result.error, undefined, result.error?.message); assert.equal(result.status, 0, result.stderr); assert.equal(result.stderr, '');
    if (args.includes('--json')) assert.equal(typeof JSON.parse(result.stdout).ratio, 'number');
  }
  const invalid = processRun(['SECRET\u001b]0;title\u0007', 'ffffff'], directory);
  assert.equal(invalid.status, 1); assert.equal(invalid.stdout, ''); assert.doesNotMatch(invalid.stderr, /SECRET|\u001b|\u0007|\bat .*\.mjs/);
  assert.deepEqual(await readdir(directory), []);
});
