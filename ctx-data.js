// Contextos (escenas): definiciones compartidas por la pestaña, el inicio y Match.
// Un producto puede estar en más de un contexto; su peso sale de qué tan bien calzan sus etiquetas, tipo y nombre.
(() => {
  const LIST = [
    { id: 'desayuno', label: 'Desayuno y sobremesa', scene: 'Una mesa servida sin apuro', tagline: 'Tazones, infusiones y dulces para empezar el día o alargar la conversación.', occ: 'madre', re: /desayuno|taza|taz[oó]n|infusi|\bt[eé]\b|caf[eé]|miel|manjar|mermelada|individual|servilleta|posavaso|mesa y cocina/i, packs: ['Desayuno en cama', 'Sobremesa larga', 'Mesa de domingo'] },
    { id: 'casa-nueva', label: 'Casa nueva', scene: 'El primer rincón que se siente propio', tagline: 'Objetos con identidad para que una casa recién estrenada ya tenga historia.', occ: 'navidad', re: /casa|deco|cuadro|vela|florero|coj[ií]n|textil|ilumin|aroma|jard[ií]n|macetero|espejo|ilustraci/i, packs: ['Primer rincón', 'Casa con identidad', 'Inauguración completa'] },
    { id: 'ritual', label: 'Ritual personal', scene: 'Cinco minutos que son solo tuyos', tagline: 'Aromas, cuidado y pausas para regalar tiempo.', occ: 'sanvalentin', re: /belleza|bienestar|jab[oó]n|crema|facial|perfume|sahumerio|relaj|masaje|vela|infusi/i, packs: ['Pausa de la tarde', 'Noche de calma', 'Ritual completo'] },
    { id: 'escritorio', label: 'Escritorio', scene: 'Un espacio de trabajo con carácter', tagline: 'Papelería, libros y detalles para pensar mejor.', occ: 'padre', re: /escritorio|oficina|papeler|cuaderno|libro|l[aá]piz|agenda|organiz|estuche|libreta/i, packs: ['Escritorio ordenado', 'Para pensar', 'Oficina con carácter'] },
    { id: 'familia', label: 'Tiempo en familia', scene: 'La tarde que todos recuerdan', tagline: 'Juegos, cuentos y mesa compartida para estar juntos.', occ: 'padre', re: /juego|puzzle|infantil|cuento|quincho|parrilla|familia|juguet|libros infantiles/i, packs: ['Tarde de juegos', 'Domingo en familia', 'Para los más chicos'] },
    { id: 'viaje', label: 'Recuerdo de viaje', scene: 'Un pedazo de Chile para llevar', tagline: 'Souvenirs y artesanía reconociblemente chilenos.', occ: 'patrias', re: /souvenir|recuerdo|chile|im[aá]n|postal|artesan|extranjero|llavero|mapa|regalos para/i, packs: ['Un recuerdo de Chile', 'Para llevar de vuelta', 'Chile en la maleta'] },
    { id: 'turista', label: 'Para llevar a casa', scene: 'Un pedazo de Chile que cabe en la maleta', tagline: 'Para quien visita Chile y quiere llevarse algo con identidad, liviano y sin trámites en el aeropuerto.', occ: 'patrias', carry: true, re: /souvenir|recuerdo|chile|im[aá]n|postal|llavero|artesan|joya|aros|collar|pulsera|posavaso|taz[aó]n|taza|chocolate|infusi|\bt[eé]\b|libro|tarjeta|mini|jab[oó]n|mapa|regalos para/i, packs: ['Primer recuerdo', 'Chile en la maleta de mano', 'Para volver a casa'] },
  ];
  const byId = (id) => LIST.find((c) => c.id === id);
  // Peso de un producto en un contexto: nombre 3, tipo 2, cada etiqueta 2
  const weight = (p, c) => (c.re.test(p.t) ? 3 : 0) + (p.ty && c.re.test(p.ty) ? 2 : 0) + (p.tg || []).filter((g) => c.re.test(g)).length * 2;
  // ¿Cabe en una maleta de mano? Es una estimación: usa las medidas de la descripción cuando existen y, si no, el tipo de producto.
  // Los líquidos grandes (vino, pisco, aceite) no pasan el control del aeropuerto, y los muebles o cuadros no caben.
  const NO = /mesa|silla|sill[oó]n|l[aá]mpara|alfombra|tinaja|espejo|cuadro|marco|mueble|estante|banco|parrilla|sauna|colch|cortina|plaid|manta|poncho|maceta|jarr[oó]n|barril|vino|pisco|licor|cerveza|aceite|aromatizador|perfume|shampoo|spray|difusor|tabla|lavamano|lavaplato|tetera|cojin|coj[ií]n|ba[uú]l|bicicleta|carro/i;
  const SMALL = /joya|aro|collar|anillo|pulsera|llavero|im[aá]n|postal|posavaso|taz[aó]n|taza|jab[oó]n|\bt[eé]\b|infusi|chocolate|libro|cuaderno|marcap|sticker|pin\b|broche|souvenir|tarjeta|mini|servilleta|miel|mermelada|cuchara|esp[aá]tula|alfajor|manjar|sal\b|merk[eé]n/i;
  const fitsCarryOn = (p) => {
    const hay = `${p.t} ${p.ty || ''}`;
    if (NO.test(hay)) return false;
    const d = p.d || '';
    const kg = d.match(/(\d+(?:[.,]\d+)?)\s?kg\b/i);
    if (kg && parseFloat(kg[1].replace(',', '.')) > 2) return false;
    const dims = [...d.matchAll(/(\d+(?:[.,]\d+)?)(?:\s?x\s?(\d+(?:[.,]\d+)?))?(?:\s?x\s?(\d+(?:[.,]\d+)?))?\s?(cm|mm)\b/gi)];
    if (dims.length) {
      const max = Math.max(...dims.flatMap((m) => [m[1], m[2], m[3]].filter(Boolean).map((n) => parseFloat(n.replace(',', '.')) / (m[4].toLowerCase() === 'mm' ? 10 : 1))));
      return max <= 40;
    }
    return SMALL.test(hay) || (p.p > 0 && p.p <= 12000);
  };
  const api = { LIST, byId, weight, fitsCarryOn };
  if (typeof window !== 'undefined') window.CEC_CTX = api;
  if (typeof module !== 'undefined') module.exports = api;
})();
