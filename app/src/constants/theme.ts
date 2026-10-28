// Mismos colores y tipografías que la landing: papel y tinta.
import { useColorScheme } from 'react-native';

export const Colors = {
  light: {
    bg: '#efe7d8',
    surface: '#f6f0e4',
    text: '#16110d',
    muted: '#5e5146',
    line: '#16110d2e',
    accent: '#b83d18',
    accentInk: '#fbf5ea',
  },
  dark: {
    bg: '#0f0c0a',
    surface: '#1a1511',
    text: '#efe7d8',
    muted: '#b3a593',
    line: '#efe7d82b',
    accent: '#f06a3f',
    accentInk: '#0f0c0a',
  },
} as const;

export type Palette = { [K in keyof typeof Colors.light]: string };

export function usePalette(): Palette {
  return Colors[useColorScheme() === 'dark' ? 'dark' : 'light'];
}

// Nombres con los que se cargan en _layout.tsx.
export const Fonts = {
  display: 'Fraunces_400Regular',
  displayItalic: 'Fraunces_400Regular_Italic',
  displayMedium: 'Fraunces_500Medium',
  body: 'Literata_400Regular',
  bodyItalic: 'Literata_400Regular_Italic',
  bodyMedium: 'Literata_500Medium',
} as const;

export const Space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;
