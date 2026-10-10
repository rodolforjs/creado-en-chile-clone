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
    $('#oItems').innerHTML = cart.map((it) => `<li><div class="ph ph--product o-items__img" data-ph="Prod"></div><div class="o-items__info"><p>${esc(it.title)}</p><small>${it.variant ? `${esc(it.variant)} · ` : ''}Cant. ${it.qty}</small></div><span>${fmt(it.price * it.qty)}</span></li>`).join('') || '<li class="o-items__empty">Tu carrito está vacío. <a href="index.html">Volver a la tienda</a></li>';
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

  $('#checkoutForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    const { cart, total, cost } = compute();
    const msg = $('#orderMsg');
    if (!cart.length) { msg.textContent = 'Tu carrito está vacío.'; return; }
    const missing = ['email', 'nombre', 'apellido', 'dir', 'comuna'].find((k) => !f.elements[k].value.trim());
    if (missing) { msg.textContent = 'Completa los datos de contacto y entrega.'; f.elements[missing].focus(); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.elements.email.value.trim())) { msg.textContent = 'Ingresa un correo válido.'; return; }
    $('#doneNum').textContent = `#CEC-${Math.floor(10000 + Math.random() * 89999)}`;
    $('#doneItems').innerHTML = cart.map((it) => `<li><div class="ph ph--product o-items__img" data-ph="Prod"></div><div class="o-items__info"><p>${esc(it.title)}</p><small>${it.variant ? `${esc(it.variant)} · ` : ''}Cant. ${it.qty}</small></div><span>${fmt(it.price * it.qty)}</span></li>`).join('');
    $('#doneTotal').textContent = fmt(total + cost);
    $('#doneMsg').textContent = `Te enviamos la confirmación a ${f.elements.email.value.trim()}.`;
    $('#orderForm').hidden = true;
    $('#orderDone').hidden = false;
    window.CEC.clearCart();
    window.scrollTo({ top: 0 });
  });
})();
