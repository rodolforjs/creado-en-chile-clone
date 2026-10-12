// Genera data/ctx-packs.js: 3 mini paquetes por contexto (3 productos cada uno, ~$20k / ~$40k / ~$65k).
// Uso: node tools/gen-packs.js
const fs = require('fs');
const path = require('path');
global.window = {};
require(path.join(__dirname, '../data/catalog.js'));
const { LIST, weight, fitsCarryOn } = require('../ctx-data.js');
const D = window.CEC_DATA;
const express = new Set(D.collections['express-en-3-horas'] || []);
const cat = (p) => (p.ty || 'otro').toLowerCase().replace(/s$/, '');
const TARGETS = [20000, 40000, 65000];
const out = {};
LIST.forEach((c) => {
  const used = new Set();
  const cand = D.products.map((p, i) => ({ p, i, w: weight(p, c) })).filter((x) => x.w >= 3 && x.p.p >= 3000 && x.p.p <= 40000 && (!c.carry || fitsCarryOn(x.p))).sort((a, b) => b.w - a.w || a.i - b.i).slice(0, 70);
  out[c.id] = TARGETS.map((target, k) => {
    let best = null;
    for (let a = 0; a < cand.length; a++) for (let b = a + 1; b < cand.length; b++) for (let d = b + 1; d < cand.length; d++) {
      const t = [cand[a], cand[b], cand[d]];
      if (t.some((x) => used.has(x.p.h))) continue;
      if (new Set(t.map((x) => cat(x.p))).size < 3) continue;
      if (new Set(t.map((x) => x.p.v)).size < 2) continue;
      const sum = t.reduce((s, x) => s + x.p.p, 0);
      const score = Math.abs(sum - target) / target - (t.reduce((s, x) => s + x.w, 0) / 90);
      if (!best || score < best.score) best = { score, t, sum };
    }
    best.t.forEach((x) => used.add(x.p.h));
    return { id: `${c.id}-${k + 1}`, name: c.packs[k], total: best.sum, items: best.t.map((x) => ({ h: x.p.h, t: x.p.t, p: x.p.p, v: x.p.v, x: express.has(x.i) ? 1 : 0 })) };
  });
});
fs.writeFileSync(path.join(__dirname, '../data/ctx-packs.js'), `// Generado por tools/gen-packs.js\nwindow.CEC_PACKS = ${JSON.stringify(out)};\n`);
console.log(Object.entries(out).map(([k, v]) => `${k}: ${v.map((x) => x.total).join(' / ')}`).join('\n'));
