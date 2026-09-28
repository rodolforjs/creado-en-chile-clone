// Creado en Chile — clon de práctica frontend
document.addEventListener('DOMContentLoaded', () => {
  // Mobile nav drawer
  const navToggle = document.getElementById('navToggle');
  const navClose = document.getElementById('navClose');
  const mobileNav = document.getElementById('mobileNav');

  const openNav = () => mobileNav.classList.add('is-open');
  const closeNav = () => mobileNav.classList.remove('is-open');

  navToggle?.addEventListener('click', openNav);
  navClose?.addEventListener('click', closeNav);
  mobileNav?.addEventListener('click', (e) => {
    if (e.target === mobileNav) closeNav();
  });
  mobileNav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeNav);
  });

  // Announcement bar rotation
  const items = document.querySelectorAll('.announcement-bar__item');
  if (items.length > 1) {
    let current = 0;
    items[current].style.display = 'flex';
    setInterval(() => {
      items[current].style.display = 'none';
      current = (current + 1) % items.length;
      items[current].style.display = 'flex';
    }, 4000);
  }

  // Newsletter form (frontend-only demo)
  const form = document.getElementById('newsletterForm');
  const msg = document.getElementById('newsletterMsg');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('newsletterEmail').value.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    msg.textContent = valid
      ? '¡Listo! Revisa tu correo para confirmar la suscripción.'
      : 'Ingresa un correo válido.';
    msg.classList.add('is-visible');
    if (valid) form.reset();
  });

  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
