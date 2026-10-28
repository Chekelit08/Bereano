// Movimiento de la landing: aparición al hacer scroll, parallax del grabado del hero,
// la imagen que sigue al cursor sobre las puertas falsas, la demo del compañero que
// "escribe" su respuesta, el versículo que se ilumina y los botones magnéticos.
// Todo se desactiva si el usuario pidió reducir el movimiento: el contenido se ve
// completo y estático.

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

/** @param {{ onDemoStart?: () => void }} [options] */
export function initMotion(options = {}) {
  initHeader();
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
  initVerseWords();
  initDemo(options.onDemoStart);
  initMagnetic();
}

/** Ejecuta `fn` como mucho una vez por frame mientras se scrollea. */
function onScroll(fn) {
  let ticking = false;
  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        fn();
        ticking = false;
      });
    },
    { passive: true },
  );
  fn();
}

/**
 * Envuelve cada palabra de `root` en un <span class="w">, sin romper las etiquetas
 * internas (<em>, <mark>…). Devuelve los spans en orden de lectura.
 */
function splitWords(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);

  const words = [];
  for (const node of textNodes) {
    const parts = node.textContent.split(/(\s+)/);
    const frag = document.createDocumentFragment();
    for (const part of parts) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        frag.append(part);
      } else {
        const span = document.createElement('span');
        span.className = 'w';
        span.textContent = part;
        frag.append(span);
        words.push(span);
      }
    }
    node.replaceWith(frag);
  }
  return words;
}

// El encabezado se esconde al bajar y vuelve al subir (también con movimiento reducido:
// es un cambio de estado, no una animación decorativa).
function initHeader() {
  const bar = document.querySelector('.topbar');
  if (!bar) return;
  let lastY = window.scrollY;
  onScroll(() => {
    const y = window.scrollY;
    const goingDown = y > lastY;
    // No se esconde si algo dentro tiene foco (navegación con teclado).
    const hide = goingDown && y > 240 && !bar.contains(document.activeElement);
    bar.classList.toggle('is-hidden', hide);
    lastY = y;
  });
}

function initParallax() {
  const el = document.querySelector('[data-parallax]');
  if (!el) return;
  onScroll(() => {
    const y = Math.min(window.scrollY, 900);
    el.style.translate = `0 ${y * -0.08}px`;
  });
}

function initDoorPreview() {
  const preview = document.getElementById('door-preview');
  if (!preview || !finePointer) return;

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

// El versículo de Hechos 17:11 se va "encendiendo" palabra por palabra con el scroll.
function initVerseWords() {
  const quote = document.querySelector('blockquote[data-words]');
  if (!quote) return;
  const words = splitWords(quote);
  const mark = quote.querySelector('mark');
  const lastMarkWord = mark ? words.indexOf([...mark.querySelectorAll('.w')].pop()) : -1;
  const section = quote.closest('section');
  section.classList.add('verse-lit');

  onScroll(() => {
    const rect = quote.getBoundingClientRect();
    const vh = window.innerHeight;
    // 0 cuando el versículo entra por abajo; 1 cuando su final llega a ~40% de la pantalla.
    const progress = (vh * 0.9 - rect.top) / (rect.height + vh * 0.5);
    const lit = Math.round(Math.min(Math.max(progress, 0), 1) * words.length);
    words.forEach((w, i) => w.classList.toggle('is-on', i < lit));
    if (mark) mark.classList.toggle('is-on', lit > lastMarkWord);
  });
}

// La demo del compañero: "escribiendo…" y después la respuesta aparece palabra por
// palabra, como en un chat real. Las citas se muestran al final.
function initDemo(onStart) {
  const phone = document.querySelector('[data-demo]');
  if (!phone) return;
  const words = splitWords(phone.querySelector('[data-stream]'));
  phone.classList.add('demo-armed');

  const run = () => {
    onStart?.();
    phone.classList.add('is-typing');
    setTimeout(() => {
      phone.classList.remove('is-typing');
      phone.classList.add('is-streaming');
      let i = 0;
      const timer = setInterval(() => {
        words[i]?.classList.add('is-on');
        i += 1;
        if (i >= words.length) {
          clearInterval(timer);
          phone.classList.add('is-done');
        }
      }, 55);
    }, 1100);
  };

  const io = new IntersectionObserver(
    (entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      run();
    },
    { threshold: 0.45 },
  );
  io.observe(phone);
}

// Botones que se acercan levemente al cursor. Solo con mouse.
function initMagnetic() {
  if (!finePointer) return;
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    el.addEventListener('pointermove', (event) => {
      const r = el.getBoundingClientRect();
      const x = (event.clientX - (r.left + r.width / 2)) * 0.18;
      const y = (event.clientY - (r.top + r.height / 2)) * 0.3;
      el.style.translate = `${x}px ${y}px`;
    });
    el.addEventListener('pointerleave', () => {
      el.style.translate = '';
    });
  });
}
