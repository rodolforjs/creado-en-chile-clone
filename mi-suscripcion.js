// Mi suscripción (demostración): plan, próxima fecha con regalo propuesto, fechas y personas, despacho y avisos.
(() => {
  const S = window.CEC_SUB;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = S.esc;
  const app = $('#subApp');
  let s = S.load();
  const ui = { tab: 'resumen', open: null, show: null, msg: '', confirmCancel: false, pick: {} };
  const PLACES = ['Tienda Santiago', 'Tienda Concepción', 'Tienda Valparaíso'];
  const persist = () => S.save(s);
  const chip = (st) => ({ pending: ['Pendiente', 'is-pending'], accepted: ['Confirmada', 'is-ok'], paused: ['Pausada', 'is-off'] }[st] || ['', '']);
  const planOn = () => s.plan && s.plan.status !== 'cancelled';

  // ---------- opciones de regalo por fecha: el usuario elige una de varias del rango ----------
  const valueOf = (it) => it.value || S.rangeOf(s.plan.ranges[it.personId]).value;
  const optionsFor = (it) => {
    const person = S.personOf(s, it.personId) || { tastes: [] };
    const taken = s.plan.items.map((x) => x.status === 'accepted' && x.handle).filter(Boolean);
    return S.suggest({ tastes: person.tastes, range: s.plan.ranges[it.personId] || 'r2', seed: `${it.id}-${it.round}`, n: S.PLAN.options, exclude: taken });
  };
  const diffNote = (diff) => (diff > 0 ? `Pagas ${S.fmt(diff)} más` : diff < 0 ? `Te quedan ${S.fmt(-diff)} de crédito` : 'Sin diferencia');
  const sorted = () => s.plan.items.map((it) => ({ it, ...S.info(it) })).sort((a, b) => a.date - b.date);

  const deliveryBlock = (id) => `<div class="sdeliv" data-for="${id}">
    <fieldset class="sfs sfs--tight"><legend>¿Cómo lo recibes?</legend>
      <label class="srange"><input type="radio" name="dm-${id}" value="envio" checked><b>Despacho a domicilio</b></label>
      <label class="srange"><input type="radio" name="dm-${id}" value="retiro"><b>Retiro en tienda</b></label>
      <label class="sfield"><span data-lbl>Dirección (demo)</span><input type="text" data-place placeholder="Calle y número, comuna"></label>
    </fieldset>
    <button class="btn btn--solid btn--md" type="button" data-act="confirm" data-id="${id}">Confirmar regalo</button>
    <button class="btn btn--outline btn--md" type="button" data-act="close">Volver</button></div>`;

  // ---------- vistas ----------
  const upcomingCard = () => {
    const list = sorted().filter((x) => x.it.status !== 'paused');
    // tras aceptar, se sigue mostrando esa fecha (con su confirmación) hasta pasar a la siguiente
    const cur = list.find((x) => x.it.id === ui.show) || list.find((x) => x.it.status === 'pending') || list[0];
    if (!cur) return `<div class="snotice">No hay fechas activas. Agrega una en “Fechas y personas”.</div>`;
    const { it, name, date } = cur;
    const person = S.personOf(s, it.personId);
    const days = S.daysTo(date);
    const left = S.PLAN.changes - it.changes;
    const nextOne = list.find((x) => x.it !== it && x.it.status === 'pending');
    const value = valueOf(it);
    const chosen = it.status === 'accepted' ? S.product(it.handle) : null;
    const opts = it.status === 'accepted' ? [] : optionsFor(it);
    const pickId = ui.pick[it.id];
    const pickP = opts.find((o) => o.h === pickId);
    let body = '';
    if (it.status === 'accepted') {
      body = `<p class="snotice snotice--ok">Confirmado. ${it.delivery.mode === 'retiro' ? `Retiro en ${esc(it.delivery.place)}` : `Despacho a ${esc(it.delivery.place || 'tu dirección')}`}, envío gratis y bolsa de regalo. Ya está pagado (${S.fmt(value)})${chosen ? `. ${diffNote(chosen.p - value)} (demo)` : ''}.</p>
        ${nextOne ? `<p class="sacct__next">Siguiente fecha: <b>${esc(nextOne.name)}</b> (${S.inDays(S.daysTo(nextOne.date))}). <button class="link-underline" type="button" data-act="focus" data-id="${nextOne.it.id}">Prepararla</button></p>` : '<p class="sacct__next">Con esto cierras tus fechas activas.</p>'}`;
    } else if (ui.open === it.id) {
      body = deliveryBlock(it.id);
    } else {
      body = `<div class="sacct__actions">
        <button class="btn btn--solid btn--md" type="button" data-act="accept" data-id="${it.id}" id="pickBtn" ${pickP ? '' : 'disabled'}>Elegir este regalo</button>
        <button class="btn btn--outline btn--md" type="button" data-act="change" data-id="${it.id}" ${left > 0 ? '' : 'disabled'}>Ver otras ${S.PLAN.options}${left > 0 ? '' : ' (ya las viste)'}</button>
        <button class="btn btn--outline btn--md" type="button" data-act="pause" data-id="${it.id}">Pausar</button></div>
        <p class="sform__fine" id="pickNote">${pickP ? diffNote(pickP.p - value) : 'Elige uno de los regalos de arriba.'}</p>`;
    }
    const gift = it.status === 'accepted'
      ? `<p class="sacct__label">Tu regalo</p><div class="sacct__gift">${chosen ? S.giftCard(chosen) : ''}</div>`
      : ui.open === it.id && pickP
        ? `<p class="sacct__label">Elegiste</p><div class="sacct__gift">${S.giftCard(pickP)}</div>`
        : `<p class="sacct__label">Elige uno de estos ${opts.length} regalos${person && person.tastes.length ? ` (gustos: ${esc(S.tasteLabels(person.tastes))})` : ''}</p>
      <p class="sacct__prepaid">Tu regalo está prepagado: <b>${S.fmt(value)}</b>. Si eliges uno más caro, pagas la diferencia; si es más barato, queda de crédito.</p>
      ${opts.length ? `<div class="sopts" role="radiogroup">${opts.map((o) => `<label class="sopt ${o.h === pickId ? 'is-on' : ''}"><input type="radio" name="pick-${it.id}" value="${esc(o.h)}" ${o.h === pickId ? 'checked' : ''}>${S.giftCard(o, '', false)}<span class="sopt__diff">${diffNote(o.p - value)}</span></label>`).join('')}</div>` : '<p>No encontramos regalos en tu rango. Prueba cambiar el rango.</p>'}`;
    return `<article class="sacct__card sacct__card--wide" id="item-${it.id}">
      <p class="sacct__label">Próxima fecha</p>
      <h3 class="sacct__h">${esc(name)} · ${person ? esc(person.name) : ''}</h3>
      <p class="sacct__when">${S.fmtDate(date)} · ${S.inDays(days)}</p>
      ${gift}
      ${body}</article>`;
  };

  const resumen = () => {
    const used = s.plan.items.filter((i) => i.status === 'accepted').length;
    const paused = s.plan.status === 'paused';
    return `<div class="sgrid">
      <article class="sacct__card">
        <p class="sacct__label">Plan</p>
        <h3 class="sacct__h">Plan anual <span class="schip ${paused ? 'is-off' : 'is-ok'}">${paused ? 'Pausado' : 'Activo'}</span></h3>
        <dl class="sdl"><div><dt>Desde</dt><dd>${S.fmtDate(new Date(s.plan.since))}</dd></div><div><dt>Renueva</dt><dd>${S.fmtDate(new Date(s.plan.renews))}</dd></div><div><dt>Prepagado</dt><dd>${S.fmt(s.plan.price)}${s.plan.quotas > 1 ? ` en ${s.plan.quotas} cuotas` : ''}</dd></div><div><dt>Medio de pago</dt><dd>${({ webpay: 'Webpay', card: 'Tarjeta de crédito', mp: 'Mercado Pago' })[s.plan.method] || 'Demo'}</dd></div><div><dt>Fechas usadas</dt><dd>${used} de ${S.PLAN.dates}</dd></div></dl>
      </article>
      ${paused ? '<div class="snotice">Tu plan está en pausa: no te enviamos avisos. Retómalo en “Despacho y avisos”.</div>' : upcomingCard()}</div>`;
  };

  const fechas = () => {
    const rows = sorted();
    const used = new Set(rows.map((r) => r.it.personId));
    const canAdd = s.plan.items.length < S.PLAN.dates;
    return `<h3 class="sacct__h2">Fechas</h3>
      <ul class="srows">${rows.map(({ it, name, date }) => { const p = S.personOf(s, it.personId); const [lab, cls] = chip(it.status); return `<li>
        <div><b>${p ? esc(p.name) : ''}</b> <span>${p ? esc(p.rel) : ''}</span><p>${esc(name)} · ${S.fmtDate(date)}</p></div>
        <label class="sfield sfield--inline"><span class="visually-hidden">Rango</span><select data-act="range" data-person="${it.personId}">${S.RANGES.map((r) => `<option value="${r.id}" ${(s.plan.ranges[it.personId] || 'r2') === r.id ? 'selected' : ''}>${r.label}</option>`).join('')}</select></label>
        <span class="schip ${cls}">${lab}</span>
        ${it.status === 'paused' ? `<button class="link-underline" type="button" data-act="resume" data-id="${it.id}">Retomar</button>` : it.status === 'pending' ? `<button class="link-underline" type="button" data-act="pause" data-id="${it.id}">Pausar</button>` : '<span></span>'}
        ${it.status === 'accepted' ? '<span></span>' : `<button class="link-underline" type="button" data-act="remove" data-id="${it.id}">Quitar</button>`}</li>`; }).join('')}</ul>
      ${canAdd ? `<fieldset class="sfs"><legend>Agregar una fecha</legend>
        <label class="sfield"><span>Persona</span><select id="nPerson">${s.people.map((p) => `<option value="${p.id}">${esc(p.name)} (${esc(p.rel)})</option>`).join('')}<option value="new">Persona nueva</option></select></label>
        <label class="sfield" id="nNameBox" hidden><span>Nombre</span><input id="nName" type="text" autocomplete="off"></label>
        <label class="sfield"><span>Ocasión</span><select id="nOcc">${S.occOptions()}</select></label>
        <button class="btn btn--outline btn--md" type="button" data-act="add">Agregar fecha</button></fieldset>` : `<p class="sform__fine">Usaste las ${S.PLAN.dates} fechas del plan.</p>`}
      <h3 class="sacct__h2">Personas y gustos</h3>
      ${s.people.filter((p) => used.has(p.id)).map((p) => `<fieldset class="sfs sfs--tight"><legend>${esc(p.name)} <span>${esc(p.rel)}</span></legend><div class="chips" data-person="${p.id}">${S.tasteChips('t-' + p.id, p.tastes)}</div></fieldset>`).join('') || '<p>Aún no hay personas.</p>'}`;
  };

  const prefs = () => {
    const pr = s.plan.prefs;
    const paused = s.plan.status === 'paused';
    return `<h3 class="sacct__h2">Despacho y avisos</h3>
      <div class="sform__row">
        <label class="sfield"><span>Cómo prefieres recibirlo</span><select data-pref="delivery"><option value="envio" ${pr.delivery === 'envio' ? 'selected' : ''}>Despacho a domicilio</option><option value="retiro" ${pr.delivery === 'retiro' ? 'selected' : ''}>Retiro en tienda</option></select></label>
        <label class="sfield"><span>Avisarme con</span><select data-pref="lead">${[3, 7, 14].map((n) => `<option value="${n}" ${+pr.lead === n ? 'selected' : ''}>${n} días de anticipación</option>`).join('')}</select></label>
        <label class="sfield"><span>Canal de aviso</span><select data-pref="channel"><option value="email" ${pr.channel === 'email' ? 'selected' : ''}>Correo</option><option value="wa" ${pr.channel === 'wa' ? 'selected' : ''}>WhatsApp</option></select></label>
      </div>
      <h3 class="sacct__h2">Pausar o cancelar</h3>
      <p>${paused ? 'El plan está en pausa y no enviamos avisos.' : 'Pausa los avisos cuando quieras, sin perder tus fechas.'}</p>
      <div class="sacct__actions"><button class="btn btn--outline btn--md" type="button" data-act="${paused ? 'unpause' : 'pausePlan'}">${paused ? 'Retomar el plan' : 'Pausar el plan'}</button>
      <button class="btn btn--outline btn--md" type="button" data-act="cancelAsk">Cancelar el plan</button></div>
      ${ui.confirmCancel ? `<div class="snotice">Si cancelas, las fechas ya entregadas no se reembolsan. El valor de las que no alcanzaste a usar se te devuelve o queda como crédito en la tienda (demo). <div class="sacct__actions"><button class="btn btn--solid btn--md" type="button" data-act="cancelYes">Sí, cancelar</button><button class="btn btn--outline btn--md" type="button" data-act="cancelNo">Mantener mi plan</button></div></div>` : ''}`;
  };

  // ---------- sin plan: recordatorios y reserva ----------
  const noPlan = () => {
    const rem = s.reminders;
    const rv = s.reservation;
    const cancelled = s.plan && s.plan.status === 'cancelled';
    let html = '';
    if (cancelled) html += `<div class="snotice">Cancelaste tu plan. Sigue activo hasta el ${S.fmtDate(new Date(s.plan.renews))}. <a href="suscribirse.html">Volver a suscribirme</a></div>`;
    if (rv) {
      const p = S.product(rv.handle);
      const { name, date } = S.info(rv);
      const days = S.daysTo(date);
      const near = days <= 21;
      let body;
      if (rv.status === 'active') body = `<p class="snotice snotice--ok">Activada. ${rv.delivery.mode === 'retiro' ? `Retiro en ${esc(rv.delivery.place)}` : `Despacho a ${esc(rv.delivery.place || 'tu dirección')}`}. Cobro (demo): ${S.fmt(p.p)}.</p>`;
      else if (ui.open === rv.id) body = deliveryBlock(rv.id).replace('Confirmar regalo', `Activar y pagar ${S.fmt(p.p)} (demo)`);
      else body = `${near ? `<p class="snotice">Se acerca la fecha: <b>¿lo activamos?</b></p>` : `<p class="sform__fine">Faltan ${days} días. Te preguntaremos “¿lo activamos?” unos días antes; si quieres, puedes activarla ahora.</p>`}
        <div class="sacct__actions"><button class="btn btn--solid btn--md" type="button" data-act="rActivate" data-id="${rv.id}">Activar</button><button class="btn btn--outline btn--md" type="button" data-act="rCancel">Cancelar reserva</button></div>`;
      html += `<article class="sacct__card"><p class="sacct__label">Tu reserva</p><h3 class="sacct__h">${esc(name)}</h3><p class="sacct__when">${S.fmtDate(date)} · ${S.inDays(days)}</p><div class="sacct__gift">${p ? S.giftCard(p) : ''}</div>${body}</article>`;
    }
    if (rem.length) {
      html += `<h3 class="sacct__h2">Tus recordatorios (gratis)</h3><ul class="srows srows--rem">${rem.map((r) => { const p = S.personOf(s, r.personId); const { name, date } = S.info(r); return `<li><div><b>${p ? esc(p.name) : ''}</b> <span>${p ? esc(p.rel) : ''}</span><p>${esc(name)} · ${S.fmtDate(date)} · ${S.inDays(S.daysTo(date))}</p></div><span></span><span></span><button class="link-underline" type="button" data-act="rmRem" data-id="${r.id}">Quitar</button></li>`; }).join('')}</ul>`;
    }
    if (!rv && !rem.length) html += `<div class="sempty"><h3>Aún no tienes fechas guardadas</h3><p>Guarda una fecha gratis o reserva la próxima. Con el plan anual te mandamos el regalo ya propuesto.</p></div>`;
    html += `<div class="sacct__actions sacct__actions--top"><a class="btn btn--solid btn--lg" href="recordatorio.html">Guardar una fecha</a><a class="btn btn--outline btn--lg" href="reserva.html">Reservar la próxima fecha</a>${planOn() ? '' : '<a class="btn btn--outline btn--lg" href="suscribirse.html">Suscribirme al plan anual</a>'}</div>`;
    return html;
  };

  const draw = () => {
    const on = planOn();
    const tabs = on ? `<div class="stabs" role="tablist">${[['resumen', 'Resumen'], ['fechas', 'Fechas y personas'], ['prefs', 'Despacho y avisos']].map(([k, l]) => `<button type="button" role="tab" aria-selected="${ui.tab === k}" class="${ui.tab === k ? 'is-on' : ''}" data-tab="${k}">${l}</button>`).join('')}</div>` : '';
    app.innerHTML = `<section class="sacct"><div class="wrapper">
      <p class="seyebrow">Mi Creado</p>
      <h1 class="sform__title">Mi suscripción</h1>
      ${s.user ? `<p class="sform__lead">${esc(s.user.name)} · ${esc(s.user.email)}</p>` : '<p class="sform__lead">Aquí ves tus fechas, tu reserva y tu plan.</p>'}
      ${S.accountNav('suscripcion')}
      ${tabs}
      <div class="sacct__body">${on ? ({ resumen, fechas, prefs }[ui.tab])() : noPlan()}</div>
      <p class="sform__msg" role="status">${ui.msg}</p>
      <p class="snote snote--in">Demostración: todo queda en este navegador. Precios y condiciones de ejemplo.</p>
    </div></section>`;
    const np = $('#nPerson');
    if (np) { const sync = () => { $('#nNameBox').hidden = np.value !== 'new'; }; np.addEventListener('change', sync); if (!s.people.length) np.value = 'new'; sync(); }
  };

  // ---------- acciones ----------
  const item = (id) => s.plan && s.plan.items.find((i) => i.id === id);
  const act = {
    accept: (id) => { if (!ui.pick[id]) { ui.msg = 'Elige uno de los regalos.'; return; } ui.open = id; },
    close: () => { ui.open = null; },
    focus: () => { ui.tab = 'resumen'; ui.open = null; ui.show = null; },
    change: (id) => { const it = item(id); if (it && it.changes < S.PLAN.changes) { it.changes += 1; it.round += 1; it.handle = null; delete ui.pick[id]; persist(); } },
    pause: (id) => { const it = item(id); if (it) { it.status = 'paused'; it.handle = it.handle; persist(); } },
    resume: (id) => { const it = item(id); if (it) { it.status = 'pending'; persist(); } },
    remove: (id) => { s.plan.items = s.plan.items.filter((i) => i.id !== id); persist(); },
    pausePlan: () => { s.plan.status = 'paused'; persist(); },
    unpause: () => { s.plan.status = 'active'; persist(); },
    cancelAsk: () => { ui.confirmCancel = true; },
    cancelNo: () => { ui.confirmCancel = false; },
    cancelYes: () => { s.plan.status = 'cancelled'; ui.confirmCancel = false; persist(); },
    rmRem: (id) => { s.reminders = s.reminders.filter((r) => r.id !== id); persist(); },
    rCancel: () => { s.reservation = null; ui.open = null; persist(); },
    rActivate: (id) => { ui.open = id; },
    add: () => {
      let pid = $('#nPerson').value;
      if (pid === 'new') {
        const name = $('#nName').value.trim();
        if (!name) { ui.msg = 'Escribe el nombre de la persona.'; return; }
        pid = S.uid('p');
        s.people.push({ id: pid, name, rel: 'Otra persona', tastes: [] });
      }
      s.plan.ranges[pid] = s.plan.ranges[pid] || 'r2';
      s.plan.items.push({ id: S.uid('i'), personId: pid, occId: $('#nOcc').value, custom: null, status: 'pending', handle: null, changes: 0, delivery: null, round: 0, value: S.rangeOf(s.plan.ranges[pid]).value });
      s.plan.price += S.rangeOf(s.plan.ranges[pid]).value;
      ui.msg = `Se suma esta fecha a tu plan: ${S.fmt(S.rangeOf(s.plan.ranges[pid]).value)} (demo).`;
      persist();
    },
    confirm: (id) => {
      const box = $(`.sdeliv[data-for="${id}"]`);
      const mode = box.querySelector('input[type=radio]:checked').value;
      const place = box.querySelector('[data-place]').value.trim();
      if (mode === 'envio' && !place) { ui.msg = 'Escribe la dirección de despacho.'; return; }
      if (s.reservation && s.reservation.id === id) { s.reservation.status = 'active'; s.reservation.delivery = { mode, place }; }
      else { const it = item(id); if (it) { it.status = 'accepted'; it.handle = ui.pick[id] || it.handle; it.delivery = { mode, place }; ui.show = id; } }
      ui.open = null;
      persist();
    },
  };

  app.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-tab]');
    if (tab) { ui.tab = tab.dataset.tab; ui.open = null; ui.msg = ''; draw(); return; }
    const b = e.target.closest('[data-act]');
    if (!b || b.tagName === 'SELECT' || b.disabled) return;
    ui.msg = '';
    const fn = act[b.dataset.act];
    if (fn) { fn(b.dataset.id); draw(); }
  });
  app.addEventListener('change', (e) => {
    const t = e.target;
    if (t.matches('input[name^="pick-"]')) {
      const id = t.name.slice(5);
      ui.pick[id] = t.value;
      app.querySelectorAll(`input[name="${t.name}"]`).forEach((x) => x.closest('.sopt').classList.toggle('is-on', x.checked));
      const it = item(id);
      const p = optionsFor(it).find((o) => o.h === t.value);
      const btn = $('#pickBtn');
      if (btn) btn.disabled = false;
      if (p && $('#pickNote')) $('#pickNote').textContent = diffNote(p.p - valueOf(it));
      return;
    }
    if (t.matches('input[name^="dm-"]')) {
      const box = t.closest('.sdeliv');
      const retiro = t.value === 'retiro';
      box.querySelector('[data-lbl]').textContent = retiro ? 'Tienda' : 'Dirección (demo)';
      const inp = box.querySelector('[data-place]');
      inp.value = retiro ? PLACES[0] : '';
      inp.placeholder = retiro ? PLACES.join(' / ') : 'Calle y número, comuna';
      return;
    }
    if (t.matches('select[data-act="range"]')) {
      s.plan.ranges[t.dataset.person] = t.value;
      s.plan.items.filter((i) => i.personId === t.dataset.person && i.status === 'pending').forEach((i) => { i.handle = null; i.value = S.rangeOf(t.value).value; delete ui.pick[i.id]; });
      s.plan.price = s.plan.items.reduce((a, i) => a + valueOf(i), 0);
      ui.msg = `Cada regalo de esta persona ahora vale ${S.fmt(S.rangeOf(t.value).value)}. Se cobra o abona la diferencia (demo).`;
      persist(); draw(); return;
    }
    if (t.matches('[data-pref]')) { s.plan.prefs[t.dataset.pref] = t.value; persist(); return; }
    const chips = t.closest('.chips[data-person]');
    if (chips) { const p = S.personOf(s, chips.dataset.person); p.tastes = S.readChecks(chips, t.name); s.plan.items.filter((i) => i.personId === p.id && i.status === 'pending').forEach((i) => { i.handle = null; }); persist(); }
  });

  draw();
})();
