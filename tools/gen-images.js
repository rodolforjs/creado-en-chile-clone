// Genera data/images.js (primera foto por producto) y data/images-extra.js (resto, para la galería de la ficha)
// a partir de la API pública de la tienda. Las fotos se enlazan desde el CDN de Shopify; no se descargan.
// Uso: node tools/gen-images.js
const fs = require('fs');
const path = require('path');
global.window = {};
require(path.join(__dirname, '../data/catalog.js'));
const handles = new Set(window.CEC_DATA.products.map((p) => p.h));
const BASE = 'https://cdn.shopify.com/s/files/1/1481/4916/';
const short = (src) => {
  const u = new URL(src);
  if (!src.startsWith(BASE) || /\.(heic|gif)$/i.test(u.pathname)) return null; // el navegador no muestra HEIC
  const rest = u.pathname.replace('/s/files/1/1481/4916/', '');
  return `${rest.startsWith('files/') ? 'f' : 'p'}/${rest.replace(/^(files|products)\//, '')}${u.search}`;
};
(async () => {
  const first = {};
  const extra = {};
  for (let page = 1; page < 30; page++) {
    const r = await fetch(`https://creadoenchile.cl/products.json?limit=250&page=${page}`);
    const { products } = await r.json();
    if (!products.length) break;
    for (const p of products) {
      if (!handles.has(p.handle)) continue;
      const imgs = p.images.map((i) => short(i.src)).filter(Boolean);
      if (!imgs.length) continue;
      first[p.handle] = imgs[0];
      if (imgs.length > 1) extra[p.handle] = imgs.slice(1, 15);
    }
  }
  fs.writeFileSync(path.join(__dirname, '../data/images.js'), `window.CEC_IMG=${JSON.stringify(first)};\n`);
  fs.writeFileSync(path.join(__dirname, '../data/images-extra.js'), `window.CEC_IMG_X=${JSON.stringify(extra)};\n`);
  console.log(Object.keys(first).length, 'con foto,', Object.keys(extra).length, 'con galería,', handles.size, 'productos');
})();
