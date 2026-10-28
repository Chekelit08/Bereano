import { StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

export type Moment = 'alba' | 'dia' | 'tarde' | 'noche';

export function momentOf(date = new Date()): Moment {
  const h = date.getHours();
  if (h >= 5 && h < 9) return 'alba';
  if (h >= 9 && h < 17) return 'dia';
  if (h >= 17 && h < 20) return 'tarde';
  return 'noche';
}

export const GREETING: Record<Moment, string> = {
  alba: 'Buenos días',
  dia: 'Buen día',
  tarde: 'Buenas tardes',
  noche: 'Buenas noches',
};

// Colores del cielo de arriba hacia abajo, y dónde está la luz (sol o luna).
const SKIES: Record<Moment, { stops: string[]; light: { x: number; y: number; color: string } }> = {
  alba: {
    stops: ['#1B2650', '#4A4784', '#A9637E', '#DE8F7A'],
    light: { x: 0.78, y: 0.82, color: '#FFD9A8' },
  },
  dia: { stops: ['#1C4A92', '#2F67B3', '#4F86C8', '#7FA6D6'], light: { x: 0.82, y: 0.2, color: '#FFF4D6' } },
  tarde: {
    stops: ['#1A1844', '#4E3473', '#A9506C', '#D9784F'],
    light: { x: 0.25, y: 0.86, color: '#FFC27A' },
  },
  noche: {
    stops: ['#050A18', '#0B1631', '#16264D', '#22356A'],
    light: { x: 0.8, y: 0.22, color: '#F2E8C9' },
  },
};

// Estrellas fijas: siempre las mismas.
const STARS = Array.from({ length: 70 }, (_, i) => {
  const r = (n: number) => {
    const x = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  return { x: r(1) * 100, y: r(2) * 70, r: r(3) < 0.85 ? 0.35 : 0.7, o: 0.3 + r(4) * 0.6 };
});

/** Cielo de fondo que cambia con la hora: la firma visual de Bereano. */
export function Sky({ moment }: { moment: Moment }) {
  const sky = SKIES[moment];
  const isNight = moment === 'noche';
  return (
    <Svg
      style={StyleSheet.absoluteFill}
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="none">
      <Defs>
        <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          {sky.stops.map((c, i) => (
            <Stop key={i} offset={i / (sky.stops.length - 1)} stopColor={c} />
          ))}
        </LinearGradient>
        <RadialGradient id="glow" cx={sky.light.x} cy={sky.light.y} r="0.6">
          <Stop offset="0" stopColor={sky.light.color} stopOpacity={isNight ? 0.35 : 0.6} />
          <Stop offset="0.35" stopColor={sky.light.color} stopOpacity={isNight ? 0.08 : 0.2} />
          <Stop offset="1" stopColor={sky.light.color} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width="100" height="100" fill="url(#sky)" />
      <Rect width="100" height="100" fill="url(#glow)" />
      {isNight &&
        STARS.map((s, i) => <Circle key={i} cx={s.x} cy={s.y} r={s.r * 0.35} fill="#FFFFFF" opacity={s.o} />)}
      {/* Colinas lejanas */}
      <Path
        d="M0 88 C 15 82, 28 86, 40 83 C 55 79, 68 85, 80 82 C 90 80, 96 83, 100 82 L100 100 L0 100 Z"
        fill="#000000"
        opacity={isNight ? 0.35 : 0.12}
      />
    </Svg>
  );
}
