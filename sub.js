// Suscripción (demostración): perfil local, fechas del calendario y regalos sugeridos. No envía datos ni cobra.
// Precios y condiciones son de ejemplo para la práctica; la propuesta original los deja "a definir".
(() => {
  const KEY = 'cec_sub';
  const fmt = (n) => '$' + Math.round(n).toLocaleString('en-US');
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const PLAN = { name: 'Plan anual', price: 29990, dates: 4, changes: 1 };
  const RANGES = [
    { id: 'r1', min: 15000, max: 25000, label: '$15.000 a $25.000' },
    { id: 'r2', min: 25000, max: 40000, label: '$25.000 a $40.000' },
    { id: 'r3', min: 40000, max: 60000, label: '$40.000 a $60.000' },
  ];
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
  const blank = () => ({ user: null, people: [], reminders: [], reservation: null, plan: null });
  const load = () => { try { return { ...blank(), ...(JSON.parse(localStorage.getItem(KEY)) || {}) }; } catch { return blank(); } };
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

  window.CEC_SUB = {
    PLAN, RANGES, RELS, TASTES, OCCASIONS, fmt, esc, load, save, uid, personOf, occ, info, upcoming, nextDate, daysTo, fmtDate, fmtShort, inDays,
    suggest, product, giftCard, tasteChips, readChecks, occOptions, tasteLabels,
  };
})();
