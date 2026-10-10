// Inicio: hero y carrusel de marcas.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- Hero: slider con puntos y autoplay ---------- */
  const track = $('#heroTrack');
  const dots = $$('#heroDots .dot');
  let slide = 0;
  let timer;
  const go = (i) => {
    slide = (i + dots.length) % dots.length;
    track.style.transform = `translateX(${-slide * 100}%)`;
    dots.forEach((d, n) => {
      d.classList.toggle('is-selected', n === slide);
      d.setAttribute('aria-selected', String(n === slide));
    });
  };
  const play = () => { clearInterval(timer); timer = setInterval(() => go(slide + 1), 6000); };
  $('#heroPrev').addEventListener('click', () => { go(slide - 1); play(); });
  $('#heroNext').addEventListener('click', () => { go(slide + 1); play(); });
  dots.forEach((d, n) => d.addEventListener('click', () => { go(n); play(); }));
  let startX = null;
  const hero = $('.hero');
  hero.addEventListener('pointerdown', (e) => { startX = e.clientX; });
  hero.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 50) { go(slide + (dx < 0 ? 1 : -1)); play(); }
  });
  hero.addEventListener('mouseenter', () => clearInterval(timer));
  hero.addEventListener('mouseleave', play);
  go(0);
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) play();

  /* ---------- Marcas: flechas del carrusel ---------- */
  const vp = $('#brandsViewport');
  const prev = $('.brands__arrow--prev');
  const next = $('.brands__arrow--next');
  const step = () => vp.clientWidth * 0.7;
  const syncArrows = () => {
    prev.disabled = vp.scrollLeft <= 4;
    next.disabled = vp.scrollLeft + vp.clientWidth >= vp.scrollWidth - 4;
  };
  prev.addEventListener('click', () => vp.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => vp.scrollBy({ left: step(), behavior: 'smooth' }));
  vp.addEventListener('scroll', syncArrows, { passive: true });
  window.addEventListener('resize', syncArrows);
  syncArrows();
})();
