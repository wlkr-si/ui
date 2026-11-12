#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { contrastRatio, generateAAOptions, meets, parseOpaqueHex } from '../lib/contrast.ts';

const INVALID = 'Supply exactly two opaque six-digit foreground/background hex colours, with only --json and --suggest options. Use --help.';
export const HELP = `Usage: node scripts/contrast.mjs <foreground> <background> [--json] [--suggest]

Colours are six hex digits with optional #; quote hash-prefixed shell arguments.
  --json     Exact unrounded ratio and explicit AA/AAA normal/large booleans
  --suggest  Optional passing AA text choices with the background fixed
  --help     Show this help

Uses the browser's unchanged contrast and AA text-option helpers.
Normal AA/AAA thresholds: 4.5/7. Large text AA/AAA thresholds: 3/4.5.
Human ratios round to two decimals only for display; decisions never round.
Suggestions use bounded 5% RGB steps toward black/white, up to two passing
choices per direction, plus current text once when it already passes.
No network, credentials, input files, output files or dependency installation.
Exit codes: 0 success (including failing pairs), 1 invalid arguments.
`;
function normalize(value) {
  if (typeof value !== 'string' || value.length > 7) throw new Error(INVALID);
  const hex = value.startsWith('#') ? value : '#' + value;
  if (!parseOpaqueHex(hex)) throw new Error(INVALID);
  return hex.toUpperCase();
}
export function parseArgs(args) {
  if (args.length === 1 && args[0] === '--help') return { help: true };
  const flags = new Set(), colors = [];
  for (const arg of args) {
    if (arg === '--json' || arg === '--suggest') {
      if (flags.has(arg)) throw new Error(INVALID);
      flags.add(arg);
    } else if (typeof arg !== 'string' || arg.startsWith('-')) throw new Error(INVALID);
    else colors.push(arg);
  }
  if (colors.length !== 2) throw new Error(INVALID);
  return { foreground: normalize(colors[0]), background: normalize(colors[1]), json: flags.has('--json'), suggest: flags.has('--suggest') };
}
export function contrastReport(foreground, background, suggest = false) {
  foreground = normalize(foreground); background = normalize(background);
  const ratio = contrastRatio(parseOpaqueHex(foreground), parseOpaqueHex(background));
  return {
    foreground, background, ratio,
    normalText: { AA: meets(ratio, 4.5), AAA: meets(ratio, 7) },
    largeText: { AA: meets(ratio, 3), AAA: meets(ratio, 4.5) },
    ...(suggest ? { aaTextOptions: generateAAOptions(background, foreground) } : {}),
  };
}
export function formatReport(report) {
  const pass = value => value ? 'Pass' : 'Fail';
  const lines = [
    `Foreground ${report.foreground}; background ${report.background}`,
    `Contrast: ${report.ratio.toFixed(2)}:1`,
    `Normal text: AA ${pass(report.normalText.AA)}; AAA ${pass(report.normalText.AAA)}`,
    `Large text: AA ${pass(report.largeText.AA)}; AAA ${pass(report.largeText.AAA)}`,
  ];
  if (report.aaTextOptions) {
    lines.push(`AA text options on ${report.background}:`);
    for (const option of report.aaTextOptions) lines.push(`  ${option.color} ${option.ratio.toFixed(2)}:1 (${option.direction})`);
  }
  return lines.join('\n');
}
export async function main(args, { stdout = console.log, stderr = console.error } = {}) {
  try {
    const options = parseArgs(args);
    if (options.help) { stdout(HELP); return 0; }
    const report = contrastReport(options.foreground, options.background, options.suggest);
    stdout(options.json ? JSON.stringify(report, null, 2) : formatReport(report));
    return 0;
  } catch { stderr(`contrast: ${INVALID}`); return 1; }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exitCode = await main(process.argv.slice(2));
