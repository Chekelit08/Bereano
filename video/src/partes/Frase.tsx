import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import type { Palabra } from '../voz';
import { C, UI } from '../tema';

/**
 * Tipografía cinética: cada palabra entra con un "pop" (resorte con rebote) cuando la voz la dice,
 * y las palabras clave se marcan con una píldora de color. Hace de subtítulo: se entiende sin sonido.
 */
export function Frase({
  palabras,
  size,
  color = C.text,
  destacar = [],
  pildora = C.blue,
  pildoraTexto = '#fff',
  align = 'left',
  fuente = UI,
  peso = 900,
}: {
  palabras: Palabra[];
  size: number;
  color?: string;
  destacar?: string[];
  pildora?: string;
  pildoraTexto?: string;
  align?: 'left' | 'center';
  fuente?: string;
  peso?: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <p
      style={{
        fontFamily: fuente,
        fontWeight: peso,
        fontSize: size,
        lineHeight: 1.12,
        letterSpacing: fuente === UI ? '-0.04em' : '-0.01em',
        margin: 0,
        textAlign: align,
      }}>
      {palabras.map((p, i) => {
        const s = spring({ frame: frame - (p.s - 0.05) * fps, fps, config: { damping: 11, stiffness: 190, mass: 0.6 } });
        const clean = p.t.replace(/[¿?¡!.,:…]/g, '').toLowerCase();
        const hl = destacar.includes(clean);
        const pill = hl ? spring({ frame: frame - (p.s + 0.05) * fps, fps, config: { damping: 14, stiffness: 160 } }) : 0;
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              position: 'relative',
              marginRight: '0.22em',
              color: hl && pill > 0.5 ? pildoraTexto : color,
              opacity: Math.min(1, s * 1.4),
              transform: `translateY(${(1 - s) * 0.5}em) scale(${0.6 + s * 0.4}) rotate(${(1 - s) * -6}deg)`,
              transformOrigin: '50% 80%',
            }}>
            {hl && (
              <span
                style={{
                  position: 'absolute',
                  inset: '0.06em -0.14em 0 -0.14em',
                  background: pildora,
                  borderRadius: '0.22em',
                  transform: `scaleX(${pill}) rotate(-2deg)`,
                  transformOrigin: 'left center',
                  zIndex: -1,
                }}
              />
            )}
            {p.t}
          </span>
        );
      })}
    </p>
  );
}
