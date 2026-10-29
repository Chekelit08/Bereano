import type { Plan } from '@/data/planes';

/** Progreso de un plan, guardado en el teléfono: qué día empezó y qué días leyó. */
export type PlanState = { start: string; done: number[] };

export function planProgress(plan: Plan, state: PlanState | undefined) {
  const total = plan.days.length;
  if (!state) return { started: false, done: 0, total, next: 0, finished: false };
  const done = new Set(state.done.filter((d) => d >= 0 && d < total));
  let next = 0;
  while (next < total && done.has(next)) next++;
  return {
    started: true,
    done: done.size,
    total,
    next: Math.min(next, total - 1),
    finished: done.size === total,
  };
}

/** Valida lo guardado (el almacenamiento local también es entrada). */
export function parsePlans(v: unknown): Record<string, PlanState> {
  if (!v || typeof v !== 'object') return {};
  const out: Record<string, PlanState> = {};
  for (const [id, s] of Object.entries(v as Record<string, unknown>)) {
    if (!/^[a-z0-9-]{1,40}$/.test(id) || !s || typeof s !== 'object') continue;
    const st = s as Record<string, unknown>;
    if (typeof st.start !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(st.start)) continue;
    const done = Array.isArray(st.done)
      ? st.done.filter((d): d is number => Number.isInteger(d) && d >= 0 && d < 400)
      : [];
    out[id] = { start: st.start, done: [...new Set(done)].sort((a, b) => a - b) };
  }
  return out;
}
