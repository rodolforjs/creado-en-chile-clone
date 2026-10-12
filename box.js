// Mini paquete como caja abierta: 3 espacios, "Cambiar" por producto y un solo envío.
// Se usa en contextos y en el inicio. Cambiar necesita el catálogo: en el inicio se carga recién al primer clic.
(() => {
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (n) => '$' + Math.round(n).toLocaleString('en-US');
  const cat = (p) => (p.ty || 'otro').toLowerCase().replace(/s$/, '');
  let catalog = null;
  const loadCatalog = () => {
    if (window.CEC_DATA) return Promise.resolve(window.CEC_DATA);
    if (catalog) return catalog;
    catalog = new Promise((ok, fail) => {
      const s = document.createElement('script');
      s.src = 'data/catalog.js';
      s.onload = () => ok(window.CEC_DATA);
      s.onerror = fail;
      document.head.appendChild(s);
    });
    return catalog;
  };

  // Piezas que podrían ocupar el lugar de `it`: mismo tipo y precio parecido, afines al momento, que no estén ya en la caja
  const altsFor = (D, it, inBox, ctx) => {
    const base = D.products.find((p) => p.h === it.h);
    const type = base ? cat(base) : null;
    const express = new Set(D.collections['express-en-3-horas'] || []);
    const img = window.CEC_IMG || {};
    const c = ctx && window.CEC_CTX ? window.CEC_CTX.byId(ctx) : null;
    const list = [];
    D.products.forEach((p, i) => {
      if (p.p < 3000 || inBox.includes(p.h) || !img[p.h]) return;
      if (type && cat(p) !== type) return;
      if (p.p < it.p * 0.6 || p.p > it.p * 1.5) return;
      const w = c ? window.CEC_CTX.weight(p, c) : 0;
      list.push({ h: p.h, t: p.t, p: p.p, v: p.v, x: express.has(i) ? 1 : 0, k: (c ? -w * 3 : 0) + Math.abs(p.p - it.p) / it.p * 5 + (i % 7) * 0.01 });
    });
    return list.sort((a, b) => a.k - b.k).slice(0, 12);
  };

  const mount = (el, packs, opts = {}) => {
    const url = (h) => (window.CEC && window.CEC.url ? window.CEC.url.product(h) : `product.html?p=${encodeURIComponent(h)}`);
    const state = packs.map((pk) => ({ name: pk.name, items: pk.items.map((i) => ({ ...i })), ctx: pk.ctx, alts: {}, changed: 0 }));
    let cur = 0;
    const total = (b) => b.items.reduce((a, i) => a + i.p, 0);
    const slot = (i, k) => `<div class="gbox__slot" data-k="${k}"><a class="gbox__ph ph ph--product" href="${url(i.h)}" data-ph="${esc(i.v)}" data-img="${esc(i.h)}" data-img-w="400"></a>
      <div class="gbox__info"><a class="gbox__t" href="${url(i.h)}">${esc(i.t)}</a><span class="gbox__v">${esc(i.v || '')}</span><b class="gbox__p">${fmt(i.p)}</b>
      <button class="link-underline gbox__swap" type="button" data-swap="${k}" aria-label="Cambiar ${esc(i.t)}">Cambiar</button></div></div>`;
    const draw = (only) => {
      const b = state[cur];
      if (only != null) {
        const n = el.querySelector(`.gbox__slot[data-k="${only}"]`);
        if (n) { n.outerHTML = slot(b.items[only], only); el.querySelector(`.gbox__slot[data-k="${only}"]`).classList.add('is-new'); }
        el.querySelector('[data-total]').textContent = fmt(total(b));
        el.querySelector('[data-hint]').textContent = b.changed ? 'Quedó a tu medida. Sigue siendo un solo envío.' : 'Toca “Cambiar” en cualquier pieza para armarla a tu gusto.';
        return;
      }
      el.innerHTML = `<div class="gbox">
        <div class="gbox__tabs" role="tablist" aria-label="Mini paquetes">${state.map((s, i) => `<button type="button" role="tab" aria-selected="${i === cur}" class="${i === cur ? 'is-on' : ''}" data-tab="${i}"><span>${esc(packs[i].tab || s.name)}</span><small>${fmt(total(s))}</small></button>`).join('')}</div>
        <div class="gbox__box">
          <div class="gbox__lid"><span class="gbox__ribbon"></span><span class="gbox__label">${esc(b.name)}</span></div>
          <div class="gbox__tray">${b.items.map(slot).join('')}</div>
          <div class="gbox__front"><span>CREADO EN CHILE</span><span>3 piezas · 1 solo envío</span></div>
        </div>
        <div class="gbox__foot"><p class="gbox__hint" data-hint>${b.changed ? 'Quedó a tu medida. Sigue siendo un solo envío.' : 'Toca “Cambiar” en cualquier pieza para armarla a tu gusto.'}</p>
          <div class="gbox__buy"><b data-total>${fmt(total(b))}</b><button class="btn btn--solid btn--md" type="button" data-add>Agregar la caja al carro</button></div></div></div>`;
    };
    el.addEventListener('click', async (e) => {
      const tab = e.target.closest('[data-tab]');
      if (tab) { cur = +tab.dataset.tab; draw(); return; }
      if (e.target.closest('[data-add]')) {
        state[cur].items.forEach((i) => window.CEC.addToCart({ handle: i.h, title: i.t, price: i.p, express: !!i.x }, false));
        window.CEC.openCart();
        return;
      }
      const sw = e.target.closest('[data-swap]');
      if (!sw) return;
      const k = +sw.dataset.swap;
      const b = state[cur];
      sw.disabled = true;
      try {
        const D = await loadCatalog();
        const key = `${cur}-${k}`;
        if (!b.alts[key]) b.alts[key] = altsFor(D, b.items[k], b.items.map((i) => i.h), b.ctx || opts.ctx);
        const alts = b.alts[key].filter((x) => !b.items.some((i) => i.h === x.h));
        if (alts.length) {
          const old = b.items[k];
          b.items[k] = alts[0];
          b.changed += 1;
          b.alts[key] = alts.slice(1).concat([old]); // el anterior vuelve al final de la fila
        }
      } catch { /* sin catálogo: la caja queda como estaba */ }
      draw(k);
    });
    draw();
  };

  window.CEC_BOX = { mount };
})();
