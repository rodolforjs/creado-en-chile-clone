// Contextos (demostración): una sola plantilla para las 6 escenas. Cambian el banner, los mini paquetes y el listado etiquetado.
(() => {
  const S = window.CEC_SUB;
  const U = window.CEC_UI;
  const X = window.CEC_CTX;
  const D = U.D;
  const esc = S.esc;
  const $ = (s, r = document) => r.querySelector(s);
  const app = $('#subApp');
  const PER_PAGE = 48;
  const qs = new URLSearchParams(location.search);
  const ctx = X.byId(qs.get('c'));
  const PRICES = [
    { id: 'm1', min: 0, max: 15000, label: 'Hasta $15.000' },
    { id: 'm2', min: 15000, max: 30000, label: '$15.000 a $30.000' },
    { id: 'm3', min: 30000, max: 50000, label: '$30.000 a $50.000' },
    { id: 'm4', min: 50000, max: 1e9, label: 'Más de $50.000' },
  ];
  const href = (c) => `contexto.html?c=${c.id}`;

  const tabs = (cur) => `<nav class="ctabs" aria-label="Contextos">${X.LIST.map((c) => `<a href="${href(c)}" class="${cur && cur.id === c.id ? 'is-on' : ''}" ${cur && cur.id === c.id ? 'aria-current="page"' : ''}>${esc(c.label)}</a>`).join('')}</nav>`;

  // ---------- elegir momento (sin contexto) ----------
  if (!ctx) {
    app.innerHTML = `<section class="ctxpick"><div class="wrapper"><p class="seyebrow">Contextos</p><h1 class="sform__title">Elige tu momento</h1><p class="sform__lead">Seis escenas para encontrar regalos según el momento que quieres crear.</p>
      <div class="mtiles mtiles--6 ctxpick__tiles">${X.LIST.map((c) => `<a class="mtile mtile--sm" href="${href(c)}"><span class="mtile__img ph ph--product" data-ph="${esc(c.label)}"></span><span class="mtile__t">${esc(c.label)}</span><span class="mtile__s">${esc(c.scene)}</span></a>`).join('')}</div></div></section>`;
    return;
  }

  // ---------- listado etiquetado ----------
  const all = D.products.map((p) => ({ p, w: X.weight(p, ctx) })).filter((x) => x.w > 0);
  const st = { price: '', sort: 'afin', page: 1 };
  const SORTS = { afin: 'Más afín al momento', asc: 'Precio: menor a mayor', desc: 'Precio: mayor a menor', nuevo: 'Novedades' };
  const filtered = () => {
    const b = PRICES.find((x) => x.id === st.price);
    let l = all.filter((x) => !b || (x.p.p >= b.min && x.p.p < b.max));
    if (st.sort === 'afin') l = l.sort((a, c) => c.w - a.w || a.p.i - c.p.i);
    else if (st.sort === 'asc') l = l.sort((a, c) => a.p.p - c.p.p);
    else if (st.sort === 'desc') l = l.sort((a, c) => c.p.p - a.p.p);
    else l = l.sort((a, c) => (c.p.ca || '').localeCompare(a.p.ca || ''));
    return l.map((x) => x.p);
  };

  const pagerHtml = (cur, last) => {
    if (last <= 1) return '';
    const num = (n) => (n === cur ? `<span class="page current" aria-current="page">${n}</span>` : `<a class="page" href="#" data-page="${n}">${n}</a>`);
    const arr = [...new Set([1, 2, 3, last, cur - 1, cur, cur + 1].filter((n) => n >= 1 && n <= last))].sort((a, b) => a - b);
    let out = cur > 1 ? `<a class="page page--nav" href="#" data-page="${cur - 1}">« Anterior</a>` : '';
    arr.forEach((n, i) => { if (i && n - arr[i - 1] > 1) out += '<span class="page">…</span>'; out += num(n); });
    if (cur < last) out += `<a class="page page--nav" href="#" data-page="${cur + 1}">Siguiente »</a>`;
    return out;
  };

  // ---------- mini paquetes ----------
  const packs = (window.CEC_PACKS || {})[ctx.id] || [];
  const packHtml = (pk) => `<article class="cpack"><div class="cpack__thumbs">${pk.items.map((i) => `<div class="ph ph--product" data-ph="${esc(i.v)}"></div>`).join('')}</div>
    <div class="cpack__body"><p class="cpack__label">Mini paquete</p><h3 class="cpack__name">${esc(pk.name)}</h3>
    <ul class="cpack__items">${pk.items.map((i) => `<li><a href="${window.CEC.url.product(i.h)}">${esc(i.t)}</a> <span>${U.fmt(i.p)}</span></li>`).join('')}</ul>
    <div class="cpack__foot"><b>${U.fmt(pk.total)}</b><button class="btn btn--solid btn--md" type="button" data-pack="${pk.id}">Agregar la escena al carro</button></div></article>`;

  // aviso de la próxima fecha del contexto
  const o = S.occ(ctx.occ);
  const nd = o ? S.nextDate(o) : null;
  const dateNote = o ? `<aside class="cdate"><p><b>Se viene ${esc(o.name)}</b> · ${S.fmtDate(nd)} (${S.inDays(S.daysTo(nd))}). Guarda a quién se lo regalas y te avisamos con ideas.</p><a class="btn btn--outline btn--md" href="recordatorio.html?oc=${o.id}">Guardar esta fecha</a><a class="link-underline" href="suscripcion.html">Ver la suscripción</a></aside>` : '';

  const draw = () => {
    const list = filtered();
    const last = Math.max(1, Math.ceil(list.length / PER_PAGE));
    st.page = Math.min(st.page, last);
    const slice = list.slice((st.page - 1) * PER_PAGE, st.page * PER_PAGE);
    $('#cgrid').innerHTML = slice.map((p) => U.card(p)).join('');
    $('#cCount').textContent = `${list.length} ${list.length === 1 ? 'producto' : 'productos'}`;
    $('#pager').innerHTML = pagerHtml(st.page, last);
    $('#cEmpty').hidden = list.length > 0;
    document.querySelectorAll('.cfilters [data-price]').forEach((b) => { b.classList.toggle('is-on', b.dataset.price === st.price); b.setAttribute('aria-pressed', b.dataset.price === st.price); });
  };

  app.innerHTML = `<section class="cban"><div class="cban__img ph ph--product" data-ph="${esc(ctx.scene)}"></div><div class="wrapper"><div class="cban__text"><p class="seyebrow">Contexto</p><h1 class="cban__title">${esc(ctx.label)}</h1><p class="cban__scene">${esc(ctx.scene)}</p><p class="cban__tag">${esc(ctx.tagline)}</p>
    <div class="cban__btns"><a class="btn btn--solid btn--md" href="match.html?ctx=${ctx.id}">Hacer un Match de este momento</a><a class="btn btn--outline btn--md cban__alt" href="#cList">Ver todos los productos</a></div></div></div></section>
  <section class="ctxbody"><div class="wrapper">
    ${tabs(ctx)}
    ${packs.length ? `<h2 class="ch">Mini paquetes</h2><p class="sform__lead">Una escena lista: tres piezas que van juntas.</p><div class="cpacks">${packs.map(packHtml).join('')}</div>` : ''}
    ${dateNote}
    <h2 class="ch" id="cList">Todo para ${esc(ctx.label.toLowerCase())}</h2>
    <div class="cfilters"><div class="chips">${PRICES.map((b) => `<button class="mchip" type="button" data-price="${b.id}">${b.label}</button>`).join('')}</div>
      <div class="cfilters__r"><span id="cCount" aria-live="polite"></span><label class="cfilters__sort"><span>Ordenar</span><select id="cSort">${Object.entries(SORTS).map(([k, l]) => `<option value="${k}">${l}</option>`).join('')}</select></label></div></div>
    <div class="cgrid" id="cgrid"></div>
    <p class="collection__empty" id="cEmpty" hidden>No encontramos productos en ese rango. <button type="button" id="cClear">Quitar el filtro</button></p>
    <nav class="pagination" id="pager" aria-label="Paginación"></nav>
  </div></section>`;
  document.title = `${ctx.label} | Creado en Chile`;

  app.addEventListener('click', (e) => {
    const pr = e.target.closest('[data-price]');
    if (pr) { st.price = st.price === pr.dataset.price ? '' : pr.dataset.price; st.page = 1; draw(); return; }
    if (e.target.id === 'cClear') { st.price = ''; draw(); return; }
    const pg = e.target.closest('a[data-page]');
    if (pg) { e.preventDefault(); st.page = +pg.dataset.page; draw(); $('#cList').scrollIntoView({ behavior: 'smooth' }); return; }
    const pk = e.target.closest('[data-pack]');
    if (pk) {
      const pack = packs.find((x) => x.id === pk.dataset.pack);
      pack.items.forEach((i) => window.CEC.addToCart({ handle: i.h, title: i.t, price: i.p, express: !!i.x }, false));
      window.CEC.openCart();
    }
  });
  $('#cSort').addEventListener('change', (e) => { st.sort = e.target.value; st.page = 1; draw(); });
  draw();
})();
