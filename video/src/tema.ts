import { loadFont } from '@remotion/fonts';
import { staticFile } from 'remotion';

export const C = {
  bg: '#FFFFFF',
  surface: '#F5F5F7',
  text: '#1D1D1F',
  muted: '#86868B',
  blue: '#0071E3',
  blueDark: '#0B1F4D',
};
export const UI = 'Inter, system-ui, sans-serif';
export const READ = 'Literata, Georgia, serif';

loadFont({ family: 'Inter', url: staticFile('fonts/inter.woff2'), weight: '100 900' });
loadFont({ family: 'Literata', url: staticFile('fonts/literata.woff2'), weight: '200 900' });
