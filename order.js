// Finalizar compra (demostración): resumen, envío y confirmación. No envía datos.
(() => {
  const fmt = window.CEC.fmt;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (s, r = document) => r.querySelector(s);
  const STD = 3990;
  const EXP = 5990;
  const FREE = window.CEC.FREE_SHIPPING;

  const compute = () => {
    const cart = window.CEC.getCart();
    const { total } = window.CEC.totals();
    const allExpress = cart.length > 0 && cart.every((c) => c.express);
    const ship = ($('input[name=ship]:checked') || {}).value || 'std';
    const cost = ship === 'exp' ? EXP : (total >= FREE ? 0 : STD);
    return { cart, total, allExpress, ship, cost };
  };
  const draw = () => {
    const { cart, total, allExpress, ship, cost } = compute();
    $('#oItems').innerHTML = cart.map((it) => `<li><div class="ph ph--product o-items__img" data-ph="Prod" data-img="${esc(it.handle || '')}" data-img-w="200"></div><div class="o-items__info"><p>${esc(it.title)}</p><small>${it.variant ? `${esc(it.variant)} · ` : ''}Cant. ${it.qty}</small></div><span>${fmt(it.price * it.qty)}</span></li>`).join('') || '<li class="o-items__empty">Tu carrito está vacío. <a href="index.html">Volver a la tienda</a></li>';
    $('#oSub').textContent = fmt(total);
    $('#oShip').textContent = cost === 0 ? 'Gratis' : fmt(cost);
    $('#oTotal').textContent = fmt(total + cost);
    $('#shipStd').textContent = total >= FREE ? 'Gratis' : fmt(STD);
    $('#shipExp').textContent = fmt(EXP);
    $('#shipExpressRow').classList.toggle('is-off', !allExpress);
    $('input[value=exp]').disabled = !allExpress;
    if (!allExpress && ship === 'exp') $('input[value=std]').checked = true;
  };
  document.querySelectorAll('input[name=ship]').forEach((i) => i.addEventListener('change', draw));
  draw();

  // Mi Creado: completa los datos con la cuenta y la dirección principal
  const SUB = window.CEC_SUB;
  const acct = SUB ? SUB.load() : null;
  if (acct) {
    const f0 = $('#checkoutForm').elements;
    const def = acct.addresses.find((a) => a.def) || acct.addresses[0];
    if (acct.user) {
      f0.email.value = acct.user.email;
      const [n, ...rest] = acct.user.name.split(' ');
      f0.nombre.value = n;
      f0.apellido.value = rest.join(' ');
    }
    if (def) {
      const [n, ...rest] = def.name.split(' ');
      f0.nombre.value = n;
      f0.apellido.value = rest.join(' ');
      f0.dir.value = def.street;
      f0.comuna.value = def.comuna;
    }
    if (!acct.user) { /* sin cuenta: la casilla de guardar dirección se ofrece igual, se asocia al crear la cuenta */ }
  }

  // Confirmación: crear la cuenta en un paso, o avisar que el pedido quedó en Mi Creado
  const drawAcct = (user, email, name) => {
    const box = $('#doneAcct');
    if (user) { box.innerHTML = '<p class="cinv__txt"><b>Tu pedido quedó en Mi Creado.</b> Míralo en Pedidos, junto a tus direcciones.</p><div class="cinv__btns"><a class="btn btn--solid btn--md" href="mi-creado.html?s=pedidos">Ver mis pedidos</a></div>'; return; }
    box.innerHTML = '<p class="cinv__txt"><b>¿Guardamos tu pedido y tus datos?</b> Crea tu cuenta en un paso: con Google no te pedimos nada más.</p><div class="cinv__btns"><button class="btn btn--solid btn--md" type="button" id="doneG">Continuar con Google (demo)</button></div>';
    $('#doneG').addEventListener('click', () => {
      SUB.setUser({ name: name || 'Cuenta de demostración', email, method: 'google' });
      drawAcct(SUB.load().user);
    });
  };

  $('#checkoutForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    const { cart, total, cost } = compute();
    const msg = $('#orderMsg');
    if (!cart.length) { msg.textContent = 'Tu carrito está vacío.'; return; }
    const missing = ['email', 'nombre', 'apellido', 'dir', 'comuna'].find((k) => !f.elements[k].value.trim());
    if (missing) { msg.textContent = 'Completa los datos de contacto y entrega.'; f.elements[missing].focus(); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.elements.email.value.trim())) { msg.textContent = 'Ingresa un correo válido.'; return; }
    const orderId = `#CEC-${Math.floor(10000 + Math.random() * 89999)}`;
    $('#doneNum').textContent = orderId;
    $('#doneItems').innerHTML = cart.map((it) => `<li><div class="ph ph--product o-items__img" data-ph="Prod"></div><div class="o-items__info"><p>${esc(it.title)}</p><small>${it.variant ? `${esc(it.variant)} · ` : ''}Cant. ${it.qty}</small></div><span>${fmt(it.price * it.qty)}</span></li>`).join('');
    $('#doneTotal').textContent = fmt(total + cost);
    $('#doneMsg').textContent = `Te enviamos la confirmación a ${f.elements.email.value.trim()}.`;
    $('#orderForm').hidden = true;
    $('#orderDone').hidden = false;
    try { localStorage.setItem('cec_last_buy', JSON.stringify({ handle: cart[0].handle || null, title: cart[0].title })); } catch { /* sin storage */ }
    if (SUB) {
      const st = SUB.load();
      const addr = { name: `${f.elements.nombre.value.trim()} ${f.elements.apellido.value.trim()}`.trim(), street: f.elements.dir.value.trim(), comuna: f.elements.comuna.value };
      st.orders.unshift({ id: orderId, date: new Date().toISOString(), total: total + cost, ship: { mode: compute().ship, cost }, address: `${addr.street}, ${addr.comuna}`, email: f.elements.email.value.trim(), items: cart.map((i) => ({ handle: i.handle, title: i.title, variant: i.variant || '', qty: i.qty, price: i.price, express: !!i.express })) });
      if ($('#saveAddr').checked && !st.addresses.some((a) => a.street === addr.street && a.comuna === addr.comuna)) st.addresses.push({ id: SUB.uid('a'), alias: 'Compra ' + orderId, ...addr, tel: '', def: !st.addresses.length });
      SUB.save(st);
      drawAcct(st.user, f.elements.email.value.trim(), `${f.elements.nombre.value.trim()} ${f.elements.apellido.value.trim()}`.trim());
    }
    window.CEC.clearCart();
    window.scrollTo({ top: 0 });
  });
})();
