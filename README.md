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
| `suscripcion.html` | Landing de Suscripción: cómo funciona, 3 niveles, calendario de fechas, preguntas |
| `recordatorio.html` | Recordatorio gratis: guarda persona y fecha, muestra el aviso de ejemplo |
| `reserva.html` | Reserva de la próxima fecha (sin plan, sin pago hasta activarla) |
| `suscribirse.html` | Alta del plan anual en 5 pasos (plan, cuenta, personas y fechas, rango, pago demo) |
| `contexto.html?c=<id>` | Contextos: una plantilla para las 6 escenas (banner, mini paquetes, aviso de próxima fecha, listado etiquetado con filtro de precio, orden y paginación de 48, Match del contexto). Sin `c`, elige momento |
| `regalo.html?de=&m=&l=` | Teaser digital: lo que ve quien recibe el aviso de un regalo (no revela el producto) |
| `match.html` | Match: ¿para quién?, momento/presupuesto/SOS, mazo de cartas que aprende (pesos de ejemplo), Mis Match (máx. 8), pago compartido y teaser digital. Botón flotante en todas las páginas |
| `mi-creado.html?s=<sección>` | Mi Creado: acceso (Google, shop o correo con código, demo), inicio, personas y gustos, fechas, guardados, pedidos, direcciones y perfil |
| `mi-suscripcion.html` | Plan, próxima fecha con regalo propuesto (aceptar, cambiar, pausar), fechas y personas, despacho y avisos, reserva y recordatorios |

Los productos salen de `data/catalog.js` (textos, marcas, precios y pertenencia a colecciones tomados del sitio real, sin imágenes: todas son placeholders). Las descripciones completas de la ficha están en `data/descriptions.js`. Todas las colecciones enlazadas tienen sus productos reales; `creado-x` está vacía también en el original. El carro se guarda en `localStorage`. No se replicaron los widgets de terceros de la ficha (reseñas, "comprados juntos", stock por tienda), por lo que la página de producto queda más corta que el original. La búsqueda es textual simple: el original usa el motor de Shopify y devuelve más resultados.

## Suscripción (propuesta nueva, no existe en el sitio real)

Viene del documento de arquitectura de la propuesta (Taller Integrado). Es una demostración: todo vive en `localStorage` (`cec_sub`), no hay cuentas ni cobros. Los precios y condiciones son **de ejemplo** porque la propuesta los deja "a definir": plan anual $29.990 con 4 fechas, 1 cambio por fecha y envío gratis; cada regalo se paga al aceptarlo dentro del rango elegido ($15.000–$25.000, $25.000–$40.000, $40.000–$60.000); la reserva se cobra solo al activarla; si se cancela, el plan sigue hasta el fin del período. Los regalos propuestos salen del catálogo según gustos y rango (`sub.js`). Enlaces desde el pie, un banner en el inicio, una invitación en el carro, "Guardar para una fecha" en la ficha y "Reservar la próxima fecha" en la confirmación del pedido. Esos agregados (banner, invitación) alteran las alturas de inicio y carro respecto del original. Mi Creado reúne todo en una cuenta local (`cec_sub`): ícono en el header, acceso en una pantalla que vuelve a donde estabas, pedidos y direcciones que se guardan al comprar, "crear cuenta en un paso" en la confirmación del pedido, y "Guardar" en la ficha. Es una demostración: no hay Google ni Shopify reales (el código del correo es 123456). Match (`match.js`) usa un sistema de etiquetas con pesos de ejemplo (momento, gustos de la persona, presupuesto y lo que vas reaccionando); sus listas se guardan en Mi Creado > Guardados. Contextos y mini paquetes: definiciones en `ctx-data.js` (etiquetas y pesos de ejemplo), paquetes generados con `node tools/gen-packs.js` a `data/ctx-packs.js`. Match habla español, inglés y portugués (`match-i18n.js`; la interfaz se traduce, los productos siguen en español) y en inglés/portugués muestra la procedencia. Con esto queda cubierta la parte nueva de la propuesta.

## Estructura

```
*.html          # Páginas generadas con encabezado, drawers y pie compartidos
styles.css      # Estilos de todas las páginas
script.js       # Header, drawers, carro, popup, newsletter (compartido)
home.js         # Hero y carrusel de marcas
collection.js   # Filtros, orden y paginación (también la búsqueda)
product.js      # Ficha de producto
cart.js / order.js / page.js
sub.js          # Cuenta local, calendario y regalos sugeridos (suscripción y Mi Creado)
mi-creado.js    # Secciones de Mi Creado
suscripcion.js / recordatorio.js / reserva.js / suscribirse.js / mi-suscripcion.js
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


Suscripción: plan anual prepago, sin cuota aparte. Se pagan por adelantado los regalos del año (valor por rango: $20.000, $30.000 o $50.000, en cuotas sin interés). En cada fecha se elige entre 6 opciones del rango (la diferencia de precio se cobra o queda de crédito) y se puede pedir otras 6 una vez. Lo no usado queda en crédito o se devuelve. Valores de ejemplo en `sub.js` (`PLAN`, `RANGES`).

Contextos: `contexto.html?c=<momento>` reutiliza la plantilla de colección (filtros, orden, grilla de 48 y paginación, armada por `collection.js` con productos etiquetados). Arriba va solo el hero con la escena; los mini paquetes y el aviso de fecha van después del listado.
