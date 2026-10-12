// Inicio: los contextos y tres mini paquetes (sin cargar el catálogo completo).
(() => {
  const X = window.CEC_CTX;
  const P = window.CEC_PACKS || {};
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (n) => '$' + Math.round(n).toLocaleString('en-US');
  const tiles = document.getElementById('hctxTiles');
  tiles.innerHTML = X.LIST.map((c) => `<a class="mtile mtile--sm" href="contexto.html?c=${c.id}"><span class="mtile__img ph ph--product" data-ph="${esc(c.label)}"></span><span class="mtile__t">${esc(c.label)}</span></a>`).join('');
  // un paquete de ~$40.000 de tres escenas distintas
  const picks = ['desayuno', 'casa-nueva', 'viaje'].map((id) => ({ ...(P[id] || [])[1], ctx: id })).filter((x) => x.items);
  window.CEC_BOX.mount(document.getElementById('hctxPacks'), picks, {});
})();
