// Inicio: los 6 contextos y tres mini paquetes (sin cargar el catálogo completo).
(() => {
  const X = window.CEC_CTX;
  const P = window.CEC_PACKS || {};
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (n) => '$' + Math.round(n).toLocaleString('en-US');
  const tiles = document.getElementById('hctxTiles');
  tiles.innerHTML = X.LIST.map((c) => `<a class="mtile mtile--sm" href="contexto.html?c=${c.id}"><span class="mtile__img ph ph--product" data-ph="${esc(c.label)}"></span><span class="mtile__t">${esc(c.label)}</span></a>`).join('');
  // un paquete de ~$40.000 de tres escenas distintas
  const picks = ['desayuno', 'casa-nueva', 'viaje'].map((id) => (P[id] || [])[1]).filter(Boolean);
  document.getElementById('hctxPacks').innerHTML = picks.map((pk) => `<article class="cpack"><div class="cpack__thumbs">${pk.items.map((i) => `<div class="ph ph--product" data-ph="${esc(i.v)}" data-img="${esc(i.h)}" data-img-w="300"></div>`).join('')}</div>
    <div class="cpack__body"><p class="cpack__label">Mini paquete</p><h3 class="cpack__name">${esc(pk.name)}</h3>
    <ul class="cpack__items">${pk.items.map((i) => `<li><a href="product.html?p=${encodeURIComponent(i.h)}">${esc(i.t)}</a> <span>${fmt(i.p)}</span></li>`).join('')}</ul>
    <div class="cpack__foot"><b>${fmt(pk.total)}</b><button class="btn btn--solid btn--md" type="button" data-pack="${pk.id}">Agregar la escena al carro</button></div></div></article>`).join('');
  document.getElementById('hctxPacks').addEventListener('click', (e) => {
    const b = e.target.closest('[data-pack]');
    if (!b) return;
    const pk = picks.find((x) => x.id === b.dataset.pack);
    pk.items.forEach((i) => window.CEC.addToCart({ handle: i.h, title: i.t, price: i.p, express: !!i.x }, false));
    window.CEC.openCart();
  });
})();
