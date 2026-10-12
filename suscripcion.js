// Landing de Suscripción: tarjeta de próxima fecha, calendario y precio del plan (datos de ejemplo).
(() => {
  const S = window.CEC_SUB;
  const $ = (s) => document.querySelector(s);
  const up = S.upcoming();
  const first = up[0];

  $('#planPrice').innerHTML = `${S.fmt(S.PLAN.price)} <small>al año</small>`;
  $('#planDates').textContent = S.PLAN.dates;

  const gifts = S.suggest({ tastes: ['casa', 'mesa', 'gourmet'], range: 'r2', seed: `hero-${first.id}`, n: 3 });
  $('#heroCard').innerHTML = `<p class="shcard__label">Próxima fecha</p>
    <h2 class="shcard__title">${S.esc(first.name)}</h2>
    <p class="shcard__when">${S.fmtDate(first.date)} · ${S.inDays(S.daysTo(first.date))}</p>
    <p class="shcard__label">Así se ve tu aviso</p>
    <div class="shcard__gifts">${gifts.map((p) => S.giftCard(p)).join('')}</div>`;

  $('#calList').innerHTML = up.map((o) => `<li class="scal__item">
    <div class="scal__date"><b>${o.date.getDate()}</b><span>${S.fmtShort(o.date).split(' ')[1]}</span></div>
    <div class="scal__body"><h3>${S.esc(o.name)}</h3><p>${S.esc(o.blurb)}</p></div>
    <p class="scal__in">${S.inDays(S.daysTo(o.date))}</p>
    <a class="scal__link link-underline" href="recordatorio.html?oc=${o.id}">Guardar</a>
  </li>`).join('');

  // calculadora: servicio hoy + regalos después
  const cs = { n: S.PLAN.dates, r: 'r2' };
  const drawCalc = () => {
    $('#calcN').value = cs.n;
    $('#calcR').innerHTML = S.RANGES.map((r) => `<label class="srange ${cs.r === r.id ? 'is-on' : ''}"><input type="radio" name="cr" value="${r.id}" ${cs.r === r.id ? 'checked' : ''}><b>${r.label}</b></label>`).join('');
    const c = S.cost(Array(cs.n).fill(cs.r));
    $('#calcOut').innerHTML = `<div class="scalc__row"><span>Hoy pagas el plan</span><b>${S.fmt(S.PLAN.price)}</b></div>
      <div class="scalc__row scalc__row--later"><span>Después, ${cs.n} regalos <small>(uno por fecha, al aceptarlo)</small></span><b>${S.fmt(c.min)} a ${S.fmt(c.max)}</b></div>
      <div class="scalc__row scalc__row--total"><span>Total del año</span><b>${S.fmt(c.planMin)} a ${S.fmt(c.planMax)}</b></div>
      <p class="scalc__fine">Con el plan te ahorras el despacho de cada fecha (unos ${S.fmt(c.ship)} en total, de ejemplo). Si pausas una fecha, ese regalo no se cobra.</p>`;
  };
  $('#calc').addEventListener('click', (e) => {
    const b = e.target.closest('[data-n]');
    if (b) { cs.n = Math.min(S.PLAN.dates, Math.max(1, cs.n + +b.dataset.n)); drawCalc(); }
  });
  $('#calc').addEventListener('change', (e) => { if (e.target.name === 'cr') { cs.r = e.target.value; drawCalc(); } });
  drawCalc();
})();
