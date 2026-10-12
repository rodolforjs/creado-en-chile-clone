// Idiomas de Match (es, en, pt). La interfaz se traduce; los nombres y descripciones de los productos siguen en español.
// En inglés y portugués la carta muestra además la procedencia ("Hecho en Chile por …"), como pide la propuesta.
(() => {
  const KEY = 'cec_lang';
  // [español, inglés, portugués]
  const T = [
    ['Para quién', 'Who for', 'Para quem'], ['Tu momento', 'Your moment', 'Seu momento'], ['Cartas', 'Cards', 'Cartas'], ['Mis Match', 'My Matches', 'Meus Match'],
    ['¿Para ti o para alguien más?', 'For you or for someone else?', 'Para você ou para outra pessoa?'],
    ['Una pregunta y empezamos. No te pedimos cuenta ni datos.', 'One question and we start. No account or personal details needed.', 'Uma pergunta e começamos. Sem conta nem dados.'],
    ['Para mí', 'For me', 'Para mim'], ['Un gusto propio', 'A treat for myself', 'Um mimo para mim'], ['Para alguien más', 'For someone else', 'Para outra pessoa'], ['Un regalo', 'A gift', 'Um presente'],
    ['Toca a quién le regalas y vemos la primera carta.', 'Tap who it is for and we show the first card.', 'Toque em quem vai receber e mostramos a primeira carta.'],
    ['Alguien nuevo', 'Someone new', 'Alguém novo'], ['No lo he guardado', "I haven't saved them", 'Ainda não salvei'],
    ['Retomar desde Mis Match', 'Pick up from My Matches', 'Retomar de Meus Match'], ['Empezar de nuevo', 'Start over', 'Começar de novo'],
    ['¿Quién es esa persona?', 'Who is this person?', 'Quem é essa pessoa?'], ['Elige el vínculo y afinamos las ideas. Puedes saltarlo.', 'Pick the relationship and we refine the ideas. You can skip it.', 'Escolha o vínculo e refinamos as ideias. Você pode pular.'],
    ['Alguien cercano', 'Someone close', 'Alguém próximo'], ['Un compromiso', 'An obligation', 'Um compromisso'], ['Si no estás seguro', 'If you are not sure', 'Se você não tem certeza'],
    ['Pareja', 'Partner', 'Parceiro(a)'], ['Quien te acompaña', 'Who is by your side', 'Quem está com você'], ['Familia', 'Family', 'Família'], ['Mamá, papá, hermanos', 'Mom, dad, siblings', 'Mãe, pai, irmãos'],
    ['Amigo o amiga', 'Friend', 'Amigo(a)'], ['Un cumpleaños, un gusto', 'A birthday, a treat', 'Um aniversário, um mimo'], ['Niño o niña', 'Child', 'Criança'], ['Hijos, sobrinos, ahijados', 'Kids, nieces, nephews, godchildren', 'Filhos, sobrinhos, afilhados'],
    ['Colega o jefatura', 'Colleague or boss', 'Colega ou chefe'], ['Trabajo y oficina', 'Work and office', 'Trabalho e escritório'], ['Anfitrión o invitación', 'Host or invitation', 'Anfitrião ou convite'], ['Una cena, una visita', 'A dinner, a visit', 'Um jantar, uma visita'],
    ['Agradecimiento', 'Thank you', 'Agradecimento'], ['Un favor, un gesto', 'A favor, a gesture', 'Um favor, um gesto'], ['No sé / otra persona', "I don't know / someone else", 'Não sei / outra pessoa'], ['Sin pistas, sorpréndeme', 'No clues, surprise me', 'Sem pistas, surpreenda-me'],
    ['la persona', 'the person', 'a pessoa'], ['Saltar este paso', 'Skip this step', 'Pular este passo'],
    ['Todo es opcional. Si prefieres, déjanos sorprenderte.', 'Everything is optional. Or let us surprise you.', 'Tudo é opcional. Ou deixe-nos surpreender você.'],
    ['Momento', 'Moment', 'Momento'], ['Presupuesto', 'Budget', 'Orçamento'], ['Urgencia', 'Urgency', 'Urgência'],
    ['Desayuno y sobremesa', 'Breakfast and long table talk', 'Café da manhã e sobremesa'], ['Casa nueva', 'New home', 'Casa nova'], ['Ritual personal', 'Personal ritual', 'Ritual pessoal'], ['Escritorio', 'Desk', 'Escritório'], ['Tiempo en familia', 'Family time', 'Tempo em família'], ['Recuerdo de viaje', 'Travel keepsake', 'Lembrança de viagem'],
    ['Hasta $15.000', 'Up to $15,000', 'Até $15.000'], ['$15.000 a $30.000', '$15,000 to $30,000', '$15.000 a $30.000'], ['$30.000 a $50.000', '$30,000 to $50,000', '$30.000 a $50.000'], ['Más de $50.000', 'Over $50,000', 'Mais de $50.000'],
    ['Lo necesito hoy', 'I need it today', 'Preciso para hoje'], ['(Modo SOS): solo lo que llega hoy', '(SOS mode): only what arrives today', '(Modo SOS): só o que chega hoje'],
    ['Ver las cartas', 'See the cards', 'Ver as cartas'], ['Sorpréndeme', 'Surprise me', 'Surpreenda-me'],
    ['⚡ Llega hoy · Express 3 horas', '⚡ Arrives today · Express 3 hours', '⚡ Chega hoje · Express 3 horas'], ['No llega hoy · llega en 1 a 2 días hábiles', 'Not today · arrives in 1 to 2 business days', 'Não chega hoje · chega em 1 a 2 dias úteis'],
    ['En stock · despacho en 2 a 5 días hábiles', 'In stock · ships in 2 to 5 business days', 'Em estoque · envio em 2 a 5 dias úteis'],
    ['Es del tipo de regalo que has ido eligiendo.', 'It is the kind of gift you have been choosing.', 'É o tipo de presente que você vem escolhendo.'], ['Te llega hoy, sin esperar.', 'It reaches you today, no waiting.', 'Chega hoje, sem esperar.'],
    ['Ver historia y detalles', 'See story and details', 'Ver história e detalhes'], ['Ver menos', 'See less', 'Ver menos'], ['Medidas:', 'Size:', 'Medidas:'], ['Abrir la ficha', 'Open product page', 'Abrir a ficha'],
    ['Ampliamos un poco el presupuesto para tener más opciones.', 'We widened the budget a little to give you more options.', 'Ampliamos um pouco o orçamento para ter mais opções.'],
    ['Hoy quedan pocas piezas que lleguen hoy: te mostramos lo más cercano y avisamos cuándo llega.', 'Few pieces arrive today: we show the closest ones and tell you when they arrive.', 'Restam poucas peças que chegam hoje: mostramos as mais próximas e avisamos quando chegam.'],
    ['Descartar', 'Skip', 'Descartar'], ['Me gusta', 'Like', 'Gostei'], ['Ya tengo suficientes, ver mi lista', 'I have enough, see my list', 'Já tenho o suficiente, ver minha lista'],
    ['Ya viste todo lo que calza', 'You have seen everything that fits', 'Você viu tudo o que combina'], ['Cerremos con lo que te gustó.', "Let's wrap up with what you liked.", 'Vamos fechar com o que você gostou.'],
    ['Prueba con otro momento o un presupuesto más amplio.', 'Try another moment or a wider budget.', 'Tente outro momento ou um orçamento maior.'], ['Ver Mis Match', 'See My Matches', 'Ver Meus Match'], ['Cambiar mis respuestas', 'Change my answers', 'Mudar minhas respostas'],
    ['Tu lista corta', 'Your short list', 'Sua lista curta'], ['Aún no elegiste ninguno', 'You have not picked any yet', 'Você ainda não escolheu nenhum'],
    ['Lo que te gustó y algunas parecidas. Compara precio, stock y despacho.', 'What you liked and a few similar ones. Compare price, stock and delivery.', 'O que você gostou e algumas parecidas. Compare preço, estoque e entrega.'],
    ['Vuelve a las cartas y toca “Me gusta”.', 'Go back to the cards and tap “Like”.', 'Volte às cartas e toque em “Gostei”.'],
    ['♥ Te gustó', '♥ You liked it', '♥ Você gostou'], ['Parecido a lo que te gustó', 'Similar to what you liked', 'Parecido com o que você gostou'], ['Llega hoy', 'Arrives today', 'Chega hoje'], ['2 a 5 días hábiles', '2 to 5 business days', '2 a 5 dias úteis'],
    ['Al carro', 'Add to cart', 'Ao carrinho'], ['Quitar', 'Remove', 'Remover'], ['Seguir viendo cartas', 'Keep browsing cards', 'Continuar vendo cartas'], ['Empezar otro Match', 'Start another Match', 'Começar outro Match'],
    ['Pago compartido', 'Shared payment', 'Pagamento compartilhado'], ['Reúne a más personas para un mismo regalo (“hacer una vaca”).', 'Bring more people in on one gift (“chip in together”).', 'Reúna mais pessoas para um mesmo presente (“vaquinha”).'],
    ['¿Entre cuántas personas?', 'Between how many people?', 'Entre quantas pessoas?'], ['Invitar por WhatsApp', 'Invite by WhatsApp', 'Convidar por WhatsApp'],
    ['Teaser digital', 'Digital teaser', 'Teaser digital'], ['Tu nombre (opcional)', 'Your name (optional)', 'Seu nome (opcional)'],
    ['“Alguien está preparando un regalo para ti en Creado en Chile. Pronto sabrás qué es.”', '“Someone is preparing a gift for you at Creado en Chile. You will soon find out what it is.”', '“Alguém está preparando um presente para você na Creado en Chile. Em breve você saberá qual é.”'],
    ['Copiar enlace del teaser', 'Copy teaser link', 'Copiar link do teaser'], ['Enlace copiado', 'Link copied', 'Link copiado'], ['No se pudo copiar', 'Could not copy', 'Não foi possível copiar'], ['Enviar por WhatsApp', 'Send by WhatsApp', 'Enviar por WhatsApp'], ['Ver cómo lo verá', 'Preview it', 'Ver como será'],
    ['Guardar este Match', 'Save this Match', 'Salvar este Match'], ['Guardado en Mi Creado', 'Saved in My Creado', 'Salvo em Meu Creado'], ['Guardar en Mi Creado', 'Save in My Creado', 'Salvar em Meu Creado'],
    ['Si no quieres, Match funciona completo igual: solo no se guarda. Con Google es un toque.', 'If you prefer not to, Match still works fully: it just is not saved. With Google it is one tap.', 'Se preferir, o Match funciona igual: só não é salvo. Com o Google é um toque.'],
    ['Gourmet', 'Gourmet', 'Gourmet'], ['Casa y deco', 'Home and decor', 'Casa e decoração'], ['Mesa y cocina', 'Table and kitchen', 'Mesa e cozinha'], ['Joyas y accesorios', 'Jewelry and accessories', 'Joias e acessórios'], ['Libros y papelería', 'Books and stationery', 'Livros e papelaria'], ['Belleza y bienestar', 'Beauty and wellness', 'Beleza e bem-estar'], ['Ropa y calzado', 'Clothing and footwear', 'Roupas e calçados'], ['Infantil', 'Kids', 'Infantil'],
    ['Teaser', 'Teaser', 'Teaser'], ['Alguien te está preparando un regalo', 'Someone is preparing a gift for you', 'Alguém está preparando um presente para você'], ['Pronto sabrás qué es.', 'You will soon find out what it is.', 'Em breve você saberá qual é.'],
    ['¿Quieres darle una pista?', 'Want to give a hint?', 'Quer dar uma dica?'], ['Elige lo que te gusta y se lo contamos para que acierte. No se guarda ninguna cuenta.', 'Pick what you like and we pass it on so they get it right. No account is saved.', 'Escolha o que você gosta e avisamos para que acerte. Nenhuma conta é salva.'],
    ['Guardar mis gustos', 'Save my tastes', 'Salvar meus gostos'], ['Conocer Creado en Chile', 'Discover Creado en Chile', 'Conhecer a Creado en Chile'], ['Listo. En esta demostración tus gustos quedan en tu navegador.', 'Done. In this demo your tastes stay in your browser.', 'Pronto. Nesta demonstração seus gostos ficam no seu navegador.'],
    ['Continuar con Google (demo)', 'Continue with Google (demo)', 'Continuar com o Google (demo)'], ['Continuar con shop (demo)', 'Continue with shop (demo)', 'Continuar com shop (demo)'],
    ['o con tu correo', 'or with your email', 'ou com seu e-mail'], ['Correo', 'Email', 'E-mail'], ['Enviarme un código', 'Email me a code', 'Enviar um código'], ['Código', 'Code', 'Código'], ['Entrar', 'Sign in', 'Entrar'],
  ];
  const P = [
    [/^(.+) te está preparando un regalo$/, (m) => `${m[1]} is preparing a gift for you`, (m) => `${m[1]} está preparando um presente para você`],
    [/^Viene pensado para:$/, () => 'It is meant for:', () => 'É pensado para:'], // [expresión, inglés, portugués]: textos con nombres o cifras
    [/^¿Para quién hoy, (.+)\?$/, (m) => `Who is it for today, ${x(m[1])}?`, (m) => `Para quem é hoje, ${m[1]}?`],
    [/^Tienes un Match a medias con (\d+) cartas? que te gustaron\.?$/, (m) => `You have an unfinished Match with ${m[1]} liked cards.`, (m) => `Você tem um Match pela metade com ${m[1]} cartas curtidas.`],
    [/^¿Para qué momento es el regalo de (.+)\?$/, (m) => `What moment is ${x(m[1])}'s gift for?`, (m) => `Para que momento é o presente de ${m[1]}?`],
    [/^¿Para qué momento es el regalo para (.+)\?$/, (m) => `What moment is the gift for (${x(m[1])})?`, (m) => `Para que momento é o presente (${x(m[1])})?`],
    [/^¿Para qué momento es el regalo\?$/, () => 'What moment is the gift for?', () => 'Para que momento é o presente?'],
    [/^Carta (\d+) de (\d+)$/, (m) => `Card ${m[1]} of ${m[2]}`, (m) => `Carta ${m[1]} de ${m[2]}`],
    [/^(\d+) me gusta$/, (m) => `${m[1]} liked`, (m) => `${m[1]} curtidas`],
    [/^A (.+) le gusta (.+), y esto va por ahí\.$/, (m) => `${m[1]} likes ${x(m[2])}, and this fits.`, (m) => `${m[1]} gosta de ${x(m[2])}, e este vai por aí.`],
    [/^Una apuesta segura para (.+): (.+)\.$/, (m) => `A safe bet for ${x(m[1])}: ${x(m[2])}.`, (m) => `Uma aposta segura para ${x(m[1])}: ${x(m[2])}.`],
    [/^Te gustó otra pieza de (.+): tiene el mismo sello\.$/, (m) => `You liked another piece by ${m[1]}: same signature.`, (m) => `Você gostou de outra peça de ${m[1]}: mesmo selo.`],
    [/^Calza con “(.+)”, el momento que elegiste\.$/, (m) => `Fits “${m[1]}”, the moment you picked.`, (m) => `Combina com “${m[1]}”, o momento que você escolheu.`],
    [/^Diseño de (.+), para empezar con algo distinto\.$/, (m) => `Design by ${m[1]}, to start with something different.`, (m) => `Design de ${m[1]}, para começar com algo diferente.`],
    [/^Hecho en Chile por (.+)$/, (m) => `Made in Chile by ${m[1]}`, (m) => `Feito no Chile por ${m[1]}`],
    [/^Tu lista corta para (.+)$/, (m) => `Your short list for ${x(m[1])}`, (m) => `Sua lista curta para ${x(m[1])}`],
    [/^Si eliges todo lo que te gustó \((.+)\), cada persona aporta$/, (m) => `If you pick everything you liked (${m[1]}), each person chips in`, (m) => `Se você escolher tudo o que gostou (${m[1]}), cada pessoa contribui com`],
    [/^Un aviso para que (.+) sepa que viene un regalo, sin revelar qué es\.$/, (m) => `A heads-up so ${x(m[1])} knows a gift is coming, without saying what it is.`, (m) => `Um aviso para que ${x(m[1])} saiba que vem um presente, sem revelar qual.`],
  ];
  const lang = () => { try { return localStorage.getItem(KEY) || window.CEC_SUB.load().profile.lang || 'es'; } catch { return 'es'; } };
  const setLang = (l) => {
    try { localStorage.setItem(KEY, l); } catch { /* sin storage */ }
    const S = window.CEC_SUB; const s = S.load(); s.profile.lang = l; S.save(s);
  };
  const idx = { en: 1, pt: 2 };
  let cur = 0;
  const LOW = new Map(T.map((r) => [r[0].toLowerCase(), r]));
  const x = (s) => { const r = LOW.get(String(s).toLowerCase()); return r ? r[cur].toLowerCase() === r[cur] ? r[cur] : (s === r[0] ? r[cur] : r[cur].charAt(0).toLowerCase() + r[cur].slice(1)) : s; };
  const EX = new Map(T.map((r) => [r[0], r]));
  const tr = (text, l = lang()) => {
    const i = idx[l];
    if (!i) return text;
    cur = i;
    const k = text.trim();
    const r = EX.get(k);
    if (r) return text.replace(k, r[i]);
    for (const p of P) { const m = k.match(p[0]); if (m) return text.replace(k, p[i](m)); }
    return text;
  };
  // Traduce los textos y atributos de un contenedor (se omiten los marcados con data-nt)
  const apply = (root, l = lang()) => {
    if (!idx[l]) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (w.nextNode()) nodes.push(w.currentNode);
    nodes.forEach((n) => { if (n.parentElement.closest('[data-nt]') || !n.nodeValue.trim()) return; n.nodeValue = tr(n.nodeValue, l); });
    root.querySelectorAll('[data-ph]').forEach((e) => { if (!e.closest('[data-nt]')) e.dataset.ph = tr(e.dataset.ph, l); });
  };
  window.CEC_I18N = { lang, setLang, tr, apply, LANGS: [['es', 'ES'], ['en', 'EN'], ['pt', 'PT']] };
})();
