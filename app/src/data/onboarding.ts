// Onboarding: qué trae a la persona a Bereano. Con eso se elige el plan que se recomienda y la
// primera pregunta para el compañero. Sin imports de React Native: lo prueba test/onboarding.test.ts.

export const GOALS = ['paz', 'entender', 'habito', 'oracion', 'familia', 'empezar'] as const;
export type Goal = (typeof GOALS)[number];
export const NAME_MAX = 30;

export const GOAL_INFO: Record<Goal, { label: string; plan: string; question: string }> = {
  paz: {
    label: 'Encontrar paz',
    plan: 'ansiedad',
    question: '¿Qué dice la Biblia sobre la ansiedad?',
  },
  entender: {
    label: 'Entender la Biblia',
    plan: 'juan',
    question: '¿Por dónde empiezo a leer la Biblia?',
  },
  habito: {
    label: 'Leer todos los días',
    plan: 'juan',
    question: '¿Cómo puedo tener un tiempo diario con Dios?',
  },
  oracion: {
    label: 'Aprender a orar',
    plan: 'ansiedad',
    question: '¿Cómo enseñó Jesús a orar?',
  },
  familia: {
    label: 'Mi familia',
    plan: 'familia',
    question: '¿Qué dice la Biblia sobre la familia?',
  },
  empezar: {
    label: 'Conocer a Jesús',
    plan: 'juan',
    question: '¿Quién es Jesús según la Biblia?',
  },
};

/** El primer objetivo elegido decide el plan y la pregunta; sin objetivos, el plan de Juan. */
export function recommendation(goals: readonly Goal[]) {
  const info = GOAL_INFO[goals[0] ?? 'empezar'];
  return { plan: info.plan, question: info.question };
}

/** Nombre para el saludo: solo letras, espacios y algunos signos; recortado. */
export function cleanName(v: unknown): string {
  if (typeof v !== 'string') return '';
  return v
    .replace(/[^\p{L}\p{M} '.-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, NAME_MAX);
}

export function parseGoals(v: unknown): Goal[] {
  return Array.isArray(v) ? GOALS.filter((g) => v.includes(g)) : [];
}
