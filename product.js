// Ficha de producto: galería, variantes, cantidad, añadir al carrito y relacionados.
(() => {
  const { D, esc, fmt, card, byHandle, expressSet } = window.CEC_UI;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const handle = new URLSearchParams(location.search).get('p');
  const p = byHandle[handle];
  const root = $('#pdp');

  if (!p) {
    root.innerHTML = '<div class="wrapper"><p class="notfound">No encontramos este producto. <a href="index.html">Volver al inicio</a></p></div>';
    $('#related').hidden = true;
    return;
  }
  document.title = `${p.t} | Creado en Chile`;

  // vistos recientemente
  const VKEY = 'cec_viewed';
  let viewed = [];
  try { viewed = JSON.parse(localStorage.getItem(VKEY)) || []; } catch { viewed = []; }
  const seen = viewed.filter((h) => h !== handle);
  try { localStorage.setItem(VKEY, JSON.stringify([handle, ...seen].slice(0, 12))); } catch { /* sin storage */ }

  // texto básico
  const v = $('#pdpVendor');
  v.textContent = p.v;
  v.href = `search.html?q=${encodeURIComponent(p.v)}`;
  $('#pdpTitle').textContent = p.t;
  const off = p.cp && p.cp > p.p ? Math.round((1 - p.p / p.cp) * 100) : 0;
  $('#pdpPrice').innerHTML = `<span class="pdp__price-now">${fmt(p.p)}</span>${off ? ` <s>${fmt(p.cp)}</s> <span class="badge badge--sale">${off}%</span>` : ''}`;
  const express = expressSet.has(p.i);
  $('#pdpExpress').hidden = !express;

  // descripción (texto completo de data/descriptions.js; si falta, cae al extracto del catálogo)
  const full = (window.CEC_DESC || {})[p.h];
  if (full) {
    $('#pdpDesc').innerHTML = full;
  } else {
    let desc = p.d || '';
    if (desc.length >= 235 && desc.lastIndexOf('.') > 60) desc = desc.slice(0, desc.lastIndexOf('.') + 1);
    const paras = desc.split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚ])/).reduce((acc, s) => {
      const last = acc[acc.length - 1];
      if (last && last.length < 90) acc[acc.length - 1] = `${last} ${s}`; else acc.push(s);
      return acc;
    }, []);
    $('#pdpDesc').innerHTML = paras.map((t) => `<p>${esc(t)}</p>`).join('');
  }

  // galería (placeholders 630×945)
  const n = Math.max(1, Math.min(p.im || 1, 15));
  const track = $('#pdpTrack');
  const thumbs = $('#pdpThumbs');
  for (let i = 0; i < n; i++) {
    track.insertAdjacentHTML('beforeend', `<div class="pdp__slide" aria-label="Imagen ${i + 1} de ${n}"><div class="ph ph--product" data-ph="Imagen ${i + 1} · 630×945"></div></div>`);
    thumbs.insertAdjacentHTML('beforeend', `<button class="pdp__thumb${i ? '' : ' is-selected'}" type="button" aria-label="Ver imagen ${i + 1}"><div class="ph ph--product" data-ph="${i + 1}"></div></button>`);
  }
  let cur = 0;
  const go = (i) => {
    cur = (i + n) % n;
    track.style.transform = `translateX(${-cur * 100}%)`;
    $$('.pdp__thumb', thumbs).forEach((t, k) => t.classList.toggle('is-selected', k === cur));
    const t = $$('.pdp__thumb', thumbs)[cur];
    if (t) thumbs.scrollTo({ left: t.offsetLeft - 20, behavior: 'smooth' });
  };
  $$('.pdp__thumb', thumbs).forEach((t, i) => t.addEventListener('click', () => go(i)));
  const arrows = $$('.pdp__arrow');
  if (n < 2) arrows.forEach((a) => { a.hidden = true; });
  $('#pdpPrev').addEventListener('click', () => go(cur - 1));
  $('#pdpNext').addEventListener('click', () => go(cur + 1));
  let x0 = null;
  const main = $('#pdpMain');
  main.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
  main.addEventListener('pointerup', (e) => { if (x0 === null) return; const d = e.clientX - x0; x0 = null; if (Math.abs(d) > 40) go(cur + (d < 0 ? 1 : -1)); });

  // variantes (color)
  let variant = '';
  const opt = (p.o || []).find((o) => o.v.length > 1);
  if (opt) {
    variant = opt.v[0];
    $('#pdpOpt').hidden = false;
    $('#pdpOpt legend').textContent = opt.n;
    $('#pdpSwatches').innerHTML = opt.v.map((val, i) => `<label class="swatch"><input type="radio" name="opt" value="${esc(val)}" ${i ? '' : 'checked'}><span class="swatch__pill" title="${esc(val)}"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.4l3.2 3.1L13 4.8" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="visually-hidden">${esc(val)}</span></label>`).join('');
    $$('#pdpSwatches input').forEach((i) => i.addEventListener('change', () => { variant = i.value; }));
  }

  // cantidad, tienda y carro
  const qty = $('#pdpQty');
  const setBtn = () => { $('#pdpAddPrice').textContent = fmt(p.p * (+qty.value || 1)); };
  qty.addEventListener('change', setBtn);
  setBtn();
  $('#storeBtn').addEventListener('click', (e) => {
    const open = $('#storePanel').hidden;
    $('#storePanel').hidden = !open;
    e.currentTarget.setAttribute('aria-expanded', String(open));
  });
  $('#pdpForm').addEventListener('submit', (e) => {
    e.preventDefault();
    window.CEC.addToCart({ handle: p.h, title: p.t, price: p.p, variant, qty: +qty.value || 1, express });
  });

  // relacionados
  const score = (q) => (q.v === p.v ? 3 : 0) + (q.ty && q.ty === p.ty ? 2 : 0) + (q.tg || []).filter((t) => (p.tg || []).includes(t)).length;
  const like = D.products.filter((q) => q.h !== p.h).map((q) => [score(q), q]).filter(([s]) => s > 0).sort((a, b) => b[0] - a[0] || a[1].p - b[1].p).slice(0, 4).map(([, q]) => q);
  const grid = $('#relatedGrid');
  const show = (tab) => {
    const list = tab === 'like' ? like : seen.map((h) => byHandle[h]).filter(Boolean).slice(0, 4);
    grid.innerHTML = list.length ? list.map((q) => card(q, { swatches: false })).join('') : `<p class="related__empty">${tab === 'like' ? 'No hay productos relacionados.' : 'Aún no has visto otros productos.'}</p>`;
  };
  $$('.tab').forEach((t) => t.addEventListener('click', () => {
    $$('.tab').forEach((o) => { const on = o === t; o.classList.toggle('is-active', on); o.setAttribute('aria-selected', String(on)); });
    show(t.dataset.tab);
  }));
  show('like');
})();
