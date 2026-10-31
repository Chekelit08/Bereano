import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, use, useEffect, useState, type ReactNode } from 'react';

import { cleanName, parseGoals, type Goal } from '@/data/onboarding';
import { dayKey, parseDays, type Activity, type Days } from '@/lib/dias';
import {
  NOTE_MAX,
  PRAYER_MAX,
  parseHighlights,
  parsePrayers,
  parseReminder,
  parseTheme,
  type Highlight,
  type HighlightColor,
  type Prayer,
  type Reminder,
} from '@/lib/personal';
import { parsePlans, type PlanState } from '@/lib/planes';
import { setThemePref, type ThemePref } from '@/lib/scheme';

export const FONT_SIZES = [16, 18, 20, 22, 25, 28] as const;

export type LastRead = { book: string; chapter: number };
type Settings = {
  fontStep: number;
  lastRead: LastRead | null;
  saved: string[];
  /** Onboarding: si ya lo vio, cómo quiere que lo saludemos y qué lo trae. */
  onboarded: boolean;
  name: string;
  goals: Goal[];
  days: Days;
  plans: Record<string, PlanState>;
  /** Resaltados por versículo ("jhn.3.16"), con nota opcional. */
  highlights: Record<string, Highlight>;
  prayers: Prayer[];
  reminder: Reminder;
  theme: ThemePref;
  /** Ya se anotó para recibir el devocional por email (no se guarda el email). */
  emailJoined: boolean;
};

const KEY = 'bereano.settings.v1';
const DEFAULTS: Settings = {
  fontStep: 2,
  lastRead: null,
  saved: [],
  onboarded: false,
  name: '',
  goals: [],
  days: {},
  plans: {},
  highlights: {},
  prayers: [],
  reminder: null,
  theme: 'system',
  emailJoined: false,
};

type Ctx = Settings & {
  fontSize: number;
  changeFont: (delta: 1 | -1) => void;
  setLastRead: (r: LastRead) => void;
  /** Guarda o quita un devocional de la lista de guardados. */
  toggleSaved: (id: string) => void;
  /** Ya cargó lo guardado (antes de eso no se sabe si vio el onboarding). */
  loaded: boolean;
  finishOnboarding: (o: { name: string; goals: Goal[] }) => void;
  /** Registra que hoy hizo algo (para la racha y el momento de hoy). */
  markDay: (a: Activity) => void;
  /** Planes de lectura: empezar, marcar un día como leído (o desmarcarlo) y dejar. */
  startPlan: (id: string) => void;
  togglePlanDay: (id: string, day: number) => void;
  leavePlan: (id: string) => void;
  /** Resalta (o quita, con null) varios versículos a la vez. */
  setHighlight: (keys: string[], color: HighlightColor | null) => void;
  setNote: (key: string, note: string) => void;
  addPrayer: (text: string) => void;
  togglePrayer: (id: string) => void;
  removePrayer: (id: string) => void;
  setReminder: (r: Reminder) => void;
  setTheme: (t: ThemePref) => void;
  setEmailJoined: () => void;
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
    return {
      fontStep,
      lastRead,
      saved,
      onboarded: v.onboarded === true,
      name: cleanName(v.name),
      goals: parseGoals(v.goals),
      highlights: parseHighlights(v.highlights),
      prayers: parsePrayers(v.prayers),
      reminder: parseReminder(v.reminder),
      theme: parseTheme(v.theme),
      emailJoined: v.emailJoined === true,
      days: parseDays(v.days),
      plans: parsePlans(v.plans),
    };
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

  // El tema elegido se aplica en toda la app (usePalette lo lee de lib/scheme).
  useEffect(() => {
    setThemePref(settings.theme);
  }, [settings.theme]);

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
    startPlan: (id) =>
      setSettings((s) =>
        s.plans[id] ? s : { ...s, plans: { ...s.plans, [id]: { start: dayKey(), done: [] } } },
      ),
    togglePlanDay: (id, day) =>
      setSettings((s) => {
        const st = s.plans[id] ?? { start: dayKey(), done: [] };
        const done = st.done.includes(day)
          ? st.done.filter((d) => d !== day)
          : [...st.done, day].sort((a, b) => a - b);
        return { ...s, plans: { ...s.plans, [id]: { ...st, done } } };
      }),
    leavePlan: (id) =>
      setSettings((s) => {
        const plans = { ...s.plans };
        delete plans[id];
        return { ...s, plans };
      }),
    markDay: (a) =>
      setSettings((s) => {
        const k = dayKey();
        if (s.days[k]?.[a]) return s;
        return { ...s, days: { ...s.days, [k]: { ...s.days[k], [a]: 1 } } };
      }),
    loaded,
    finishOnboarding: ({ name, goals }) =>
      setSettings((s) => ({
        ...s,
        onboarded: true,
        name: cleanName(name),
        goals: parseGoals(goals),
      })),
    toggleSaved: (id) =>
      setSettings((s) => ({
        ...s,
        saved: s.saved.includes(id) ? s.saved.filter((x) => x !== id) : [id, ...s.saved],
      })),
    setHighlight: (keys, color) =>
      setSettings((s) => {
        const highlights = { ...s.highlights };
        for (const k of keys) {
          if (color) highlights[k] = { ...highlights[k], c: color, t: Date.now() };
          else delete highlights[k];
        }
        return { ...s, highlights };
      }),
    setNote: (key, note) =>
      setSettings((s) => {
        const h = s.highlights[key] ?? { c: 'amarillo' as const, t: Date.now() };
        const n = note.trim().slice(0, NOTE_MAX);
        const next: Highlight = { c: h.c, t: h.t, ...(n && { n }) };
        return { ...s, highlights: { ...s.highlights, [key]: next } };
      }),
    addPrayer: (text) =>
      setSettings((s) => {
        const t = text.replace(/\s+/g, ' ').trim().slice(0, PRAYER_MAX);
        if (!t) return s;
        const p: Prayer = {
          id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
          text: t,
          at: Date.now(),
        };
        return { ...s, prayers: [p, ...s.prayers].slice(0, 500) };
      }),
    togglePrayer: (id) =>
      setSettings((s) => ({
        ...s,
        prayers: s.prayers.map((p) =>
          p.id !== id
            ? p
            : p.answered
              ? { id: p.id, text: p.text, at: p.at }
              : { ...p, answered: Date.now() },
        ),
      })),
    removePrayer: (id) => setSettings((s) => ({ ...s, prayers: s.prayers.filter((p) => p.id !== id) })),
    setReminder: (reminder) => setSettings((s) => ({ ...s, reminder })),
    setTheme: (theme) => setSettings((s) => ({ ...s, theme })),
    setEmailJoined: () => setSettings((s) => ({ ...s, emailJoined: true })),
  };

  return <SettingsContext value={value}>{children}</SettingsContext>;
}

export function useSettings(): Ctx {
  const ctx = use(SettingsContext);
  if (!ctx) throw new Error('useSettings fuera de SettingsProvider');
  return ctx;
}
