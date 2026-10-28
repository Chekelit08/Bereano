// Movimiento de la landing: aparición al hacer scroll, parallax del grabado del hero y
// la imagen que sigue al cursor sobre las puertas falsas. Todo se desactiva si el
// usuario pidió reducir el movimiento.

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initMotion() {
  if (reduce || !('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('js');

  // Aparición escalonada de las filas de puertas falsas
  document.querySelectorAll('.door[data-reveal]').forEach((el, i) => el.style.setProperty('--i', i));

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  );
  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));

  initParallax();
  initDoorPreview();
}

function initParallax() {
  const el = document.querySelector('[data-parallax]');
  if (!el) return;
  let ticking = false;
  const update = () => {
    const y = Math.min(window.scrollY, 900);
    el.style.translate = `0 ${y * -0.08}px`;
    ticking = false;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) requestAnimationFrame(update);
      ticking = true;
    },
    { passive: true },
  );
}

function initDoorPreview() {
  const preview = document.getElementById('door-preview');
  if (!preview || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  // Precarga las imágenes para que no aparezcan en blanco.
  document.querySelectorAll('[data-img]').forEach((el) => {
    new Image().src = el.dataset.img;
  });

  document.querySelectorAll('.door').forEach((door) => {
    door.addEventListener('pointerenter', () => {
      preview.src = door.dataset.img;
      preview.classList.add('is-visible');
    });
    door.addEventListener('pointerleave', () => preview.classList.remove('is-visible'));
    door.addEventListener('pointermove', (event) => {
      preview.style.setProperty('--x', `${event.clientX + 160}px`);
      preview.style.setProperty('--y', `${event.clientY}px`);
    });
  });
}
