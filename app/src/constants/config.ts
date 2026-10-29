// Claves PÚBLICAS de Supabase (la publishable key está pensada para ir en la app).
// Las claves privadas (la de servicio de Supabase y la de Anthropic) NUNCA van acá: viven en la Edge Function.
export const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://annxvazsnzlkeqkrqwfk.supabase.co';
export const SUPABASE_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_KEY ?? 'sb_publishable_YPovJgyaAOjktYGZciD45Q_KIXGvW4E';

// Claves PÚBLICAS de RevenueCat (SDK). Sin ellas, el paywall funciona en modo demostración.
export const REVENUECAT_IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '';
export const REVENUECAT_ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '';
export const PLUS_ENTITLEMENT = 'plus';

// Precios de referencia (USD) mientras no lleguen los de la tienda.
export const FALLBACK_PRICES = { annual: 'USD 39,99', monthly: 'USD 6,99', annualPerMonth: 'USD 3,33' };
export const FREE_QUESTIONS = 3;
export const PLUS_DAILY_QUESTIONS = 30;
