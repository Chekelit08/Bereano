// Inserta en la tabla `waitlist` de Supabase usando la API REST (PostgREST).
// Usamos fetch directo en lugar de supabase-js: es un solo INSERT y ahorra ~40 KB.
//
// La clave que se usa acá es la publishable/anon: es pública por diseño.
// Lo que protege los datos es RLS en la base (ver supabase/migrations).

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export { isValidEmail, isValidName, normalizeEmail, normalizeName } from './validation.js';

/**
 * @returns {Promise<'ok'>} se resuelve también si el email ya estaba anotado
 * (mismo mensaje en ambos casos: no revelamos qué emails existen).
 */
export async function joinWaitlist({ name = null, email, country = null, source }) {
  if (!url || !key) {
    throw new Error('Falta configurar VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY');
  }

  const headers = {
    apikey: key,
    'Content-Type': 'application/json',
    // Sin esto PostgREST intenta devolver la fila insertada, y eso requiere SELECT (que no damos).
    Prefer: 'return=minimal',
  };
  // Las claves anon "legacy" son JWT y van también en Authorization.
  // Las nuevas (sb_publishable_...) no son JWT y van solo en `apikey`.
  if (key.startsWith('eyJ')) headers.Authorization = `Bearer ${key}`;

  const res = await fetch(`${url}/rest/v1/waitlist`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name, email, country, source }),
  });

  if (res.status === 201) return 'ok';
  if (res.status === 409) return 'ok'; // email duplicado (violación de UNIQUE)

  const body = await res.json().catch(() => ({}));
  if (body.message === 'rate_limited') throw new RateLimitError();
  throw new Error(`Supabase respondió ${res.status}`);
}

// Lo lanza el trigger anti-spam de la base (supabase/migrations/*_waitlist_rate_limit.sql).
export class RateLimitError extends Error {
  constructor() {
    super('rate_limited');
    this.name = 'RateLimitError';
  }
}

export function errorMessage(err) {
  return err instanceof RateLimitError
    ? 'Recibimos muchas altas desde esta conexión. Prueba de nuevo en un rato.'
    : 'No pudimos guardar tus datos. Prueba de nuevo en un momento.';
}
