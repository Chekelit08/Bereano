// Claves PÚBLICAS de Supabase (la publishable key está pensada para ir en la app).
// La service_role y la clave de Anthropic NUNCA van acá: viven en la Edge Function.
export const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://annxvazsnzlkeqkrqwfk.supabase.co';
export const SUPABASE_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_KEY ?? 'sb_publishable_YPovJgyaAOjktYGZciD45Q_KIXGvW4E';
