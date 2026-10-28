// PostHog se carga de forma diferida (import dinámico) para no frenar el primer render:
// los eventos que ocurren antes de que cargue quedan en cola y se envían después.

const key = import.meta.env.VITE_POSTHOG_KEY;
const host = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

let posthog = null;
const queue = [];

export function initAnalytics() {
  if (!key) {
    if (import.meta.env.DEV) console.info('[analytics] Sin VITE_POSTHOG_KEY: los eventos solo se muestran en consola.');
    return;
  }
  import('posthog-js')
    .then(({ default: ph }) => {
      ph.init(key, {
        api_host: host,
        // Solo eventos explícitos: el autocapture podría registrar textos de la página
        // que no necesitamos, y así cada evento tiene un nombre claro para los embudos.
        autocapture: false,
        capture_pageview: true,
        capture_pageleave: true,
        // Nada de grabar sesiones: hay un formulario con datos personales.
        disable_session_recording: true,
        disable_surveys: true,
        // No creamos perfiles de persona para visitantes anónimos (más barato y más privado).
        person_profiles: 'identified_only',
      });
      posthog = ph;
      for (const [event, properties] of queue.splice(0)) ph.capture(event, properties);
    })
    .catch(() => {
      // Bloqueador de anuncios o red caída: la landing funciona igual.
    });
}

export function track(event, properties = {}) {
  if (import.meta.env.DEV) console.info('[analytics]', event, properties);
  if (!key) return;
  if (posthog) posthog.capture(event, properties);
  else queue.push([event, properties]);
}
