// Reserva de la próxima fecha (sin plan): se elige el objeto ahora y se cobra solo si se activa cerca de la fecha.
(() => {
  const S = window.CEC_SUB;
  const $ = (s, r = document) => r.querySelector(s);
  const app = $('#subApp');
  const qs = new URLSearchParams(location.search);
  let s = S.load();

  // Compra reciente (la guarda order.js al confirmar un pedido): conecta el regalo con lo que compró hoy
  let last = null;
  try { last = JSON.parse(localStorage.getItem('cec_last_buy')); } catch { /* sin compra */ }
  const lastProd = last && last.handle ? S.product(last.handle) : null;
  const tastesOf = (p) => (p ? S.TASTES.filter((t) => t.re.test(`${p.t} ${p.ty || ''} ${(p.tg || []).join(' ')}`)).map((t) => t.id) : []);

  const rem = s.reminders.find((r) => r.id === qs.get('r'));
  const st = { occ: rem && rem.occId ? rem.occId : S.upcoming()[0].id, range: 'r2', pick: null, round: 0 };
  const person = rem ? S.personOf(s, rem.personId) : null;
  const tastes = person && person.tastes.length ? person.tastes : tastesOf(lastProd);

  const options = () => S.suggest({ tastes, range: st.range, seed: `res-${st.occ}-${st.range}-${st.round}`, n: 6 });
  let list = options();

  const draw = () => {
    const o = S.occ(st.occ);
    const date = S.nextDate(o);
    app.innerHTML = `<section class="sform"><div class="wrapper wrapper--narrow">
      <p class="seyebrow">Sin suscribirte</p>
      <h1 class="sform__title">Reserva la próxima fecha</h1>
      <p class="sform__lead">Elige hoy el regalo y olvídate. No pagas ahora: cerca de la fecha te preguntamos “¿lo activamos?”. Si no lo activas, no se cobra nada.</p>
      ${s.reservation ? `<div class="snotice">Ya tienes una reserva (${S.esc(S.info(s.reservation).name)}). Si reservas otra, reemplaza a la anterior.</div>` : ''}
      ${lastProd ? `<div class="snotice">Conectado con tu compra: <b>${S.esc(lastProd.t)}</b>. Por eso te mostramos ideas en la misma línea.</div>` : ''}
      <div class="sform__row">
        <label class="sfield"><span>Ocasión</span><select id="rOcc">${S.occOptions(st.occ)}</select></label>
        <label class="sfield"><span>Rango de precio</span><select id="rRange">${S.RANGES.map((r) => `<option value="${r.id}" ${r.id === st.range ? 'selected' : ''}>${r.label}</option>`).join('')}</select></label>
      </div>
      <h2 class="sform__h2">Elige el objeto para el ${S.fmtDate(date)}</h2>
      <div class="spick" role="radiogroup" aria-label="Regalos sugeridos">${list.map((p) => `<label class="spick__item ${st.pick === p.h ? 'is-on' : ''}"><input type="radio" name="gift" value="${S.esc(p.h)}" ${st.pick === p.h ? 'checked' : ''}>${S.giftCard(p, '', false)}<span class="spick__mark">Elegido</span></label>`).join('')}</div>
      <button class="spick__more" type="button" id="rMore">Ver otras ideas</button>
      <p class="sform__msg" id="msg" role="alert"></p>
      <button class="btn btn--solid btn--xl" type="button" id="rGo">Reservar sin pagar ahora</button>
      <p class="sform__fine">Entrega o retiro se define al activar. Demostración: no se envía nada.</p>
    </div></section>`;
    $('#rOcc').addEventListener('change', (e) => { st.occ = e.target.value; st.pick = null; st.round = 0; list = options(); draw(); });
    $('#rRange').addEventListener('change', (e) => { st.range = e.target.value; st.pick = null; st.round = 0; list = options(); draw(); });
    $('#rMore').addEventListener('click', () => { st.round += 1; st.pick = null; list = options(); draw(); });
    app.querySelectorAll('input[name=gift]').forEach((i) => i.addEventListener('change', () => { st.pick = i.value; app.querySelectorAll('.spick__item').forEach((l) => l.classList.toggle('is-on', l.contains(i))); $('#msg').textContent = ''; }));
    $('#rGo').addEventListener('click', go);
  };

  const go = () => {
    if (!st.pick) { $('#msg').textContent = 'Elige uno de los regalos para reservar.'; return; }
    s.reservation = { id: S.uid('v'), occId: st.occ, custom: null, handle: st.pick, range: st.range, status: 'reserved', createdAt: new Date().toISOString(), personId: person ? person.id : null };
    S.save(s);
    const p = S.product(st.pick);
    const date = S.nextDate(S.occ(st.occ));
    app.innerHTML = `<section class="sform"><div class="wrapper wrapper--narrow">
      <div class="gtags sform__tag">${S.tag('Reservado', S.fmtShort(date), { drop: true })}</div>
      <h1 class="sform__title">Tu regalo para ${S.esc(S.occ(st.occ).name)} quedó reservado</h1>
      <p class="sform__lead">Es el ${S.fmtDate(date)}. No se cobró nada. Unos días antes te preguntaremos si lo activamos, y ahí eliges entrega o retiro.</p>
      <div class="sform__gifts sform__gifts--one">${S.giftCard(p)}</div>
      <div class="sform__actions">
        <a class="btn btn--solid btn--lg" href="mi-suscripcion.html">Ver mi reserva</a>
        <a class="btn btn--outline btn--lg" href="suscripcion.html#planes">Conocer el plan anual</a>
        <a class="btn btn--outline btn--lg" href="index.html">Seguir comprando</a>
      </div>
    </div></section>`;
    window.scrollTo({ top: 0 });
  };

  draw();
})();
