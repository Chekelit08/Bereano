// "Cálido y natural": piedra, papel y salvia, con un oliva apagado de acento. Títulos en
// Newsreader, interfaz en Manrope, lectura en Literata. Sin contrastes fuertes.
import { useColorScheme } from 'react-native';

export const Colors = {
  light: {
    bg: '#ECEBE6', // piedra
    surface: '#F7F6F2', // papel
    surface2: '#E2DFD6', // arena
    text: '#262821', // carbón
    muted: '#686A60',
    line: '#2628211A',
    accent: '#56633F', // oliva (texto e íconos: 5,4:1)
    fill: '#C7D0B6', // salvia (botones y selección)
    fillInk: '#262821',
  },
  dark: {
    bg: '#1B1D18',
    surface: '#24271F',
    surface2: '#2E3127',
    text: '#E9E8E1',
    muted: '#A4A698',
    line: '#E9E8E11F',
    accent: '#B5C29A',
    fill: '#3A4130',
    fillInk: '#E9E8E1',
  },
} as const;

export type Palette = { [K in keyof typeof Colors.light]: string };

export function usePalette(): Palette {
  return Colors[useColorScheme() === 'dark' ? 'dark' : 'light'];
}

// Nombres con los que se cargan en _layout.tsx.
export const Fonts = {
  display: 'Newsreader_500Medium',
  displayItalic: 'Newsreader_400Regular_Italic',
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
