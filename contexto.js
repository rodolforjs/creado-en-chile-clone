// Contextos (demostración): una sola plantilla. Arriba la escena; abajo el listado de colección (filtros, orden, grilla), que arma collection.js.
// Los mini paquetes y el aviso de fecha van después del listado, para no competir con los productos.
(() => {
  const S = window.CEC_SUB;
  const U = window.CEC_UI;
  const X = window.CEC_CTX;
  const esc = S.esc;
  const $ = (s, r = document) => r.querySelector(s);
  const main = $('#main');
  const ctx = X.byId(new URLSearchParams(location.search).get('c'));
  const href = (c) => `contexto.html?c=${c.id}`;

  // ---------- elegir momento (sin contexto) ----------
  if (!ctx) {
    window.CEC_NO_COLLECTION = true;
    main.className = 'page-sub page-ctx';
    main.innerHTML = `<section class="ctxpick"><div class="wrapper"><p class="seyebrow">Contextos</p><h1 class="sform__title">Elige tu momento</h1><p class="sform__lead">Seis escenas para encontrar regalos según el momento que quieres crear.</p>
      <div class="mtiles mtiles--6 ctxpick__tiles">${X.LIST.map((c) => `<a class="mtile mtile--sm" href="${href(c)}"><span class="mtile__img ph ph--product" data-ph="${esc(c.label)}"></span><span class="mtile__t">${esc(c.label)}</span><span class="mtile__s">${esc(c.scene)}</span></a>`).join('')}</div></div></section>`;
    return;
  }

  document.title = `${ctx.label} | Creado en Chile`;

  // ---------- hero con la escena ----------
  $('#ctxHero').innerHTML = `<section class="cban"><div class="cban__img ph ph--product" data-ph="Escena: ${esc(ctx.scene)}"></div><div class="wrapper"><div class="cban__text">
    <p class="seyebrow">Contexto</p><h1 class="cban__title">${esc(ctx.label)}</h1><p class="cban__scene">${esc(ctx.scene)}</p><p class="cban__tag">${esc(ctx.tagline)}</p>
    <div class="cban__btns"><a class="btn btn--solid btn--md" href="match.html?ctx=${ctx.id}">Hacer un Match de este momento</a></div>
    <nav class="cban__others" aria-label="Otros momentos"><span>Otros momentos</span>${X.LIST.filter((c) => c.id !== ctx.id).map((c) => `<a href="${href(c)}">${esc(c.label)}</a>`).join('')}</nav>
  </div></div></section>`;

  // ---------- puntos sobre la escena (como IKEA): cada uno abre el producto; hay un botón para llevar todo ----------
  const scenePack = ((window.CEC_PACKS || {})[ctx.id] || [])[1];
  const SPOTS = [[64, 34], [80, 58], [70, 74]];
  if (scenePack) {
    const total = scenePack.items.reduce((a, i) => a + i.p, 0);
    $('.cban').insertAdjacentHTML('beforeend', `<div class="cspots" id="cSpots">${scenePack.items.map((i, k) => `<div class="cspot" style="left:${SPOTS[k][0]}%;top:${SPOTS[k][1]}%">
        <button class="cspot__dot" type="button" aria-label="${esc(i.t)}" aria-expanded="false" data-spot="${k}"></button>
        <div class="cspot__pop" hidden><p class="cspot__t">${esc(i.t)}</p><p class="cspot__p">${U.fmt(i.p)}</p><a class="link-underline" href="${window.CEC.url.product(i.h)}">Ver producto</a><button class="btn btn--solid btn--sm" type="button" data-add="${k}">Agregar</button></div></div>`).join('')}
      <button class="cspots__all btn btn--white btn--md" type="button" data-all>Llevar la escena · ${U.fmt(total)}</button></div>`);
    const close = () => document.querySelectorAll('.cspot__pop').forEach((p) => { p.hidden = true; p.previousElementSibling.setAttribute('aria-expanded', 'false'); });
    $('#cSpots').addEventListener('click', (e) => {
      const dot = e.target.closest('[data-spot]');
      const add = e.target.closest('[data-add]');
      if (dot) { const pop = dot.nextElementSibling; const open = pop.hidden; close(); pop.hidden = !open; dot.setAttribute('aria-expanded', String(open)); return; }
      const toCart = (i) => window.CEC.addToCart({ handle: i.h, title: i.t, price: i.p, express: !!i.x }, false);
      if (add) { toCart(scenePack.items[+add.dataset.add]); close(); window.CEC.openCart(); return; }
      if (e.target.closest('[data-all]')) { scenePack.items.forEach(toCart); window.CEC.openCart(); }
    });
    document.addEventListener('click', (e) => { if (!e.target.closest('.cspot')) close(); });
  }

  // ---------- tipos de producto del momento (como las categorías con foto de IKEA): filtran el listado ----------
  const counts = {};
  U.D.products.forEach((p) => { if (p.ty && X.weight(p, ctx) > 0) counts[p.ty] = (counts[p.ty] || 0) + 1; });
  const types = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const cur = new URLSearchParams(location.search).getAll('tipo');
  $('#ctxTypes').innerHTML = types.length ? `<div class="wrapper"><nav class="ctypes" aria-label="Tipos de producto"><a class="ctype ${cur.length ? '' : 'is-on'}" href="${href(ctx)}"><span class="ph ph--product ctype__img" data-ph="Todo"></span><span>Todo</span></a>${types.map(([t]) => `<a class="ctype ${cur.includes(t) ? 'is-on' : ''}" href="${href(ctx)}&tipo=${encodeURIComponent(t)}"><span class="ph ph--product ctype__img" data-ph="${esc(t)}"></span><span>${esc(t)}</span></a>`).join('')}</nav></div>` : '';

  // ---------- después del listado: paquetes y aviso de fecha ----------
  const packs = (window.CEC_PACKS || {})[ctx.id] || [];
  const o = S.occ(ctx.occ);
  const nd = o ? S.nextDate(o) : null;
  const dateNote = o ? `<aside class="cdate"><p><b>Se viene ${esc(o.name)}</b> · ${S.fmtDate(nd)} (${S.inDays(S.daysTo(nd))}). Guarda a quién se lo regalas y te avisamos con ideas.</p><a class="btn btn--outline btn--md" href="recordatorio.html?oc=${o.id}">Guardar esta fecha</a></aside>` : '';
  $('#ctxMore').innerHTML = `<div class="wrapper">${packs.length ? `<h2 class="ch">¿Prefieres la escena lista?</h2><p class="sform__lead">Una caja con tres piezas que van juntas, en un solo envío. Cambia lo que quieras.</p><div id="ctxBox"></div>` : ''}${dateNote}</div>`;
  if (packs.length) window.CEC_BOX.mount($('#ctxBox'), packs, { ctx: ctx.id });

})();
