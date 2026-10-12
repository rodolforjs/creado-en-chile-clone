// Landing de Suscripción: tarjeta de próxima fecha, calendario y precio del plan (datos de ejemplo).
(() => {
  const S = window.CEC_SUB;
  const $ = (s) => document.querySelector(s);
  const up = S.upcoming();
  const first = up[0];

  $('#planPrice').innerHTML = `Desde ${S.fmt(S.cost(Array(S.PLAN.dates).fill('r1')).total)} <small>al año</small>`;
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
    const r = S.rangeOf(cs.r);
    $('#calcOut').innerHTML = `<div class="scalc__row"><span>${cs.n} ${cs.n === 1 ? 'regalo' : 'regalos'} de ${S.fmt(r.value)} <small>(eliges entre 6 opciones de ${r.label})</small></span><b>${S.fmt(c.total)}</b></div>
      <div class="scalc__row"><span>Recargo por el plan</span><b>$0</b></div>
      <div class="scalc__row scalc__row--total"><span>Pagas hoy</span><b>${S.fmt(c.total)}</b></div>
      <p class="scalc__fine">O en 6 cuotas sin interés de ${S.fmt(c.total / 6)}. Incluye envío gratis y bolsa de regalo en cada fecha (te ahorras unos ${S.fmt(c.ship)} de despacho, de ejemplo).</p>`;
  };
  $('#calc').addEventListener('click', (e) => {
    const b = e.target.closest('[data-n]');
    if (b) { cs.n = Math.min(S.PLAN.dates, Math.max(1, cs.n + +b.dataset.n)); drawCalc(); }
  });
  $('#calc').addEventListener('change', (e) => { if (e.target.name === 'cr') { cs.r = e.target.value; drawCalc(); } });
  drawCalc();
})();
