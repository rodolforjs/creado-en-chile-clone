// Fotos reales de producto, enlazadas desde el CDN de Shopify (data/images.js).
// Cualquier `.ph[data-img="<handle>"]` recibe su foto; el placeholder queda debajo si no hay foto o falla la carga.
(() => {
  const MAP = window.CEC_IMG || {};
  const url = (spec, w) => {
    const [kind, ...rest] = spec.split('/');
    const file = rest.join('/');
    const [pathPart, qs] = file.split('?');
    const sized = w ? pathPart.replace(/(\.\w+)$/, `_${w}x$1`) : pathPart;
    return `https://cdn.shopify.com/s/files/1/1481/4916/${kind === 'f' ? 'files' : 'products'}/${sized}${qs ? `?${qs}` : ''}`;
  };
  // handle -> URL (n = 0 es la foto principal; n > 0 sale de images-extra.js)
  window.CEC_IMGU = (h, w = 600, n = 0) => {
    const spec = n ? ((window.CEC_IMG_X || {})[h] || [])[n - 1] : MAP[h];
    return spec ? url(spec, w) : '';
  };
  const put = (el) => {
    if (el.dataset.imgDone) return;
    el.dataset.imgDone = '1';
    const src = window.CEC_IMGU(el.dataset.img, +el.dataset.imgW || 600, +el.dataset.imgN || 0);
    if (!src) return;
    const img = new Image();
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.addEventListener('load', () => el.classList.add('has-img'));
    img.addEventListener('error', () => img.remove());
    img.src = src;
    el.append(img);
  };
  const scan = (root) => {
    if (root.nodeType !== 1) return;
    if (root.matches('.ph[data-img]')) put(root);
    root.querySelectorAll('.ph[data-img]').forEach(put);
  };
  // tarjetas estáticas del inicio: la foto sale del handle del botón de compra rápida
  const tagStatic = () => document.querySelectorAll('.pgi__quick[data-handle]').forEach((b) => {
    const ph = b.closest('.pgi') && b.closest('.pgi').querySelector('.ph');
    if (ph && !ph.dataset.img) ph.dataset.img = b.dataset.handle;
  });
  const start = () => {
    tagStatic();
    scan(document.body);
    new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach(scan))).observe(document.body, { childList: true, subtree: true });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
