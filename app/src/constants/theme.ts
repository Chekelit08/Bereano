// "Cielo vivo": azules profundos, luz de lámpara dorada (Salmo 119:105) y un cielo que cambia
// con la hora del día. Títulos en Instrument Serif, interfaz en Manrope, lectura en Literata.
import { useColorScheme } from 'react-native';

export const Colors = {
  light: {
    bg: '#F3F5F9', // neblina
    surface: '#FFFFFF',
    surface2: '#E8ECF4',
    text: '#141B2E', // tinta azul
    muted: '#5B6478',
    line: '#141B2E1A',
    accent: '#8A5A00', // oro viejo (texto sobre claro: 5,4:1)
    fill: '#F2B544', // oro de lámpara (botones)
    fillInk: '#141B2E',
  },
  dark: {
    bg: '#0B1220', // noche profunda
    surface: '#141C2E',
    surface2: '#1C2640',
    text: '#EEF1F7',
    muted: '#9AA3B8',
    line: '#EEF1F71F',
    accent: '#F2B544',
    fill: '#F2B544',
    fillInk: '#141B2E',
  },
} as const;

export type Palette = { [K in keyof typeof Colors.light]: string };

export function usePalette(): Palette {
  return Colors[useColorScheme() === 'dark' ? 'dark' : 'light'];
}

// Nombres con los que se cargan en _layout.tsx.
export const Fonts = {
  display: 'InstrumentSerif_400Regular',
  displayItalic: 'InstrumentSerif_400Regular_Italic',
  ui: 'Manrope_500Medium',
  uiSemi: 'Manrope_600SemiBold',
  uiBold: 'Manrope_700Bold',
  uiHeavy: 'Manrope_800ExtraBold',
  read: 'Literata_400Regular',
  readItalic: 'Literata_400Regular_Italic',
  readMedium: 'Literata_500Medium',
} as const;

export const Space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;
export const Radius = { sm: 12, md: 18, lg: 26, pill: 999 } as const;
