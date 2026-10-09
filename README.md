# Creado en Chile — Réplica del inicio (práctica)

Réplica de práctica del **inicio** de [creadoenchile.cl](https://creadoenchile.cl/) en HTML, CSS y JavaScript puros. Objetivo: igualar estructura, medidas y flujo del original. Lo que no tenemos (fotos, logo, productos extra) se reemplaza por **placeholders del mismo tamaño y forma**.

Medidas verificadas contra el sitio real a 1440, 820 y 390 px (alturas de cada sección dentro de ±3 px, salvo una tarjeta móvil; ver `docs/mapa-sitio.md`). No hay carrito real, checkout ni backend: el carro y el newsletter funcionan solo en el navegador.

Incluye barra de anuncios con ticker, header con desplegables, header compacto al hacer scroll, drawer móvil, búsqueda, hero con puntos, botones por precio, listas de colecciones, tarjetas con compra rápida, marquee, fila de íconos, newsletter, marcas con carrusel, blog, footer, WhatsApp flotante y popup del 10%.

## Estructura

```
index.html      # Marcado de todas las secciones del inicio
styles.css      # Tokens (color/tipografía/espaciado) + estilos de cada sección
script.js       # Header, drawers, hero, carruseles, popup, carro de demostración
assets/img/     # Fotos de la primera versión (ya no se usan; el inicio usa placeholders)
```

## Ver en local

Abre `index.html` directamente en el navegador, o sirve la carpeta con cualquier servidor estático:

```bash
python3 -m http.server 8000
```

## Publicado con GitHub Pages

Este repo se publica vía GitHub Pages desde la rama `main`.
