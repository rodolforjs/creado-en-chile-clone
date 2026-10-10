// Recordatorio de fechas (gratis): guarda persona y fecha en el navegador y muestra cómo sería el aviso.
(() => {
  const S = window.CEC_SUB;
  const $ = (s, r = document) => r.querySelector(s);
  const app = $('#subApp');
  const qs = new URLSearchParams(location.search);
  const preOcc = qs.get('oc') || '';
  const preProd = qs.get('p') ? S.product(qs.get('p')) : null;
  let s = S.load();

  const draw = () => {
    app.innerHTML = `<section class="sform"><div class="wrapper wrapper--narrow">
      <p class="seyebrow">Recordatorio gratis</p>
      <h1 class="sform__title">Guarda una fecha</h1>
      <p class="sform__lead">Unos días antes te enviamos un aviso con 3 ideas de regalo, filtradas para esa persona.</p>
      ${preProd ? `<div class="snotice">Guardaremos <b>${S.esc(preProd.t)}</b> como una de las ideas para esa fecha.</div>` : ''}
      <form id="remForm" novalidate>
        <fieldset class="sfs"><legend>¿Para quién es?</legend>
          <label class="sfield"><span>Nombre</span><input name="name" type="text" autocomplete="off" placeholder="Ej.: Carmen"></label>
          <label class="sfield"><span>Quién es para ti</span><select name="rel">${S.RELS.map((r) => `<option>${r}</option>`).join('')}</select></label>
          <div class="sfield"><span>Qué le gusta (opcional)</span><div class="chips">${S.tasteChips('tastes')}</div></div>
        </fieldset>
        <fieldset class="sfs"><legend>¿Qué fecha?</legend>
          <label class="sfield"><span>Ocasión</span><select name="occ">${S.occOptions(preOcc)}<option value="custom">Otra fecha (cumpleaños, aniversario)</option></select></label>
          <div id="customBox" hidden>
            <label class="sfield"><span>Nombre de la fecha</span><input name="clabel" type="text" placeholder="Ej.: Cumpleaños de Carmen"></label>
            <label class="sfield"><span>Día</span><input name="cdate" type="date"></label>
          </div>
        </fieldset>
        <fieldset class="sfs"><legend>Tu cuenta</legend>
          ${s.user ? `<p class="sform__acct">Guardaremos esto en la cuenta de <b>${S.esc(s.user.name)}</b> (${S.esc(s.user.email)}).</p>` : `
          <button class="gbtn" type="button" id="gDemo"><svg viewBox="0 0 18 18" aria-hidden="true"><path fill="#4285F4" d="M17.6 9.2c0-.6-.1-1.2-.2-1.8H9v3.4h4.8a4.1 4.1 0 0 1-1.8 2.7v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.5z"/><path fill="#34A853" d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.5-1.8.9-3.1.9-2.400 0-4.400-1.600-5.100-3.800H.9v2.300A9 9 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.900 10.700a5.400 5.400 0 0 1 0-3.400V5H.9a9 9 0 0 0 0 8z"/><path fill="#EA4335" d="M9 3.600c1.300 0 2.500.5 3.500 1.400l2.600-2.600A9 9 0 0 0 .9 5l3 2.300C4.600 5.200 6.600 3.600 9 3.600z"/></svg>Continuar con Google (demo)</button>
          <p class="sform__or">o con tu correo</p>
          <label class="sfield"><span>Nombre</span><input name="uname" type="text" autocomplete="off"></label>
          <label class="sfield"><span>Correo</span><input name="uemail" type="email" autocomplete="off"></label>`}
        </fieldset>
        <p class="sform__msg" id="msg" role="alert"></p>
        <button class="btn btn--solid btn--xl" type="submit">Guardar y avisarme</button>
        <p class="sform__fine">Demostración: los datos se quedan en este navegador.</p>
      </form></div></section>`;

    const f = $('#remForm');
    const toggle = () => { $('#customBox').hidden = f.elements.occ.value !== 'custom'; };
    f.elements.occ.addEventListener('change', toggle);
    toggle();
    const g = $('#gDemo');
    if (g) g.addEventListener('click', () => { f.elements.uname.value = 'Cuenta de demostración'; f.elements.uemail.value = 'demo@ejemplo.cl'; $('#msg').textContent = ''; });
    f.addEventListener('submit', (e) => { e.preventDefault(); submit(f); });
  };

  const submit = (f) => {
    const msg = $('#msg');
    const name = f.elements.name.value.trim();
    if (!name) { msg.textContent = 'Escribe el nombre de la persona.'; f.elements.name.focus(); return; }
    let custom = null;
    if (f.elements.occ.value === 'custom') {
      const label = f.elements.clabel.value.trim();
      const v = f.elements.cdate.value;
      if (!label || !v) { msg.textContent = 'Completa el nombre y el día de la fecha.'; return; }
      const [, m, d] = v.split('-').map(Number);
      custom = { label, m, d };
    }
    if (!s.user) {
      const un = f.elements.uname.value.trim();
      const ue = f.elements.uemail.value.trim();
      if (!un || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ue)) { msg.textContent = 'Necesitamos tu nombre y un correo válido (o usa Google).'; return; }
      s.user = { name: un, email: ue };
    }
    const person = { id: S.uid('p'), name, rel: f.elements.rel.value, tastes: S.readChecks(f, 'tastes') };
    s.people.push(person);
    const rem = { id: S.uid('r'), personId: person.id, occId: custom ? null : f.elements.occ.value, custom, ideas: preProd ? [preProd.h] : [] };
    s.reminders.push(rem);
    S.save(s);
    done(person, rem);
  };

  const done = (person, rem) => {
    const { name, date } = S.info(rem);
    const days = S.daysTo(date);
    const lead = Math.min(7, Math.max(0, days));
    const ideas = S.suggest({ tastes: person.tastes, range: 'r2', seed: person.id + rem.id, n: 3, exclude: rem.ideas });
    const shown = [...rem.ideas.map(S.product).filter(Boolean), ...ideas].slice(0, 3);
    app.innerHTML = `<section class="sform"><div class="wrapper wrapper--narrow">
      <p class="seyebrow">Listo</p>
      <h1 class="sform__title">Te avisamos por ${S.esc(person.name)}</h1>
      <p class="sform__lead">${S.esc(name)} es el ${S.fmtDate(date)} (${S.inDays(days)}). Te escribimos a ${S.esc(s.user.email)} ${lead} ${lead === 1 ? 'día' : 'días'} antes.</p>
      <h2 class="sform__h2">Así se vería tu aviso</h2>
      <div class="sform__gifts">${shown.map((p) => S.giftCard(p)).join('')}</div>
      <div class="sform__actions">
        <a class="btn btn--solid btn--lg" href="reserva.html?r=${rem.id}">Reservar uno de estos</a>
        <a class="btn btn--outline btn--lg" href="recordatorio.html">Guardar otra fecha</a>
        <a class="btn btn--outline btn--lg" href="suscripcion.html#planes">Ver el plan anual</a>
      </div>
      <p class="sform__fine">Tus fechas están en <a href="mi-suscripcion.html">Mi suscripción</a>.</p>
    </div></section>`;
    window.scrollTo({ top: 0 });
  };

  draw();
})();
