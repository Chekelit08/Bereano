// Estadísticas propias para el panel (public.analytics_events en Supabase). Anónimas: un id
// aleatorio de visita, la página, el evento y unos pocos datos sin información personal.
// Sin consentimiento (visitantes de Europa) el id vive solo en memoria: no se guarda nada.

import { canPersist } from './consent.js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
const KEY = 'bereano.visitor';

let visitor = null;
const queue = [];
let timer = null;

function newId() {
  return crypto.randomUUID ? crypto.randomUUID() : '00000000-0000-4000-8000-' + String(Date.now()).padStart(12, '0').slice(-12);
}

function getVisitor() {
  if (visitor) return visitor;
  try {
    visitor = canPersist() ? localStorage.getItem(KEY) : null;
    if (!visitor || !/^[0-9a-f-]{36}$/.test(visitor)) {
      visitor = newId();
      if (canPersist()) localStorage.setItem(KEY, visitor);
    }
  } catch {
    visitor = newId();
  }
  return visitor;
}

/** Mismas reglas que los CHECK de la base. */
export function cleanEvent(name, props = {}) {
  if (!/^[a-z0-9_]{2,48}$/.test(name)) return null;
  const out = {};
  for (const [k, v] of Object.entries(props).slice(0, 8)) {
    if (!/^[a-z0-9_]{1,24}$/.test(k)) continue;
    if (typeof v === 'string') out[k] = v.slice(0, 60);
    else if ((typeof v === 'number' && Number.isFinite(v)) || typeof v === 'boolean') out[k] = v;
  }
  return { name, props: out };
}

function flush() {
  timer = null;
  if (!queue.length || !url || !key) return;
  const rows = queue.splice(0);
  // keepalive: se manda aunque la persona cierre la pestaña.
  fetch(`${url}/rest/v1/analytics_events`, {
    method: 'POST',
    keepalive: true,
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(rows),
  }).catch(() => {});
}

export function record(name, props) {
  const ev = cleanEvent(name, props);
  if (!ev || import.meta.env.DEV) return;
  queue.push({ source: 'landing', name: ev.name, screen: location.pathname.slice(0, 80), visitor: getVisitor(), props: ev.props });
  if (queue.length >= 20) flush();
  else if (!timer) timer = setTimeout(flush, 3000);
}

addEventListener('pagehide', flush);
addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') flush();
});
