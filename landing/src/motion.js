// Movimiento de la landing: aparición al hacer scroll, la demo del compañero que
// "escribe" su respuesta, el versículo que se ilumina, los botones magnéticos, la intro,
// el scroll suave, el cursor, la galería horizontal y la cinta.
// Todo se desactiva si el usuario pidió reducir el movimiento: el contenido se ve
// completo y estático.

import Lenis from 'lenis';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

/** @param {{ onDemoStart?: () => void }} [options] */
export function initMotion(options = {}) {
  initHeader();
  initProgress();
  if (reduce || !('IntersectionObserver' in window)) return;
  initIntro();
  initSmoothScroll();
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

  initVerseWords();
  initDemo(options.onDemoStart);
  initMagnetic();
  initCursor();
  initHorizontal();
  initMarquee();
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

// Intro: contador de 0 a 100 y la cortina se levanta. La decide public/theme.js
// (solo la primera visita de la sesión); si este script no llega, el CSS la cierra solo.
function initIntro() {
  const root = document.documentElement;
  const intro = document.querySelector('.intro');
  if (!intro || !root.classList.contains('intro-on')) return;
  const count = intro.querySelector('[data-count]');
  const start = performance.now();
  const duration = 900;
  const tick = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - (1 - t) ** 3;
    count.textContent = String(Math.round(eased * 100)).padStart(3, '0');
    if (t < 1) requestAnimationFrame(tick);
    else setTimeout(() => intro.classList.add('is-leaving'), 120);
  };
  requestAnimationFrame(tick);
}

// Scroll suave con Lenis, solo con mouse o trackpad (en el celular el nativo es mejor).
let lenis = null;
function initSmoothScroll() {
  if (!finePointer) return;
  lenis = new Lenis({ autoRaf: true, anchors: true, lerp: 0.12 });

  // Con el aviso de "próximamente" abierto, la página de atrás no se mueve.
  const dialog = document.getElementById('soon-dialog');
  if (dialog) {
    new MutationObserver(() => (dialog.open ? lenis.stop() : lenis.start())).observe(dialog, {
      attributes: true,
      attributeFilter: ['open'],
    });
  }
}

// Barra finita arriba que muestra cuánto falta de la página.
function initProgress() {
  const bar = document.querySelector('.progress');
  if (!bar) return;
  onScroll(() => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.setProperty('--p', max > 0 ? (window.scrollY / max).toFixed(4) : 0);
  });
}

// Cursor propio: sigue al mouse con inercia, crece sobre lo clickeable y muestra
// una etiqueta donde hay [data-cursor]. El cursor del sistema sigue visible.
function initCursor() {
  const cursor = document.querySelector('.cursor');
  if (!cursor || !finePointer) return;
  const label = cursor.querySelector('.cursor__label');
  let x = 0;
  let y = 0;
  let cx = 0;
  let cy = 0;

  window.addEventListener('pointermove', (event) => {
    x = event.clientX;
    y = event.clientY;
    cursor.classList.add('is-active');
    const target = event.target.closest?.('a, button, summary, [data-cursor], input, select');
    const text = target?.closest('[data-cursor]')?.dataset.cursor || '';
    cursor.classList.toggle('is-hover', Boolean(target) && !text);
    cursor.classList.toggle('has-label', Boolean(text));
    if (text) label.textContent = text;
  });
  document.addEventListener('pointerleave', () => cursor.classList.remove('is-active'));

  const loop = () => {
    cx += (x - cx) * 0.2;
    cy += (y - cy) * 0.2;
    cursor.style.setProperty('--cx', `${cx}px`);
    cursor.style.setProperty('--cy', `${cy}px`);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

// Galería de planes: en escritorio con mouse queda fija y avanza de costado con el
// scroll vertical. En el celular es un carrusel nativo (CSS), así que no se toca.
function initHorizontal() {
  const section = document.querySelector('[data-hscroll]');
  if (!section || !matchMedia('(min-width: 900px) and (pointer: fine)').matches) return;
  const track = section.querySelector('[data-track]');
  section.classList.add('hscroll-on');

  let distance = 0;
  const measure = () => {
    distance = Math.max(track.scrollWidth - window.innerWidth, 0);
    section.style.height = `${window.innerHeight + distance}px`;
  };
  measure();
  window.addEventListener('resize', measure);

  onScroll(() => {
    const top = section.getBoundingClientRect().top;
    const progress = Math.min(Math.max(-top / (distance || 1), 0), 1);
    track.style.setProperty('--tx', `${-progress * distance}px`);
  });

  // Con teclado: si el foco cae en una tarjeta fuera de pantalla, la página scrollea hasta ella.
  track.addEventListener('focusin', (event) => {
    const card = event.target.closest('li');
    if (!card || !distance) return;
    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    const target = Math.min(card.offsetLeft - window.innerWidth * 0.1, distance);
    window.scrollTo({ top: sectionTop + Math.max(target, 0) });
  });
}

// La cinta acelera con la velocidad del scroll y cambia de sentido al subir.
function initMarquee() {
  const marquee = document.querySelector('.marquee');
  const track = marquee?.querySelector('.marquee__track');
  if (!track) return;
  marquee.classList.add('marquee--js');

  let offset = 0;
  let lastY = window.scrollY;
  let direction = 1;
  let boost = 0;
  const loop = () => {
    const y = window.scrollY;
    const delta = y - lastY;
    lastY = y;
    if (delta !== 0) direction = delta > 0 ? 1 : -1;
    boost += (Math.min(Math.abs(delta), 80) - boost) * 0.1;
    offset -= (0.6 + boost * 0.35) * direction;
    const half = track.scrollWidth / 2;
    if (half > 0) offset = ((offset % half) - half) % half;
    track.style.setProperty('--mx', `${offset}px`);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
