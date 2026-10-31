// Edge Function: datos del panel de estadísticas (landing/panel.html).
//
// Seguridad: solo responde si el header Authorization trae `Bearer <PANEL_TOKEN>` (variable de
// entorno, al menos 32 caracteres). Lee un resumen agregado con la service_role; nunca devuelve
// eventos sueltos ni emails. verify_jwt = false en supabase/config.toml: no usa sesión de Supabase.
import { createClient } from '@supabase/supabase-js';

const TOKEN = Deno.env.get('PANEL_TOKEN') ?? '';
const ORIGINS = ['https://bereano.ezeadenett.workers.dev', 'https://bereano.app', 'http://localhost:5173', 'http://localhost:4173'];
const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false },
});

function safeEqual(a: string, b: string): boolean {
  const ea = new TextEncoder().encode(a);
  const eb = new TextEncoder().encode(b);
  let diff = ea.length ^ eb.length;
  for (let i = 0; i < Math.max(ea.length, eb.length); i++) diff |= (ea[i] ?? 0) ^ (eb[i] ?? 0);
  return diff === 0;
}

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin') ?? '';
  const cors = {
    'Access-Control-Allow-Origin': ORIGINS.includes(origin) ? origin : ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    Vary: 'Origin',
  };
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (req.method !== 'GET') return new Response('Método no permitido', { status: 405, headers: cors });

  const auth = req.headers.get('Authorization') ?? '';
  if (TOKEN.length < 32 || !safeEqual(auth, `Bearer ${TOKEN}`)) {
    return Response.json({ error: 'Clave incorrecta' }, { status: 401, headers: cors });
  }

  const days = Math.min(180, Math.max(1, Number(new URL(req.url).searchParams.get('days')) || 30));
  const { data, error } = await db.rpc('analytics_summary', { p_days: days });
  if (error) {
    console.error('panel: error al leer el resumen', error.code);
    return Response.json({ error: 'No se pudo leer el resumen' }, { status: 500, headers: cors });
  }
  return Response.json(data, { headers: { ...cors, 'Cache-Control': 'no-store' } });
});
