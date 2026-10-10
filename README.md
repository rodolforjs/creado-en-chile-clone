# Creado en Chile — Réplica de práctica

Réplica de práctica del **inicio** de [creadoenchile.cl](https://creadoenchile.cl/) en HTML, CSS y JavaScript puros. Objetivo: igualar estructura, medidas y flujo del original. Lo que no tenemos (fotos, logo, productos extra) se reemplaza por **placeholders del mismo tamaño y forma**.

Medidas verificadas contra el sitio real a 1440, 820 y 390 px (alturas de cada sección dentro de ±3 px, salvo una tarjeta móvil; ver `docs/mapa-sitio.md`). No hay carrito real, checkout ni backend: el carro y el newsletter funcionan solo en el navegador.

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

Los productos salen de `data/catalog.js`: textos, marcas y precios de práctica tomados del sitio real, sin imágenes (todas son placeholders). El carro se guarda en `localStorage`. No se replicaron los widgets de terceros de la ficha (reseñas, "comprados juntos", stock por tienda).

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
