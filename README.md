# Creado en Chile — Réplica de práctica

Réplica de práctica de [creadoenchile.cl](https://creadoenchile.cl/) (inicio, colecciones, ficha, carro, búsqueda y páginas auxiliares) en HTML, CSS y JavaScript puros. Objetivo: igualar estructura, medidas y flujo del original. Lo que no tenemos (fotos, logo, productos extra) se reemplaza por **placeholders del mismo tamaño y forma**.

Medidas verificadas contra el sitio real a 1440, 820 y 390 px. Inicio: alturas de sección dentro de ±3 px, salvo dos secciones móviles (Ofertas −22 px, Novedades +20 px). Colección, ficha, carro vacío y búsqueda: posiciones y alturas dentro de ±5 px, salvo el contenido de cada fila (que depende de qué productos salgan) (ver `docs/mapa-sitio.md`). En tablet (768–1023 px) colección y búsqueda mantienen la barra lateral de filtros; el drawer de filtros solo aparece bajo 768 px. No hay carrito real, checkout ni backend: el carro y el newsletter funcionan solo en el navegador.

Incluye barra de anuncios con ticker, header con desplegables, header compacto al hacer scroll, drawer móvil, búsqueda, hero con puntos, botones por precio, listas de colecciones, tarjetas con compra rápida, marquee, fila de íconos, newsletter, marcas con carrusel, blog, footer, WhatsApp flotante y popup del 10%.

## Páginas

| Archivo | Qué es |
|---|---|
| `index.html` | Inicio |
| `collection.html?c=<handle>` | Plantilla de colección (filtros, orden, paginación de 48) |
| `product.html?p=<handle>` | Ficha de producto |
| `cart.html` | Página del carro (el drawer del carro está en todas las páginas) |
| `pedido.html` | Finalizar compra y confirmación (demostración, no envía datos) |
| `search.html?q=<texto>` | Resultados de búsqueda (misma plantilla de colección) |
| `page.html?p=<slug>` | Páginas que aún no están en la réplica |

Los productos salen de `data/catalog.js` (textos, marcas, precios y pertenencia a colecciones tomados del sitio real, sin imágenes: todas son placeholders). Las descripciones completas de la ficha están en `data/descriptions.js`. Todas las colecciones enlazadas tienen sus productos reales; `creado-x` está vacía también en el original. El carro se guarda en `localStorage`. No se replicaron los widgets de terceros de la ficha (reseñas, "comprados juntos", stock por tienda), por lo que la página de producto queda más corta que el original. La búsqueda es textual simple: el original usa el motor de Shopify y devuelve más resultados.

## Estructura

```
*.html          # Páginas generadas con encabezado, drawers y pie compartidos
styles.css      # Estilos de todas las páginas
script.js       # Header, drawers, carro, popup, newsletter (compartido)
home.js         # Hero y carrusel de marcas
collection.js   # Filtros, orden y paginación (también la búsqueda)
product.js      # Ficha de producto
cart.js / order.js / page.js
data-helpers.js # Tarjeta de producto compartida
data/catalog.js # Catálogo de práctica
data/descriptions.js # Descripciones completas (HTML simplificado) para la ficha
docs/           # Mapa del sitio original
assets/img/     # Fotos de la primera versión (ya no se usan)
```

## Ver en local

Sirve la carpeta con cualquier servidor estático (abrir los HTML con `file://` también funciona):

```bash
python3 -m http.server 8000
```

## Publicado con GitHub Pages

Este repo se publica vía GitHub Pages desde la rama `main`.
