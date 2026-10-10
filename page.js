// Página genérica para rutas que todavía no están en la réplica.
(() => {
  const NAMES = {
    tiendas: 'Tiendas y horarios', 'nuestras-tiendas': 'Tiendas y horarios', 'sobre-creado-en-chile': 'Nosotros', 'regalos-corporativos': 'Ventas corporativas',
    'terminos-y-condiciones': 'Términos y condiciones', 'inscr-bete-en-nuestra-base-de-datos': 'Inscribe tu marca a nuestra BB.DD', 'politica-de-ventas': 'Políticas, cambios y formas de pago',
    'estado-de-mi-orden': 'Cambios y devoluciones', 'encuentra-el-regalo-que-estas-buscando': 'Guía de regalos', 'marcas-creado-en-chile': 'Marcas', account: 'Mi cuenta',
  };
  const slug = new URLSearchParams(location.search).get('p') || '';
  const pretty = (s) => s.replace(/^blog-/, '').replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());
  const title = NAMES[slug] || (slug.startsWith('blog-') ? pretty(slug) : pretty(slug || 'Página'));
  document.title = `${title} | Creado en Chile`;
  document.getElementById('pgTitle').textContent = title;
  document.getElementById('pgTxt').textContent = 'Esta página todavía no forma parte de la réplica. Por ahora están el inicio, las colecciones, la ficha de producto, el carro y la confirmación.';
})();
