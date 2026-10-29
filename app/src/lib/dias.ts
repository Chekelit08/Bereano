// Racha y "momento de hoy": qué hizo el usuario cada día. Todo queda en el teléfono.
export type Activity = 'devo' | 'read' | 'chat';
export type Days = Record<string, Partial<Record<Activity, 1>>>;

export function dayKey(d = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Días seguidos con al menos una actividad. Si hoy todavía no hizo nada, cuenta hasta ayer. */
export function streak(days: Days, today = new Date()): number {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (!hasAny(days, d)) d.setDate(d.getDate() - 1);
  let n = 0;
  while (hasAny(days, d)) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

function hasAny(days: Days, d: Date) {
  const v = days[dayKey(d)];
  return !!v && Object.keys(v).length > 0;
}

/** Valida lo guardado y se queda con los últimos 400 días. */
export function parseDays(v: unknown): Days {
  if (!v || typeof v !== 'object') return {};
  const out: Days = {};
  for (const [k, a] of Object.entries(v as Record<string, unknown>)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(k) || !a || typeof a !== 'object') continue;
    const clean: Partial<Record<Activity, 1>> = {};
    for (const act of ['devo', 'read', 'chat'] as const)
      if ((a as Record<string, unknown>)[act]) clean[act] = 1;
    out[k] = clean;
  }
  return Object.fromEntries(Object.entries(out).sort().slice(-400));
}
