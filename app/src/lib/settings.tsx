import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, use, useEffect, useState, type ReactNode } from 'react';

import { CARD_STYLES, type CardStyle } from '@/components/story-card';
import { dayKey, parseDays, type Activity, type Days } from '@/lib/dias';

export const FONT_SIZES = [16, 18, 20, 22, 25, 28] as const;

export type LastRead = { book: string; chapter: number };
type Settings = {
  fontStep: number;
  lastRead: LastRead | null;
  saved: string[];
  cardStyle: CardStyle;
  days: Days;
};

const KEY = 'bereano.settings.v1';
const DEFAULTS: Settings = { fontStep: 2, lastRead: null, saved: [], cardStyle: 'editorial', days: {} };

type Ctx = Settings & {
  fontSize: number;
  changeFont: (delta: 1 | -1) => void;
  setLastRead: (r: LastRead) => void;
  /** Guarda o quita un devocional de la lista de guardados. */
  toggleSaved: (id: string) => void;
  setCardStyle: (s: CardStyle) => void;
  /** Registra que hoy hizo algo (para la racha y el momento de hoy). */
  markDay: (a: Activity) => void;
};

const SettingsContext = createContext<Ctx | null>(null);

/** Lee lo guardado y lo valida: el almacenamiento local también es "entrada". */
function parse(raw: string | null): Settings {
  try {
    const v = raw ? JSON.parse(raw) : {};
    const fontStep =
      Number.isInteger(v.fontStep) && v.fontStep >= 0 && v.fontStep < FONT_SIZES.length
        ? v.fontStep
        : DEFAULTS.fontStep;
    const lr = v.lastRead;
    const lastRead =
      lr &&
      typeof lr.book === 'string' &&
      /^[1-3a-z][a-z0-9]{2}$/.test(lr.book) &&
      Number.isInteger(lr.chapter)
        ? { book: lr.book, chapter: lr.chapter }
        : null;
    const saved = Array.isArray(v.saved)
      ? v.saved.filter((id: unknown) => typeof id === 'string' && /^[a-z0-9-]{1,40}$/.test(id)).slice(0, 500)
      : [];
    const cardStyle = CARD_STYLES.some((c) => c.id === v.cardStyle)
      ? (v.cardStyle as CardStyle)
      : DEFAULTS.cardStyle;
    return { fontStep, lastRead, saved, cardStyle, days: parseDays(v.days) };
  } catch {
    return DEFAULTS;
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      // Si ya se abrió un capítulo mientras cargaba, gana ese.
      .then((raw) => setSettings((s) => ({ ...parse(raw), ...(s.lastRead && { lastRead: s.lastRead }) })))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(KEY, JSON.stringify(settings)).catch(() => {});
  }, [settings, loaded]);

  const value: Ctx = {
    ...settings,
    fontSize: FONT_SIZES[settings.fontStep],
    changeFont: (delta) =>
      setSettings((s) => ({
        ...s,
        fontStep: Math.min(FONT_SIZES.length - 1, Math.max(0, s.fontStep + delta)),
      })),
    setLastRead: (lastRead) =>
      setSettings((s) =>
        s.lastRead?.book === lastRead.book && s.lastRead.chapter === lastRead.chapter
          ? s
          : { ...s, lastRead },
      ),
    markDay: (a) =>
      setSettings((s) => {
        const k = dayKey();
        if (s.days[k]?.[a]) return s;
        return { ...s, days: { ...s.days, [k]: { ...s.days[k], [a]: 1 } } };
      }),
    setCardStyle: (cardStyle) => setSettings((s) => ({ ...s, cardStyle })),
    toggleSaved: (id) =>
      setSettings((s) => ({
        ...s,
        saved: s.saved.includes(id) ? s.saved.filter((x) => x !== id) : [id, ...s.saved],
      })),
  };

  return <SettingsContext value={value}>{children}</SettingsContext>;
}

export function useSettings(): Ctx {
  const ctx = use(SettingsContext);
  if (!ctx) throw new Error('useSettings fuera de SettingsProvider');
  return ctx;
}
