// Edge Function: webhook de RevenueCat. Mantiene public.subscriptions al día.
//
// Seguridad: RevenueCat manda el header Authorization que configuramos en su panel; se compara
// con REVENUECAT_WEBHOOK_AUTH (variable de entorno). Sin eso, 401. Solo esta función escribe
// suscripciones (service_role). Se configura con verify_jwt = false en supabase/config.toml,
// porque RevenueCat no manda un JWT de Supabase.
import { createClient } from '@supabase/supabase-js';

import { parseEvent, safeEqual } from './core.ts';

const SECRET = Deno.env.get('REVENUECAT_WEBHOOK_AUTH') ?? '';
const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false },
});

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Método no permitido', { status: 405 });
  if (SECRET.length < 32 || !safeEqual(req.headers.get('Authorization') ?? '', SECRET)) {
    return new Response('No autorizado', { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response('JSON inválido', { status: 400 });
  }

  const change = parseEvent(body);
  // Los eventos que no nos importan se confirman igual (200) para que RevenueCat no reintente.
  if ('skip' in change) return Response.json({ ok: true, skipped: change.skip });

  const { error } = await db.rpc('subscription_apply', {
    p_user: change.userId,
    p_expires: change.expiresAt,
    p_period: change.periodType,
    p_store: change.store,
    p_event_ts: change.eventTs,
  });
  if (error) {
    console.error('revenuecat-webhook: no pude guardar', error.code);
    return new Response('Error al guardar', { status: 500 }); // RevenueCat reintenta
  }
  return Response.json({ ok: true });
});
