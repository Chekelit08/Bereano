// Validación de email igual a la de la base (public.waitlist). Sin React Native: tiene test.
export const EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/;

export function normalizeEmail(v: string): string {
  return v.trim().toLowerCase();
}

export function isValidEmail(v: string): boolean {
  const e = normalizeEmail(v);
  return e.length <= 254 && EMAIL_RE.test(e);
}
