import { encodeArtwork } from "./pixel-mask-link.ts"

export const MAX_GRID_BYTES = 4096

export function parseGrid(text) {
  if (typeof text !== 'string' || text.length > MAX_GRID_BYTES) throw new Error('Grid exceeds the 4 KiB limit.');
  const normalized = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const mask = (normalized.endsWith('\n') ? normalized.slice(0, -1) : normalized).split('\n');
  try { encodeArtwork(mask); }
  catch { throw new Error('Grid must have exactly 8, 16 or 32 equally sized rows of dots and hashes, with no spaces or blank rows.'); }
  return mask;
}
