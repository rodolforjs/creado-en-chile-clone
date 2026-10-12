// Teaser digital: lo que ve quien recibe el aviso. No revela el regalo.
(() => {
  const S = window.CEC_SUB;
  const X = window.CEC_CTX;
  const I = window.CEC_I18N;
  const esc = S.esc;
  const qs = new URLSearchParams(location.search);
  const lang = ['es', 'en', 'pt'].includes(qs.get('l')) ? qs.get('l') : 'es';
  const from = (qs.get('de') || '').slice(0, 40);
  const ctx = X.byId(qs.get('m'));
  const app = document.getElementById('subApp');
  const KEY = 'cec_taste_hint';
  let saved = [];
  try { saved = JSON.parse(localStorage.getItem(KEY)) || []; } catch { saved = []; }
  const draw = (done) => {
    app.innerHTML = `<section class="mt"><div class="wrapper wrapper--narrow">
      <div class="regalo"><div class="regalo__box ph ph--product" data-ph="?" data-nt><span aria-hidden="true">🎁</span></div>
      <p class="seyebrow">Teaser</p>
      <h1 class="sform__title">${from ? `${esc(from)} te está preparando un regalo` : 'Alguien te está preparando un regalo'}</h1>
      <p class="sform__lead"><span>Pronto sabrás qué es.</span>${ctx ? ` <span>Viene pensado para:</span> <b>${esc(ctx.label)}</b>.` : ''}</p>
      <fieldset class="sfs"><legend>¿Quieres darle una pista?</legend><p class="sform__fine">Elige lo que te gusta y se lo contamos para que acierte. No se guarda ninguna cuenta.</p>
      <div class="chips" id="rg">${S.tasteChips('rg', saved)}</div>
      <div class="sacct__actions"><button class="btn btn--solid btn--md" type="button" id="rgSave">Guardar mis gustos</button><a class="btn btn--outline btn--md" href="index.html">Conocer Creado en Chile</a></div>
      <p class="sform__msg" role="status">${done ? 'Listo. En esta demostración tus gustos quedan en tu navegador.' : ''}</p></fieldset></div></div></section>`;
    if (I) I.apply(app, lang);
    document.getElementById('rgSave').addEventListener('click', () => { saved = S.readChecks(document.getElementById('rg'), 'rg'); try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch { /* sin storage */ } draw(true); });
  };
  draw(false);
})();
