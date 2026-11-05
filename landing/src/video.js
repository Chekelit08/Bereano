// Video de presentación: arranca sin sonido cuando entra en pantalla y se pausa al salir.
// El botón activa el sonido (y lo reinicia desde el principio la primera vez).
import { track } from './analytics.js';

export function initVideo(root = document) {
  const video = root.querySelector('[data-video]');
  const button = root.querySelector('[data-video-sound]');
  if (!video || !button) return;
  const label = button.querySelector('[data-video-sound-label]');
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let seen = false;

  // En el celular va la versión vertical (9:16), que llena la pantalla.
  if (window.matchMedia?.('(max-width: 600px)').matches && video.dataset.srcVertical) {
    video.src = video.dataset.srcVertical;
    video.poster = video.dataset.posterVertical ?? video.poster;
    video.width = 720;
    video.height = 1280;
    video.closest('figure')?.classList.add('video-intro__frame--vertical');
  }
  let unmutedOnce = false;

  if (reduce) {
    // Sin reproducción automática: el que quiera lo mira con los controles.
    video.controls = true;
  } else if ('IntersectionObserver' in window) {
    new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
          if (!seen) {
            seen = true;
            track('video_visto');
          }
        } else {
          video.pause();
        }
      },
      { threshold: 0.4 },
    ).observe(video);
  }

  button.addEventListener('click', () => {
    const on = video.muted;
    video.muted = !on;
    if (on && !unmutedOnce) {
      unmutedOnce = true;
      video.currentTime = 0;
      track('video_sonido');
    }
    if (on) video.play().catch(() => {});
    button.setAttribute('aria-pressed', String(on));
    label.textContent = on ? 'Silenciar' : 'Activar sonido';
  });
}
