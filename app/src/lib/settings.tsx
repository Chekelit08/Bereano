import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, use, useEffect, useState, type ReactNode } from 'react';

import { cleanName, parseGoals, type Goal } from '@/data/onboarding';
import { dayKey, parseDays, type Activity, type Days } from '@/lib/dias';
import { parsePlans, type PlanState } from '@/lib/planes';

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
  };

  return <SettingsContext value={value}>{children}</SettingsContext>;
}

export function useSettings(): Ctx {
  const ctx = use(SettingsContext);
  if (!ctx) throw new Error('useSettings fuera de SettingsProvider');
  return ctx;
}
