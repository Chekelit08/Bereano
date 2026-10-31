// Lo personal de cada persona: resaltados con notas, diario de oración, recordatorio y tema.
// Todo queda en el teléfono. Sin imports de React Native: lo prueba test/personal.test.ts.
import { THEMES, type ThemePref } from './scheme-types';

export const HIGHLIGHT_COLORS = ['amarillo', 'verde', 'azul', 'rosa', 'violeta'] as const;
export type HighlightColor = (typeof HIGHLIGHT_COLORS)[number];
/** Color de fondo de cada resaltado (con transparencia, para claro y oscuro). */
export const HIGHLIGHT_HEX: Record<HighlightColor, string> = {
  amarillo: '#FFD43B',
  verde: '#51CF66',
  azul: '#4DABF7',
  rosa: '#F783AC',
  violeta: '#9775FA',
};

export type Highlight = { c: HighlightColor; n?: string; t: number };
/** Clave de un versículo: "jhn.3.16". */
export type VerseKey = `${string}.${number}.${number}`;
export const verseKey = (book: string, chapter: number, verse: number): VerseKey =>
  `${book}.${chapter}.${verse}`;

export function parseVerseKey(k: string): { book: string; chapter: number; verse: number } | null {
  const m = /^([1-3a-z][a-z0-9]{2})\.(\d{1,3})\.(\d{1,3})$/.exec(k);
  return m ? { book: m[1], chapter: Number(m[2]), verse: Number(m[3]) } : null;
}

export const NOTE_MAX = 1000;
export const PRAYER_MAX = 300;

export function parseHighlights(v: unknown): Record<string, Highlight> {
  if (!v || typeof v !== 'object') return {};
  const out: Record<string, Highlight> = {};
  for (const [k, h] of Object.entries(v as Record<string, unknown>).slice(0, 5000)) {
    if (!parseVerseKey(k) || !h || typeof h !== 'object') continue;
    const { c, n, t } = h as Record<string, unknown>;
    if (!HIGHLIGHT_COLORS.includes(c as HighlightColor) || typeof t !== 'number') continue;
    out[k] = {
      c: c as HighlightColor,
      t,
      ...(typeof n === 'string' && n.trim() && { n: n.slice(0, NOTE_MAX) }),
    };
  }
  return out;
}

export type Prayer = { id: string; text: string; at: number; answered?: number };

export function parsePrayers(v: unknown): Prayer[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter(
      (p): p is Prayer =>
        !!p &&
        typeof p.id === 'string' &&
        p.id.length <= 40 &&
        typeof p.text === 'string' &&
        p.text.trim().length > 0 &&
        typeof p.at === 'number' &&
        (p.answered === undefined || typeof p.answered === 'number'),
    )
    .slice(0, 500)
    .map((p) => ({
      id: p.id,
      text: p.text.slice(0, PRAYER_MAX),
      at: p.at,
      ...(p.answered && { answered: p.answered }),
    }));
}

export const REMINDER_TIMES = [
  { hour: 7, minute: 0 },
  { hour: 8, minute: 30 },
  { hour: 12, minute: 0 },
  { hour: 19, minute: 0 },
  { hour: 21, minute: 30 },
] as const;
export type Reminder = { hour: number; minute: number } | null;

export function parseReminder(v: unknown): Reminder {
  if (!v || typeof v !== 'object') return null;
  const { hour, minute } = v as Record<string, unknown>;
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null;
  if ((hour as number) < 0 || (hour as number) > 23 || (minute as number) < 0 || (minute as number) > 59)
    return null;
  return { hour: hour as number, minute: minute as number };
}

export function parseTheme(v: unknown): ThemePref {
  return THEMES.includes(v as ThemePref) ? (v as ThemePref) : 'system';
}

/** "7:00", "21:30". */
export const timeLabel = (r: { hour: number; minute: number }) =>
  `${r.hour}:${String(r.minute).padStart(2, '0')}`;
