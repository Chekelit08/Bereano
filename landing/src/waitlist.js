// Inserta en la tabla `waitlist` de Supabase usando la API REST (PostgREST).
// Usamos fetch directo en lugar de supabase-js: es un solo INSERT y ahorra ~40 KB.
//
// La clave que se usa acá es la publishable/anon: es pública por diseño.
// Lo que protege los datos es RLS en la base (ver supabase/migrations).

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Mismas reglas que los CHECK de la tabla. Validamos en los dos lados:
// acá para dar buen feedback, en la base porque el cliente no es confiable.
export const EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/;

export function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

export function isValidEmail(email) {
  return email.length <= 254 && EMAIL_RE.test(email);
}

export function normalizeName(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

export function isValidName(name) {
  return name.length >= 1 && name.length <= 80;
}

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
  throw new Error(`Supabase respondió ${res.status}`);
}
