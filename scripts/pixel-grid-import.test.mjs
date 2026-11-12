import test from 'node:test';
import assert from 'node:assert/strict';
import { readGridFile, createGridImportSession } from '../lib/pixel-grid-import.ts';
import { initialMaskState, maskReducer, maskGridText, blankMask, transformMask } from '../lib/pixel-mask.ts';
import { parseGrid, MAX_GRID_BYTES } from './pixels.mjs';
import { decodeArtwork, encodeArtwork } from '../lib/pixel-mask-link.ts';
const rows = size => Array.from({length:size}, (_, y) => '.'.repeat(y) + '#' + '.'.repeat(size-y-1));
const blob = text => new Blob([text]);
function delayed() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return {file: {size:72, slice:()=>({arrayBuffer:()=>promise})}, resolve: text => resolve(new TextEncoder().encode(text).buffer)};
}

test('all CLI sizes/formats import exact cells, preserve ink and undo previous size in one action', async () => {
  for (const size of [8,16,32]) {
    const mask = rows(size);
    const text = maskGridText(mask);
    for (const variant of [text, text.slice(0,-1), '\uFEFF'+text.replaceAll('\n','\r\n')]) {
      assert.deepEqual(await readGridFile(blob(variant)), parseGrid(variant));
    }
    let state = initialMaskState(blankMask(size === 8 ? 32 : 8), '#33f282');
    const initial = state;
    const session = createGridImportSession();
    assert.equal(await session.open(blob(text), imported => {state=maskReducer(state,{type:'replace',mask:imported})}), 'opened');
    assert.deepEqual(state.mask, mask); assert.equal(state.ink, initial.ink); assert.equal(state.past.length,1);
    assert.deepEqual(decodeArtwork(encodeArtwork(state.mask,state.ink)), {mask,ink:'#33f282'});
    const undone=maskReducer(state,{type:'undo'}); assert.deepEqual(undone.mask,initial.mask); assert.equal(undone.ink,initial.ink);
    assert.deepEqual(maskReducer(undone,{type:'redo'}).mask,mask);
    let theme = initialMaskState(blankMask(size === 8 ? 16 : 8), null);
    await session.open(blob(text), imported => { theme = maskReducer(theme, {type:'replace', mask:imported}); });
    assert.equal(theme.ink, null); assert.deepEqual(theme.mask, mask); assert.equal(theme.past.length, 1);
  }
});

test('size is checked before reading, reads are capped and malformed UTF-8/format never apply', async () => {
  let read=false;
  await assert.rejects(readGridFile({size:MAX_GRID_BYTES+1,slice(){read=true;throw new Error('read')}}));
  assert.equal(read,false);
  await assert.rejects(readGridFile({size:10,slice(start,end){assert.equal(start,0);assert.equal(end,MAX_GRID_BYTES+1);return blob('x'.repeat(MAX_GRID_BYTES+1))}}));
  for (const file of [blob(''),blob(rows(8).join('\n')+'\n\n'),blob(rows(8).join('\n').replace('#',' ')),blob('<svg/>'),blob(new Uint8Array([0xff,0xfe])), {size:72,slice(){throw new Error('read failed')}}]) {
    let applied=false;
    assert.equal(await createGridImportSession().open(file,()=>{applied=true}), 'invalid');
    assert.equal(applied,false);
  }
});

test('new editor actions, selection, cancellation and unmount invalidate pending imports', async () => {
  for (const intent of ['edit','selection','cancel','unmount']) {
    const session=createGridImportSession(), pending=delayed();let commits=0;
    const first=session.open(pending.file,()=>commits++);
    if(intent==='cancel') assert.equal(await session.open(undefined,()=>commits++),'cancelled');
    else session.invalidate();
    pending.resolve(maskGridText(rows(8)));
    assert.equal(await first,'stale'); assert.equal(commits,0);
  }
  const session=createGridImportSession(), old=delayed();const applied=[];
  const first=session.open(old.file,mask=>applied.push(mask));
  assert.equal(await session.open(blob(maskGridText(rows(16))),mask=>applied.push(mask)),'opened');
  old.resolve(maskGridText(rows(8)));assert.equal(await first,'stale');assert.deepEqual(applied,[rows(16)]);
});


test('transform intent invalidates a pending grid replacement without losing undoable artwork', async () => {
  for (const size of [8,16,32]) for (const transform of ['flip-horizontal','flip-vertical','rotate-clockwise']) {
    const session=createGridImportSession(), pending=delayed();
    let state=initialMaskState(rows(size), '#fa127d');
    const initial=state;
    const reading=session.open(pending.file,mask=>{state=maskReducer(state,{type:'replace',mask})});
    session.invalidate(); // The editor command path invalidates before dispatching replace.
    state=maskReducer(state,{type:'replace',mask:transformMask(state.mask,transform)});
    const transformed=state;
    pending.resolve(maskGridText(blankMask(8)));
    assert.equal(await reading,'stale'); assert.equal(state,transformed);
    assert.deepEqual(maskReducer(state,{type:'undo'}).mask,initial.mask);
    assert.equal(state.ink,initial.ink);
  }
});
