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
  const hideOnScroll = document.body.classList.contains('hide-header-on-scroll');
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-stuck', y > 140);
    if (hideOnScroll) header.classList.toggle('is-hidden', y > 260 && y > lastY);
    lastY = y;
  };
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

  /* ---------- Carro (localStorage, solo demostración) ---------- */
  const fmt = (n) => '$' + Math.round(n).toLocaleString('en-US');
  const KEY = 'cec_cart';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
  const save = (c) => { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch { /* sin storage */ } };
  let cart = load();
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
      const t = document.createElement('a');
      t.className = 'cart__item-title';
      t.href = `product.html?p=${encodeURIComponent(it.handle || '')}`;
      t.textContent = it.title;
      const m = document.createElement('p');
      m.className = 'cart__item-meta';
      m.textContent = `${it.variant ? it.variant + ' · ' : ''}${it.qty} × ${fmt(it.price)}`;
      const rm = document.createElement('button');
      rm.className = 'cart__item-remove';
      rm.type = 'button';
      rm.textContent = 'Quitar';
      rm.addEventListener('click', () => { cart.splice(i, 1); save(cart); render(); });
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
    document.dispatchEvent(new CustomEvent('cart:change', { detail: { cart, total, count } }));
  };
  const addToCart = (item, open = true) => {
    const found = cart.find((c) => c.handle === item.handle && c.variant === item.variant);
    if (found) found.qty += item.qty || 1; else cart.push({ ...item, qty: item.qty || 1 });
    save(cart);
    render();
    if (open) setDrawer($('#cartDrawer'), true);
  };
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-quick-add]');
    if (!btn) return;
    e.preventDefault();
    addToCart({ handle: btn.dataset.handle || '', title: btn.dataset.title, price: parseInt(btn.dataset.price.replace(/[^\d]/g, ''), 10) });
  });
  render();
  window.CEC = {
    fmt, addToCart, openCart: () => setDrawer($('#cartDrawer'), true),
    getCart: () => cart, clearCart: () => { cart = []; save(cart); render(); },
    url: {
      collection: (h, extra = '') => `collection.html?c=${encodeURIComponent(h)}${extra}`,
      product: (h) => `product.html?p=${encodeURIComponent(h)}`,
    },
  };

  /* ---------- Año del footer ---------- */
  const y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
})();
