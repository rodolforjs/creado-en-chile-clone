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
  // Mi Creado: al entrar, vuelve a la página donde estaba
  const acct = $('#accountLink');
  if (acct) acct.addEventListener('click', () => { try { sessionStorage.setItem('cec_return', location.pathname.split('/').pop() + location.search); } catch { /* sin storage */ } });
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
  const FREE_SHIPPING = 60000;
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
  const save = (c) => { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch { /* sin storage */ } };
  let cart = load();
  const stepper = (qty, onChange) => {
    const w = document.createElement('div');
    w.className = 'qty qty--sm';
    w.innerHTML = '<button type="button" aria-label="Menos">−</button><input type="text" inputmode="numeric" readonly aria-label="Cantidad"><button type="button" aria-label="Más">+</button>';
    $('input', w).value = qty;
    const [minus, plus] = $$('button', w);
    minus.addEventListener('click', () => onChange(qty - 1));
    plus.addEventListener('click', () => onChange(qty + 1));
    return w;
  };
  const setQty = (i, q) => { if (q < 1) cart.splice(i, 1); else cart[i].qty = q; save(cart); render(); };
  const totals = () => cart.reduce((t, it) => ({ total: t.total + it.price * it.qty, count: t.count + it.qty }), { total: 0, count: 0 });
  const render = () => {
    const list = $('#cartList');
    list.innerHTML = '';
    const { total, count } = totals();
    cart.forEach((it, i) => {
      const li = document.createElement('li');
      li.className = 'cartd__item';
      const img = document.createElement('div');
      img.className = 'ph ph--product cartd__img';
      img.dataset.ph = '100×100';
      img.dataset.img = it.handle || '';
      img.dataset.imgW = '200';
      const info = document.createElement('div');
      info.className = 'cartd__info';
      const row = document.createElement('div');
      row.className = 'cartd__row';
      const t = document.createElement('a');
      t.className = 'cartd__name';
      t.href = it.handle === 'gift-wrapping' ? '#' : `product.html?p=${encodeURIComponent(it.handle || '')}`;
      t.textContent = it.title;
      const pr = document.createElement('span');
      pr.className = 'cartd__price';
      pr.textContent = fmt(it.price * it.qty);
      row.append(t, pr);
      info.append(row);
      if (it.variant) { const v = document.createElement('p'); v.className = 'cartd__variant'; v.textContent = `Color: ${it.variant}`; info.append(v); }
      const act = document.createElement('div');
      act.className = 'cartd__actions';
      const rm = document.createElement('button');
      rm.type = 'button';
      rm.className = 'cartd__remove';
      rm.textContent = 'Eliminar';
      rm.addEventListener('click', () => setQty(i, 0));
      act.append(stepper(it.qty, (q) => setQty(i, q)), rm);
      info.append(act);
      li.append(img, info);
      list.append(li);
    });
    const empty = cart.length === 0;
    $('#cartEmpty').hidden = !empty;
    $('#cartFooter').hidden = empty;
    $('#cartShip').hidden = empty;
    $('#cartMsg').hidden = !cart.some((c) => c.handle === 'gift-wrapping');
    $('#cartExpress').hidden = empty || !cart.every((c) => c.express);
    const left = Math.max(0, FREE_SHIPPING - total);
    $('#cartShipText').textContent = left > 0 ? `Te falta ${fmt(left)} para envío gratis` : '¡Tu pedido tiene envío gratis!';
    $('#cartShipBar').style.width = `${Math.min(100, (total / FREE_SHIPPING) * 100)}%`;
    $('#cartDrawerCount').textContent = count ? `(${count} ${count === 1 ? 'producto' : 'productos'})` : '';
    $('#cartTotal').textContent = fmt(total);
    const badge = $('#cartCount');
    badge.hidden = count === 0;
    badge.textContent = count;
    document.dispatchEvent(new CustomEvent('cart:change', { detail: { cart, total, count } }));
  };
  const addToCart = (item, open = true) => {
    const found = cart.find((c) => c.handle === item.handle && (c.variant || '') === (item.variant || ''));
    if (found) found.qty += item.qty || 1; else cart.push({ ...item, qty: item.qty || 1 });
    save(cart);
    render();
    if (open) setDrawer($('#cartDrawer'), true);
  };
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-quick-add]');
    if (!btn) return;
    e.preventDefault();
    addToCart({ handle: btn.dataset.handle || '', title: btn.dataset.title, price: parseInt(btn.dataset.price.replace(/[^\d]/g, ''), 10), express: btn.dataset.express === '1' });
  });
  // bolsa de regalo y condiciones
  const giftQty = $('#giftQty');
  $$('[data-gift]').forEach((b) => b.addEventListener('click', () => { giftQty.value = Math.max(0, (+giftQty.value || 0) + (+b.dataset.gift)); }));
  $('#giftAdd').addEventListener('click', () => {
    const q = +giftQty.value || 0;
    if (!q) return;
    addToCart({ handle: 'gift-wrapping', title: 'Para Regalo', price: 1000, express: true, qty: q }, false);
    giftQty.value = 0;
  });
  const terms = $('#cartTerms');
  const checkout = $('#cartCheckout');
  checkout.href = 'pedido.html';
  terms.addEventListener('change', () => { checkout.classList.toggle('is-disabled', !terms.checked); checkout.setAttribute('aria-disabled', String(!terms.checked)); });
  checkout.addEventListener('click', (e) => { if (!terms.checked) e.preventDefault(); });
  render();
  window.CEC = {
    fmt, addToCart, openCart: () => setDrawer($('#cartDrawer'), true),
    getCart: () => cart, setQty, totals, FREE_SHIPPING,
    clearCart: () => { cart = []; save(cart); render(); },
    url: {
      collection: (h, extra = '') => `collection.html?c=${encodeURIComponent(h)}${extra}`,
      product: (h) => `product.html?p=${encodeURIComponent(h)}`,
    },
  };

  /* ---------- Match: botón flotante sobre WhatsApp ---------- */
  if (!document.querySelector('.page-match')) {
    const mf = document.createElement('a');
    mf.className = 'match-float';
    mf.href = 'match.html';
    mf.setAttribute('aria-label', 'Match: encuentra un regalo');
    mf.innerHTML = '<span aria-hidden="true">♥</span> Match';
    document.body.appendChild(mf);
  }

  /* ---------- Año del footer ---------- */
  const y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
})();
