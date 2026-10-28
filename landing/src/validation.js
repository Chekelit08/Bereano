// Validación de los datos de la lista de espera. Mismas reglas que los CHECK de la
// tabla en Supabase (un test verifica que no se desincronicen). Validamos en los dos
// lados: acá para dar buen feedback, en la base porque el cliente no es confiable.

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
