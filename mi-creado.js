// Mi Creado (demostración): inicio, personas y gustos, fechas, guardados, pedidos, direcciones y perfil.
// La cuenta es local: se guarda en este navegador (localStorage `cec_sub`).
(() => {
  const S = window.CEC_SUB;
  const esc = S.esc;
  const $ = (s, r = document) => r.querySelector(s);
  const app = $('#subApp');
  const SECTIONS = ['inicio', 'personas', 'fechas', 'guardados', 'pedidos', 'direcciones', 'perfil'];
  const COMUNAS = ['Santiago', 'Providencia', 'Las Condes', 'Ñuñoa', 'Vitacura', 'La Reina', 'Maipú', 'Viña del Mar', 'Valparaíso', 'Concepción', 'Otra comuna'];
  const qs = new URLSearchParams(location.search);
  let sec = SECTIONS.includes(qs.get('s')) ? qs.get('s') : 'inicio';
  let s = S.load();
  const ui = { msg: '', edit: null, openOrder: null };
  const persist = () => S.save(s);
  const fmtD = (iso) => S.fmtDate(new Date(iso));
  const first = () => (s.user ? s.user.name.split(' ')[0] : '');

  // ---------- acceso ----------
  const gate = () => {
    app.innerHTML = `<section class="sform"><div class="wrapper wrapper--narrow">
      <p class="seyebrow">Mi Creado</p>
      <h1 class="sform__title">Entra a Mi Creado</h1>
      <p class="sform__lead">Tus fechas, tus personas, tus guardados y tus pedidos, dentro de la tienda. Con Google es un toque: no te pedimos nada más.</p>
      <div id="lbox"></div></div></section>`;
    S.loginBox($('#lbox'), () => {
      let back = null;
      try { back = sessionStorage.getItem('cec_return'); sessionStorage.removeItem('cec_return'); } catch { /* sin storage */ }
      if (back && !back.startsWith('mi-creado')) { location.href = back; return; }
      s = S.load();
      draw();
    });
  };

  // ---------- entradas de fechas ----------
  const entries = () => {
    const out = [];
    if (s.plan && s.plan.status !== 'cancelled') s.plan.items.forEach((it) => out.push({ kind: 'plan', it, personId: it.personId, ...S.info(it), status: it.status }));
    s.reminders.forEach((r) => out.push({ kind: 'rem', it: r, personId: r.personId, ...S.info(r), status: 'rem' }));
    if (s.reservation) out.push({ kind: 'res', it: s.reservation, personId: s.reservation.personId, ...S.info(s.reservation), status: s.reservation.status });
    return out.sort((a, b) => a.date - b.date);
  };
  const KIND = { plan: ['Plan anual', 'is-ok'], rem: ['Recordatorio', ''], res: ['Reserva', 'is-pending'] };
  const STATUS = { pending: 'Pendiente', accepted: 'Confirmada', paused: 'Pausada', reserved: 'Reservada', active: 'Activada', rem: 'Te avisamos' };
  const personName = (id) => { const p = S.personOf(s, id); return p ? p.name : ''; };

  // ---------- secciones ----------
  const inicio = () => {
    const list = entries().filter((e) => e.status !== 'paused');
    const nx = list[0];
    const last = s.orders[0];
    let card;
    if (nx) {
      const days = S.daysTo(nx.date);
      let gifts = [];
      let cta = '';
      if (nx.kind === 'plan') {
        const p = nx.it.handle ? S.product(nx.it.handle) : S.suggest({ tastes: (S.personOf(s, nx.personId) || { tastes: [] }).tastes, range: s.plan.ranges[nx.personId] || 'r2', seed: `${nx.it.id}-${nx.it.round}`, n: 1 })[0];
        gifts = p ? [p] : [];
        cta = '<a class="btn btn--solid btn--md" href="mi-suscripcion.html">Aceptar, cambiar o pausar</a>';
      } else if (nx.kind === 'res') {
        const p = S.product(nx.it.handle);
        gifts = p ? [p] : [];
        cta = '<a class="btn btn--solid btn--md" href="mi-suscripcion.html">Ver mi reserva</a>';
      } else {
        const person = S.personOf(s, nx.personId) || { tastes: [], id: 'x' };
        gifts = S.suggest({ tastes: person.tastes, range: 'r2', seed: person.id + nx.it.id, n: 3 });
        cta = `<a class="btn btn--solid btn--md" href="reserva.html?r=${nx.it.id}">Reservar uno de estos</a><a class="btn btn--outline btn--md" href="match.html${nx.personId ? `?p=${nx.personId}` : ''}">Hacer un Match</a><a class="btn btn--outline btn--md" href="suscripcion.html#planes">Ver el plan anual</a>`;
      }
      card = `<article class="sacct__card"><p class="sacct__label">Próxima fecha</p><h3 class="sacct__h">${esc(nx.name)}${nx.personId ? ` · ${esc(personName(nx.personId))}` : ''}</h3>
        <p class="sacct__when">${S.fmtDate(nx.date)} · ${S.inDays(days)} <span class="schip ${KIND[nx.kind][1]}">${KIND[nx.kind][0]}</span></p>
        <p class="sacct__label">${nx.kind === 'rem' ? 'Ideas para esa persona' : 'Regalo propuesto'}</p>
        <div class="sform__gifts">${gifts.map((p) => S.giftCard(p)).join('')}</div><div class="sacct__actions">${cta}</div></article>`;
    } else {
      card = `<div class="sempty"><h3>Aún no tienes fechas</h3><p>Guarda a quien quieres y su fecha, y te avisamos con ideas.</p><div class="sacct__actions" style="justify-content:center"><a class="btn btn--solid btn--md" href="recordatorio.html">Guardar una fecha</a><a class="btn btn--outline btn--md" href="suscripcion.html">Conocer la suscripción</a></div></div>`;
    }
    const lastCard = last ? `<article class="sacct__card"><p class="sacct__label">Último pedido</p><h3 class="sacct__h">${esc(last.id)}</h3><p class="sacct__when">${fmtD(last.date)} · ${S.fmt(last.total)}</p><p>${last.items.map((i) => esc(i.title)).slice(0, 3).join(', ')}${last.items.length > 3 ? '…' : ''}</p><div class="sacct__actions"><a class="btn btn--outline btn--md" href="mi-creado.html?s=pedidos">Ver mis pedidos</a></div></article>` : `<article class="sacct__card"><p class="sacct__label">Último pedido</p><p>Todavía no tienes pedidos.</p><div class="sacct__actions"><a class="btn btn--outline btn--md" href="index.html">Ir a comprar</a></div></article>`;
    const stat = (n, l, k) => `<a class="astat" href="mi-creado.html?s=${k}"><b>${n}</b><span>${l}</span></a>`;
    const saved = new Set([...s.saved, ...s.reminders.flatMap((r) => r.ideas || [])]).size + (s.matches || []).length;
    return `<div class="astats">${stat(s.people.length, 'Personas', 'personas')}${stat(entries().length, 'Fechas', 'fechas')}${stat(saved, 'Guardados', 'guardados')}${stat(s.orders.length, 'Pedidos', 'pedidos')}</div>
      <div class="sgrid sgrid--even">${card}${lastCard}</div>`;
  };

  const personas = () => `<h3 class="sacct__h2">Personas y gustos</h3>
    <p class="sform__lead">A quién le regalas y qué le gusta. Con esto afinamos los regalos propuestos.</p>
    ${s.people.map((p) => `<fieldset class="sfs"><legend>${esc(p.name)} <span>${esc(p.rel)}</span></legend>
      <div class="chips" data-person="${p.id}">${S.tasteChips('t-' + p.id, p.tastes)}</div>
      <p class="sform__fine">${datesOf(p.id)}</p>
      <a class="btn btn--outline btn--md" href="match.html?p=${p.id}">Hacer un Match para ${esc(p.name)}</a> <button class="link-underline" type="button" data-act="delPerson" data-id="${p.id}">Quitar persona</button></fieldset>`).join('') || '<div class="sempty"><p>Aún no guardas personas.</p></div>'}
    <fieldset class="sfs"><legend>Agregar persona</legend>
      <label class="sfield"><span>Nombre</span><input id="npName" type="text" autocomplete="off"></label>
      <label class="sfield"><span>Quién es para ti</span><select id="npRel">${S.RELS.map((r) => `<option>${r}</option>`).join('')}</select></label>
      <div class="sfield"><span>Qué le gusta (opcional)</span><div class="chips" id="npTastes">${S.tasteChips('tastes')}</div></div>
      <button class="btn btn--outline btn--md" type="button" data-act="addPerson">Agregar persona</button></fieldset>`;
  const datesOf = (pid) => { const n = entries().filter((e) => e.personId === pid); return n.length ? `${n.length} ${n.length === 1 ? 'fecha' : 'fechas'}: ${n.map((e) => esc(e.name)).join(', ')}` : 'Sin fechas todavía.'; };

  const fechas = () => {
    const list = entries();
    return `<h3 class="sacct__h2">Fechas</h3>
      <ul class="srows srows--dates">${list.map((e) => `<li><div><b>${esc(e.name)}</b> <span>${e.personId ? esc(personName(e.personId)) : ''}</span><p>${S.fmtDate(e.date)} · ${S.inDays(S.daysTo(e.date))}</p></div>
        <span class="schip ${KIND[e.kind][1]}">${KIND[e.kind][0]}</span><span class="schip ${e.status === 'accepted' || e.status === 'active' ? 'is-ok' : e.status === 'paused' ? 'is-off' : ''}">${STATUS[e.status] || ''}</span>
        ${e.kind === 'rem' ? `<button class="link-underline" type="button" data-act="delRem" data-id="${e.it.id}">Quitar</button>` : '<a class="link-underline" href="mi-suscripcion.html">Gestionar</a>'}</li>`).join('') || '<li class="sitems__empty">Aún no hay fechas.</li>'}</ul>
      <fieldset class="sfs"><legend>Guardar una fecha</legend>
        ${s.people.length ? `<label class="sfield"><span>Persona</span><select id="fPerson">${s.people.map((p) => `<option value="${p.id}">${esc(p.name)} (${esc(p.rel)})</option>`).join('')}</select></label>
        <label class="sfield"><span>Ocasión</span><select id="fOcc">${S.occOptions()}<option value="custom">Otra fecha (cumpleaños, aniversario)</option></select></label>
        <div id="fCustom" hidden><label class="sfield"><span>Nombre de la fecha</span><input id="fLabel" type="text" placeholder="Ej.: Cumpleaños de Carmen"></label><label class="sfield"><span>Día</span><input id="fDate" type="date"></label></div>
        <button class="btn btn--outline btn--md" type="button" data-act="addRem">Guardar fecha</button>` : '<p>Primero agrega una persona en “Personas y gustos”.</p>'}</fieldset>`;
  };

  const guardados = () => {
    const ideas = s.reminders.flatMap((r) => r.ideas || []);
    const hs = [...new Set([...s.saved, ...ideas])];
    const prods = hs.map(S.product).filter(Boolean);
    return `<h3 class="sacct__h2">Guardados</h3>
      <p class="sform__lead">Lo que guardaste desde la ficha de producto o como idea para una fecha.</p>
      ${prods.length ? `<div class="agrid">${prods.map((p) => `<div class="agrid__item">${window.CEC_UI.card(p, { swatches: false })}${s.saved.includes(p.h) ? `<button class="link-underline" type="button" data-act="unsave" data-id="${esc(p.h)}">Quitar de guardados</button>` : '<p class="sform__fine">Idea de una fecha</p>'}</div>`).join('')}</div>` : '<div class="sempty"><h3>Aún no guardas nada</h3><p>En la ficha de cada producto puedes tocar “Guardar”.</p><div class="sacct__actions" style="justify-content:center"><a class="btn btn--solid btn--md" href="index.html">Ver productos</a></div></div>'}
      <h3 class="sacct__h2">Mis Match</h3>
      ${(s.matches || []).length ? (s.matches || []).map((m) => `<article class="sacct__card"><div class="orow"><div><b>Match para ${esc(m.forWho)}</b><p>${fmtD(m.date)} · ${m.items.length} ${m.items.length === 1 ? 'regalo' : 'regalos'}</p></div><button class="link-underline" type="button" data-act="delMatch" data-id="${m.id}">Quitar</button></div>
        <div class="agrid">${m.items.map((h) => S.product(h)).filter(Boolean).map((p) => `<div class="agrid__item">${window.CEC_UI.card(p, { swatches: false })}</div>`).join('')}</div></article>`).join('') : '<div class="sempty"><h3>Aún no guardas un Match</h3><p>Haz un Match y guarda tu lista corta para compararla después.</p><div class="sacct__actions" style="justify-content:center"><a class="btn btn--solid btn--md" href="match.html">Hacer un Match</a></div></div>'}`;
  };

  const pedidos = () => `<h3 class="sacct__h2">Pedidos</h3>
    ${s.orders.map((o) => `<article class="sacct__card"><div class="orow"><div><b>${esc(o.id)}</b><p>${fmtD(o.date)} · ${S.fmt(o.total)}</p></div><span class="schip is-ok">Confirmado</span>
      <button class="link-underline" type="button" data-act="toggleOrder" data-id="${o.id}">${ui.openOrder === o.id ? 'Ocultar' : 'Ver detalle'}</button></div>
      ${ui.openOrder === o.id ? `<ul class="o-items">${o.items.map((i) => `<li><div class="ph ph--product o-items__img" data-ph="Prod"></div><div class="o-items__info"><p>${esc(i.title)}</p><small>${i.variant ? `${esc(i.variant)} · ` : ''}Cant. ${i.qty}</small></div><span>${S.fmt(i.price * i.qty)}</span></li>`).join('')}</ul>
        <dl class="sdl"><div><dt>Envío</dt><dd>${o.ship.cost ? S.fmt(o.ship.cost) : 'Gratis'} (${o.ship.mode === 'exp' ? 'Express' : 'Estándar'})</dd></div><div><dt>Entrega</dt><dd>${esc(o.address || '')}</dd></div><div><dt>Total</dt><dd>${S.fmt(o.total)}</dd></div></dl>
        <div class="sacct__actions"><button class="btn btn--outline btn--md" type="button" data-act="rebuy" data-id="${o.id}">Volver a comprar</button></div>` : ''}</article>`).join('') || '<div class="sempty"><h3>Aún no tienes pedidos</h3><p>Cuando compres, tu pedido queda guardado aquí.</p><div class="sacct__actions" style="justify-content:center"><a class="btn btn--solid btn--md" href="index.html">Ir a comprar</a></div></div>'}`;

  const addrForm = (a = {}) => `<fieldset class="sfs"><legend>${a.id ? 'Editar dirección' : 'Agregar dirección'}</legend>
    <label class="sfield"><span>Nombre de la dirección</span><input id="aAlias" type="text" placeholder="Casa, trabajo…" value="${esc(a.alias || '')}"></label>
    <label class="sfield"><span>Nombre y apellido</span><input id="aName" type="text" value="${esc(a.name || (s.user ? s.user.name : ''))}"></label>
    <label class="sfield"><span>Dirección</span><input id="aStreet" type="text" value="${esc(a.street || '')}"></label>
    <label class="sfield"><span>Comuna</span><select id="aComuna">${COMUNAS.map((c) => `<option ${a.comuna === c ? 'selected' : ''}>${c}</option>`).join('')}</select></label>
    <label class="sfield"><span>Teléfono</span><input id="aTel" type="tel" value="${esc(a.tel || '')}"></label>
    <label class="check check--block"><input type="checkbox" id="aDef" ${a.def ? 'checked' : ''}><span class="check__box"></span><span class="check__label">Usar como principal</span></label>
    <div class="sacct__actions"><button class="btn btn--solid btn--md" type="button" data-act="saveAddr" data-id="${a.id || ''}">Guardar dirección</button>${a.id ? '<button class="btn btn--outline btn--md" type="button" data-act="cancelEdit">Cancelar</button>' : ''}</div></fieldset>`;
  const direcciones = () => `<h3 class="sacct__h2">Direcciones</h3>
    <ul class="srows srows--addr">${s.addresses.map((a) => `<li><div><b>${esc(a.alias || a.street)}</b> ${a.def ? '<span class="schip is-ok">Principal</span>' : ''}<p>${esc(a.name)} · ${esc(a.street)}, ${esc(a.comuna)}${a.tel ? ` · ${esc(a.tel)}` : ''}</p></div>
      ${a.def ? '<span></span>' : `<button class="link-underline" type="button" data-act="defAddr" data-id="${a.id}">Hacer principal</button>`}<button class="link-underline" type="button" data-act="editAddr" data-id="${a.id}">Editar</button><button class="link-underline" type="button" data-act="delAddr" data-id="${a.id}">Quitar</button></li>`).join('') || '<li class="sitems__empty">Aún no guardas direcciones. También se guardan al comprar.</li>'}</ul>
    ${addrForm(ui.edit ? s.addresses.find((a) => a.id === ui.edit) : {})}`;

  const perfil = () => {
    const pr = s.profile;
    const meth = { google: 'Google', shop: 'shop', code: 'Correo con código' }[s.user.method] || 'Correo';
    return `<h3 class="sacct__h2">Perfil</h3>
      <div class="sform__row"><label class="sfield"><span>Nombre</span><input id="pName" type="text" value="${esc(s.user.name)}"></label>
      <label class="sfield"><span>Correo</span><input id="pEmail" type="email" value="${esc(s.user.email)}"></label>
      <label class="sfield"><span>Idioma</span><select id="pLang"><option value="es" ${pr.lang === 'es' ? 'selected' : ''}>Español</option><option value="en" ${pr.lang === 'en' ? 'selected' : ''}>English</option></select></label></div>
      <fieldset class="sfs"><legend>Avisos</legend>
        <label class="check check--block"><input type="checkbox" id="pEmailN" ${pr.notify.email ? 'checked' : ''}><span class="check__box"></span><span class="check__label">Avisos de mis fechas por correo</span></label>
        <label class="check check--block"><input type="checkbox" id="pWa" ${pr.notify.wa ? 'checked' : ''}><span class="check__box"></span><span class="check__label">Avisos de mis fechas por WhatsApp</span></label>
        <label class="check check--block"><input type="checkbox" id="pNews" ${pr.notify.news ? 'checked' : ''}><span class="check__box"></span><span class="check__label">Novedades y ofertas</span></label></fieldset>
      <button class="btn btn--solid btn--md" type="button" data-act="saveProfile">Guardar cambios</button>
      <h3 class="sacct__h2">Acceso</h3>
      <p>Entraste con <b>${meth}</b>.</p>
      <div class="sacct__actions"><button class="btn btn--outline btn--md" type="button" data-act="logout">Cerrar sesión</button><button class="btn btn--outline btn--md" type="button" data-act="wipeAsk">Borrar mis datos (demo)</button></div>
      ${ui.wipe ? '<div class="snotice">Esto borra personas, fechas, plan, guardados, pedidos y direcciones de este navegador. <div class="sacct__actions"><button class="btn btn--solid btn--md" type="button" data-act="wipeYes">Sí, borrar todo</button><button class="btn btn--outline btn--md" type="button" data-act="wipeNo">Cancelar</button></div></div>' : ''}`;
  };

  // ---------- render ----------
  const VIEWS = { inicio, personas, fechas, guardados, pedidos, direcciones, perfil };
  const draw = () => {
    if (!s.user) { gate(); return; }
    app.innerHTML = `<section class="sacct"><div class="wrapper">
      <p class="seyebrow">Mi Creado</p>
      <h1 class="sform__title">Hola, ${esc(first())}</h1>
      <p class="sform__lead">${esc(s.user.email)}</p>
      ${S.accountNav(sec)}
      <div class="sacct__body">${VIEWS[sec]()}</div>
      <p class="sform__msg" role="status">${ui.msg}</p>
      <p class="snote snote--in">Demostración: todo queda en este navegador.</p></div></section>`;
    const fo = $('#fOcc');
    if (fo) fo.addEventListener('change', () => { $('#fCustom').hidden = fo.value !== 'custom'; });
  };

  // ---------- acciones ----------
  const act = {
    delPerson: (id) => {
      if (s.plan && s.plan.status !== 'cancelled' && s.plan.items.some((i) => i.personId === id)) { ui.msg = 'Esta persona tiene fechas en tu plan. Quítalas primero en Mi suscripción.'; return; }
      s.people = s.people.filter((p) => p.id !== id);
      s.reminders = s.reminders.filter((r) => r.personId !== id);
      persist();
    },
    addPerson: () => {
      const name = $('#npName').value.trim();
      if (!name) { ui.msg = 'Escribe el nombre de la persona.'; return; }
      s.people.push({ id: S.uid('p'), name, rel: $('#npRel').value, tastes: S.readChecks($('#npTastes'), 'tastes') });
      persist();
    },
    delRem: (id) => { s.reminders = s.reminders.filter((r) => r.id !== id); persist(); },
    addRem: () => {
      const occId = $('#fOcc').value;
      let custom = null;
      if (occId === 'custom') {
        const label = $('#fLabel').value.trim();
        const v = $('#fDate').value;
        if (!label || !v) { ui.msg = 'Completa el nombre y el día de la fecha.'; return; }
        const [, m, d] = v.split('-').map(Number);
        custom = { label, m, d };
      }
      s.reminders.push({ id: S.uid('r'), personId: $('#fPerson').value, occId: custom ? null : occId, custom, ideas: [] });
      persist();
    },
    delMatch: (id) => { s.matches = (s.matches || []).filter((m) => m.id !== id); persist(); },
    unsave: (h) => { s.saved = s.saved.filter((x) => x !== h); persist(); },
    toggleOrder: (id) => { ui.openOrder = ui.openOrder === id ? null : id; },
    rebuy: (id) => {
      const o = s.orders.find((x) => x.id === id);
      if (!o || !window.CEC) return;
      o.items.forEach((i) => window.CEC.addToCart({ handle: i.handle, title: i.title, price: i.price, express: !!i.express, qty: i.qty, variant: i.variant || '' }, false));
      window.CEC.openCart();
    },
    editAddr: (id) => { ui.edit = id; },
    cancelEdit: () => { ui.edit = null; },
    delAddr: (id) => { s.addresses = s.addresses.filter((a) => a.id !== id); if (s.addresses.length && !s.addresses.some((a) => a.def)) s.addresses[0].def = true; ui.edit = null; persist(); },
    defAddr: (id) => { s.addresses.forEach((a) => { a.def = a.id === id; }); persist(); },
    saveAddr: (id) => {
      const a = { alias: $('#aAlias').value.trim(), name: $('#aName').value.trim(), street: $('#aStreet').value.trim(), comuna: $('#aComuna').value, tel: $('#aTel').value.trim(), def: $('#aDef').checked };
      if (!a.name || !a.street) { ui.msg = 'Completa el nombre y la dirección.'; return; }
      if (a.def) s.addresses.forEach((x) => { x.def = false; });
      if (id) Object.assign(s.addresses.find((x) => x.id === id), a); else s.addresses.push({ id: S.uid('a'), ...a, def: a.def || !s.addresses.length });
      ui.edit = null;
      persist();
    },
    saveProfile: () => {
      const name = $('#pName').value.trim();
      const email = $('#pEmail').value.trim();
      if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { ui.msg = 'Revisa tu nombre y un correo válido.'; return; }
      s.user.name = name; s.user.email = email;
      s.profile.lang = $('#pLang').value;
      s.profile.notify = { email: $('#pEmailN').checked, wa: $('#pWa').checked, news: $('#pNews').checked };
      persist();
      ui.msg = 'Cambios guardados.';
    },
    logout: () => { S.logout(); s = S.load(); },
    wipeAsk: () => { ui.wipe = true; },
    wipeNo: () => { ui.wipe = false; },
    wipeYes: () => { try { localStorage.removeItem('cec_sub'); localStorage.removeItem('cec_last_buy'); } catch { /* sin storage */ } s = S.load(); ui.wipe = false; },
  };
  app.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    ui.msg = '';
    const fn = act[b.dataset.act];
    if (fn) { fn(b.dataset.id); s = S.load(); draw(); }
  });
  app.addEventListener('change', (e) => {
    const chips = e.target.closest('.chips[data-person]');
    if (chips) { const p = S.personOf(s, chips.dataset.person); p.tastes = S.readChecks(chips, e.target.name); if (s.plan) s.plan.items.filter((i) => i.personId === p.id && i.status === 'pending').forEach((i) => { i.handle = null; }); persist(); }
  });

  draw();
})();
