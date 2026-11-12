import test from "node:test"
import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { mkdtemp, writeFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { flatPixelSvg, renderedPixelInk } from "../lib/pixel-flat-svg.ts"

const pattern = (size, kind) => Array.from({length:size}, (_,y) => Array.from({length:size},(_,x) => kind === "full" || kind === "asymmetric" && (x === 1 && y < size - 2 || y === size - 3 && x > 1 || x === size - 2 && y === 2) ? "#" : ".").join(""))
function geometry(svg) {
  const root = /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 (8|16|32) \1" width="(\d+)" height="(\d+)" shape-rendering="crispEdges" fill="(#[0-9a-f]{6})"><title>Pixel mask<\/title>(.*)<\/svg>$/.exec(svg)
  assert.ok(root, "only the transparent bitmap SVG vocabulary is permitted")
  const rects = [...root[5].matchAll(/<rect x="(\d+)" y="(\d+)" width="1" height="1"\/>/g)]
  assert.equal(rects.map(match => match[0]).join(""), root[5], "no hidden elements, references or background")
  return {size:Number(root[1]),width:Number(root[2]),height:Number(root[3]),ink:root[4],cells:rects.map(match => [Number(match[1]),Number(match[2])])}
}

test("blank, full and asymmetric flat exports have exact bounded unit geometry at every size", () => {
  for (const size of [8,16,32]) for (const kind of ["blank","full","asymmetric"]) {
    const mask = pattern(size,kind), before = [...mask]
    const svg = flatPixelSvg(mask,"#aBcD09"), parsed = geometry(svg)
    assert.equal(parsed.size,size); assert.equal(parsed.width,size*16); assert.equal(parsed.height,size*16); assert.equal(parsed.ink,"#abcd09")
    const expected = mask.flatMap((row,y)=>[...row].flatMap((cell,x)=>cell==="#"?[[x,y]]:[]))
    assert.deepEqual(parsed.cells,expected); assert.equal(new Set(parsed.cells.map(cell=>cell.join(","))).size,expected.length)
    assert.deepEqual(mask,before)
    mask[0]=".".repeat(size)
    assert.deepEqual(geometry(svg).cells,expected, "already-captured bytes cannot change with later edits")
  }
})

test("actual released CLI SVG bytes match the browser helper for all sizes and mask kinds", async t => {
  const dir=await mkdtemp(join(tmpdir(),"wlkr-flat-svg-"))
  t.after(()=>rm(dir,{recursive:true,force:true}))
  for(const size of [8,16,32]) for(const kind of ["blank","full","asymmetric"]) for(const ink of ["#010101","#FFFFFF","#33f282"]) {
    const mask=pattern(size,kind), path=join(dir,"owned-grid.txt")
    await writeFile(path,mask.join("\n")+"\n")
    const cli=execFileSync(process.execPath,["scripts/pixels.mjs","--grid",path,"--ink",ink,"--format","svg"],{encoding:"utf8"}).trim()
    assert.equal(flatPixelSvg(mask,ink),cli)
    assert.deepEqual(geometry(cli),geometry(flatPixelSvg(mask,ink)))
  }
})

test("strict bounded mask/ink validation rejects sparse, malformed and injected values before serialization", () => {
  for(const mask of [null,{},[],Array(8),pattern(7,"full"),pattern(16,"full").slice(1),Array(8).fill(".......\n"),Array(8).fill("#######<"),Array(8).fill("........extra"),Array(8).fill(["........"])]) assert.throws(()=>flatPixelSvg(mask,"#010101"),/dot\/hash/)
  const oversize=Array(33);let touched=false
  Object.defineProperty(oversize,0,{get(){touched=true;throw new Error("must not scan oversized mask")}})
  assert.throws(()=>flatPixelSvg(oversize,"#010101"),/dot\/hash/);assert.equal(touched,false)
  for(const ink of [null,undefined,"#fff","#12345678","red","rgb(0,0,0)","currentColor","#123456\n",'#123456"><image href="https://invalid.test"/>',123456,Symbol("ink")]) assert.throws(()=>flatPixelSvg(pattern(8,"full"),ink),/opaque six-digit/)
})

test("theme resolution uses only a fresh 1x1 canvas and rejects unavailable, invalid or translucent colours", () => {
  const savedDocument=Object.getOwnPropertyDescriptor(globalThis,"document")
  const savedComputed=Object.getOwnPropertyDescriptor(globalThis,"getComputedStyle")
  try {
    const svg={}, canvas={width:0,height:0}
    let color="oklch(0.985 0 0)", rgba=new Uint8ClampedArray([250,250,250,255]), calls=0, unavailable=false, fill="#000000"
    const context={
      set fillStyle(value){if(["#000000","#ffffff", "oklch(0.985 0 0)"].includes(value))fill=value},
      get fillStyle(){return fill},
      fillRect(x,y,w,h){assert.deepEqual([x,y,w,h],[0,0,1,1]);calls++},
      getImageData(x,y,w,h){assert.deepEqual([x,y,w,h],[0,0,1,1]);return{data:rgba}},
    }
    Object.defineProperty(globalThis,"getComputedStyle",{configurable:true,value:element=>{assert.equal(element,svg);return{color}}})
    Object.defineProperty(globalThis,"document",{configurable:true,value:{createElement(tag){assert.equal(tag,"canvas");return Object.assign(canvas,{getContext(type){assert.equal(type,"2d");return unavailable?null:context}})}}})
    assert.equal(renderedPixelInk(svg),"#fafafa");assert.equal(canvas.width,1);assert.equal(canvas.height,1);assert.equal(calls,1)
    rgba=new Uint8ClampedArray([0,0,0,128]);assert.throws(()=>renderedPixelInk(svg),/opaque foreground/)
    color="unsupported CSS colour";assert.throws(()=>renderedPixelInk(svg),/could not be resolved/)
    unavailable=true;assert.throws(()=>renderedPixelInk(svg),/unavailable/)
  } finally {
    if(savedDocument)Object.defineProperty(globalThis,"document",savedDocument);else delete globalThis.document
    if(savedComputed)Object.defineProperty(globalThis,"getComputedStyle",savedComputed);else delete globalThis.getComputedStyle
  }
})
