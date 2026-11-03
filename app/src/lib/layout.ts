import { Platform, useWindowDimensions } from 'react-native';

/** Pantalla ancha (computadora): barra lateral en vez de pestañas abajo y contenido a dos columnas. */
export const WIDE = 960;

export function useWide(): boolean {
  const { width } = useWindowDimensions();
  return Platform.OS === 'web' && width >= WIDE;
}
