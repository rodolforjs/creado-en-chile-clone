// Votar la lista corta (demostración): quien recibe el enlace marca cuáles le gustan y envía sus votos por WhatsApp.
// No hay servidor: los votos viven en el navegador de quien vota y solo salen por el mensaje.
(() => {
  const S = window.CEC_SUB;
  const U = window.CEC_UI;
  const I = window.CEC_I18N;
  const esc = S.esc;
  const qs = new URLSearchParams(location.search);
  const lang = ['es', 'en', 'pt'].includes(qs.get('lang')) ? qs.get('lang') : 'es';
  const from = (qs.get('de') || '').slice(0, 40);
  const who = (qs.get('p') || '').slice(0, 40);
  const handles = (qs.get('l') || '').split(',').filter((h) => U.byHandle[h]).slice(0, 8);
  const app = document.getElementById('subApp');
  const KEY = `cec_votes_${handles.join('|').slice(0, 120)}`;
  let votes = {};
  try { votes = JSON.parse(localStorage.getItem(KEY)) || {}; } catch { votes = {}; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(votes)); } catch { /* sin storage */ } };
  const tr = (t) => (I ? I.tr(t, lang) : t);
  const isSos = (p) => U.expressSet.has(p.i);

  const draw = () => {
    const items = handles.map((h) => U.byHandle[h]);
    const yes = items.filter((p) => votes[p.h] === 'y');
    const no = items.filter((p) => votes[p.h] === 'n');
    const text = `${tr('Mis votos para tu regalo')}: ♥ ${yes.map((p) => p.t).join(', ') || '—'}${no.length ? ` · ✕ ${no.map((p) => p.t).join(', ')}` : ''}`;
    app.innerHTML = `<section class="mt"><div class="wrapper">
      <div class="gtags">${S.tag('Ayúdame a elegir', who ? who : '', {})}</div>
      <h1 class="sform__title">${from ? `${esc(from)} necesita tu ayuda para elegir un regalo` : 'Necesitamos tu ayuda para elegir un regalo'}</h1>
      ${items.length ? `<p class="sform__lead">Marca los que te gustan. Nadie verá tus votos hasta que los envíes.</p>
      <ul class="vgrid">${items.map((p) => `<li class="vcard ${votes[p.h] === 'y' ? 'is-yes' : votes[p.h] === 'n' ? 'is-no' : ''}">
        <a class="vcard__img" href="${window.CEC.url.product(p.h)}" target="_blank" rel="noopener"><div class="ph ph--product" data-ph="${esc(p.v)}" data-img="${esc(p.h)}" data-img-w="600" data-nt></div></a>
        <div class="vcard__body"><p class="vcard__brand" data-nt>${esc(p.v || '')}</p><a class="vcard__t" href="${window.CEC.url.product(p.h)}" target="_blank" rel="noopener" data-nt>${esc(p.t)}</a>
        <p class="vcard__p" data-nt>${U.fmt(p.p)}</p>
        <div class="vcard__btns"><button type="button" class="btn ${votes[p.h] === 'y' ? 'btn--solid' : 'btn--outline'} btn--md" data-v="y" data-h="${esc(p.h)}" aria-pressed="${votes[p.h] === 'y'}"><span aria-hidden="true">♥</span> Me gusta</button><button type="button" class="btn ${votes[p.h] === 'n' ? 'btn--solid' : 'btn--outline'} btn--md" data-v="n" data-h="${esc(p.h)}" aria-pressed="${votes[p.h] === 'n'}">Mejor no</button></div></div></li>`).join('')}</ul>
      <section class="vsend"><h2 class="mh">Tus votos</h2><p class="vsend__sum" data-nt>♥ ${yes.length} · ✕ ${no.length}</p>
        ${yes.length || no.length ? `<a class="btn btn--solid btn--lg" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(text)}">Enviar mis votos por WhatsApp</a>` : '<p class="sform__fine">Marca al menos uno para poder enviar.</p>'}
        <p class="sform__fine">En esta demostración los votos no llegan solos: se envían por WhatsApp.</p></section>`
      : '<p class="sform__lead">Aún no hay regalos para votar. Pide que te manden el enlace de nuevo.</p>'}
    </div></section>`;
    if (I) I.apply(app, lang);
  };
  app.addEventListener('click', (e) => {
    const b = e.target.closest('[data-v]');
    if (!b) return;
    votes[b.dataset.h] = votes[b.dataset.h] === b.dataset.v ? undefined : b.dataset.v;
    if (!votes[b.dataset.h]) delete votes[b.dataset.h];
    save();
    const y = window.scrollY; draw(); window.scrollTo({ top: y });
  });
  draw();
})();
