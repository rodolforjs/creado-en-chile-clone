// Página del carro (/cart): lista, cantidades, subtotal y "Los más vendidos".
(() => {
  const { D, esc, fmt, card } = window.CEC_UI;
  const $ = (s, r = document) => r.querySelector(s);

  const render = () => {
    const cart = window.CEC.getCart();
    const list = $('#cpList');
    list.innerHTML = '';
    cart.forEach((it, i) => {
      const li = document.createElement('li');
      li.className = 'cartpg__item';
      li.innerHTML = `<div class="ph ph--product cartpg__img" data-ph="100×150"></div>
        <div class="cartpg__info"><a class="cartpg__name" href="${it.handle === 'gift-wrapping' ? '#' : `product.html?p=${encodeURIComponent(it.handle)}`}">${esc(it.title)}</a>
        ${it.variant ? `<p class="cartpg__variant">${esc(it.variant)}</p>` : ''}<p class="cartpg__price">${fmt(it.price)}</p></div>
        <div class="cartpg__qty"><div class="qty"><button type="button" data-d="-1" aria-label="Menos">−</button><input type="text" inputmode="numeric" readonly value="${it.qty}" aria-label="Cantidad"><button type="button" data-d="1" aria-label="Más">+</button></div><p class="cartpg__line">${fmt(it.price * it.qty)}</p></div>`;
      li.querySelectorAll('[data-d]').forEach((b) => b.addEventListener('click', () => window.CEC.setQty(i, it.qty + (+b.dataset.d))));
      list.append(li);
    });
    $('#cpEmpty').hidden = cart.length > 0;
    $('#cpSum').hidden = cart.length === 0;
    $('#cpTotal').textContent = fmt(window.CEC.totals().total);
  };
  document.addEventListener('cart:change', render);
  $('#cpGift').addEventListener('click', () => window.CEC.addToCart({ handle: 'gift-wrapping', title: 'Para Regalo', price: 1000, express: true }, false));
  $('#cpUpdate').addEventListener('click', render);
  render();

  const best = (D.collections['lo-mas-vendido'] || []).slice(0, 4).map((i) => D.products[i]);
  $('#bestGrid').innerHTML = best.map((p) => card(p, { swatches: false })).join('');
})();
