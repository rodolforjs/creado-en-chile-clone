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
  ];
  const byId = (id) => LIST.find((c) => c.id === id);
  // Peso de un producto en un contexto: nombre 3, tipo 2, cada etiqueta 2
  const weight = (p, c) => (c.re.test(p.t) ? 3 : 0) + (p.ty && c.re.test(p.ty) ? 2 : 0) + (p.tg || []).filter((g) => c.re.test(g)).length * 2;
  const api = { LIST, byId, weight };
  if (typeof window !== 'undefined') window.CEC_CTX = api;
  if (typeof module !== 'undefined') module.exports = api;
})();
