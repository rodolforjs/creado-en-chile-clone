// Match (demostración): mazo de cartas que aprende de cada reacción y cierra en Mis Match (máx. 8).
// Los pesos y las etiquetas son de ejemplo: la propuesta deja "a definir" los pesos de partida.
(() => {
  const S = window.CEC_SUB;
  const U = window.CEC_UI;
  const D = U.D;
  const esc = S.esc;
  const $ = (s, r = document) => r.querySelector(s);
  const app = $('#subApp');
  const I = window.CEC_I18N;
  const DECK = 10; // cartas por Match
  const LIKE_MAX = 6; // me gusta que caben en la lista
  const LIST = 8; // opciones en Mis Match: tus me gusta + parecidas
  const DRAFT = 'cec_match_draft';

  // Momentos (contextos): vienen de ctx-data.js, los mismos de las pestañas
  const CONTEXTS = window.CEC_CTX.LIST;
  const BUDGETS = [
    { id: 'm1', min: 0, max: 15000, label: 'Hasta $15.000' },
    { id: 'm2', min: 15000, max: 30000, label: '$15.000 a $30.000' },
    { id: 'm3', min: 30000, max: 50000, label: '$30.000 a $50.000' },
    { id: 'm4', min: 50000, max: 1e9, label: 'Más de $50.000' },
  ];
  // Vínculos para "alguien nuevo": cercanos y de compromiso. Cada uno sugiere gustos y presupuesto de partida.
  const RELOPTS = [
    { id: 'pareja', g: 'Cercano', label: 'Pareja', sub: 'Quien te acompaña', tastes: ['casa', 'joyas', 'belleza'], range: 'm3' },
    { id: 'familia', g: 'Cercano', label: 'Familia', sub: 'Mamá, papá, hermanos', tastes: ['mesa', 'casa', 'gourmet'], range: 'm2' },
    { id: 'amistad', g: 'Cercano', label: 'Amigo o amiga', sub: 'Un cumpleaños, un gusto', tastes: ['libros', 'gourmet', 'joyas'], range: 'm2' },
    { id: 'nino', g: 'Cercano', label: 'Niño o niña', sub: 'Hijos, sobrinos, ahijados', tastes: ['infantil', 'libros'], range: 'm1' },
    { id: 'colega', g: 'Compromiso', label: 'Colega o jefatura', sub: 'Trabajo y oficina', tastes: ['libros', 'gourmet'], range: 'm1' },
    { id: 'anfitrion', g: 'Compromiso', label: 'Anfitrión o invitación', sub: 'Una cena, una visita', tastes: ['gourmet', 'mesa'], range: 'm2' },
    { id: 'gracias', g: 'Compromiso', label: 'Agradecimiento', sub: 'Un favor, un gesto', tastes: ['gourmet', 'belleza'], range: 'm1' },
    { id: 'otro', g: 'Otro', label: 'No sé / otra persona', sub: 'Sin pistas, sorpréndeme', tastes: [], range: '' },
  ];
  const relOf = (id) => RELOPTS.find((r) => r.id === id);
  const ctxOf = (id) => CONTEXTS.find((c) => c.id === id);
  const budgetOf = (id) => BUDGETS.find((b) => b.id === id);
  const hay = (p) => `${p.t} ${p.ty || ''} ${(p.tg || []).join(' ')}`;
  const cat = (p) => (p.ty || 'otro').toLowerCase().replace(/s$/, '');
  const isSos = (p) => U.expressSet.has(p.i);

  const qs = new URLSearchParams(location.search);
  let s = S.load();
  const fresh = () => ({ step: 'entry', who: null, ctx: qs.get('ctx') && ctxOf(qs.get('ctx')) ? qs.get('ctx') : '', range: '', sos: false, seen: [], likes: [], w: {}, current: null, widened: false, sosRelaxed: false, details: false, msg: '', savedId: '', share: 3, cmp: [] });
  let st = fresh();
  let draft = null;
  try { draft = JSON.parse(localStorage.getItem(DRAFT)); } catch { draft = null; }
  const persistDraft = () => { try { localStorage.setItem(DRAFT, JSON.stringify({ ...st, current: null })); } catch { /* sin storage */ } };
  const clearDraft = () => { try { localStorage.removeItem(DRAFT); } catch { /* sin storage */ } };

  const person = () => (st.who && st.who.person ? S.personOf(s, st.who.person) : null);
  const rel = () => (st.who && st.who.rel ? relOf(st.who.rel) : null);
  const forName = () => { const p = person(); return p ? p.name : st.who && st.who.kind === 'me' ? 'ti' : 'la persona'; };

  // ---------- puntaje: etiquetas con pesos que se mueven con cada reacción ----------
  const keysOf = (p) => [`c:${cat(p)}`, `v:${(p.v || '').toLowerCase()}`, `b:${BUDGETS.find((b) => p.p >= b.min && p.p < b.max).id}`];
  const pool = () => {
    const b = budgetOf(st.range);
    let list = D.products.filter((p) => p.p > 0 && !st.seen.includes(p.h));
    st.widened = false; st.sosRelaxed = false;
    if (b) {
      const i = BUDGETS.indexOf(b);
      let r = list.filter((p) => p.p >= b.min && p.p < b.max);
      if (r.length < 12) {
        const lo = BUDGETS[Math.max(0, i - 1)].min; const hi = BUDGETS[Math.min(BUDGETS.length - 1, i + 1)].max;
        r = list.filter((p) => p.p >= lo && p.p < hi); st.widened = true;
      }
      list = r;
    }
    if (st.sos) {
      const hoy = list.filter(isSos);
      if (hoy.length >= 5) list = hoy; else { st.sosRelaxed = true; list = list.sort((a, b) => Number(isSos(b)) - Number(isSos(a))); }
    }
    return list;
  };
  const pr = () => { const c = person(); const ids = c ? c.tastes : rel() ? rel().tastes : []; return ids.map((id) => S.TASTES.find((t) => t.id === id)).filter(Boolean); };
  const score = (p) => {
    const h = hay(p);
    const c = ctxOf(st.ctx);
    let v = 0; const why = [];
    if (c && c.re.test(h)) { v += 3; why.push({ k: 'ctx', t: c.label }); }
    const t = pr().find((x) => x.re.test(h));
    if (t) { v += 2.4; why.push({ k: 'taste', t: t.label }); }
    const b = budgetOf(st.range);
    if (b && p.p >= b.min && p.p < b.max) v += 1.2;
    if (st.sos && isSos(p)) { v += 1.5; why.push({ k: 'sos' }); }
    if (I.lang() === 'en' && /artesan|autor|origen|hecho a mano/i.test(h)) v += 0.8;
    if (I.lang() === 'pt' && /chile/i.test(h)) v += 0.8;
    keysOf(p).forEach((k) => {
      const w = st.w[k] || 0; v += w;
      if (k.startsWith('v:') && w > 0.5) why.push({ k: 'vendor', t: p.v });
      if (k.startsWith('c:') && w > 0.5) why.push({ k: 'cat' });
    });
    return { v, why };
  };
  const pct = (v) => Math.max(58, Math.min(98, Math.round(66 + v * 5)));
  const phrase = (p, why) => {
    const w = (k) => why.find((x) => x.k === k);
    const who = person();
    if (w('taste') && who) return `A ${who.name} le gusta ${w('taste').t.toLowerCase()}, y esto va por ahí.`;
    if (w('taste') && rel()) return `Una apuesta segura para ${rel().label.toLowerCase()}: ${w('taste').t.toLowerCase()}.`;
    if (w('vendor')) return `Te gustó otra pieza de ${w('vendor').t}: tiene el mismo sello.`;
    if (w('cat')) return 'Es del tipo de regalo que has ido eligiendo.';
    if (w('ctx')) return `Calza con “${w('ctx').t}”, el momento que elegiste.`;
    if (w('sos')) return 'Te llega hoy, sin esperar.';
    return `Diseño de ${p.v || 'una marca chilena'}, para empezar con algo distinto.`;
  };

  // ---------- el paquete que se arma mientras juegas ----------
  const labelOf = {};
  const keyLabel = (k) => {
    if (labelOf[k]) return labelOf[k];
    const val = k.slice(2);
    let l = val;
    if (k[0] === 'c') { const p = D.products.find((x) => cat(x) === val); l = p && p.ty ? p.ty.toLowerCase() : val; }
    if (k[0] === 'v') { const p = D.products.find((x) => (x.v || '').toLowerCase() === val); l = p ? p.v : val; }
    labelOf[k] = l;
    return l;
  };
  // Lo que Match aprendió de tus reacciones: tipos y marcas con peso fuerte (el tramo de precio no se muestra)
  const learned = () => Object.entries(st.w)
    .filter(([k, w]) => (k[0] === 'c' && Math.abs(w) >= 0.8) || (k[0] === 'v' && Math.abs(w) >= 0.3))
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).slice(0, 5)
    .map(([k, w]) => ({ k, up: w > 0, label: `${w > 0 ? 'Más' : 'Menos'} ${k[0] === 'v' ? 'de ' : ''}${keyLabel(k)}` }));
  const packBox = () => {
    const items = st.likes.map((h) => U.byHandle[h]).filter(Boolean);
    const total = items.reduce((a, p) => a + p.p, 0);
    const b = budgetOf(st.range);
    const cap = b && b.max < 1e9 ? b.max : 0;
    const over = cap && total > cap;
    const slots = Array.from({ length: LIKE_MAX }, (_, i) => (items[i] ? `<span class="mpack__slot has" title="${esc(items[i].t)}"><span class="ph ph--product" data-ph="" data-img="${esc(items[i].h)}" data-img-w="200"></span></span>` : '<span class="mpack__slot"></span>')).join('');
    const chips = learned();
    return `<section class="mpack" id="mPack" aria-label="Tu paquete">
      <div class="mpack__top">
        <div class="mpack__box"><p class="mpack__k">Tu paquete</p><div class="mpack__slots">${slots}</div></div>
        <div class="mpack__meter"><p class="mpack__k">${cap ? 'Presupuesto' : 'Llevas'}</p>
          ${cap ? `<div class="mpack__bar${over ? ' is-over' : ''}" role="img" aria-label="${U.fmt(total)} de ${U.fmt(cap)}"><i style="width:${Math.min(100, Math.round((total / cap) * 100))}%"></i></div>
          <p class="mpack__sum"><b>${U.fmt(total)}</b> <span>de ${U.fmt(cap)}</span></p>${over ? `<p class="mpack__over">Te pasas por ${U.fmt(total - cap)}</p>` : ''}`
          : `<p class="mpack__sum"><b>${U.fmt(total)}</b></p>`}</div>
      </div>
      <div class="mpack__learn"><span class="mpack__k">Lo que aprendí</span>
        ${chips.length ? chips.map((c) => `<span class="mlearn ${c.up ? 'is-up' : 'is-down'}"><button type="button" data-m="flip" data-k="${esc(c.k)}" title="Invertir">${esc(c.label)}</button><button type="button" data-m="unlearn" data-k="${esc(c.k)}" aria-label="Quitar: ${esc(c.label)}">×</button></span>`).join('')
          : '<span class="mpack__none">Todavía nada. Responde con “Me gusta” o “Descartar”.</span>'}
        ${chips.length ? '<span class="mpack__note">Toca para invertir o quita con ×. Se aplica desde la próxima carta.</span>' : ''}</div></section>`;
  };
  const redrawPack = () => { const el = $('#mPack'); if (!el) return; el.outerHTML = packBox(); I.apply($('#mPack')); persistDraft(); };

  const next = () => {
    const list = pool();
    if (!list.length) return null;
    const scored = list.map((p) => ({ p, ...score(p) }));
    const n = st.seen.length;
    const rand = (() => { let a = (n + 1) * 2654435761 >>> 0; return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; }; })();
    scored.forEach((x) => { x.v += rand() * 1.6; });
    scored.sort((a, b) => b.v - a.v);
    if (n < 5) {
      // set variado: una carta por tipo de producto y por tramo de precio
      const usedCats = st.seen.map((h) => U.byHandle[h]).filter(Boolean).map(cat);
      const usedBands = st.seen.map((h) => U.byHandle[h]).filter(Boolean).map((p) => keysOf(p)[2]);
      const pick = scored.find((x) => !usedCats.includes(cat(x.p)) && !usedBands.includes(keysOf(x.p)[2])) || scored.find((x) => !usedCats.includes(cat(x.p))) || scored[0];
      return pick;
    }
    return scored[0];
  };

  // ---------- pantallas ----------
  const head = (eyebrow, title, lead) => `<p class="seyebrow">${eyebrow}</p><h1 class="sform__title">${title}</h1>${lead ? `<p class="sform__lead">${lead}</p>` : ''}`;
  const langBar = () => `<div class="mlang" data-nt role="group" aria-label="Idioma">${I.LANGS.map(([k, l]) => `<button type="button" class="${I.lang() === k ? 'is-on' : ''}" data-m="lang" data-id="${k}" aria-pressed="${I.lang() === k}">${l}</button>`).join('')}</div>`;
  const shell = (inner, wide = false, keep = false) => { const y = window.scrollY; app.innerHTML = `<section class="mt"><div class="wrapper${wide ? '' : ' wrapper--narrow'}">${langBar()}${inner}</div></section>`; I.apply(app); window.scrollTo({ top: keep ? y : 0 }); };
  const steps = (n) => `<ol class="msteps" aria-label="Pasos">${['Para quién', 'Tu momento', 'Cartas', 'Mis Match'].map((l, i) => `<li class="${i + 1 === n ? 'is-on' : i + 1 < n ? 'is-done' : ''}">${l}</li>`).join('')}</ol>`;

  const entry = () => {
    const people = s.user ? s.people : [];
    const resume = draft && draft.likes && draft.likes.length ? `<div class="snotice mresume">Tienes un Match a medias con ${draft.likes.length} ${draft.likes.length === 1 ? 'carta' : 'cartas'} que te gustaron. <div class="sacct__actions"><button class="btn btn--solid btn--md" type="button" data-m="resume">Retomar desde Mis Match</button><button class="btn btn--outline btn--md" type="button" data-m="dropdraft">Empezar de nuevo</button></div></div>` : '';
    const tile = (k, t, sub) => `<button class="mtile" type="button" data-m="who" data-k="${k}"><span class="mtile__img ph ph--product" data-ph="${t}"></span><span class="mtile__t">${t}</span><span class="mtile__s">${sub}</span></button>`;
    if (s.user) {
      shell(`${steps(1)}${head('Match', `¿Para quién hoy${s.user ? ', ' + esc(s.user.name.split(' ')[0]) : ''}?`, 'Toca a quién le regalas y vemos la primera carta.')}${resume}
        <div class="mpeople">${people.map((p) => `<button class="mperson" type="button" data-m="who" data-k="person" data-id="${p.id}"><b>${esc(p.name)}</b><span>${esc(p.rel)}</span></button>`).join('')}
        <button class="mperson mperson--alt" type="button" data-m="who" data-k="me"><b>Para mí</b><span>Un gusto propio</span></button>
        <button class="mperson mperson--alt" type="button" data-m="who" data-k="other"><b>Alguien nuevo</b><span>No lo he guardado</span></button></div>`);
    } else {
      shell(`${steps(1)}${head('Match', '¿Para ti o para alguien más?', 'Una pregunta y empezamos. No te pedimos cuenta ni datos.')}${resume}
        <div class="mtiles mtiles--2">${tile('me', 'Para mí', 'Un gusto propio')}${tile('other', 'Para alguien más', 'Un regalo')}</div>`);
    }
  };

  const relStep = () => {
    const groups = ['Cercano', 'Compromiso', 'Otro'];
    shell(`${steps(1)}${head('Match', '¿Quién es esa persona?', 'Elige el vínculo y afinamos las ideas. Puedes saltarlo.')}
      ${groups.map((g) => `<h2 class="mh">${g === 'Otro' ? 'Si no estás seguro' : g === 'Cercano' ? 'Alguien cercano' : 'Un compromiso'}</h2><div class="mpeople">${RELOPTS.filter((r) => r.g === g).map((r) => `<button class="mperson" type="button" data-m="rel" data-id="${r.id}"><b>${r.label}</b><span>${r.sub}</span></button>`).join('')}</div>`).join('')}
      <div class="sacct__actions mact"><button class="link-underline" type="button" data-m="relskip">Saltar este paso</button></div>`);
  };

  const ask = (keep = false) => {
    const sosOn = st.sos ? 'checked' : '';
    shell(`${steps(2)}${head('Match', `¿Para qué momento${person() ? ` es el regalo de ${esc(person().name)}` : rel() ? ` es el regalo para ${esc(rel().label.toLowerCase())}` : ' es el regalo'}?`, 'Todo es opcional. Si prefieres, déjanos sorprenderte.')}
      <div class="mask">
        <div><h2 class="mh">Momento</h2>
        <div class="mtiles mtiles--6">${CONTEXTS.map((c) => `<button class="mtile mtile--sm ${st.ctx === c.id ? 'is-on' : ''}" type="button" data-m="ctx" data-id="${c.id}" aria-pressed="${st.ctx === c.id}"><span class="mtile__img ph ph--product" data-ph="${esc(c.label)}"></span><span class="mtile__t">${esc(c.label)}</span></button>`).join('')}</div></div>
        <div class="mask__row"><div><h2 class="mh">Presupuesto</h2>
        <div class="chips">${BUDGETS.map((b) => `<button class="mchip ${st.range === b.id ? 'is-on' : ''}" type="button" data-m="range" data-id="${b.id}" aria-pressed="${st.range === b.id}">${b.label}</button>`).join('')}</div></div>
        <div><h2 class="mh">Urgencia</h2>
        <label class="check check--block"><input type="checkbox" id="mSos" ${sosOn}><span class="check__box"></span><span class="check__label"><b>Lo necesito hoy</b> (Modo SOS): solo lo que llega hoy</span></label></div></div>
      </div>
      <div class="sacct__actions mact"><button class="btn btn--solid btn--md" type="button" data-m="start">Ver las cartas</button><button class="btn btn--outline btn--md" type="button" data-m="surprise">Sorpréndeme</button></div>`, true, keep);
  };

  const card = (keep = false) => {
    const x = st.current;
    if (!x) { empty(); return; }
    const p = x.p;
    const m = (p.d || '').match(/\d+(?:[.,]\d+)?\s?(?:x\s?\d+(?:[.,]\d+)?\s?)*(?:cm|mm|ml|g|kg)\b/i);
    const note = `${st.widened ? '<p class="snote snote--in">Ampliamos un poco el presupuesto para tener más opciones.</p>' : ''}${st.sosRelaxed ? '<p class="snote snote--in">Hoy quedan pocas piezas que lleguen hoy: te mostramos lo más cercano y avisamos cuándo llega.</p>' : ''}`;
    shell(`${steps(3)}${packBox()}
      <div class="mdeck__bar"><span>Carta ${st.seen.length + 1} de ${DECK}</span><span>${st.likes.length} ${st.likes.length === 1 ? 'me gusta' : 'me gusta'}</span></div>
      <article class="mcard" aria-live="polite">
        <div class="mcard__photo"><span class="mcard__stamp mcard__stamp--yes" aria-hidden="true"><i>♥</i> Me gusta</span><span class="mcard__stamp mcard__stamp--no" aria-hidden="true"><i>✕</i> Descartar</span><div class="ph ph--product" data-ph="${esc(p.v)}" data-img="${esc(p.h)}" data-img-w="900"></div>${S.tag('Match', pct(x.v) + '%', { pos: 'photo', hang: true })}</div>
        <div class="mcard__body">
          <p class="mcard__brand">${esc(p.v || '')}</p>${I.lang() !== 'es' ? `<p class="mcard__origin">Hecho en Chile por ${esc(p.v || 'una marca chilena')}</p>` : ''}
          <h2 class="mcard__title">${esc(p.t)}</h2>
          <p class="mcard__price">${U.fmt(p.p)}</p>
          <p class="mcard__stock ${isSos(p) ? 'is-now' : ''}">${isSos(p) ? '⚡ Llega hoy · Express 3 horas' : st.sos ? 'No llega hoy · llega en 1 a 2 días hábiles' : 'En stock · despacho en 2 a 5 días hábiles'}</p>
          <p class="mcard__why">${esc(phrase(p, x.why))}</p>
          <button class="link-underline" type="button" data-m="details" aria-expanded="${st.details}">${st.details ? 'Ver menos' : 'Ver historia y detalles'}</button>
          ${st.details ? `<div class="mcard__more"><p>${esc(p.d || 'Una pieza de diseño chileno.')}</p>${m ? `<p><b>Medidas:</b> ${esc(m[0])}</p>` : ''}<a class="link-underline" href="${window.CEC.url.product(p.h)}" target="_blank" rel="noopener">Abrir la ficha</a></div>` : ''}
          ${note}
          <div class="mdeck__btns"><button class="btn btn--outline btn--md" type="button" data-m="no"><span aria-hidden="true">✕</span> Descartar</button><button class="btn btn--solid btn--md" type="button" data-m="yes"><span aria-hidden="true">♥</span> Me gusta</button></div>
          <p class="mdeck__foot mdeck__hint">Arrastra la carta o usa las flechas ← →</p>
          ${st.likes.length ? '<p class="mdeck__foot"><button class="link-underline" type="button" data-m="enough">Ya tengo suficientes, ver mi lista</button></p>' : ''}
        </div>
      </article>`, true, keep);
    bindDrag();
  };

  // La carta se inclina al arrastrarla: a la derecha es "me gusta", a la izquierda "descartar"
  const bindDrag = () => {
    const c = $('.mcard');
    if (!c) return;
    let x0 = null; let dx = 0;
    const setV = (y, n) => { c.style.setProperty('--yes', y); c.style.setProperty('--no', n); };
    c.addEventListener('dragstart', (e) => e.preventDefault()); // la foto no se arrastra como imagen
    c.addEventListener('pointerdown', (e) => {
      if (e.button || e.target.closest('button, a, input, select')) return;
      x0 = e.clientX; dx = 0; c.setPointerCapture(e.pointerId); c.classList.add('is-drag');
    });
    c.addEventListener('pointermove', (e) => {
      if (x0 === null) return;
      dx = e.clientX - x0;
      c.style.transform = `translateX(${dx}px) rotate(${Math.max(-9, Math.min(9, dx / 40))}deg)`;
      setV(Math.max(0, Math.min(1, dx / 140)), Math.max(0, Math.min(1, -dx / 140)));
    });
    const end = () => {
      if (x0 === null) return;
      const d = dx; x0 = null; dx = 0; c.classList.remove('is-drag');
      if (Math.abs(d) > 130) { c.classList.add('is-gone'); c.style.transform = `translateX(${d > 0 ? 900 : -900}px) rotate(${d > 0 ? 12 : -12}deg)`; setTimeout(() => react(d > 0), 220); return; }
      c.style.transform = ''; setV(0, 0);
    };
    c.addEventListener('pointerup', end);
    c.addEventListener('pointercancel', end);
  };
  document.addEventListener('keydown', (e) => {
    if (st.step !== 'deck' || !st.current || e.target.closest('input, select, textarea') || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); react(true); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); react(false); }
  });

  const empty = () => {
    shell(`${steps(3)}${head('Match', 'Ya viste todo lo que calza', st.likes.length ? 'Cerremos con lo que te gustó.' : 'Prueba con otro momento o un presupuesto más amplio.')}
      <div class="sacct__actions">${st.likes.length ? '<button class="btn btn--solid btn--md" type="button" data-m="enough">Ver Mis Match</button>' : ''}<button class="btn btn--outline btn--md" type="button" data-m="again">Cambiar mis respuestas</button></div>`);
  };

  // Parecidas a lo que te gustó: mismo tipo, misma marca o mismo tramo de precio, sin repetir lo ya visto
  const similar = (n) => {
    const liked = st.likes.map((h) => U.byHandle[h]).filter(Boolean);
    if (!liked.length) return [];
    const sim = (p) => liked.reduce((a, l) => a + (cat(l) === cat(p) ? 2 : 0) + ((l.v || '') === (p.v || '') ? 1 : 0) + (keysOf(l)[2] === keysOf(p)[2] ? 0.5 : 0), 0);
    const seen = new Set([...st.seen, ...st.likes]);
    const pl = D.products.filter((p) => p.p > 0 && !seen.has(p.h));
    return pl.map((p) => ({ p, v: sim(p) + score(p).v * 0.2 })).sort((a, b) => b.v - a.v).slice(0, n).map((x) => x.p.h);
  };
  const stockLine = (p) => (isSos(p) ? '<span class="schip is-ok">Llega hoy</span>' : '<span class="schip">2 a 5 días hábiles</span>');
  // Mesa para comparar: dos zonas donde se arrastran (o se tocan con "Comparar") dos cartas de la lista
  const measure = (p) => { const m = (p.d || '').match(/\d+(?:[.,]\d+)?\s?(?:x\s?\d+(?:[.,]\d+)?\s?)*(?:cm|mm|ml|g|kg)\b/i); return m ? m[0] : '—'; };
  const cmpPanel = () => {
    const [a, b] = (st.cmp || []).map((h) => U.byHandle[h]);
    const zone = (p, i) => (p
      ? `<div class="mcmp__zone has" data-zone="${i}"><div class="ph ph--product mcmp__img" data-ph="${esc(p.v)}" data-img="${esc(p.h)}" data-img-w="200"></div><div class="mcmp__txt"><b>${esc(p.t)}</b><span>${U.fmt(p.p)}</span><button class="link-underline" type="button" data-m="uncmp" data-id="${esc(p.h)}">Quitar</button></div></div>`
      : `<div class="mcmp__zone" data-zone="${i}"><span class="mcmp__ab">${i ? 'B' : 'A'}</span><p>Arrastra una carta aquí o toca “Comparar”</p></div>`);
    const cell = (v, best) => `<td class="${best ? 'is-best' : ''}">${v}${best ? ' <span class="mcmp__best">Mejor</span>' : ''}</td>`;
    const table = a && b ? `<table class="mcmp__table"><tbody>
      <tr><th>Precio</th>${cell(U.fmt(a.p), a.p < b.p)}${cell(U.fmt(b.p), b.p < a.p)}</tr>
      <tr><th>Marca</th><td>${esc(a.v || '—')}</td><td>${esc(b.v || '—')}</td></tr>
      <tr><th>Llegada</th>${cell(isSos(a) ? 'Hoy · Express 3 horas' : '2 a 5 días hábiles', isSos(a) && !isSos(b))}${cell(isSos(b) ? 'Hoy · Express 3 horas' : '2 a 5 días hábiles', isSos(b) && !isSos(a))}</tr>
      <tr><th>Medidas</th><td>${esc(measure(a))}</td><td>${esc(measure(b))}</td></tr>
      <tr><th></th><td><button class="btn btn--solid btn--md" type="button" data-m="addcart" data-id="${esc(a.h)}">Al carro</button></td><td><button class="btn btn--solid btn--md" type="button" data-m="addcart" data-id="${esc(b.h)}">Al carro</button></td></tr></tbody></table>` : '';
    return `<section class="mcmp" aria-label="Comparar"><h2 class="mh">Compara dos regalos</h2><div class="mcmp__zones">${zone(a, 0)}${zone(b, 1)}</div>${table}</section>`;
  };
  const putCmp = (h, zone) => {
    const c = (st.cmp || []).slice();
    const at = c.indexOf(h);
    if (at >= 0) c[at] = '';
    c[zone] = h;
    st.cmp = [c[0] || '', c[1] || ''];
    list(true);
  };
  const list = (keep = false) => {
    if (!st.similar) st.similar = similar(Math.max(2, LIST - Math.min(st.likes.length, LIST - 2)));
    const likes = st.likes.slice(0, LIST - 2);
    const sims = st.similar.filter((h) => !likes.includes(h)).slice(0, LIST - likes.length);
    const rows = [...likes.map((h) => [h, false]), ...sims.map((h) => [h, true])].filter(([h]) => U.byHandle[h]);
    const items = likes.map((h) => U.byHandle[h]).filter(Boolean);
    const total = items.reduce((a, p) => a + p.p, 0);
    const forOther = st.who && st.who.kind !== 'me';
    const voteUrl = new URL(`votar.html?${new URLSearchParams({ l: rows.map(([h]) => h).join(','), ...(st.from || (s.user && s.user.name) ? { de: st.from || s.user.name.split(' ')[0] } : {}), ...(person() ? { p: person().name } : {}), lang: I.lang() })}`, location.href).href;
    const per = Math.ceil(total / Math.max(2, st.share));
    const user = s.user;
    shell(`${steps(4)}<div class="mlisthead"><h1 class="sform__title">${rows.length ? `Tu lista corta${person() ? ` para ${esc(person().name)}` : ''}` : 'Aún no elegiste ninguno'}</h1><p class="sform__lead">${rows.length ? 'Lo que te gustó y algunas parecidas. Compara precio, stock y despacho.' : 'Vuelve a las cartas y toca “Me gusta”.'}</p></div>
      ${rows.length > 1 ? cmpPanel() : ''}
      ${rows.length ? `<ul class="mlist">${rows.map(([h, sim]) => { const p = U.byHandle[h]; return `<li class="mrow ${sim ? 'is-sim' : ''}" draggable="true" data-h="${esc(p.h)}"><a class="mrow__img" href="${window.CEC.url.product(p.h)}"><div class="ph ph--product" data-ph="${esc(p.v)}" data-img="${esc(p.h)}" data-img-w="300"></div></a>
        <div class="mrow__info">${sim ? S.tag('Parecido', '', { small: true }) : S.tag('♥ Te gustó', '', { small: true })}<a class="mrow__t" href="${window.CEC.url.product(p.h)}">${esc(p.t)}</a><p>${esc(p.v || '')}</p><p class="mrow__p">${U.fmt(p.p)} ${stockLine(p)}</p>
        <div class="mrow__act"><button class="btn btn--solid btn--md" type="button" data-m="addcart" data-id="${esc(p.h)}">Al carro</button><button class="link-underline" type="button" data-m="cmp" data-id="${esc(p.h)}" aria-pressed="${(st.cmp || []).includes(p.h)}">${(st.cmp || []).includes(p.h) ? 'Comparando' : 'Comparar'}</button><button class="link-underline" type="button" data-m="${sim ? 'dropsim' : 'drop'}" data-id="${esc(p.h)}">Quitar</button></div></div></li>`; }).join('')}</ul>` : ''}
      <div class="sacct__actions mact"><button class="btn btn--outline btn--md" type="button" data-m="more" ${st.seen.length >= DECK ? 'disabled' : ''}>Seguir viendo cartas</button><button class="btn btn--outline btn--md" type="button" data-m="again">Empezar otro Match</button></div>
      ${items.length ? `<div class="mextras">
        <fieldset class="sfs"><legend>Pago compartido</legend><p class="sform__fine">Reúne a más personas para un mismo regalo (“hacer una vaca”).</p>
          <label class="sfield"><span>¿Entre cuántas personas?</span><select id="mShare">${[2, 3, 4, 5, 6, 8, 10].map((n) => `<option ${st.share === n ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
          <p>Si eliges todo lo que te gustó (${U.fmt(total)}), cada persona aporta <b>${U.fmt(per)}</b>.</p>
          <a class="btn btn--outline btn--md" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(`Hagamos una vaca por un regalo en Creado en Chile: ${U.fmt(per)} por persona (somos ${st.share}). Mira las opciones: ${items.map((p) => p.t).join(', ')}`)}">Invitar por WhatsApp</a></fieldset>
        <fieldset class="sfs"><legend>Que otros voten</legend><p class="sform__fine">Manda la lista corta y quienes la reciban marcan cuáles les gustan. Sirve para decidir entre varios.</p>
          <div class="sacct__actions"><button class="btn btn--outline btn--md" type="button" data-m="copyvote" data-url="${esc(voteUrl)}">Copiar enlace para votar</button><a class="btn btn--outline btn--md" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(`${I.tr('Ayúdame a elegir un regalo en Creado en Chile')}: ${voteUrl}`)}">Enviar por WhatsApp</a><a class="link-underline" target="_blank" rel="noopener" href="${esc(voteUrl)}">Ver cómo lo verán</a></div></fieldset>
        ${forOther ? `<fieldset class="sfs"><legend>Teaser digital</legend><p class="sform__fine">Un aviso para que ${esc(forName())} sepa que viene un regalo, sin revelar qué es.</p>
          <label class="sfield"><span>Tu nombre (opcional)</span><input id="mFrom" type="text" autocomplete="off" value="${esc(st.from || (user ? user.name.split(' ')[0] : ''))}"></label>
          <p class="mteaser">“Alguien está preparando un regalo para ti en Creado en Chile. Pronto sabrás qué es.”</p>
          <div class="sacct__actions"><button class="btn btn--outline btn--md" type="button" data-m="copyteaser">Copiar enlace del teaser</button><a class="btn btn--outline btn--md" id="mTeaserWa" target="_blank" rel="noopener" href="#">Enviar por WhatsApp</a><a class="link-underline" id="mTeaserSee" target="_blank" rel="noopener" href="#">Ver cómo lo verá</a></div></fieldset>` : ''}
        <fieldset class="sfs"><legend>Guardar este Match</legend>
          ${st.savedId ? `<p class="schip is-ok">Guardado en Mi Creado</p> <a class="link-underline" href="mi-creado.html?s=guardados">Ver Mis Match</a>`
            : user ? '<button class="btn btn--solid btn--md" type="button" data-m="save">Guardar en Mi Creado</button>'
            : '<p class="sform__fine">Si no quieres, Match funciona completo igual: solo no se guarda. Con Google es un toque.</p><div id="mLogin"></div>'}</fieldset></div>` : ''}
      <p class="sform__msg" role="status">${esc(st.msg)}</p>`, true, keep);
    const lb = $('#mLogin');
    if (lb) { S.loginBox(lb, () => { s = S.load(); saveMatch(); list(); }); I.apply(lb); }
    const fr = $('#mFrom');
    if (fr) { const upd = () => { st.from = fr.value.trim(); const l = teaserLink(); $('#mTeaserSee').href = l; $('#mTeaserWa').href = `https://wa.me/?text=${encodeURIComponent(`${I.tr('“Alguien está preparando un regalo para ti en Creado en Chile. Pronto sabrás qué es.”').replace(/[“”]/g, '')} ${l}`)}`; }; fr.addEventListener('input', upd); upd(); }
    const sh = $('#mShare');
    if (sh) sh.addEventListener('change', () => { st.share = +sh.value; list(true); });
  };

  const teaserLink = () => new URL(`regalo.html?${new URLSearchParams({ ...(st.from ? { de: st.from } : {}), ...(st.ctx ? { m: st.ctx } : {}), l: I.lang() })}`, location.href).href;
  const saveMatch = () => {
    s = S.load();
    if (!s.user) return;
    const id = S.uid('m');
    s.matches = s.matches || [];
    s.matches.unshift({ id, date: new Date().toISOString(), forWho: forName(), personId: st.who && st.who.person ? st.who.person : null, ctx: st.ctx, range: st.range, items: st.likes.slice(0, LIST - 2).concat((st.similar || []).filter((h) => !st.likes.includes(h)).slice(0, LIST - Math.min(st.likes.length, LIST - 2))) });
    s.matches = s.matches.slice(0, 20);
    S.save(s);
    st.savedId = id; st.msg = '';
    clearDraft();
  };

  // ---------- flujo ----------
  const redraw = () => { const f = { entry, rel: relStep, ask, deck: () => card(true), list }[st.step] || entry; f(); };
  const deal = () => { st.current = next(); st.details = false; st.step = 'deck'; persistDraft(); card(); };
  const react = (liked) => {
    const x = st.current;
    if (!x) return;
    keysOf(x.p).forEach((k) => { st.w[k] = (st.w[k] || 0) + (liked ? 1 : -0.8) * (k.startsWith('v:') ? 0.4 : 1); });
    st.seen.push(x.p.h);
    if (liked) st.likes.push(x.p.h);
    if (st.likes.length >= LIKE_MAX || st.seen.length >= DECK) { st.step = 'list'; st.similar = null; persistDraft(); list(); return; }
    deal();
  };
  const go = {
    who: (b) => {
      st.who = b.dataset.k === 'person' ? { kind: 'person', person: b.dataset.id } : { kind: b.dataset.k };
      if (qs.get('ctx')) st.ctx = qs.get('ctx');
      if (b.dataset.k === 'other') { st.step = 'rel'; relStep(); return; }
      st.step = 'ask'; ask();
    },
    ctx: (b) => { st.ctx = st.ctx === b.dataset.id ? '' : b.dataset.id; st.sos = $('#mSos').checked; ask(true); },
    range: (b) => { st.range = st.range === b.dataset.id ? '' : b.dataset.id; st.sos = $('#mSos').checked; ask(true); },
    rel: (b) => { const r = relOf(b.dataset.id); st.who = { kind: 'other', rel: r.id }; if (!st.range && r.range) st.range = r.range; st.step = 'ask'; ask(); },
    relskip: () => { st.who = { kind: 'other' }; st.step = 'ask'; ask(); },
    start: () => { st.sos = $('#mSos').checked; deal(); },
    surprise: () => { st.ctx = ''; st.range = ''; st.sos = false; deal(); },
    flip: (b) => { const k = b.dataset.k; const w = st.w[k] || 0; st.w[k] = w === 0 ? 1 : -w; redrawPack(); },
    unlearn: (b) => { delete st.w[b.dataset.k]; redrawPack(); },
    details: () => { st.details = !st.details; card(true); },
    yes: () => react(true),
    no: () => react(false),
    enough: () => { st.step = 'list'; st.similar = null; persistDraft(); list(); },
    more: () => { deal(); },
    again: () => { st = fresh(); st.who = null; entry(); },
    drop: (b) => { st.likes = st.likes.filter((h) => h !== b.dataset.id); st.seen = st.seen; persistDraft(); list(); },
    dropsim: (b) => { st.similar = (st.similar || []).filter((h) => h !== b.dataset.id); list(); },
    addcart: (b) => {
      const p = U.byHandle[b.dataset.id];
      window.CEC.addToCart({ handle: p.h, title: p.t, price: p.p, express: isSos(p) });
    },
    cmp: (b) => { const h = b.dataset.id; const c = (st.cmp || []).slice(); const at = c.indexOf(h); if (at >= 0) { c[at] = ''; st.cmp = c; list(true); return; } const free = c[0] ? (c[1] ? -1 : 1) : 0; putCmp(h, free < 0 ? 0 : free); },
    uncmp: (b) => { st.cmp = (st.cmp || []).map((h) => (h === b.dataset.id ? '' : h)); list(true); },
    copyvote: (b) => { (navigator.clipboard ? navigator.clipboard.writeText(b.dataset.url) : Promise.reject()).then(() => { b.textContent = I.tr('Enlace copiado'); }, () => { b.textContent = I.tr('No se pudo copiar'); }); },
    save: () => { saveMatch(); list(); },
    copyteaser: (b) => {
      (navigator.clipboard ? navigator.clipboard.writeText(teaserLink()) : Promise.reject()).then(() => { b.textContent = I.tr('Enlace copiado'); }, () => { b.textContent = I.tr('No se pudo copiar'); });
    },
    lang: (b) => { I.setLang(b.dataset.id); s = S.load(); redraw(); },
    resume: () => { st = { ...fresh(), ...draft, current: null, step: 'list', savedId: '' }; list(); },
    dropdraft: () => { clearDraft(); draft = null; entry(); },
  };
  // arrastrar una carta de la lista a la mesa de comparar
  app.addEventListener('dragstart', (e) => { const li = e.target.closest('.mrow[data-h]'); if (li) { e.dataTransfer.setData('text/plain', li.dataset.h); e.dataTransfer.effectAllowed = 'copy'; } });
  app.addEventListener('dragover', (e) => { if (e.target.closest('.mcmp__zone')) { e.preventDefault(); e.target.closest('.mcmp__zone').classList.add('is-over'); } });
  app.addEventListener('dragleave', (e) => { const z = e.target.closest('.mcmp__zone'); if (z) z.classList.remove('is-over'); });
  app.addEventListener('drop', (e) => { const z = e.target.closest('.mcmp__zone'); if (!z) return; e.preventDefault(); const h = e.dataTransfer.getData('text/plain'); if (h && U.byHandle[h]) putCmp(h, +z.dataset.zone); });
  app.addEventListener('click', (e) => {
    const b = e.target.closest('[data-m]');
    if (b && go[b.dataset.m] && !b.closest('#mLogin')) go[b.dataset.m](b);
  });

  // ---------- entrada ----------
  const pid = qs.get('p');
  if (pid && s.user && S.personOf(s, pid)) { st.who = { kind: 'person', person: pid }; st.step = 'ask'; ask(); } else entry();
})();
