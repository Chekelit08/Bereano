import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import type { Palabra } from '../voz';
import { C, UI } from '../tema';

/**
 * La frase que dice la voz, palabra por palabra: la que se está diciendo entra desde abajo y
 * las que vienen esperan tenues. Sirve de subtítulo, así el video se entiende sin sonido.
 */
export function Frase({
  palabras,
  size,
  color = C.text,
  dim = '#1D1D1F2E',
  destacar = [],
  acento = C.blue,
  align = 'left',
}: {
  palabras: Palabra[];
  size: number;
  color?: string;
  dim?: string;
  destacar?: string[];
  acento?: string;
  align?: 'left' | 'center';
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <p
      style={{
        fontFamily: UI,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1.08,
        letterSpacing: '-0.035em',
        margin: 0,
        textAlign: align,
        textWrap: 'balance',
      }}>
      {palabras.map((p, i) => {
        const on = interpolate(t, [p.s - 0.06, p.s + 0.14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const clean = p.t.replace(/[¿?¡!.,:…]/g, '').toLowerCase();
        const hl = destacar.includes(clean);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              marginRight: '0.24em',
              color: on > 0.5 ? (hl ? acento : color) : dim,
              transform: `translateY(${(1 - on) * 0.18}em)`,
              opacity: 0.35 + on * 0.65,
            }}>
            {p.t}
          </span>
        );
      })}
    </p>
  );
}
