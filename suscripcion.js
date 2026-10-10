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
})();
