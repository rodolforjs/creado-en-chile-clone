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
    quotas: 6,
    terms: false,
    msg: '',
  };
  if (s.plan && s.plan.status !== 'cancelled') { location.replace('mi-suscripcion.html'); return; }

  const stepper = () => `<ol class="sstepper">${STEPS.map((n, i) => `<li class="${i === st.step ? 'is-now' : i < st.step ? 'is-done' : ''}"><span>${i + 1}</span><b>${n}</b></li>`).join('')}</ol>`;
  const nav = (next = 'Continuar') => `<p class="sform__msg" role="alert">${st.msg}</p><div class="sform__actions sform__actions--split">${st.step ? '<button class="btn btn--outline btn--lg" type="button" data-back>Volver</button>' : '<a class="btn btn--outline btn--lg" href="suscripcion.html#planes">Cancelar</a>'}<button class="btn btn--solid btn--lg" type="button" data-next>${next}</button></div>`;
  const costOf = () => S.cost(st.items.map((i) => st.ranges[i.personId] || 'r2'));
  const drawCost = () => { const b = $('#costBox'); if (!b) return; const c = costOf(); b.innerHTML = `<div><span>${c.n} ${c.n === 1 ? 'regalo' : 'regalos'} prepagados</span><b>${S.fmt(c.total)}</b></div><div><span>Recargo por el plan</span><b>$0</b></div>`; };
  const itemInfo = (it) => { const p = st.people.find((x) => x.id === it.personId); return { p, ...S.info(it) }; };

  const views = [
    // 1 · Plan
    () => `<h1 class="sform__title">Plan anual</h1>
      <p class="sform__lead">Pagas por adelantado los regalos del año. Después, en cada fecha, eliges el que más le guste entre varias opciones.</p>
      <div class="splan splan--main splan--flat">
        <p class="splan__price">Pagas tus regalos del año <small>sin recargo</small></p>
        <ul class="splan__list">
          <li>Hasta ${S.PLAN.dates} fechas al año, con aviso a tiempo.</li>
          <li>En cada fecha eliges entre ${S.PLAN.options} regalos de tu rango de precio, y puedes pedir otras ${S.PLAN.options} ${S.PLAN.changes} vez.</li>
          <li>Envío gratis y bolsa de regalo en cada fecha.</li>
          <li>Pago en cuotas sin interés.</li>
        </ul>
        <p class="splan__fine">Si una fecha no se usa, queda en crédito o te la devolvemos. Si eliges un regalo más caro o más barato dentro del rango, se ajusta la diferencia.</p>
      </div>${nav()}`,
    // 2 · Cuenta
    () => `<h1 class="sform__title">Tu cuenta</h1>
      <p class="sform__lead">La necesitamos para guardar tus fechas y avisarte.</p>
      <div id="acctBox"></div>
      ${nav()}`,
    // 3 · Personas y fechas
    () => {
      const full = st.items.length >= S.PLAN.dates;
      return `<h1 class="sform__title">Personas y fechas</h1>
      <p class="sform__lead">Agrega a quién le regalas y en qué fecha. Tu plan incluye ${S.PLAN.dates} fechas al año.</p>
      <p class="scount"><b>${st.items.length}</b> de ${S.PLAN.dates} fechas</p>
      <ul class="sitems">${st.items.map((it, i) => { const x = itemInfo(it); return `<li><div><b>${S.esc(x.p ? x.p.name : '')}</b> <span>${S.esc(x.p ? x.p.rel : '')}</span><p>${S.esc(x.name)} · ${S.fmtDate(x.date)}</p></div><button class="link-underline" type="button" data-del="${i}">Quitar</button></li>`; }).join('') || '<li class="sitems__empty">Aún no agregas fechas.</li>'}</ul>
      ${full ? '' : `<fieldset class="sfs"><legend>Agregar una fecha</legend>
        <label class="sfield"><span>Persona</span><select id="aPerson">${st.people.map((p) => `<option value="${p.id}">${S.esc(p.name)} (${S.esc(p.rel)})</option>`).join('')}<option value="new">Persona nueva</option></select></label>
        <div id="aNew">
          <label class="sfield"><span>Nombre</span><input id="aName" type="text" autocomplete="off"></label>
          <label class="sfield"><span>Quién es para ti</span><select id="aRel">${S.RELS.map((r) => `<option>${r}</option>`).join('')}</select></label>
          <div class="sfield"><span>Qué le gusta (opcional)</span><div class="chips" id="aTastes">${S.tasteChips('tastes')}</div></div>
        </div>
        <label class="sfield"><span>Ocasión</span><select id="aOcc">${S.occOptions()}<option value="custom">Otra fecha (cumpleaños, aniversario)</option></select></label>
        <div id="aCustom" hidden>
          <label class="sfield"><span>Nombre de la fecha</span><input id="aLabel" type="text" placeholder="Ej.: Cumpleaños de Carmen"></label>
          <label class="sfield"><span>Día</span><input id="aDate" type="date"></label>
        </div>
        <button class="btn btn--outline btn--md" type="button" id="aAdd">Agregar fecha</button>
      </fieldset>`}${nav()}`;
    },
    // 4 · Rango
    () => {
      const ids = [...new Set(st.items.map((i) => i.personId))];
      return `<h1 class="sform__title">Rango de precio</h1>
      <p class="sform__lead">Elige cuánto quieres gastar por regalo en cada persona. En cada fecha verás 6 opciones de ese rango para elegir.</p>
      <div class="scost" id="costBox"></div>
      ${ids.map((id) => { const p = st.people.find((x) => x.id === id); const cur = st.ranges[id] || 'r2'; return `<fieldset class="sfs"><legend>${S.esc(p.name)} <span>${S.esc(p.rel)}</span></legend><div class="sranges">${S.RANGES.map((r) => `<label class="srange ${cur === r.id ? 'is-on' : ''}"><input type="radio" name="rg-${id}" value="${r.id}" ${cur === r.id ? 'checked' : ''}><b>${r.label}</b></label>`).join('')}</div></fieldset>`; }).join('')}
      ${nav()}`;
    },
    // 5 · Pago
    () => `<h1 class="sform__title">Pago</h1>
      <p class="sform__lead">Revisa el resumen y confirma. Es una demostración: no se cobra nada.</p>
      ${(() => { const c = costOf(); return `<div class="ssum">${st.items.map((i) => { const x = itemInfo(i); return `<div><span>${S.esc(x.p ? x.p.name : '')} · ${S.esc(x.name)}</span><b>${S.fmt(S.rangeOf(st.ranges[i.personId] || 'r2').value)}</b></div>`; }).join('')}<div><span>Envío y bolsa de regalo</span><b>Incluidos</b></div><div class="ssum__tot"><span>Pagas hoy</span><b>${S.fmt(c.total)}</b></div></div>
      <p class="scost__note">Por cada fecha elegirás entre ${S.PLAN.options} regalos de tu rango. Lo que no uses queda en crédito o te lo devolvemos.</p>`; })()}
      <label class="sfield"><span>Cuotas</span><select id="quotas">${[1, 3, 6, 12].map((n) => `<option value="${n}" ${st.quotas === n ? 'selected' : ''}>${n === 1 ? 'Un pago' : `${n} cuotas sin interés`}${n > 1 ? ` de ${S.fmt(costOf().total / n)}` : ''}</option>`).join('')}</select></label>
      <fieldset class="sfs"><legend>Medio de pago</legend><div class="sranges">${[['webpay', 'Webpay'], ['card', 'Tarjeta de crédito'], ['mp', 'Mercado Pago']].map(([v, l]) => `<label class="srange ${st.method === v ? 'is-on' : ''}"><input type="radio" name="pay" value="${v}" ${st.method === v ? 'checked' : ''}><b>${l}</b></label>`).join('')}</div></fieldset>
      <label class="check check--block"><input type="checkbox" id="terms" ${st.terms ? 'checked' : ''}><span class="check__box"></span><span class="check__label">Acepto las condiciones del plan (ejemplo para la práctica).</span></label>
      ${nav(`Pagar ${S.fmt(costOf().total)} (demo)`)}`,
  ];

  const bind = () => {
    app.querySelector('[data-back]')?.addEventListener('click', () => { st.step -= 1; st.msg = ''; draw(); });
    app.querySelector('[data-next]')?.addEventListener('click', next);
    if (st.step === 1) {
      const box = $('#acctBox');
      if (st.user) box.innerHTML = `<p class="sform__acct">Seguirás con la cuenta de <b>${S.esc(st.user.name)}</b> (${S.esc(st.user.email)}).</p>`;
      else S.loginBox(box, (u) => { st.user = u; st.msg = ''; st.step = 2; draw(); });
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
    if (st.step === 3) drawCost();
    if (st.step === 3) app.querySelectorAll('.srange input').forEach((i) => i.addEventListener('change', () => { st.ranges[i.name.slice(3)] = i.value; drawCost(); app.querySelectorAll(`input[name="${i.name}"]`).forEach((x) => x.closest('.srange').classList.toggle('is-on', x.checked)); }));
    if (st.step === 4) {
      app.querySelectorAll('input[name=pay]').forEach((i) => i.addEventListener('change', () => { st.method = i.value; app.querySelectorAll('input[name=pay]').forEach((x) => x.closest('.srange').classList.toggle('is-on', x.checked)); }));
      $('#quotas').addEventListener('change', (e) => { st.quotas = +e.target.value; });
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
    if (st.step === 1 && !st.user) { st.msg = 'Entra con Google, shop o tu correo para continuar.'; draw(); return; }
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
      status: 'active', price: costOf().total, quotas: st.quotas, since: now.toISOString(), renews: renews.toISOString(), method: st.method,
      prefs: { delivery: 'envio', lead: 7, channel: 'email' },
      ranges: { ...Object.fromEntries([...used].map((id) => [id, st.ranges[id] || 'r2'])) },
      items: st.items.map((i) => ({ id: i.id, personId: i.personId, occId: i.occId, custom: i.custom, status: 'pending', handle: null, changes: 0, delivery: null, round: 0, value: S.rangeOf(st.ranges[i.personId] || 'r2').value })),
    };
    S.save(s);
    app.innerHTML = `<section class="sform"><div class="wrapper wrapper--narrow">
      <p class="seyebrow">Listo</p>
      <h1 class="sform__title">Tus regalos del año están pagados</h1>
      <p class="sform__lead">Tu plan está activo hasta el ${S.fmtDate(renews)}. Te avisaremos antes de cada fecha con 6 opciones de tu rango, y ahí eliges la que más te guste.</p>
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
