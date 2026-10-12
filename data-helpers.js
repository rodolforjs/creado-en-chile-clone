// Ayudas compartidas por las páginas con catálogo (colección, ficha, búsqueda).
(() => {
  const D = window.CEC_DATA;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (n) => '$' + Math.round(n).toLocaleString('en-US');
  const expressSet = new Set((D.collections['express-en-3-horas'] || []));

  const COLORS = {
    negro: '#111', blanco: '#f4f4f4', azul: '#2b57a6', rojo: '#c0392b', roja: '#c0392b', verde: '#3b7d4f', amarillo: '#e8c52d',
    rosado: '#e9a8b8', rosa: '#e9a8b8', burdeo: '#6d1f2f', morado: '#6a3d8f', naranja: '#e8812d', café: '#6b4328', cafe: '#6b4328',
    beige: '#d9c6a5', gris: '#8a8a8a', dorado: '#c9a227', plateado: '#bfc3c7', cobre: '#b46a3c', natural: '#d8b98a', celeste: '#8ec5e8',
    crudo: '#efe6d3', camel: '#b8864f', turquesa: '#2fb5b0', fucsia: '#d02c8a', lila: '#b99ad3', mostaza: '#d4a017', terracota: '#c4623e',
  };
  const colorOf = (p) => {
    const opt = (p.o || []).find((o) => /color/i.test(o.n));
    if (!opt) return [];
    const found = [];
    opt.v.forEach((v) => {
      const w = v.toLowerCase().split(/[\s/,-]+/).find((t) => COLORS[t]);
      if (w && !found.includes(w)) found.push(w);
    });
    return found;
  };
  const colorCount = (p) => { const o = (p.o || []).find((x) => /^color$/i.test(x.n.trim())); return o ? o.v.length : 0; };

  const COIN = '<svg class="pgi__coin" aria-hidden="true"><use href="#coin-3h"/></svg>';
  const CART = '<svg class="pgi__quick-icon" aria-hidden="true"><use href="#i-cart"/></svg>';

  // Tarjeta de producto (misma estructura que en el inicio)
  const card = (p, { swatches = true } = {}) => {
    const href = `product.html?p=${encodeURIComponent(p.h)}`;
    const off = p.cp && p.cp > p.p ? Math.round((1 - p.p / p.cp) * 100) : 0;
    const badge = off ? `<div class="pgi__badge"><span class="badge badge--sale">${off}%</span></div>` : '';
    const idx = D.products.indexOf(p);
    const coin = expressSet.has(idx) ? COIN : '';
    const n = colorCount(p);
    let sw = '';
    if (swatches && n > 0) {
      const pills = Array.from({ length: Math.min(n, 4) }, () => '<span class="pgi__swatch"></span>').join('');
      sw = `<div class="pgi__swatches">${pills}${n > 4 ? `<span class="pgi__more">+ ${n - 4} más</span>` : ''}</div>`;
    }
    const old = off ? ` <s>${fmt(p.cp)}</s>` : '';
    return `<article class="pgi">
  <div class="pgi__image">
    <a class="pgi__media" href="${href}" aria-label="${esc(p.t)}"><div class="ph ph--product" data-ph="${esc(p.v)}" data-img="${esc(p.h)}"></div></a>
    ${badge}${coin}
    <button class="pgi__quick" type="button" data-quick-add data-express="${expressSet.has(idx) ? 1 : 0}" data-handle="${esc(p.h)}" data-title="${esc(p.t)}" data-price="${p.p}" aria-label="Compra rápida">${CART}<span class="pgi__quick-text">Compra rápida</span></button>
  </div>
  <div class="pgi__info">
    <a class="pgi__title" href="${href}">${esc(p.t)}</a>
    <a class="pgi__price" href="${href}"><span class="pgi__price-new">${fmt(p.p)}</span>${old}</a>
    ${sw}
  </div>
</article>`;
  };

  const byHandle = {};
  D.products.forEach((p, i) => { p.i = i; byHandle[p.h] = p; });

  window.CEC_UI = { D, esc, fmt, card, colorOf, colorCount, COLORS, byHandle, expressSet };
})();
