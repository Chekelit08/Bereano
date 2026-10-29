// Lógica pura del webhook de RevenueCat (sin red ni base), testeada en app/test/revenuecat.test.ts.
// Docs de eventos: https://www.revenuecat.com/docs/integrations/webhooks/event-types-and-fields

export const ENTITLEMENT = 'plus';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PERIODS: Record<string, string> = { NORMAL: 'normal', TRIAL: 'trial', INTRO: 'intro', PREPAID: 'prepaid' };

export type Apply = {
  userId: string;
  expiresAt: string | null; // ISO, o null = sin vencimiento
  periodType: string | null;
  store: string | null;
  eventTs: number;
};

/** Convierte el cuerpo del webhook en un cambio de suscripción, o explica por qué se ignora. */
export function parseEvent(body: unknown): Apply | { skip: string } {
  if (!body || typeof body !== 'object') return { skip: 'cuerpo inválido' };
  const e = (body as { event?: Record<string, unknown> }).event;
  if (!e || typeof e !== 'object') return { skip: 'sin evento' };

  const type = String(e.type ?? '');
  if (type === 'TEST') return { skip: 'evento de prueba' };
  if (type === 'TRANSFER') return { skip: 'transferencia (se resuelve en el próximo evento)' };

  const entitlements = Array.isArray(e.entitlement_ids) ? e.entitlement_ids.map(String) : [];
  if (!entitlements.includes(ENTITLEMENT) && type !== 'EXPIRATION') return { skip: 'no es de Plus' };

  // La app inicia sesión en RevenueCat con el id de usuario de Supabase (un UUID).
  const candidates = [e.app_user_id, e.original_app_user_id, ...(Array.isArray(e.aliases) ? e.aliases : [])];
  const userId = candidates.find((id): id is string => typeof id === 'string' && UUID.test(id));
  if (!userId) return { skip: 'sin usuario de Supabase' };

  const eventTs = Number(e.event_timestamp_ms);
  if (!Number.isFinite(eventTs) || eventTs <= 0) return { skip: 'sin fecha de evento' };

  const exp = e.expiration_at_ms;
  let expiresAt: string | null = null;
  if (exp !== null && exp !== undefined) {
    const ms = Number(exp);
    if (!Number.isFinite(ms)) return { skip: 'vencimiento inválido' };
    expiresAt = new Date(ms).toISOString();
  } else if (type === 'EXPIRATION') {
    expiresAt = new Date(eventTs).toISOString();
  }

  const periodType = PERIODS[String(e.period_type ?? '')] ?? null;
  const store = typeof e.store === 'string' ? e.store.slice(0, 40) : null;
  return { userId: userId.toLowerCase(), expiresAt, periodType, store, eventTs };
}

/** Compara el header de autorización sin filtrar por tiempo cuánto coincide. */
export function safeEqual(a: string, b: string): boolean {
  const ea = new TextEncoder().encode(a);
  const eb = new TextEncoder().encode(b);
  let diff = ea.length ^ eb.length;
  for (let i = 0; i < Math.max(ea.length, eb.length); i++) diff |= (ea[i] ?? 0) ^ (eb[i] ?? 0);
  return diff === 0;
}
