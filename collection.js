// Plantilla de colección: filtros, orden, paginación y grilla de 48.
(() => {
  const { D, esc, card, colorOf } = window.CEC_UI;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const PER_PAGE = 48;

  const SORTS_ALL = [
    ['features', 'Características'], ['relevant', 'Más relevantes'], ['best', 'Más vendidos'],
    ['az', 'Alfabéticamente, A-Z'], ['za', 'Alfabéticamente, Z-A'],
    ['pasc', 'Precio, menor a mayor'], ['pdesc', 'Precio, mayor a menor'],
    ['dasc', 'Fecha: antiguo(a) a reciente'], ['ddesc', 'Fecha: reciente a antiguo(a)'],
  ];
  // La búsqueda del original solo ordena por relevancia o precio.
  const SORTS_SEARCH = [['relevant', 'Relevancia'], ['pasc', 'Precio, menor a mayor'], ['pdesc', 'Precio, mayor a menor']];
  const MORE_AFTER = 10; // en la búsqueda, cada filtro muestra 10 opciones y "Ver más"
  const PRICES = [
    ['0-10000', 'Menos de $10.000'], ['10000-25000', '$10.000 a $25.000'], ['25000-35000', '$25.000 a $35.000'],
    ['35000-50000', '$35.000 a $50.000'], ['50000-75000', '$50.000 a $75.000'], ['75000-100000', '$75.000 a $100.000'],
    ['100000-', 'Más de $100.000'],
  ];

  const qs = new URLSearchParams(location.search);
  const query = (qs.get('q') || '').trim();
  const isSearch = location.pathname.endsWith('search.html');
  const SORTS = isSearch ? SORTS_SEARCH : SORTS_ALL;
  const handle = qs.get('c') || 'mujer';
  const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const tokens = norm(query).split(/\s+/).filter(Boolean);
  const all = isSearch
    ? D.products.filter((p) => { const hay = norm(`${p.t} ${p.v} ${p.ty || ''} ${(p.tg || []).join(' ')}`); return tokens.every((t) => hay.includes(t)); }).map((p) => p.i)
    : (D.collections[handle] || D.products.map((p) => p.i));
  const info = (D.titles || {})[handle];
  const pretty = (h) => h.replace(/-\d+$/, '').replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());
  const title = isSearch ? (query ? `Resultados para "${query}"` : 'Búsqueda') : (info ? info.t : pretty(handle));

  document.title = `${isSearch ? 'Búsqueda' : title} | Creado en Chile`;
  if (isSearch) {
    $('#colTitle').textContent = title;
    $('#spInput').value = query;
  } else {
    $('#colCrumb').textContent = title;
    $('#colTitle').textContent = title.toUpperCase();
  }

  // ---- estado (en la URL) ----
  const state = {
    sort: qs.get('sort') || (isSearch ? 'relevant' : 'best'),
    page: Math.max(1, parseInt(qs.get('page'), 10) || 1),
    f: { marca: qs.getAll('marca'), color: qs.getAll('color'), talla: qs.getAll('talla'), tipo: qs.getAll('tipo'), precio: qs.getAll('precio') },
  };
  const sync = () => {
    const u = new URLSearchParams();
    if (isSearch) u.set('q', query); else u.set('c', handle);
    if (state.sort !== (isSearch ? 'relevant' : 'best')) u.set('sort', state.sort);
    Object.entries(state.f).forEach(([k, arr]) => arr.forEach((v) => u.append(k, v)));
    if (state.page > 1) u.set('page', state.page);
    history.replaceState(null, '', `?${u}`);
  };

  const prods = all.map((i) => D.products[i]);
  const sizeOf = (p) => { const o = (p.o || []).find((x) => /talla|size/i.test(x.n)); return o ? o.v : []; };
  const uniq = (arr) => [...new Set(arr)];
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // ---- opciones de filtro disponibles ----
  const groups = [
    { key: 'marca', label: 'Marca', opts: uniq(prods.map((p) => p.v)).sort((a, b) => a.localeCompare(b, 'es')).map((v) => [v, v]) },
    { key: 'color', label: 'Color', opts: uniq(prods.flatMap(colorOf)).sort().map((v) => [v, cap(v)]) },
    { key: 'talla', label: 'Talla', opts: uniq(prods.flatMap(sizeOf)).sort((a, b) => a.localeCompare(b, 'es', { numeric: true })).map((v) => [v, v]) },
    { key: 'tipo', label: 'Tipo', opts: uniq(prods.map((p) => p.ty).filter(Boolean)).sort((a, b) => a.localeCompare(b, 'es')).map((v) => [v, v]) },
    { key: 'precio', label: 'Precio', opts: PRICES },
  ];

  const match = (p) => {
    const f = state.f;
    if (f.marca.length && !f.marca.includes(p.v)) return false;
    if (f.color.length && !colorOf(p).some((c) => f.color.includes(c))) return false;
    if (f.talla.length && !sizeOf(p).some((t) => f.talla.includes(t))) return false;
    if (f.tipo.length && !f.tipo.includes(p.ty)) return false;
    if (f.precio.length && !f.precio.some((r) => { const [a, b] = r.split('-'); return p.p >= +a && (!b || p.p < +b); })) return false;
    return true;
  };
  const sorters = {
    features: null, relevant: null, best: null,
    az: (a, b) => a.t.localeCompare(b.t, 'es'), za: (a, b) => b.t.localeCompare(a.t, 'es'),
    pasc: (a, b) => a.p - b.p, pdesc: (a, b) => b.p - a.p,
    dasc: (a, b) => a.ca.localeCompare(b.ca), ddesc: (a, b) => b.ca.localeCompare(a.ca),
  };

  // ---- render ----
  const renderSort = (root, name) => {
    root.innerHTML = SORTS.map(([v, l]) => `<li class="collection__sort-item"><label><input type="radio" name="${name}" value="${v}" ${state.sort === v ? 'checked' : ''}><span class="radio"></span>${l}</label></li>`).join('');
    $$('input', root).forEach((inp) => inp.addEventListener('change', () => { state.sort = inp.value; state.page = 1; closeSort(); update(); }));
  };
  const sortPop = $('#sortPop');
  sortPop.innerHTML = '<ul id="sortList"></ul>';
  const filtersSort = $('#filtersSort');
  filtersSort.innerHTML = '<p class="filters__label">Ordenar por</p><ul id="sortListM"></ul>';

  const moreOpen = {}; // grupos de la búsqueda con "Ver más" desplegado
  const renderFilters = () => {
    $('#filtersList').innerHTML = groups.filter((g) => g.opts.length > (isSearch ? 0 : 1) || g.key === 'precio').map((g) => {
      // en la búsqueda del original los filtros parten abiertos (en móvil, cerrados)
      const open = state.f[g.key].length > 0 || (isSearch && !mobile.matches);
      const capped = isSearch && g.key !== 'color' && g.opts.length > MORE_AFTER;
      const items = g.opts.map(([v, l], i) => `<li${capped && !moreOpen[g.key] && i >= MORE_AFTER ? ' hidden' : ''}><label class="check"><input type="checkbox" data-k="${g.key}" value="${esc(v)}" ${state.f[g.key].includes(v) ? 'checked' : ''}><span class="check__box"></span>${g.key === 'color' ? `<span class="check__dot" style="background:${window.CEC_UI.COLORS[v] || '#ccc'}"></span>` : ''}<span class="check__label">${esc(l)}</span></label></li>`).join('');
      const more = capped ? `<button class="filter__more" type="button" data-more="${g.key}">${moreOpen[g.key] ? 'Ver menos' : 'Ver más'}</button>` : '';
      return `<div class="filter ${open ? 'is-open' : ''}" data-g="${g.key}"><button class="filter__title" type="button" aria-expanded="${open}">${g.label}${state.f[g.key].length ? `<span class="filter__count">(${state.f[g.key].length})</span>` : ''}<span class="filter__icon" aria-hidden="true"></span></button><div class="filter__body"><ul class="filter__tags">${items}</ul>${more}</div></div>`;
    }).join('');
    $$('#filtersList .filter__title').forEach((b) => b.addEventListener('click', () => {
      const f = b.parentElement;
      const o = !f.classList.contains('is-open');
      f.classList.toggle('is-open', o);
      b.setAttribute('aria-expanded', String(o));
    }));
    $$('#filtersList .filter__more').forEach((b) => b.addEventListener('click', () => {
      moreOpen[b.dataset.more] = !moreOpen[b.dataset.more];
      renderFilters();
    }));
    $$('#filtersList input').forEach((inp) => inp.addEventListener('change', () => {
      const arr = state.f[inp.dataset.k];
      if (inp.checked) arr.push(inp.value); else arr.splice(arr.indexOf(inp.value), 1);
      state.page = 1;
      if (!mobile.matches) update(); else renderCount();
    }));
  };

  const filtered = () => {
    let list = prods.filter(match);
    const s = sorters[state.sort];
    if (s) list = list.slice().sort(s);
    return list;
  };
  const renderCount = () => {
    const n = filtered().length;
    $('#colCount').textContent = `${n} ${n === 1 ? 'producto' : 'productos'}`;
    $('#filterApply').textContent = `Ver ${n} ${n === 1 ? 'producto' : 'productos'}`;
  };

  const pagerHtml = (cur, last) => {
    if (last <= 1) return '';
    const num = (n) => (n === cur ? `<span class="page current" aria-current="page">${n}</span>` : `<a class="page" href="#" data-page="${n}">${n}</a>`);
    const set = new Set([1, 2, 3, last, cur - 1, cur, cur + 1].filter((n) => n >= 1 && n <= last));
    const arr = [...set].sort((a, b) => a - b);
    let out = cur > 1 ? `<a class="page page--nav" href="#" data-page="${cur - 1}">« Anterior</a>` : '';
    arr.forEach((n, i) => { if (i && n - arr[i - 1] > 1) out += '<span class="page">…</span>'; out += num(n); });
    if (cur < last) out += `<a class="page page--nav" href="#" data-page="${cur + 1}">Siguiente »</a>`;
    return out;
  };

  const renderGrid = () => {
    const list = filtered();
    const last = Math.max(1, Math.ceil(list.length / PER_PAGE));
    state.page = Math.min(state.page, last);
    const slice = list.slice((state.page - 1) * PER_PAGE, state.page * PER_PAGE);
    $('#cgrid').innerHTML = slice.map((p) => card(p)).join('');
    $('#colEmpty').hidden = list.length > 0;
    const pager = $('#pager');
    pager.innerHTML = pagerHtml(state.page, last);
    $$('a[data-page]', pager).forEach((a) => a.addEventListener('click', (e) => {
      e.preventDefault();
      state.page = +a.dataset.page;
      update();
      window.scrollTo({ top: Math.max(0, $('.collection').offsetTop - 130 + 0), behavior: 'smooth' });
    }));
  };

  const mobile = window.matchMedia('(max-width: 767px)');
  function update() { sync(); renderSort($('#sortList'), 'sort'); renderSort($('#sortListM'), 'sortm'); renderCount(); renderGrid(); }

  // ---- ordenar (popover) ----
  const sortBtn = $('#sortBtn');
  function closeSort() { sortPop.hidden = true; sortBtn.setAttribute('aria-expanded', 'false'); }
  sortBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = sortPop.hidden;
    sortPop.hidden = !open;
    sortBtn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', (e) => { if (!$('#sortWrap').contains(e.target)) closeSort(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeSort(); closeFilters(); } });

  // ---- filtros en móvil/tablet (drawer) ----
  const aside = $('#filters');
  const scrim = $('#scrim');
  const openFilters = () => { aside.classList.add('is-open'); scrim.hidden = false; document.body.style.overflow = 'hidden'; };
  function closeFilters() { aside.classList.remove('is-open'); if (!document.querySelector('.drawer.is-open')) { scrim.hidden = true; document.body.style.overflow = ''; } }
  $('#filterOpen').addEventListener('click', openFilters);
  $('#filterClose').addEventListener('click', closeFilters);
  scrim.addEventListener('click', closeFilters);
  $('#filterApply').addEventListener('click', () => { update(); closeFilters(); });
  const clearAll = () => { Object.keys(state.f).forEach((k) => { state.f[k] = []; }); state.page = 1; renderFilters(); update(); };
  $('#filterClear').addEventListener('click', clearAll);
  $('#emptyClear').addEventListener('click', clearAll);

  renderFilters();
  update();
})();
