// Estilo Apple: blanco, negro y grises neutros, con el azul de Apple como único acento. Inter para títulos e interfaz, Literata para leer.
import { useColorScheme } from 'react-native';

export const Colors = {
  light: {
    bg: '#FFFFFF',
    surface: '#F5F5F7',
    surface2: '#E8E8ED',
    text: '#1D1D1F',
    muted: '#6E6E73',
    line: '#0000001A',
    accent: '#0066CC', // azul Apple para texto y links (5,1:1 sobre gris)
    fill: '#0071E3', // botones y selección
    fillInk: '#FFFFFF',
  },
  dark: {
    bg: '#000000',
    surface: '#1C1C1E',
    surface2: '#2C2C2E',
    text: '#F5F5F7',
    muted: '#98989D',
    line: '#FFFFFF24',
    accent: '#2997FF',
    fill: '#0071E3',
    fillInk: '#FFFFFF',
  },
} as const;

export type Palette = { [K in keyof typeof Colors.light]: string };

export function usePalette(): Palette {
  return Colors[useColorScheme() === 'dark' ? 'dark' : 'light'];
}

// Nombres con los que se cargan en _layout.tsx.
export const Fonts = {
  display: 'Inter_700Bold',
  displayItalic: 'Inter_700Bold',
  ui: 'Inter_400Regular',
  uiSemi: 'Inter_500Medium',
  uiBold: 'Inter_600SemiBold',
  uiHeavy: 'Inter_700Bold',
  read: 'Literata_400Regular',
  readItalic: 'Literata_400Regular_Italic',
  readMedium: 'Literata_500Medium',
} as const;

export const Space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;
export const Radius = { sm: 12, md: 18, lg: 26, pill: 999 } as const;
