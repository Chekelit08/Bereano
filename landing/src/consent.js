// Consentimiento de cookies analíticas.
//
// Fuera de Europa, PostHog guarda un identificador en el navegador (como cualquier analítica).
// En Europa (RGPD/ePrivacy), por defecto NO guarda nada en el dispositivo: cuenta la visita
// en memoria y se olvida al cerrar la pestaña. Solo si la persona acepta, pasa a recordarla.
//
// Detectamos Europa por la zona horaria del navegador: no necesita pedir la ubicación y
// alcanza para España, que es el mercado europeo que nos importa.

const KEY = 'analytics_consent';

export function inEurope() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    return tz.startsWith('Europe/') || tz === 'Atlantic/Canary' || tz === 'Africa/Ceuta';
  } catch {
    return false;
  }
}

/** @returns {'yes' | 'no' | null} */
export function getConsent() {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'yes' || v === 'no' ? v : null;
  } catch {
    return null;
  }
}

export function saveConsent(value) {
  try {
    localStorage.setItem(KEY, value);
  } catch {
    // Sin almacenamiento: la elección dura solo esta visita.
  }
}

/** ¿Podemos guardar un identificador en el dispositivo? */
export function canPersist() {
  return !inEurope() || getConsent() === 'yes';
}

export function needsBanner() {
  return inEurope() && getConsent() === null;
}
