// Tema elegido en Ajustes: el del sistema, claro u oscuro.
export const THEMES = ['system', 'light', 'dark'] as const;
export type ThemePref = (typeof THEMES)[number];
