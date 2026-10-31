import { useSyncExternalStore } from 'react';
import { Appearance, Platform, useColorScheme } from 'react-native';

import type { ThemePref } from './scheme-types';

export { THEMES, type ThemePref } from './scheme-types';

// El tema vive fuera de React: lo usan usePalette y el layout raíz, que están por encima del
// SettingsProvider. Ajustes lo cambia con setThemePref.

let pref: ThemePref = 'system';
const listeners = new Set<() => void>();

export function setThemePref(next: ThemePref) {
  if (next === pref) return;
  pref = next;
  // En iOS y Android, así también siguen el tema los componentes nativos (alertas, teclado).
  if (Platform.OS !== 'web') Appearance.setColorScheme(next === 'system' ? 'unspecified' : next);
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** 'light' o 'dark' según lo elegido (o el sistema). */
export function useScheme(): 'light' | 'dark' {
  const system = useColorScheme();
  const p = useSyncExternalStore(
    subscribe,
    () => pref,
    () => pref,
  );
  if (p !== 'system') return p;
  return system === 'dark' ? 'dark' : 'light';
}
