# Mapa del sitio actual — creadoenchile.cl

Explorado el 2026-10-09 (viewport 1440px). Plataforma: Shopify. Referencia: `arquitectura-web-creado-en-chile.html`, solo la parte "Hoy". Todo lo marcado como nuevo (Match, Mi Creado, Suscripción, Contextos) queda fuera de esta réplica.

## Elementos globales (en todas las páginas)

- **Barra de anuncios** (46px, rota mensajes): "ENVÍO GRATIS X compras sobre $60.000", "Regalos en 3 horas aquí", "6 a 12 cuotas sin interés".
- **Header** (130px): menú hamburguesa, logo, buscar, cuenta, carro. Menú desplegable con 15 enlaces.
- **Footer** (753px): los 15 enlaces del menú, Tiendas y horarios, Contacto (WhatsApp), Cambios y devoluciones, Nosotros, Ventas corporativas, Términos, Inscribe tu marca, Políticas. Además Instagram, idioma ES/EN, medios de pago.
- **Newsletter** (350px), previo al footer en el home.
- **WhatsApp flotante** (wa.me/56988899856).

## Home — orden de secciones y alto aprox.

| # | Sección | Alto | Notas |
|---|---|---|---|
| 1 | Anuncios | 46 | |
| 2 | Header | 130 | transparente sobre el hero |
| 3 | H1 SEO | 35 | "El mejor regalo con diseño e identidad local" |
| 4 | Hero slideshow | 389 | con puntos, banners Ofertas y Express |
| 5 | Botones por precio | 127 | 4 o más rangos: "Regalos entre $10.000 y $25.000", etc. |
| 6 | Lista de colecciones | 812 | Nuevos Aromas, Vasos de Gallo, Cerámica Gres, Posavasos |
| 7 | Ofertas: sólo esta semana | 676 | carrusel + "Ver más", etiqueta de % |
| 8 | Marquee | 44 | "Compra varias marcas en un solo despacho", "Conoce nuestras tiendas" |
| 9 | Bloque custom (brick) | 570 | imágenes |
| 10 | Imagen + texto: Regalos corporativos | 450 | |
| 11 | Novedades exclusivas | 677 | grilla + "Ver productos" |
| 12 | Fila de íconos | 179 | Diseño e identidad local, Miles de productos, Pagas un sólo envío, Apoyo y difusión |
| 13 | ¡Sabemos que te encantan! | 653 | vistos recientemente |
| 14 | Lista de colecciones | 587 | Joyas, Recuerdos de Chile, Quincho y Parrilla |
| 15 | Newsletter | 350 | 10% primera compra |
| 16 | ¿Por qué comprar? | 432 | imágenes superpuestas |
| 17 | Regalos con envío express | 642 | grilla |
| 18 | Slideshow de banners | 360 | |
| 19 | Marcas exclusivas | 474 | logos |
| 20 | 5 preguntas a… (texto) | 170 | |
| 21 | Blog: 9 tarjetas | 637 | |
| 22 | Footer | 753 | |

## Plantillas de página

### Colección (`/collections/<handle>`)
Ejemplo `mujer`: 399 productos, 9 páginas, paginación (1 2 3 … 9, "Siguiente »").
- Bloque de texto superior, barra sticky "Ordenar por" con conteo "N productos".
- Filtros: MARCA, COLOR, TALLA, TIPO, PRECIO.
- Grilla de 4 columnas (tarjeta 233x357 a 1440px; 2 columnas en móvil).
- **Tarjeta:** imagen, botón "COMPRA RÁPIDA", nombre, precio ($28,990), puntos de variantes de color y "+ N más", etiqueta de % en ofertas.
- Variantes: Ofertas, Envío Express (3 horas, con subcolecciones Mujer, Hombre, Infantil), + Vendido, Novedades, Por precio (7 rangos).

### Ficha de producto (`/collections/<c>/products/<p>`)
- Galería con lightbox (~15 imágenes posibles), marca (enlace a su colección), nombre, etiqueta "⚡ 3 HORAS", precio y % de descuento.
- Selector de color (con "Ver más / Ver menos"), cantidad, "Añadir al carrito", descripción.
- Secciones debajo: Te podría gustar (related), Visto recientemente.

### Carro (`/cart`)
Página "Tu Carrito", vacía: "Tu carrito está vacío" + colección sugerida. Con productos: lista, "Ir a pagar" (checkout de Shopify, fuera del alcance).

### Búsqueda (`/search?q=`)
Contador de resultados, ordenar (Relevancia, Precio), filtros, grilla con Compra rápida, paginación.

### Páginas de contenido (`/pages/...`)
- `encuentra-el-regalo-que-estas-buscando` — Guía de Regalos (11 accesos con imagen)
- `marcas-creado-en-chile` — Marcas exclusivas + lista A–Z
- `tiendas` — 8 tiendas con dirección, horario y mapa
- `sobre-creado-en-chile` — Nosotros (historia con video, valores, Reinserta, Creado x…, Imagen País)
- `regalos-corporativos` — Ventas corporativas + formulario "Cotiza tu proyecto"
- `terminos-y-condiciones` — 13 secciones (I a XIII)
- `inscr-bete-en-nuestra-base-de-datos` — postulaciones de marca (cerradas)
- `politica-de-ventas` — tarifas, envíos, medios de pago, retiro, cambios, stock
- `estado-de-mi-orden` — cambios y devoluciones (reversso.cl)

### Blog (`/blogs/news`)
Listado "Agenda y Noticias" con tarjetas de "5 preguntas a…", y artículo en formato entrevista.

## Taxonomía de categorías (15 enlaces del menú)

Ofertas · Envío Express · Guía de Regalos · Marcas · + Vendido · Por precio (7 rangos) · Novedades · Mujer · Hombre · Casa y Jardín · Mesa, Cocina, Quincho · Entretención y Souvenirs · Belleza y Bienestar · Gourmet · Infantil. Cada categoría tiene su submenú de subcolecciones (ver el HTML de arquitectura).

## Estado del clon (2026-10-10)

Hecho y medido contra el original a 1440, 820 y 390 px: inicio, plantilla de colección, ficha de producto, carro (vacío), búsqueda. Hecho sin medir: carro con productos y flujo de pedido (demostración).

Suscripción (propuesta nueva): landing, recordatorio gratis, reserva, alta del plan anual y Mi suscripción, con precios de ejemplo (ver README).

Mi Creado (propuesta nueva): acceso, inicio, personas, fechas, guardados, pedidos, direcciones y perfil.

Pendiente: páginas de contenido (hoy `page.html` es un comodín), blog, y los widgets de terceros de la ficha (reseñas, "comprados juntos", stock por tienda).
