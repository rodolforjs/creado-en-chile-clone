// Suscripción (demostración): perfil local, fechas del calendario y regalos sugeridos. No envía datos ni cobra.
// Precios y condiciones son de ejemplo para la práctica; la propuesta original los deja "a definir".
(() => {
  const KEY = 'cec_sub';
  const fmt = (n) => '$' + Math.round(n).toLocaleString('en-US');
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // Plan prepago: se pagan por adelantado los regalos del año. `value` es lo que vale cada regalo; el usuario elige entre `options` opciones del rango.
  const PLAN = { name: 'Plan anual prepago', dates: 4, changes: 1, options: 6 };
  const RANGES = [
    { id: 'r1', min: 15000, max: 25000, value: 20000, label: '$15.000 a $25.000' },
    { id: 'r2', min: 25000, max: 40000, value: 30000, label: '$25.000 a $40.000' },
    { id: 'r3', min: 40000, max: 60000, value: 50000, label: '$40.000 a $60.000' },
  ];
  // Lo que se paga hoy: el valor de cada regalo del año. El servicio (avisos, curaduría, envío, bolsa) va incluido.
  const SHIP = 4990; // despacho de ejemplo que el plan ahorra en cada fecha
  const rangeOf = (id) => RANGES.find((r) => r.id === id) || RANGES[1];
  const cost = (rangeIds) => ({ n: rangeIds.length, total: rangeIds.reduce((a, id) => a + rangeOf(id).value, 0), ship: SHIP * rangeIds.length });
  const RELS = ['Mamá', 'Papá', 'Pareja', 'Hijo/a', 'Abuelo/a', 'Amigo/a', 'Hermano/a', 'Colega', 'Otra persona'];
  const TASTES = [
    { id: 'gourmet', label: 'Gourmet', re: /gourmet|manjar|miel|merqu|infusi|snack|dulce|salado|aperitivo/i },
    { id: 'casa', label: 'Casa y deco', re: /casa y jard|deco|iluminaci|velas?\b|aroma|room spray|textil casa/i },
    { id: 'mesa', label: 'Mesa y cocina', re: /mesa|cocina|cer[aá]mica|taza|vaso|plato|posavaso|bar\b/i },
    { id: 'joyas', label: 'Joyas y accesorios', re: /joyas|collar|aros|pulsera|anillo|pa[nñ]uelo|bufanda|bolso|billetera/i },
    { id: 'libros', label: 'Libros y papelería', re: /libro|papeler|escritorio|cuaderno/i },
    { id: 'belleza', label: 'Belleza y bienestar', re: /belleza|jab[oó]n|facial|bienestar|perfume/i },
    { id: 'ropa', label: 'Ropa y calzado', re: /vestuario|poncho|calcet|polera|pantufla|ruana|ropa/i },
    { id: 'infantil', label: 'Infantil', re: /infantil|juguet|beb[eé]/i },
  ];

  // Fechas del calendario (Chile). m: mes 1-12. Fijas con d, o enésimo día de semana (wd 0=domingo, nth).
  const OCCASIONS = [
    { id: 'sanvalentin', name: 'San Valentín', m: 2, d: 14, blurb: 'Para quien te acompaña.' },
    { id: 'madre', name: 'Día de la Madre', m: 5, wd: 0, nth: 2, blurb: 'Segundo domingo de mayo.' },
    { id: 'padre', name: 'Día del Padre', m: 6, wd: 0, nth: 3, blurb: 'Tercer domingo de junio.' },
    { id: 'abuelos', name: 'Día de los Abuelos', m: 7, d: 26, blurb: 'Un detalle para los que más cuentan historias.' },
    { id: 'nino', name: 'Día del Niño', m: 8, wd: 0, nth: 2, blurb: 'Segundo domingo de agosto.' },
    { id: 'patrias', name: 'Fiestas Patrias', m: 9, d: 18, blurb: 'Para celebrar lo nuestro.' },
    { id: 'navidad', name: 'Navidad', m: 12, d: 25, blurb: 'La fecha con más regalos.' },
  ];

  const dayMs = 86400000;
  const today = () => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate()); };
  const occDate = (o, y) => {
    if (o.d) return new Date(y, o.m - 1, o.d);
    const first = new Date(y, o.m - 1, 1);
    const shift = (o.wd - first.getDay() + 7) % 7;
    return new Date(y, o.m - 1, 1 + shift + (o.nth - 1) * 7);
  };
  const nextDate = (o, from = today()) => {
    let d = occDate(o, from.getFullYear());
    if (d < from) d = occDate(o, from.getFullYear() + 1);
    return d;
  };
  const daysTo = (d, from = today()) => Math.round((d - from) / dayMs);
  const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const fmtDate = (d) => `${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
  const fmtShort = (d) => `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
  const inDays = (n) => (n === 0 ? 'hoy' : n === 1 ? 'mañana' : `en ${n} días`);
  const occ = (id) => OCCASIONS.find((o) => o.id === id);
  // Nombre y próxima fecha de un recordatorio o fecha del plan (del calendario o personalizada)
  const info = (r) => {
    const o = r.custom ? { id: r.id, name: r.custom.label, m: r.custom.m, d: r.custom.d } : occ(r.occId);
    return { name: o.name, date: nextDate(o) };
  };
  const upcoming = () => OCCASIONS.map((o) => ({ ...o, date: nextDate(o) })).sort((a, b) => a.date - b.date);

  // ---- almacenamiento ----
  const blank = () => ({
    user: null, people: [], reminders: [], reservation: null, plan: null,
    saved: [], matches: [], orders: [], addresses: [], profile: { lang: 'es', notify: { email: true, wa: false, news: true } },
  });
  const load = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY)) || {};
      const b = blank();
      return { ...b, ...raw, profile: { ...b.profile, ...(raw.profile || {}), notify: { ...b.profile.notify, ...((raw.profile || {}).notify || {}) } } };
    } catch { return blank(); }
  };
  const save = (s) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* sin storage */ } };
  const uid = (p) => `${p}${Date.now().toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`;
  const personOf = (s, id) => s.people.find((p) => p.id === id);

  // ---- regalos sugeridos (desde el catálogo, sin repetir) ----
  const hash = (str) => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rng = (seed) => { let a = hash(seed); return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const suggest = ({ tastes = [], range, seed = 'x', n = 3, exclude = [] }) => {
    const D = window.CEC_DATA;
    if (!D) return [];
    const r = RANGES.find((x) => x.id === range) || RANGES[1];
    const res = tastes.map((id) => (TASTES.find((t) => t.id === id) || {}).re).filter(Boolean);
    const inRange = D.products.filter((p) => p.p >= r.min && p.p < r.max && !exclude.includes(p.h));
    const hay = (p) => `${p.t} ${p.ty || ''} ${(p.tg || []).join(' ')}`;
    const rand = rng(seed);
    const shuffle = (a) => a.map((x) => [rand(), x]).sort((x, y) => x[0] - y[0]).map((x) => x[1]);
    const match = res.length ? inRange.filter((p) => res.some((re) => re.test(hay(p)))) : [];
    const out = shuffle(match).slice(0, n);
    if (out.length < n) out.push(...shuffle(inRange.filter((p) => !out.includes(p))).slice(0, n - out.length));
    return out;
  };
  const product = (h) => (window.CEC_DATA ? window.CEC_DATA.products.find((p) => p.h === h) : null);
  const tasteLabels = (ids) => ids.map((id) => (TASTES.find((t) => t.id === id) || {}).label).filter(Boolean).join(', ');

  // Mini tarjeta de regalo con placeholder (misma proporción que las tarjetas de producto)
  // `link: false` para tarjetas que se eligen (dentro de un label): sin enlace al producto
  const giftCard = (p, extra = '', link = true) => {
    const href = window.CEC.url.product(p.h);
    const media = `<div class="ph ph--product" data-ph="${esc(p.v)}"></div>`;
    return `<article class="sgift">${link ? `<a class="sgift__media" href="${href}" aria-label="${esc(p.t)}">${media}</a>` : `<span class="sgift__media">${media}</span>`}<div class="sgift__info">${link ? `<a class="sgift__title" href="${href}">${esc(p.t)}</a>` : `<span class="sgift__title">${esc(p.t)}</span>`}<p class="sgift__price">${fmt(p.p)}</p>${extra}</div></article>`;
  };

  // Chips de gustos (checkbox): devuelve HTML y lee la selección
  const tasteChips = (name, sel = []) => TASTES.map((t) => `<label class="chip"><input type="checkbox" name="${name}" value="${t.id}" ${sel.includes(t.id) ? 'checked' : ''}><span>${t.label}</span></label>`).join('');
  const readChecks = (root, name) => [...root.querySelectorAll(`input[name="${name}"]:checked`)].map((i) => i.value);
  const occOptions = (selected) => upcoming().map((o) => `<option value="${o.id}" ${selected === o.id ? 'selected' : ''}>${o.name} · ${fmtShort(o.date)}</option>`).join('');


  // ---- cuenta (demostración): Google, shop o correo con código, en una sola pantalla ----
  const nameFromEmail = (e) => e.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
  const GSVG = '<svg viewBox="0 0 18 18" aria-hidden="true"><path fill="#4285F4" d="M17.6 9.2c0-.6-.1-1.2-.2-1.8H9v3.4h4.8a4.1 4.1 0 0 1-1.8 2.7v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.5z"/><path fill="#34A853" d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H.9v2.3A9 9 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.9 10.7a5.4 5.4 0 0 1 0-3.4V5H.9a9 9 0 0 0 0 8z"/><path fill="#EA4335" d="M9 3.6c1.3 0 2.5.5 3.5 1.4l2.6-2.600A9 9 0 0 0 .9 5l3 2.300C4.600 5.200 6.600 3.600 9 3.600z"/></svg>';
  const setUser = (user) => { const s = load(); s.user = user; save(s); return s; };
  const logout = () => { const s = load(); s.user = null; save(s); };
  // Pinta las opciones de acceso en `root`. `hint` = correo ya conocido (ej. el del pedido). Llama onLogin(user).
  const loginBox = (root, onLogin, { hint = '', lead = '' } = {}) => {
    root.innerHTML = `${lead ? `<p class="sform__acct">${lead}</p>` : ''}
      <button class="gbtn" type="button" data-m="google">${GSVG}Continuar con Google (demo)</button>
      <button class="gbtn gbtn--alt" type="button" data-m="shop"><b class="shopmark">shop</b>Continuar con shop (demo)</button>
      <p class="sform__or">o con tu correo</p>
      <div class="lcode">
        <label class="sfield"><span>Correo</span><input type="email" data-email autocomplete="off" value="${esc(hint)}"></label>
        <button class="btn btn--outline btn--md" type="button" data-m="send">Enviarme un código</button>
        <div class="lcode__step" hidden>
          <p class="sform__fine">Demostración: el código llegaría a tu correo. Usa <b>123456</b>.</p>
          <label class="sfield"><span>Código</span><input type="text" inputmode="numeric" maxlength="6" data-code autocomplete="off"></label>
          <button class="btn btn--solid btn--md" type="button" data-m="verify">Entrar</button>
        </div>
        <p class="sform__msg" role="alert"></p>
      </div>`;
    const msg = root.querySelector('.sform__msg');
    const emailEl = root.querySelector('[data-email]');
    const fin = (u) => { setUser(u); onLogin(u); };
    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-m]');
      if (!b) return;
      const m = b.dataset.m;
      if (m === 'google') fin({ name: 'Cuenta de demostración', email: 'demo@ejemplo.cl', method: 'google' });
      else if (m === 'shop') fin({ name: 'Cuenta de demostración', email: 'demo@ejemplo.cl', method: 'shop' });
      else if (m === 'send') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim())) { msg.textContent = 'Ingresa un correo válido.'; return; }
        msg.textContent = '';
        root.querySelector('.lcode__step').hidden = false;
        root.querySelector('[data-code]').focus();
      } else if (m === 'verify') {
        if (root.querySelector('[data-code]').value.trim() !== '123456') { msg.textContent = 'Código incorrecto. En la demostración es 123456.'; return; }
        const em = emailEl.value.trim();
        fin({ name: nameFromEmail(em), email: em, method: 'code' });
      }
    });
  };

  // Barra de navegación de Mi Creado (la usan mi-creado.html y mi-suscripcion.html)
  const NAV = [
    ['inicio', 'Inicio', 'mi-creado.html'], ['personas', 'Personas y gustos', 'mi-creado.html?s=personas'], ['fechas', 'Fechas', 'mi-creado.html?s=fechas'],
    ['guardados', 'Guardados', 'mi-creado.html?s=guardados'], ['suscripcion', 'Mi suscripción', 'mi-suscripcion.html'],
    ['pedidos', 'Pedidos', 'mi-creado.html?s=pedidos'], ['direcciones', 'Direcciones', 'mi-creado.html?s=direcciones'], ['perfil', 'Perfil', 'mi-creado.html?s=perfil'],
  ];
  const accountNav = (active) => `<nav class="anav" aria-label="Mi Creado">${NAV.map(([k, l, h]) => `<a href="${h}" class="${k === active ? 'is-on' : ''}" ${k === active ? 'aria-current="page"' : ''}>${l}</a>`).join('')}</nav>`;

  window.CEC_SUB = {
    PLAN, SHIP, cost, rangeOf, RANGES, RELS, TASTES, OCCASIONS, fmt, esc, load, save, uid, personOf, occ, info, upcoming, nextDate, daysTo, fmtDate, fmtShort, inDays,
    suggest, product, giftCard, setUser, logout, loginBox, accountNav, nameFromEmail, tasteChips, readChecks, occOptions, tasteLabels,
  };
})();
