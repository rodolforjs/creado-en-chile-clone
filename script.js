// Creado en Chile — réplica de práctica (inicio). JS sin dependencias.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = {
    get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch { /* sin storage */ } },
  };

  /* ---------- Header compacto al hacer scroll ---------- */
  const header = $('#siteHeader');
  const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > 140);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Drawers (menú móvil y carro) + scrim ---------- */
  const scrim = $('#scrim');
  let openDrawer = null;
  const setDrawer = (drawer, open) => {
    if (!drawer) return;
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    scrim.hidden = !open && !searchOpen();
    document.body.style.overflow = open ? 'hidden' : '';
    openDrawer = open ? drawer : null;
  };
  $$('[data-drawer-open]').forEach((btn) =>
    btn.addEventListener('click', () => { closeSearch(); setDrawer(document.getElementById(btn.dataset.drawerOpen), true); }));
  $$('[data-drawer-close]').forEach((btn) =>
    btn.addEventListener('click', () => setDrawer(btn.closest('.drawer'), false)));

  /* ---------- Búsqueda ---------- */
  const searchPop = $('#searchPop');
  const searchBtn = $('#searchToggle');
  const searchOpen = () => !searchPop.hidden;
  function closeSearch() {
    if (searchPop.hidden) return;
    searchPop.hidden = true;
    searchBtn.setAttribute('aria-expanded', 'false');
    if (!openDrawer) scrim.hidden = true;
  }
  searchBtn.addEventListener('click', () => {
    if (searchOpen()) return closeSearch();
    searchPop.hidden = false;
    searchBtn.setAttribute('aria-expanded', 'true');
    scrim.hidden = false;
    $('#searchInput').focus();
  });
  $('#searchClose').addEventListener('click', closeSearch);
  scrim.addEventListener('click', () => { setDrawer(openDrawer, false); closeSearch(); });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    setDrawer(openDrawer, false);
    closeSearch();
    closePopup();
    closeLang();
  });

  /* ---------- Acordeón del menú móvil ---------- */
  $$('.mnav__toggle').forEach((btn) => btn.addEventListener('click', () => {
    const item = btn.closest('.mnav__item');
    const open = !item.classList.contains('is-open');
    item.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
  }));

  /* ---------- Hero: slider con puntos y autoplay ---------- */
  const track = $('#heroTrack');
  const dots = $$('#heroDots .dot');
  let slide = 0;
  let timer;
  const go = (i) => {
    slide = (i + dots.length) % dots.length;
    track.style.transform = `translateX(${-slide * 100}%)`;
    dots.forEach((d, n) => {
      d.classList.toggle('is-selected', n === slide);
      d.setAttribute('aria-selected', String(n === slide));
    });
  };
  const play = () => { clearInterval(timer); timer = setInterval(() => go(slide + 1), 6000); };
  dots.forEach((d, n) => d.addEventListener('click', () => { go(n); play(); }));
  let startX = null;
  const hero = $('.hero');
  hero.addEventListener('pointerdown', (e) => { startX = e.clientX; });
  hero.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 50) { go(slide + (dx < 0 ? 1 : -1)); play(); }
  });
  hero.addEventListener('mouseenter', () => clearInterval(timer));
  hero.addEventListener('mouseleave', play);
  go(0);
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) play();

  /* ---------- Marcas: flechas del carrusel ---------- */
  const vp = $('#brandsViewport');
  const prev = $('.brands__arrow--prev');
  const next = $('.brands__arrow--next');
  const step = () => vp.clientWidth * 0.7;
  const syncArrows = () => {
    prev.disabled = vp.scrollLeft <= 4;
    next.disabled = vp.scrollLeft + vp.clientWidth >= vp.scrollWidth - 4;
  };
  prev.addEventListener('click', () => vp.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => vp.scrollBy({ left: step(), behavior: 'smooth' }));
  vp.addEventListener('scroll', syncArrows, { passive: true });
  window.addEventListener('resize', syncArrows);
  syncArrows();

  /* ---------- Footer móvil: acordeones ---------- */
  $$('.footer-title__button').forEach((btn) => btn.addEventListener('click', () => {
    if (!window.matchMedia('(max-width: 767px)').matches) return;
    btn.closest('.footer-block').classList.toggle('is-open');
  }));

  /* ---------- Idioma ---------- */
  const lang = $('#lang');
  const langBtn = $('.lang__toggle', lang);
  const langList = $('.lang__list', lang);
  function closeLang() { langList.hidden = true; langBtn.setAttribute('aria-expanded', 'false'); }
  langBtn.addEventListener('click', () => {
    const open = langList.hidden;
    langList.hidden = !open;
    langBtn.setAttribute('aria-expanded', String(open));
  });
  $$('li', langList).forEach((li) => li.addEventListener('click', () => {
    $$('li', langList).forEach((o) => o.setAttribute('aria-selected', String(o === li)));
    $('span', langBtn).textContent = li.textContent;
    closeLang();
  }));
  document.addEventListener('click', (e) => { if (!lang.contains(e.target)) closeLang(); });

  /* ---------- Newsletter (solo front: no envía datos) ---------- */
  $$('[data-newsletter]').forEach((form) => form.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = $('.form-msg', form);
    const email = form.elements.email.value.trim();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    msg.textContent = ok ? '¡Gracias por suscribirte!' : 'Ingresa un correo válido.';
    if (ok) {
      form.reset();
      if (form.closest('#popup')) setTimeout(closePopup, 1200);
    }
  }));

  /* ---------- Popup 10% (una vez por sesión) ---------- */
  const popup = $('#popup');
  function closePopup() { if (!popup.hidden) { popup.hidden = true; store.set('cec_popup', '1'); } }
  if (!store.get('cec_popup')) setTimeout(() => { popup.hidden = false; }, 2500);
  $('#popupClose').addEventListener('click', closePopup);
  $('#popupNo').addEventListener('click', closePopup);
  popup.addEventListener('click', (e) => { if (e.target === popup) closePopup(); });

  /* ---------- Carro (en memoria, solo demostración) ---------- */
  const cart = [];
  const fmt = (n) => '$' + n.toLocaleString('es-CL');
  const render = () => {
    const list = $('#cartList');
    list.innerHTML = '';
    let total = 0;
    let count = 0;
    cart.forEach((it, i) => {
      total += it.price * it.qty;
      count += it.qty;
      const li = document.createElement('li');
      const left = document.createElement('div');
      const t = document.createElement('p');
      t.className = 'cart__item-title';
      t.textContent = it.title;
      const m = document.createElement('p');
      m.className = 'cart__item-meta';
      m.textContent = `${it.qty} × ${fmt(it.price)}`;
      const rm = document.createElement('button');
      rm.className = 'cart__item-remove';
      rm.type = 'button';
      rm.textContent = 'Quitar';
      rm.addEventListener('click', () => { cart.splice(i, 1); render(); });
      left.append(t, m, rm);
      li.append(left);
      list.append(li);
    });
    $('#cartEmpty').hidden = cart.length > 0;
    $('#cartFooter').hidden = cart.length === 0;
    $('#cartTotal').textContent = fmt(total);
    const badge = $('#cartCount');
    badge.hidden = count === 0;
    badge.textContent = count;
  };
  $$('[data-quick-add]').forEach((btn) => btn.addEventListener('click', () => {
    const price = parseInt(btn.dataset.price.replace(/[^\d]/g, ''), 10);
    const found = cart.find((c) => c.title === btn.dataset.title);
    if (found) found.qty += 1; else cart.push({ title: btn.dataset.title, price, qty: 1 });
    render();
    setDrawer($('#cartDrawer'), true);
  }));
  render();

  /* ---------- Año del footer ---------- */
  const y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
})();
