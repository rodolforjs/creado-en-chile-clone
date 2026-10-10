// Alta del plan anual (demostración): plan, cuenta, personas y fechas, rango y pago. No cobra ni envía datos.
(() => {
  const S = window.CEC_SUB;
  const $ = (s, r = document) => r.querySelector(s);
  const app = $('#subApp');
  const STEPS = ['Plan', 'Cuenta', 'Personas y fechas', 'Rango de precio', 'Pago'];
  const s = S.load();
  const st = {
    step: 0,
    user: s.user ? { ...s.user } : null,
    people: s.people.map((p) => ({ ...p })),
    items: s.reminders.slice(0, S.PLAN.dates).map((r) => ({ id: S.uid('i'), personId: r.personId, occId: r.occId, custom: r.custom })),
    ranges: {},
    method: 'webpay',
    terms: false,
    msg: '',
  };
  if (s.plan && s.plan.status !== 'cancelled') { location.replace('mi-suscripcion.html'); return; }

  const stepper = () => `<ol class="sstepper">${STEPS.map((n, i) => `<li class="${i === st.step ? 'is-now' : i < st.step ? 'is-done' : ''}"><span>${i + 1}</span><b>${n}</b></li>`).join('')}</ol>`;
  const nav = (next = 'Continuar') => `<p class="sform__msg" role="alert">${st.msg}</p><div class="sform__actions sform__actions--split">${st.step ? '<button class="btn btn--outline btn--lg" type="button" data-back>Volver</button>' : '<a class="btn btn--outline btn--lg" href="suscripcion.html#planes">Cancelar</a>'}<button class="btn btn--solid btn--lg" type="button" data-next>${next}</button></div>`;
  const itemInfo = (it) => { const p = st.people.find((x) => x.id === it.personId); return { p, ...S.info(it) }; };

  const views = [
    // 1 · Plan
    () => `<h1 class="sform__title">Plan anual</h1>
      <p class="sform__lead">Un regalo pre-curado para cada fecha importante, dentro del rango que elijas.</p>
      <div class="splan splan--main splan--flat">
        <p class="splan__price">${S.fmt(S.PLAN.price)} <small>al año</small></p>
        <ul class="splan__list">
          <li>Hasta ${S.PLAN.dates} fechas al año, con aviso del regalo propuesto.</li>
          <li>${S.PLAN.changes} cambio de regalo por fecha.</li>
          <li>Envío gratis en cada fecha, con despacho o retiro.</li>
          <li>Aceptar, cambiar o pausar en cada aviso.</li>
        </ul>
        <p class="splan__fine">Cada regalo se paga al aceptarlo, dentro de tu rango. Si cancelas, el plan sigue hasta el final del período.</p>
      </div>${nav()}`,
    // 2 · Cuenta
    () => `<h1 class="sform__title">Tu cuenta</h1>
      <p class="sform__lead">La necesitamos para guardar tus fechas y avisarte.</p>
      ${st.user ? `<p class="sform__acct">Seguirás con la cuenta de <b>${S.esc(st.user.name)}</b> (${S.esc(st.user.email)}).</p>` : `
      <button class="gbtn" type="button" id="gDemo"><svg viewBox="0 0 18 18" aria-hidden="true"><path fill="#4285F4" d="M17.6 9.2c0-.6-.1-1.2-.2-1.8H9v3.4h4.8a4.1 4.1 0 0 1-1.8 2.7v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.5z"/><path fill="#34A853" d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H.9v2.3A9 9 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.9 10.7a5.4 5.4 0 0 1 0-3.4V5H.9a9 9 0 0 0 0 8z"/><path fill="#EA4335" d="M9 3.6c1.3 0 2.5.5 3.5 1.400l2.600-2.600A9 9 0 0 0 .9 5l3 2.300C4.600 5.200 6.600 3.600 9 3.600z"/></svg>Continuar con Google (demo)</button>
      <p class="sform__or">o con tu correo</p>
      <label class="field"><span>Nombre</span><input id="uName" type="text" autocomplete="off"></label>
      <label class="field"><span>Correo</span><input id="uEmail" type="email" autocomplete="off"></label>`}
      ${nav()}`,
    // 3 · Personas y fechas
    () => {
      const full = st.items.length >= S.PLAN.dates;
      return `<h1 class="sform__title">Personas y fechas</h1>
      <p class="sform__lead">Agrega a quién le regalas y en qué fecha. Tu plan incluye ${S.PLAN.dates} fechas al año.</p>
      <p class="scount"><b>${st.items.length}</b> de ${S.PLAN.dates} fechas</p>
      <ul class="sitems">${st.items.map((it, i) => { const x = itemInfo(it); return `<li><div><b>${S.esc(x.p ? x.p.name : '')}</b> <span>${S.esc(x.p ? x.p.rel : '')}</span><p>${S.esc(x.name)} · ${S.fmtDate(x.date)}</p></div><button class="link-underline" type="button" data-del="${i}">Quitar</button></li>`; }).join('') || '<li class="sitems__empty">Aún no agregas fechas.</li>'}</ul>
      ${full ? '' : `<fieldset class="sfs"><legend>Agregar una fecha</legend>
        <label class="field"><span>Persona</span><select id="aPerson">${st.people.map((p) => `<option value="${p.id}">${S.esc(p.name)} (${S.esc(p.rel)})</option>`).join('')}<option value="new">Persona nueva</option></select></label>
        <div id="aNew">
          <label class="field"><span>Nombre</span><input id="aName" type="text" autocomplete="off"></label>
          <label class="field"><span>Quién es para ti</span><select id="aRel">${S.RELS.map((r) => `<option>${r}</option>`).join('')}</select></label>
          <div class="field"><span>Qué le gusta (opcional)</span><div class="chips" id="aTastes">${S.tasteChips('tastes')}</div></div>
        </div>
        <label class="field"><span>Ocasión</span><select id="aOcc">${S.occOptions()}<option value="custom">Otra fecha (cumpleaños, aniversario)</option></select></label>
        <div id="aCustom" hidden>
          <label class="field"><span>Nombre de la fecha</span><input id="aLabel" type="text" placeholder="Ej.: Cumpleaños de Carmen"></label>
          <label class="field"><span>Día</span><input id="aDate" type="date"></label>
        </div>
        <button class="btn btn--outline btn--md" type="button" id="aAdd">Agregar fecha</button>
      </fieldset>`}${nav()}`;
    },
    // 4 · Rango
    () => {
      const ids = [...new Set(st.items.map((i) => i.personId))];
      return `<h1 class="sform__title">Rango de precio</h1>
      <p class="sform__lead">Elige cuánto quieres gastar por regalo en cada persona. Cada regalo se paga al aceptarlo.</p>
      ${ids.map((id) => { const p = st.people.find((x) => x.id === id); const cur = st.ranges[id] || 'r2'; return `<fieldset class="sfs"><legend>${S.esc(p.name)} <span>${S.esc(p.rel)}</span></legend><div class="sranges">${S.RANGES.map((r) => `<label class="srange ${cur === r.id ? 'is-on' : ''}"><input type="radio" name="rg-${id}" value="${r.id}" ${cur === r.id ? 'checked' : ''}><b>${r.label}</b></label>`).join('')}</div></fieldset>`; }).join('')}
      ${nav()}`;
    },
    // 5 · Pago
    () => `<h1 class="sform__title">Pago</h1>
      <p class="sform__lead">Revisa el resumen y confirma. Es una demostración: no se cobra nada.</p>
      <div class="ssum"><div><span>Plan anual</span><b>${S.fmt(S.PLAN.price)}</b></div><div><span>Fechas</span><b>${st.items.length} de ${S.PLAN.dates}</b></div><div><span>Envío</span><b>Gratis en cada fecha</b></div></div>
      <fieldset class="sfs"><legend>Medio de pago</legend><div class="sranges">${[['webpay', 'Webpay'], ['card', 'Tarjeta de crédito'], ['mp', 'Mercado Pago']].map(([v, l]) => `<label class="srange ${st.method === v ? 'is-on' : ''}"><input type="radio" name="pay" value="${v}" ${st.method === v ? 'checked' : ''}><b>${l}</b></label>`).join('')}</div></fieldset>
      <label class="check check--block"><input type="checkbox" id="terms" ${st.terms ? 'checked' : ''}><span class="check__box"></span><span class="check__label">Acepto las condiciones del plan (ejemplo para la práctica).</span></label>
      ${nav(`Pagar ${S.fmt(S.PLAN.price)} (demo)`)}`,
  ];

  const bind = () => {
    app.querySelector('[data-back]')?.addEventListener('click', () => { st.step -= 1; st.msg = ''; draw(); });
    app.querySelector('[data-next]')?.addEventListener('click', next);
    if (st.step === 1) {
      $('#gDemo')?.addEventListener('click', () => { $('#uName').value = 'Cuenta de demostración'; $('#uEmail').value = 'demo@ejemplo.cl'; });
    }
    if (st.step === 2) {
      app.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => { st.items.splice(+b.dataset.del, 1); draw(); }));
      const person = $('#aPerson');
      if (person) {
        const sync = () => { $('#aNew').hidden = person.value !== 'new'; };
        person.addEventListener('change', sync);
        // sin personas guardadas, parte en "Persona nueva"
        if (!st.people.length) person.value = 'new';
        sync();
        $('#aOcc').addEventListener('change', () => { $('#aCustom').hidden = $('#aOcc').value !== 'custom'; });
        $('#aAdd').addEventListener('click', addItem);
      }
    }
    if (st.step === 3) app.querySelectorAll('.srange input').forEach((i) => i.addEventListener('change', () => { st.ranges[i.name.slice(3)] = i.value; app.querySelectorAll(`input[name="${i.name}"]`).forEach((x) => x.closest('.srange').classList.toggle('is-on', x.checked)); }));
    if (st.step === 4) {
      app.querySelectorAll('input[name=pay]').forEach((i) => i.addEventListener('change', () => { st.method = i.value; app.querySelectorAll('input[name=pay]').forEach((x) => x.closest('.srange').classList.toggle('is-on', x.checked)); }));
      $('#terms').addEventListener('change', (e) => { st.terms = e.target.checked; });
    }
  };

  const addItem = () => {
    const msg = app.querySelector('.sform__msg');
    let pid = $('#aPerson').value;
    if (pid === 'new') {
      const name = $('#aName').value.trim();
      if (!name) { msg.textContent = 'Escribe el nombre de la persona.'; return; }
      pid = S.uid('p');
      st.people.push({ id: pid, name, rel: $('#aRel').value, tastes: S.readChecks($('#aTastes'), 'tastes') });
    }
    let custom = null;
    const occId = $('#aOcc').value;
    if (occId === 'custom') {
      const label = $('#aLabel').value.trim();
      const v = $('#aDate').value;
      if (!label || !v) { msg.textContent = 'Completa el nombre y el día de la fecha.'; return; }
      const [, m, d] = v.split('-').map(Number);
      custom = { label, m, d };
    }
    st.items.push({ id: S.uid('i'), personId: pid, occId: custom ? null : occId, custom });
    st.msg = '';
    draw();
  };

  const next = () => {
    st.msg = '';
    if (st.step === 1 && !st.user) {
      const n = $('#uName').value.trim();
      const e = $('#uEmail').value.trim();
      if (!n || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { st.msg = 'Necesitamos tu nombre y un correo válido (o usa Google).'; draw(); return; }
      st.user = { name: n, email: e };
    }
    if (st.step === 2 && !st.items.length) { st.msg = 'Agrega al menos una fecha para continuar.'; draw(); return; }
    if (st.step === 4) {
      if (!st.terms) { st.msg = 'Acepta las condiciones para continuar.'; draw(); return; }
      finish();
      return;
    }
    st.step += 1;
    draw();
  };

  const finish = () => {
    const used = new Set(st.items.map((i) => i.personId));
    const people = st.people.filter((p) => used.has(p.id) || s.people.some((x) => x.id === p.id));
    const now = new Date();
    const renews = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    s.user = st.user;
    s.people = people;
    s.reminders = s.reminders.filter((r) => !st.items.some((i) => i.personId === r.personId && i.occId === r.occId && !r.custom));
    s.plan = {
      status: 'active', price: S.PLAN.price, since: now.toISOString(), renews: renews.toISOString(), method: st.method,
      prefs: { delivery: 'envio', lead: 7, channel: 'email' },
      ranges: { ...Object.fromEntries([...used].map((id) => [id, st.ranges[id] || 'r2'])) },
      items: st.items.map((i) => ({ id: i.id, personId: i.personId, occId: i.occId, custom: i.custom, status: 'pending', handle: null, changes: 0, delivery: null, round: 0 })),
    };
    S.save(s);
    app.innerHTML = `<section class="sform"><div class="wrapper wrapper--narrow">
      <p class="seyebrow">Listo</p>
      <h1 class="sform__title">Bienvenido al plan anual</h1>
      <p class="sform__lead">Tu plan está activo hasta el ${S.fmtDate(renews)}. Te avisaremos antes de cada fecha con el regalo propuesto, y ahí aceptas, cambias o pausas.</p>
      <div class="sform__actions"><a class="btn btn--solid btn--lg" href="mi-suscripcion.html">Ir a Mi suscripción</a><a class="btn btn--outline btn--lg" href="index.html">Seguir comprando</a></div>
      <p class="sform__fine">Demostración: no se cobró nada.</p></div></section>`;
    window.scrollTo({ top: 0 });
  };

  const draw = () => {
    app.innerHTML = `<section class="sform"><div class="wrapper wrapper--narrow">${stepper()}${views[st.step]()}</div></section>`;
    bind();
    if (st.msg) window.scrollTo({ top: Math.max(0, app.offsetTop), behavior: 'smooth' });
  };

  draw();
})();
