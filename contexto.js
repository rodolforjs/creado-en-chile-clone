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

  // ---------- después del listado: paquetes y aviso de fecha ----------
  const packs = (window.CEC_PACKS || {})[ctx.id] || [];
  const packHtml = (pk) => `<article class="cpack"><div class="cpack__thumbs">${pk.items.map((i) => `<div class="ph ph--product" data-ph="${esc(i.v)}"></div>`).join('')}</div>
    <div class="cpack__body"><p class="cpack__label">Mini paquete</p><h3 class="cpack__name">${esc(pk.name)}</h3>
    <ul class="cpack__items">${pk.items.map((i) => `<li><a href="${window.CEC.url.product(i.h)}">${esc(i.t)}</a> <span>${U.fmt(i.p)}</span></li>`).join('')}</ul>
    <div class="cpack__foot"><b>${U.fmt(pk.total)}</b><button class="btn btn--solid btn--md" type="button" data-pack="${pk.id}">Agregar la escena al carro</button></div></div></article>`;
  const o = S.occ(ctx.occ);
  const nd = o ? S.nextDate(o) : null;
  const dateNote = o ? `<aside class="cdate"><p><b>Se viene ${esc(o.name)}</b> · ${S.fmtDate(nd)} (${S.inDays(S.daysTo(nd))}). Guarda a quién se lo regalas y te avisamos con ideas.</p><a class="btn btn--outline btn--md" href="recordatorio.html?oc=${o.id}">Guardar esta fecha</a></aside>` : '';
  $('#ctxMore').innerHTML = `<div class="wrapper">${packs.length ? `<h2 class="ch">¿Prefieres la escena lista?</h2><p class="sform__lead">Tres piezas que van juntas, en un solo clic.</p><div class="cpacks">${packs.map(packHtml).join('')}</div>` : ''}${dateNote}</div>`;

  $('#ctxMore').addEventListener('click', (e) => {
    const pk = e.target.closest('[data-pack]');
    if (!pk) return;
    const pack = packs.find((x) => x.id === pk.dataset.pack);
    pack.items.forEach((i) => window.CEC.addToCart({ handle: i.h, title: i.t, price: i.p, express: !!i.x }, false));
    window.CEC.openCart();
  });
})();
