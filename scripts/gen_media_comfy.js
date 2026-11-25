#!/usr/bin/env node
// Generates listing photos (Z-Image Turbo) and short clips (Wan 2.2 i2v) on the local ComfyUI of the GPU server.
// Usage (on the server):  node gen_media_comfy.js spec.json OUT_DIR
// Reuses the graph builders of studio.siteaccess.ru. Skips files that already exist, so it can be re-run.
const fs = require('node:fs');
const path = require('node:path');
const { zImage, wan22 } = require('/var/www/studio.siteaccess.ru/server/workflows/graphs.js');

const COMFY = process.env.COMFY_URL || 'http://127.0.0.1:8188';
const [specFile, outDir] = process.argv.slice(2);
const spec = JSON.parse(fs.readFileSync(specFile, 'utf8'));
fs.mkdirSync(outDir, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function run(graph, output) {
  const res = await fetch(`${COMFY}/prompt`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ prompt: graph, client_id: 'market-gen' }) });
  const { prompt_id, error, node_errors } = await res.json();
  if (!prompt_id) throw new Error(JSON.stringify(error || node_errors));
  for (let i = 0; i < 900; i++) {
    await sleep(1500);
    const h = (await (await fetch(`${COMFY}/history/${prompt_id}`)).json())[prompt_id];
    if (!h) continue;
    if (h.status && h.status.status_str === 'error') throw new Error('comfy error ' + JSON.stringify(h.status.messages).slice(0, 400));
    const o = h.outputs && h.outputs[output];
    if (!o) continue;
    const f = (o.images || o.videos || o.gifs || [])[0];
    if (!f) throw new Error('no output file');
    const q = new URLSearchParams({ filename: f.filename, subfolder: f.subfolder || '', type: f.type || 'output' });
    return Buffer.from(await (await fetch(`${COMFY}/view?${q}`)).arrayBuffer());
  }
  throw new Error('timeout');
}

async function upload(file) {
  const fd = new FormData();
  fd.append('image', new Blob([fs.readFileSync(file)]), path.basename(file));
  fd.append('overwrite', 'true');
  const r = await (await fetch(`${COMFY}/upload/image`, { method: 'POST', body: fd })).json();
  return r.subfolder ? `${r.subfolder}/${r.name}` : r.name;
}

(async () => {
  let seed = 7100;
  for (const item of spec) {
    for (const [i, prompt] of item.photos.entries()) {
      const file = path.join(outDir, `${item.slug}-${i + 1}.png`);
      seed++;
      if (fs.existsSync(file)) continue;
      const t = Date.now();
      const { graph, output } = zImage({ prompt, width: 1216, height: 912, seed, prefix: 'market/img' });
      fs.writeFileSync(file, await run(graph, output));
      console.log('photo', path.basename(file), ((Date.now() - t) / 1000).toFixed(1) + 's');
    }
  }
  if (process.env.SKIP_VIDEO) return;
  for (const item of spec) {
    if (!item.video) continue;
    const file = path.join(outDir, `${item.slug}.mp4`);
    if (fs.existsSync(file)) continue;
    const t = Date.now();
    const start = await upload(path.join(outDir, `${item.slug}-1.png`));
    const { graph, output } = wan22({ prompt: item.video, width: 832, height: 624, frames: 81, seed: 4242, start, prefix: 'market/video' });
    fs.writeFileSync(file, await run(graph, output));
    console.log('video', path.basename(file), ((Date.now() - t) / 1000).toFixed(1) + 's');
  }
  console.log('done');
})().catch((e) => { console.error(e); process.exit(1); });
