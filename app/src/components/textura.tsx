import { StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

export type Moment = 'alba' | 'dia' | 'tarde' | 'noche';

export function momentOf(date = new Date()): Moment {
  const h = date.getHours();
  if (h >= 5 && h < 12) return 'alba';
  if (h >= 12 && h < 17) return 'dia';
  if (h >= 17 && h < 20) return 'tarde';
  return 'noche';
}

export const GREETING: Record<Moment, string> = {
  alba: 'Buenos días',
  dia: 'Buenas tardes',
  tarde: 'Buenas tardes',
  noche: 'Buenas noches',
};

// Manchas difusas de salvia, arena y arcilla: una textura suave, como papel teñido.
const SPOTS = {
  light: [
    { x: 0.15, y: 0.2, r: 0.75, c: '#B9C4A3', o: 0.75 },
    { x: 0.9, y: 0.15, r: 0.6, c: '#E3D6C2', o: 0.9 },
    { x: 0.75, y: 0.95, r: 0.7, c: '#D7B9A0', o: 0.55 },
    { x: 0.1, y: 0.95, r: 0.5, c: '#CBD3BC', o: 0.7 },
  ],
  dark: [
    { x: 0.15, y: 0.2, r: 0.75, c: '#46503A', o: 0.8 },
    { x: 0.9, y: 0.15, r: 0.6, c: '#3E3A30', o: 0.8 },
    { x: 0.75, y: 0.95, r: 0.7, c: '#4A3B30', o: 0.6 },
    { x: 0.1, y: 0.95, r: 0.5, c: '#38402F', o: 0.7 },
  ],
};

/** Fondo de la tarjeta del versículo del día. */
export function Textura({ dark, base }: { dark: boolean; base: string }) {
  const spots = SPOTS[dark ? 'dark' : 'light'];
  return (
    <Svg
      style={StyleSheet.absoluteFill}
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="none">
      <Defs>
        {spots.map((s, i) => (
          <RadialGradient key={i} id={`t${i}`} cx={s.x} cy={s.y} r={s.r}>
            <Stop offset="0" stopColor={s.c} stopOpacity={s.o} />
            <Stop offset="1" stopColor={s.c} stopOpacity="0" />
          </RadialGradient>
        ))}
      </Defs>
      <Rect width="100" height="100" fill={base} />
      {spots.map((_, i) => (
        <Rect key={i} width="100" height="100" fill={`url(#t${i})`} />
      ))}
    </Svg>
  );
}
