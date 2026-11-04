import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Escena, useEntrada, useVertical } from '../partes/Escena';
import { Telefono } from '../partes/Telefono';
import { C, UI } from '../tema';
import { VOZ } from '../voz';

// Cada pantalla aparece cuando la voz la nombra.
const PANTALLAS = [
  { src: 'app/planes.png', desde: 0 },
  { src: 'app/racha.png', desde: 1.6 },
  { src: 'app/oracion-guiada.png', desde: 2.5 },
  { src: 'app/lector.png', desde: 4.15 },
];

export function Planes() {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const vertical = useVertical();
  const entra = useEntrada(0);
  const ancho = vertical ? 660 : 470;
  const offline = spring({ frame: f - 5.9 * fps, fps, config: { damping: 13, stiffness: 150 } });
  return (
    <Escena
      palabras={VOZ.planes.palabras}
      destacar={['completa']}
      visual={
        <div style={{ position: 'relative', transform: `translateY(${(1 - entra) * 300}px)`, opacity: entra }}>
          <Telefono ancho={ancho}>
            {PANTALLAS.map((p) => {
              const a = interpolate(t, [p.desde, p.desde + 0.25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
              return (
                <Img
                  key={p.src}
                  src={staticFile(p.src)}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    opacity: a,
                    transform: `translateX(${(1 - a) * 40}px)`,
                  }}
                />
              );
            })}
          </Telefono>
          <div
            style={{
              position: 'absolute',
              left: vertical ? -40 : -60,
              top: vertical ? 120 : 90,
              fontFamily: UI,
              fontWeight: 800,
              fontSize: vertical ? 40 : 30,
              color: '#fff',
              background: C.text,
              padding: vertical ? '18px 30px' : '14px 24px',
              borderRadius: 999,
              boxShadow: '0 20px 40px #0000002a',
              transform: `scale(${offline}) rotate(-4deg)`,
            }}>
            Sin conexión ✓
          </div>
        </div>
      }
    />
  );
}
