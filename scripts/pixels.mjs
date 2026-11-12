#!/usr/bin/env node
import { constants } from 'node:fs';
import { open } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { decodeArtwork, encodeArtwork, maskShareUrl } from '../lib/pixel-mask-link.ts';

export const MAX_GRID_BYTES = 4096;
export const HELP = `Usage: node scripts/pixels.mjs (--grid <file> | --mask <token>) [options]

  --grid <file>    Regular UTF-8 dots/# grid: 8×8, 16×16 or 32×32
  --mask <token>   Existing canonical v1/v2 mask token (not a URL)
  --ink <colour>   Override ink with six hex digits, with optional #
  --format <type>  url (default), svg or json
  --help           Show this help

No network, credentials, dependencies or file writes; output goes to stdout.
Grid limit: 4 KiB; LF/CRLF and one final newline are accepted.
Final symlinks, directories, FIFOs and devices are refused; parent symlinks resolve.
SVG is a flat regular grid with transparent background, not a gallery frame.
Theme-relative masks require --ink for SVG; URL/JSON preserve null ink.
Exit codes: 0 success, 1 invalid arguments/input or read failure.
`;
const safe = value => String(value).replace(/[\x00-\x1f\x7f-\x9f]/g, ' ');

export function parseArgs(args) {
  if (args.length === 1 && args[0] === '--help') return { help: true };
  const options = { format: 'url' };
  const seen = new Set();
  for (let index = 0; index < args.length; index += 2) {
    const flag = args[index], value = args[index + 1];
    if (!['--grid', '--mask', '--ink', '--format'].includes(flag) || seen.has(flag)) throw new Error('Use --grid or --mask once, with optional --ink and --format.');
    if (typeof value !== 'string' || !value || value.startsWith('--')) throw new Error('Each option needs one value; prefix dash-leading filenames with ./ .');
    seen.add(flag); options[flag.slice(2)] = value;
  }
  if (Number(seen.has('--grid')) + Number(seen.has('--mask')) !== 1) throw new Error('Supply exactly one of --grid and --mask.');
  if (!['url', 'svg', 'json'].includes(options.format)) throw new Error('Format must be url, svg or json.');
  if (options.ink !== undefined) {
    if (!/^#?[0-9a-f]{6}$/i.test(options.ink)) throw new Error('Ink must be six hex digits, for example #33f282.');
    options.ink = '#' + options.ink.replace(/^#/, '').toLowerCase();
  }
  return options;
}

export function parseGrid(text) {
  if (typeof text !== 'string' || text.length > MAX_GRID_BYTES) throw new Error('Grid exceeds the 4 KiB limit.');
  const normalized = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const mask = (normalized.endsWith('\n') ? normalized.slice(0, -1) : normalized).split('\n');
  try { encodeArtwork(mask); }
  catch { throw new Error('Grid must have exactly 8, 16 or 32 equally sized rows of dots and hashes, with no spaces or blank rows.'); }
  return mask;
}

export async function readGrid(path) {
  if (!constants.O_NONBLOCK || !constants.O_NOFOLLOW) throw new Error('Grid input needs nonblocking, no-follow file support on this platform.');
  let handle;
  try { handle = await open(path, constants.O_RDONLY | constants.O_NONBLOCK | constants.O_NOFOLLOW | (constants.O_NOCTTY || 0)); }
  catch { throw new Error('Cannot open grid; use a readable regular file, not a symlink.'); }
  try {
    const stat = await handle.stat();
    if (!stat.isFile()) throw new Error('Grid must be a regular file; directories, FIFOs and devices are not accepted.');
    if (stat.size > MAX_GRID_BYTES) throw new Error('Grid exceeds the 4 KiB limit.');
    const buffer = Buffer.alloc(MAX_GRID_BYTES + 1);
    let total = 0;
    while (total < buffer.length) {
      const { bytesRead } = await handle.read(buffer, total, buffer.length - total, null);
      if (!bytesRead) break;
      total += bytesRead;
    }
    if (total > MAX_GRID_BYTES) throw new Error('Grid exceeds the 4 KiB limit.');
    let text;
    try { text = new TextDecoder('utf-8', { fatal: true }).decode(buffer.subarray(0, total)); }
    catch { throw new Error('Grid must be UTF-8 text.'); }
    return parseGrid(text);
  } catch (error) { throw new Error(error.code ? 'Cannot read grid file.' : error.message); }
  finally { await handle.close(); }
}

export function flatSvg(mask, ink) {
  // Reuse the codec for shape/colour validation before creating any XML.
  encodeArtwork(mask, ink);
  if (ink === null) throw new Error('SVG requires explicit ink; supply --ink for a theme-relative mask.');
  const size = mask.length;
  const cells = mask.flatMap((row, y) => [...row].flatMap((cell, x) => cell === '#' ? [`<rect x="${x}" y="${y}" width="1" height="1"/>`] : []));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size * 16}" height="${size * 16}" shape-rendering="crispEdges" fill="${ink}"><title>Pixel mask</title>${cells.join('')}</svg>`;
}

export async function main(args, { stdout = console.log, stderr = console.error } = {}) {
  try {
    const options = parseArgs(args);
    if (options.help) { stdout(HELP); return 0; }
    let artwork;
    if (options.grid) artwork = { mask: await readGrid(options.grid), ink: null };
    else {
      try { artwork = decodeArtwork(options.mask); }
      catch { throw new Error('Invalid mask token; supply a canonical v1/v2 token, not a URL.'); }
    }
    const ink = options.ink ?? artwork.ink;
    const token = encodeArtwork(artwork.mask, ink);
    const url = maskShareUrl(artwork.mask, ink);
    const output = options.format === 'svg' ? flatSvg(artwork.mask, ink) : options.format === 'json' ? JSON.stringify({ size: artwork.mask.length, mask: artwork.mask, ink, token, url }, null, 2) : url;
    stdout(output);
    return 0;
  } catch (error) { stderr(`pixels: ${safe(error.message)}`); return 1; }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exitCode = await main(process.argv.slice(2));
