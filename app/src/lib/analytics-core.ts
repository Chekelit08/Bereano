// Validación de eventos (sin React Native: lo prueba test/personal.test.ts). Coincide con los
// CHECK de public.analytics_events.
export type EventProps = Record<string, string | number | boolean>;

export function cleanEvent(
  name: string,
  props: Record<string, unknown>,
): { name: string; props: EventProps } | null {
  if (!/^[a-z0-9_]{2,48}$/.test(name)) return null;
  const out: EventProps = {};
  for (const [k, v] of Object.entries(props).slice(0, 8)) {
    if (!/^[a-z0-9_]{1,24}$/.test(k)) continue;
    if (typeof v === 'string') out[k] = v.slice(0, 60);
    else if (typeof v === 'number' && Number.isFinite(v)) out[k] = v;
    else if (typeof v === 'boolean') out[k] = v;
  }
  return { name, props: out };
}

/** Ruta de Expo Router sin parámetros concretos: "planes/[id]/[dia]". */
export function screenName(segments: string[]): string {
  return segments.join('/') || '(tabs)';
}
