// Memorizar versículos: práctica tapando palabras y repaso espaciado. Todo queda en el teléfono.
// Sin imports de React Native: lo prueba test/memoria.test.ts.
import { parseVerseKey } from './personal';

/** Nivel 0–3: cuántas palabras se tapan (25 %, 50 %, 75 %, todas). */
export const LEVELS = [0.25, 0.5, 0.75, 1] as const;
/** Días hasta el próximo repaso según cuántas veces seguidas lo supo. */
export const INTERVALS = [1, 3, 7, 14, 30] as const;

export type MemoryItem = { added: number; streak: number; due: string };

export function dayKeyOf(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function rand(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** Qué palabras se tapan: siempre las mismas para el mismo versículo y nivel (no "salta"). */
export function maskedWords(text: string, level: number, seed: number): boolean[] {
  const words = text.split(' ');
  const ratio = LEVELS[Math.max(0, Math.min(LEVELS.length - 1, level))];
  const order = words.map((w, i) => ({
    i,
    k: rand(seed * 31 + i),
    letters: w.replace(/[^\p{L}]/gu, '').length,
  }));
  // Primero se tapan las palabras con letras (no la puntuación sola), en un orden fijo al azar.
  const candidates = order.filter((o) => o.letters > 0).sort((a, b) => a.k - b.k);
  const count = ratio >= 1 ? candidates.length : Math.max(1, Math.round(candidates.length * ratio));
  const hidden = new Set(candidates.slice(0, count).map((o) => o.i));
  return words.map((_, i) => hidden.has(i));
}

/** Próximo repaso: si lo supo, el intervalo crece; si le costó, vuelve mañana. */
export function review(item: MemoryItem, knew: boolean, today = new Date()): MemoryItem {
  const streak = knew ? Math.min(item.streak + 1, INTERVALS.length) : 0;
  const days = knew ? INTERVALS[streak - 1] : 1;
  const due = new Date(today.getFullYear(), today.getMonth(), today.getDate() + days);
  return { ...item, streak, due: dayKeyOf(due) };
}

export function isDue(item: MemoryItem, today = new Date()): boolean {
  return item.due <= dayKeyOf(today);
}

export function parseMemory(v: unknown): Record<string, MemoryItem> {
  if (!v || typeof v !== 'object') return {};
  const out: Record<string, MemoryItem> = {};
  for (const [k, m] of Object.entries(v as Record<string, unknown>).slice(0, 500)) {
    if (!parseVerseKey(k) || !m || typeof m !== 'object') continue;
    const { added, streak, due } = m as Record<string, unknown>;
    if (typeof added !== 'number' || !Number.isInteger(streak) || typeof due !== 'string') continue;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(due)) continue;
    out[k] = { added, streak: Math.max(0, Math.min(INTERVALS.length, streak as number)), due };
  }
  return out;
}

/** Sin Plus se puede memorizar un versículo; con Plus, todos los que quieras. */
export const FREE_MEMORY = 1;
